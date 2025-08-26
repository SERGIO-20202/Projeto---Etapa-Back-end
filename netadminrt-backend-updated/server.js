import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { WebSocketServer } from 'ws';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'troca_isto_em_producao';
const DB_FILE = process.env.DB_FILE || './db/database.sqlite';
const LOG_FILE = path.join(__dirname, 'logs', 'atividades.log');

// helper log
function registrarLog(msg){
  const linha = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, linha);
}

// DB init (open connection)
let db;
async function initDb(){
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });
  // create tables if not exists
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
}

initDb().catch(err => { console.error('Erro ao abrir DB:', err); process.exit(1); });

// middleware de autenticação
function autenticarToken(req, res, next){
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'Token não fornecido' });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = payload;
    next();
  });
}

// rotas auth
import authRouter from './routes/auth.js';
import vlanRouter from './routes/vlans.js';

app.use('/api/auth', authRouter);
app.use('/api/vlans', vlanRouter);

// endpoint de métricas (HTTP)
app.get('/api/metrics', autenticarToken, async (req, res) => {
  const vlanCountRow = await db.get('SELECT COUNT(*) AS total FROM vlans');
  const userCountRow = await db.get('SELECT COUNT(*) AS total FROM usuarios');

  const trafficRow = await db.get('SELECT SUM(trafego) AS totalTraffic FROM vlans');

  const vlanCount = vlanCountRow?.total || 0;
  const userCount = userCountRow?.total || 0;
  const traffic = trafficRow?.totalTraffic || 0; // soma do tráfego

  res.json({ vlanCount, userCount, traffic });
});
// criar logs dir se não existir
const logsDir = path.join(__dirname, 'logs');
if(!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// start server + websocket
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
  registrarLog('Servidor iniciado');
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws, req) => {
  registrarLog('Cliente WS conectado');
  ws.send(JSON.stringify({ message: 'connected' }));
});

// broadcast de métricas a cada 5s
setInterval(async () => {
  try {
    const vlanCountRow = await db.get('SELECT COUNT(*) AS total FROM vlans');
    const userCountRow = await db.get('SELECT COUNT(*) AS total FROM usuarios');
    const data = {
      vlanCount: vlanCountRow?.total || 0,
      userCount: userCountRow?.total || 0,
      traffic: Math.floor(Math.random()*1000)
    };
    const payload = JSON.stringify({ type: 'metrics', data });
    wss.clients.forEach(client => {
      if(client.readyState === 1) client.send(payload);
    });
  } catch(e){
    console.error('Erro ao coletar métricas:', e);
  }
}, 5000);

export { db, registrarLog };
