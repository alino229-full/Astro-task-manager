import React from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

const statusStyles = {
  'todo': 'bg-gray-100 text-gray-800 border-gray-300',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'completed': 'bg-green-100 text-green-800 border-green-300'
};

const priorityStyles = {
  'low': 'bg-green-50 text-green-700 ring-green-600/20',
  'medium': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  'high': 'bg-red-50 text-red-700 ring-red-600/20'
};

const statusLabels = {
  'todo': 'À faire',
  'in-progress': 'En cours',
  'completed': 'Terminé'
};

const priorityLabels = {
  'low': 'Faible',
  'medium': 'Moyenne',
  'high': 'Élevée'
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* En-tête avec titre et actions */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 truncate flex-1 mr-4">
          {project.name}
        </h3>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier le projet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer le projet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Badges statut et priorité */}
      <div className="flex gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[project.status]}`}>
          {statusLabels[project.status]}
        </span>
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityStyles[project.priority]}`}>
          Priorité: {priorityLabels[project.priority]}
        </span>
      </div>

      {/* Dates */}
      <div className="flex justify-between text-sm text-gray-500 border-t pt-4">
        <div>
          <span className="font-medium">Créé:</span> {formatDate(project.createdAt)}
        </div>
        <div>
          <span className="font-medium">Modifié:</span> {formatDate(project.updatedAt)}
        </div>
      </div>
    </div>
  );
} 