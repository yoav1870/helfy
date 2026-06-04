import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('Running migrations...');

    // Create migrations tracking table
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get all migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.migration.js'))
      .sort();

    for (const file of migrationFiles) {
      // Check if migration already executed
      const [rows] = await db.query('SELECT * FROM migrations WHERE name = ?', [file]);

      if (rows.length === 0) {
        console.log(`Executing migration: ${file}`);
        const migration = await import(`./${file}`);
        await migration.up(db);
        await db.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`✓ Migration ${file} completed`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

export default runMigrations;
