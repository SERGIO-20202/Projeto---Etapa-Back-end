import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const DB_FILE = './db/database.sqlite';
const LOG_FILE = path.join('logs', 'atividades.log');

// cria diretório de logs se não existir
if (!fs.existsSync('logs')) fs.mkdirSync('logs', { recursive: true });

// helper log
function registrarLog(msg){
  const linha = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, linha);
}

// inicializa DB
async function initDb() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  // criar tabelas
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

  // cria usuário admin padrão se não existir
  const adminEmail = 'admin@teste.com';
  const existingAdmin = await db.get('SELECT * FROM usuarios WHERE email = ?', adminEmail);
  if (!existingAdmin) {
    const hash = await bcrypt.hash('123456', 10); // senha padrão
    await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', 'Admin', adminEmail, hash);
    registrarLog('Usuário administrador criado: admin@teste.com / 123456');
    console.log('Usuário administrador criado: admin@teste.com / 123456');
  } else {
    console.log('Usuário administrador já existe');
  }

  await db.close();
}

initDb().catch(err => {
  console.error('Erro ao inicializar DB:', err);
  process.exit(1);
});

