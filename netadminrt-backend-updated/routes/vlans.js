import express from 'express';
import { db, registrarLog } from '../models/db.js';

const router = express.Router();

// Criar VLAN
router.post('/', (req, res) => {
  try {
    const { nome, status, descricao } = req.body;
    if (!nome || !status) {
      return res.status(400).json({ error: 'nome e status são obrigatórios' });
    }

    const stmt = db.prepare(
      'INSERT INTO vlans (nome, status, descricao, trafego) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(nome, status, descricao || '', 0);

    registrarLog(`VLAN ${nome} criada`);
    res.json({ id: info.lastInsertRowid, message: 'VLAN criada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar VLANs
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM vlans').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar VLAN
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nome, status, descricao } = req.body;

    const stmt = db.prepare(
      'UPDATE vlans SET nome = ?, status = ?, descricao = ? WHERE id = ?'
    );
    const info = stmt.run(nome, status, descricao, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'VLAN não encontrada' });
    }

    registrarLog(`VLAN ${id} atualizada`);
    res.json({ message: 'VLAN atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar VLAN
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM vlans WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'VLAN não encontrada' });
    }

    registrarLog(`VLAN ${id} deletada`);
    res.json({ message: 'VLAN deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
