import { db, Project } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Project).values([
		{
			id: 1,
			name: "Site Web E-commerce",
			description: "Développement d'une boutique en ligne complète avec panier et paiement",
			status: "in-progress",
			priority: "high",
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date('2024-12-30'),
		},
		{
			id: 2,
			name: "Application Mobile",
			description: "Application mobile React Native pour la gestion des tâches",
			status: "todo",
			priority: "medium",
			createdAt: new Date('2024-01-20'),
			updatedAt: new Date('2024-01-20'),
		},
		{
			id: 3,
			name: "API REST",
			description: "API RESTful avec authentification JWT et documentation Swagger",
			status: "completed",
			priority: "high",
			createdAt: new Date('2024-01-10'),
			updatedAt: new Date('2024-01-25'),
		},
		{
			id: 4,
			name: "Dashboard Analytics",
			description: "Interface d'administration avec graphiques et statistiques en temps réel",
			status: "todo",
			priority: "low",
			createdAt: new Date('2024-01-22'),
			updatedAt: new Date('2024-01-22'),
		},
	]);
}
