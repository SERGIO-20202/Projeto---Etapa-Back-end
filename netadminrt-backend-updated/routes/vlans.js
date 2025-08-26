import express from 'express';
import dbPromise from '../db.js';

const router = express.Router();

// Middleware simples para autenticação por token (se já tiver no server.js pode remover daqui)
function autenticarToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  import('jsonwebtoken').then(jwt => {
    jwt.default.verify(token, process.env.JWT_SECRET || 'troca_isto_em_producao', (err, payload) => {
      if (err) return res.status(403).json({ error: 'Token inválido' });
      req.usuario = payload;
      next();
    });
  });
}

// 📌 Listar VLANs
router.get('/', autenticarToken, async (req, res) => {
  try {
    const db = await dbPromise;
    const rows = await db.all('SELECT * FROM vlans');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Criar VLAN
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { nome, status, descricao } = req.body;
    if (!nome || !status) {
      return res.status(400).json({ error: 'nome e status são obrigatórios' });
    }

    const db = await dbPromise;
    const result = await db.run(
      'INSERT INTO vlans (nome, status, descricao, trafego, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [nome, status, descricao || '', 0, req.usuario.id] // inicia tráfego em 0
    );

    res.json({ id: result.lastID, nome, status, descricao, trafego: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Atualizar VLAN
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const { nome, status, descricao } = req.body;
    const { id } = req.params;

    const db = await dbPromise;
    const result = await db.run(
      'UPDATE vlans SET nome = ?, status = ?, descricao = ? WHERE id = ?',
      [nome, status, descricao, id]
    );

    res.json({ changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Deletar VLAN
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const result = await db.run('DELETE FROM vlans WHERE id = ?', [id]);
    res.json({ changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
