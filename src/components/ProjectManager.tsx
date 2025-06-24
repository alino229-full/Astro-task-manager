import React, { useState, useEffect } from 'react';
import { actions, isActionError } from 'astro:actions';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectStats } from './ProjectStats';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [filters, setFilters] = useState<{
    status?: 'todo' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
  }>({});

  // Charger les données initiales
  useEffect(() => {
    loadProjects();
    loadStats();
  }, []);

  // Charger les projets avec filtres
  const loadProjects = async (newFilters?: typeof filters) => {
    setIsLoading(true);
    try {
      const filtersToUse = newFilters !== undefined ? newFilters : filters;
      const result = await actions.getProjects(filtersToUse);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setProjects(result.data?.projects || []);
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement des projets');
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const result = await actions.getProjectStats();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setStats(result.data?.stats || null);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Afficher une notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Créer un projet
  const handleCreateProject = async (data: {
    name: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
  }) => {
    setIsSubmitting(true);
    try {
      const result = await actions.createProject(data);
      
      if (result.error) {
        if (isActionError(result.error)) {
          throw new Error(result.error.message);
        }
        throw new Error('Erreur lors de la création du projet');
      }
      
      showNotification('success', result.data?.message || 'Projet créé avec succès!');
      setShowForm(false);
      await loadProjects();
      await loadStats();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de la création du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modifier un projet
  const handleUpdateProject = async (data: {
    name: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
  }) => {
    if (!editingProject) return;
    
    setIsSubmitting(true);
    try {
      const result = await actions.updateProject({
        id: editingProject.id,
        ...data
      });
      
      if (result.error) {
        if (isActionError(result.error)) {
          throw new Error(result.error.message);
        }
        throw new Error('Erreur lors de la modification du projet');
      }
      
      showNotification('success', result.data?.message || 'Projet modifié avec succès!');
      setEditingProject(null);
      setShowForm(false);
      await loadProjects();
      await loadStats();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de la modification du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un projet
  const handleDeleteProject = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const result = await actions.deleteProject({ id });
      
      if (result.error) {
        if (isActionError(result.error)) {
          throw new Error(result.error.message);
        }
        throw new Error('Erreur lors de la suppression du projet');
      }
      
      showNotification('success', result.data?.message || 'Projet supprimé avec succès!');
      await loadProjects();
      await loadStats();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de la suppression du projet');
    }
  };

  // Gérer l'édition d'un projet
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  // Gérer l'annulation du formulaire
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  // Gérer les filtres
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    loadProjects(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    loadProjects(emptyFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestionnaire de Projets
            </h1>
            <p className="text-gray-600">
              Gérez vos projets avec les nouvelles Actions d'Astro
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau projet
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Statistiques */}
        {stats && <ProjectStats stats={stats} isLoading={false} />}

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
            
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ 
                ...filters, 
                status: e.target.value as any || undefined 
              })}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange({ 
                ...filters, 
                priority: e.target.value as any || undefined 
              })}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les priorités</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>

            {(filters.status || filters.priority) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>

        {/* Liste des projets */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(filters).length > 0 
                ? 'Aucun projet ne correspond aux filtres sélectionnés.'
                : 'Commencez par créer votre premier projet.'
              }
            </p>
            {Object.keys(filters).length > 0 ? (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Effacer les filtres
              </button>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer un projet
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        {/* Formulaire modal */}
        {showForm && (
          <ProjectForm
            project={editingProject}
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
} 