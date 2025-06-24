import React from 'react';

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

interface ProjectStatsProps {
  stats: Stats;
  isLoading?: boolean;
}

export function ProjectStats({ stats, isLoading = false }: ProjectStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    {
      title: 'Total des projets',
      value: stats.total,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'À faire',
      value: stats.todo,
      icon: (
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-gray-50 border-gray-200'
    },
    {
      title: 'En cours',
      value: stats.inProgress,
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: 'Terminés',
      value: stats.completed,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50 border-green-200'
    }
  ];

  return (
    <div className="mb-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.color} p-4 rounded-lg border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className="flex-shrink-0">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression et statistiques avancées */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progression des projets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression générale</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Projets terminés</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {stats.completed} sur {stats.total} projets terminés
              </div>
            </div>
          </div>

          {/* Répartition par priorité */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par priorité</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Priorité élevée</span>
                </div>
                <span className="text-sm font-medium">{stats.highPriority}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Priorité moyenne</span>
                </div>
                <span className="text-sm font-medium">{stats.mediumPriority}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Priorité faible</span>
                </div>
                <span className="text-sm font-medium">{stats.lowPriority}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 