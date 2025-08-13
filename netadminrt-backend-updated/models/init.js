import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '.', process.env.DB_FILE || 'db/database.sqlite');

async function init(){
  const dbDir = path.dirname(DB_FILE);
  if(!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
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
      trafego INTEGER,
      usuario_id INTEGER,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);
  // criar admin se não existir
  const adminEmail = 'admin@netadmin.com';
  const row = await db.get('SELECT * FROM usuarios WHERE email = ?', [adminEmail]);
  if(!row){
    const senha = 'admin123';
    const hash = await bcrypt.hash(senha, 10);
    await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', ['Admin', adminEmail, hash]);
    console.log('Usuário admin criado:', adminEmail);
  }
  await db.close();
}

init().catch(err => { console.error(err); process.exit(1); });
