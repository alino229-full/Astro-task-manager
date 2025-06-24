import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Project, eq } from 'astro:db';

// Types pour les statuts et priorités
const StatusEnum = z.enum(['todo', 'in-progress', 'completed']);
const PriorityEnum = z.enum(['low', 'medium', 'high']);

export const server = {
  // CREATE - Créer un nouveau projet
  createProject: defineAction({
    input: z.object({
      name: z.string().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
      description: z.string().min(1, "La description est requise").max(500, "La description ne peut pas dépasser 500 caractères"),
      status: StatusEnum.default('todo'),
      priority: PriorityEnum.default('medium'),
    }),
    handler: async (input) => {
      try {
        const now = new Date();
        
        const result = await db.insert(Project).values({
          name: input.name,
          description: input.description,
          status: input.status,
          priority: input.priority,
          createdAt: now,
          updatedAt: now,
        });

        return { 
          success: true, 
          message: `Projet "${input.name}" créé avec succès!`,
          project: {
            ...input,
            createdAt: now,
            updatedAt: now,
          }
        };
      } catch (error) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création du projet'
        });
      }
    }
  }),

  // READ - Récupérer tous les projets
  getProjects: defineAction({
    input: z.object({
      status: StatusEnum.optional(),
      priority: PriorityEnum.optional(),
    }).optional(),
    handler: async (input) => {
      try {
        let query = db.select().from(Project);
        
        // Filtrage optionnel par statut ou priorité
        if (input?.status || input?.priority) {
          const conditions = [];
          if (input.status) conditions.push(eq(Project.status, input.status));
          if (input.priority) conditions.push(eq(Project.priority, input.priority));
          
          if (conditions.length > 0) {
            query = query.where(conditions.length === 1 ? conditions[0] : 
              conditions.reduce((acc, condition) => acc && condition));
          }
        }

        const projects = await query.orderBy(Project.updatedAt);
        
        return { 
          success: true, 
          projects,
          count: projects.length 
        };
      } catch (error) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des projets'
        });
      }
    }
  }),

  // READ - Récupérer un projet par ID
  getProject: defineAction({
    input: z.object({
      id: z.number().positive("L'ID doit être un nombre positif"),
    }),
    handler: async (input) => {
      try {
        const projects = await db.select().from(Project).where(eq(Project.id, input.id));
        
        if (projects.length === 0) {
          throw new ActionError({
            code: 'NOT_FOUND',
            message: 'Projet non trouvé'
          });
        }

        return { 
          success: true, 
          project: projects[0] 
        };
      } catch (error) {
        if (error instanceof ActionError) throw error;
        
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du projet'
        });
      }
    }
  }),

  // UPDATE - Mettre à jour un projet
  updateProject: defineAction({
    input: z.object({
      id: z.number().positive("L'ID doit être un nombre positif"),
      name: z.string().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères").optional(),
      description: z.string().min(1, "La description est requise").max(500, "La description ne peut pas dépasser 500 caractères").optional(),
      status: StatusEnum.optional(),
      priority: PriorityEnum.optional(),
    }),
    handler: async (input) => {
      try {
        const { id, ...updateData } = input;
        
        // Vérifier si le projet existe
        const existingProjects = await db.select().from(Project).where(eq(Project.id, id));
        
        if (existingProjects.length === 0) {
          throw new ActionError({
            code: 'NOT_FOUND',
            message: 'Projet non trouvé'
          });
        }

        // Préparer les données de mise à jour
        const dataToUpdate = {
          ...updateData,
          updatedAt: new Date(),
        };

        // Supprimer les propriétés undefined
        Object.keys(dataToUpdate).forEach(key => {
          if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
            delete dataToUpdate[key as keyof typeof dataToUpdate];
          }
        });

        await db.update(Project).set(dataToUpdate).where(eq(Project.id, id));

        // Récupérer le projet mis à jour
        const updatedProjects = await db.select().from(Project).where(eq(Project.id, id));

        return { 
          success: true, 
          message: 'Projet mis à jour avec succès!',
          project: updatedProjects[0]
        };
      } catch (error) {
        if (error instanceof ActionError) throw error;
        
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour du projet'
        });
      }
    }
  }),

  // DELETE - Supprimer un projet
  deleteProject: defineAction({
    input: z.object({
      id: z.number().positive("L'ID doit être un nombre positif"),
    }),
    handler: async (input) => {
      try {
        // Vérifier si le projet existe
        const existingProjects = await db.select().from(Project).where(eq(Project.id, input.id));
        
        if (existingProjects.length === 0) {
          throw new ActionError({
            code: 'NOT_FOUND',
            message: 'Projet non trouvé'
          });
        }

        const projectName = existingProjects[0].name;
        
        await db.delete(Project).where(eq(Project.id, input.id));

        return { 
          success: true, 
          message: `Projet "${projectName}" supprimé avec succès!`
        };
      } catch (error) {
        if (error instanceof ActionError) throw error;
        
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la suppression du projet'
        });
      }
    }
  }),

  // Statistiques des projets
  getProjectStats: defineAction({
    handler: async () => {
      try {
        const allProjects = await db.select().from(Project);
        
        const stats = {
          total: allProjects.length,
          todo: allProjects.filter(p => p.status === 'todo').length,
          inProgress: allProjects.filter(p => p.status === 'in-progress').length,
          completed: allProjects.filter(p => p.status === 'completed').length,
          highPriority: allProjects.filter(p => p.priority === 'high').length,
          mediumPriority: allProjects.filter(p => p.priority === 'medium').length,
          lowPriority: allProjects.filter(p => p.priority === 'low').length,
        };

        return { 
          success: true, 
          stats 
        };
      } catch (error) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des statistiques'
        });
      }
    }
  }),
}; 