import express from 'express';
import { db, registrarLog } from '../server.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const router = express.Router();

// middleware local para autenticação (reaproveita token do header)
function autenticarTokenLocal(req, res, next){
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'Token não fornecido' });
  jwt.verify(token, process.env.JWT_SECRET || 'troca_isto_em_producao', (err, payload) => {
    if(err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = payload;
    next();
  });
}

// GET / -> listar vlans do usuário
router.get('/', autenticarTokenLocal, async (req, res) => {
  const rows = await db.all('SELECT * FROM vlans WHERE usuario_id = ?', [req.usuario.id]);
  res.json(rows);
});

// POST / -> criar VLAN (simula tráfego)
router.post('/', autenticarTokenLocal, async (req, res) => {
  try {
    const { nome, status, descricao } = req.body;
    const trafego = Math.floor(Math.random()*1000);
    const result = await db.run('INSERT INTO vlans (nome, status, descricao, trafego, usuario_id) VALUES (?, ?, ?, ?, ?)', [nome, status, descricao, trafego, req.usuario.id]);
    registrarLog(`Usuário ${req.usuario.email} criou VLAN ${nome}`);
    res.json({ id: result.lastID });
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id
router.put('/:id', autenticarTokenLocal, async (req, res) => {
  try {
    const { nome, status, descricao } = req.body;
    const id = req.params.id;
    const result = await db.run('UPDATE vlans SET nome = ?, status = ?, descricao = ? WHERE id = ? AND usuario_id = ?', [nome, status, descricao, id, req.usuario.id]);
    registrarLog(`Usuário ${req.usuario.email} atualizou VLAN ${id}`);
    res.json({ changes: result.changes });
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', autenticarTokenLocal, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.run('DELETE FROM vlans WHERE id = ? AND usuario_id = ?', [id, req.usuario.id]);
    registrarLog(`Usuário ${req.usuario.email} deletou VLAN ${id}`);
    res.json({ changes: result.changes });
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

export default router;
