import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { User } from '../types';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDatabase() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'cliente',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}
