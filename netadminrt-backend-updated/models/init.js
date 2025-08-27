// models/init.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Inicializa e retorna o banco
export async function initDB() {
  // Abre conexão com o SQLite
  const db = await open({
    filename: './database.db', // arquivo do banco
    driver: sqlite3.Database
  });

  // Cria tabela de usuários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Cria tabela de logs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      acao TEXT NOT NULL,
      usuario_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  console.log('Banco SQLite inicializado com sucesso!');
  return db;
}

// Teste rápido: se rodar diretamente, inicializa o banco
if (import.meta.url === `file://${process.argv[1]}`) {
  initDB();
}
