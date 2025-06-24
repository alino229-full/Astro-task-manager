import { defineDb, defineTable, column } from 'astro:db';

const Project = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    description: column.text(),
    status: column.text(), // 'todo', 'in-progress', 'completed'
    priority: column.text(), // 'low', 'medium', 'high'
    createdAt: column.date(),
    updatedAt: column.date(),
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: { Project }
});
