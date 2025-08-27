import express from 'express';
import db from '../models/init.js';          // ✅ Conexão direta com o banco
import { registrarLog } from '../server.js'; // ✅ Função de log

const router = express.Router();

// Criar VLAN
router.post('/', (req, res) => {
  const { nome, status, descricao } = req.body;
  if (!nome || !status) {
    return res.status(400).json({ error: 'nome e status são obrigatórios' });
  }

  db.run(
    'INSERT INTO vlans (nome, status, descricao, trafego) VALUES (?, ?, ?, ?)',
    [nome, status, descricao || '', 0],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      registrarLog(`VLAN ${nome} criada`);
      res.json({ id: this.lastID, message: 'VLAN criada com sucesso' });
    }
  );
});

// Listar VLANs
router.get('/', (req, res) => {
  db.all('SELECT * FROM vlans', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Atualizar VLAN
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, status, descricao } = req.body;

  db.run(
    'UPDATE vlans SET nome = ?, status = ?, descricao = ? WHERE id = ?',
    [nome, status, descricao, id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'VLAN não encontrada' });
      }
      registrarLog(`VLAN ${id} atualizada`);
      res.json({ message: 'VLAN atualizada com sucesso' });
    }
  );
});

// Deletar VLAN
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM vlans WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'VLAN não encontrada' });
    }
    registrarLog(`VLAN ${id} deletada`);
    res.json({ message: 'VLAN deletada com sucesso' });
  });
});

export default router;
