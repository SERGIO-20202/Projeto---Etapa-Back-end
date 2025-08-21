import express from 'express';
import { db } from '../server.js';
import { autenticarToken } from '../server.js'; // se tiver middleware no server

const router = express.Router();

// listar VLANs
router.get('/', autenticarToken, async (req, res) => {
  try {
    const vlans = await db.all('SELECT * FROM vlans');
    res.json(vlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar VLANs' });
  }
});

// criar VLAN
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { nome, status, descricao } = req.body;
    await db.run('INSERT INTO vlans (nome, status, descricao) VALUES (?, ?, ?)', nome, status, descricao);
    res.json({ message: 'VLAN criada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar VLAN' });
  }
});

export default router;
