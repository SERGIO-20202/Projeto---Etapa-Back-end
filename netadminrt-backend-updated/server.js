import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { WebSocketServer } from 'ws';

import db from './models/init.js';   // <-- Importa o banco centralizado

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'troca_isto_em_producao';
const LOG_FILE = path.join(__dirname, 'logs', 'atividades.log');

// Criar logs dir se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Função de log
function registrarLog(msg) {
  const linha = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, linha);
}

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = payload;
    next();
  });
}

// Rotas
import authRouter from './routes/auth.js';
import vlanRouter from './routes/vlans.js';
app.use('/api/auth', authRouter);
app.use('/api/vlans', vlanRouter);

// Endpoint de métricas
app.get('/api/metrics', autenticarToken, async (req, res) => {
  db.get('SELECT COUNT(*) AS total FROM vlans', (err, vlanCountRow) => {
    db.get('SELECT COUNT(*) AS total FROM usuarios', (err, userCountRow) => {
      db.get('SELECT SUM(trafego) AS totalTraffic FROM vlans', (err, trafficRow) => {
        res.json({
          vlanCount: vlanCountRow?.total || 0,
          userCount: userCountRow?.total || 0,
          traffic: trafficRow?.totalTraffic || 0
        });
      });
    });
  });
});

// Start server + websocket
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('🚀 Servidor rodando na porta', PORT);
  registrarLog('Servidor iniciado');
});

// WebSocket
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  registrarLog('Cliente WS conectado');
  ws.send(JSON.stringify({ message: 'connected' }));
});

// Broadcast de métricas a cada 5s
setInterval(() => {
  db.get('SELECT COUNT(*) AS total FROM vlans', (err, vlanCountRow) => {
    db.get('SELECT COUNT(*) AS total FROM usuarios', (err, userCountRow) => {
      const data = {
        vlanCount: vlanCountRow?.total || 0,
        userCount: userCountRow?.total || 0,
        traffic: Math.floor(Math.random() * 1000)
      };
      const payload = JSON.stringify({ type: 'metrics', data });
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(payload);
      });
    });
  });
}, 5000);

export { db, registrarLog };
