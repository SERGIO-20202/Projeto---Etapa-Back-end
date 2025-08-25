import express from 'express';
import { db, registrarLog } from '../server.js';

const router = express.Router();

// Criar VLAN
router.post('/', (req, res) => {
  const { vlan_id, nome, status } = req.body;

  if (!vlan_id || !nome || !status) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  db.run(
    'INSERT INTO vlans (vlan_id, nome, status) VALUES (?, ?, ?)',
    [vlan_id, nome, status],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      registrarLog(`VLAN ${nome} criada`);
      res.status(201).json({ id: this.lastID, vlan_id, nome, status });
    }
  );
});

// Listar VLANs
router.get('/', (req, res) => {
  db.all('SELECT * FROM vlans', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Atualizar VLAN
router.put('/:id', (req, res) => {
  const { nome, status } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE vlans SET nome = ?, status = ? WHERE id = ?',
    [nome, status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      registrarLog(`VLAN ${id} atualizada`);
      res.json({ updated: this.changes });
    }
  );
});

// Deletar VLAN
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM vlans WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarLog(`VLAN ${id} removida`);
    res.json({ deleted: this.changes });
  });
});

export default router;
