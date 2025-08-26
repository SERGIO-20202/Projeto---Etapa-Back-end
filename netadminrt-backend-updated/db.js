// backend/db.js
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'db', 'database.sqlite');

// função para inicializar
async function initDb() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  // cria tabelas se não existirem
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS vlans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      status TEXT NOT NULL,
      descricao TEXT,
      trafego INTEGER DEFAULT 0,
      usuario_id INTEGER,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  return db;
}

// Exporta como Promise para ser usado com await em outros módulos
const dbPromise = initDb();
export default dbPromise;
