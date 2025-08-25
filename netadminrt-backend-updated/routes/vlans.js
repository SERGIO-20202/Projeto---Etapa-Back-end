import express from 'express';
import { db, registrarLog } from '../server.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'troca_isto_em_producao';

// middleware local para autenticação (reaproveita token do header)
function autenticarTokenLocal(req, res, next){
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'Token não fornecido' });
  jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET, (err, payload) => {
    if(err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = payload;
    next();
  });
}

// Criar VLAN
router.post('/', autenticarTokenLocal, async (req, res) => {
  try {
    const { nome, status, descricao = '', trafego = 0 } = req.body;
    if(!nome || !status) return res.status(400).json({ error: 'nome e status são obrigatórios' });

    const result = await db.run(
      'INSERT INTO vlans (nome, status, descricao, trafego, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [nome, status, descricao, trafego, req.usuario.id]
    );

    registrarLog(`Usuário ${req.usuario.email} criou VLAN ${nome}`);
    // com sqlite-promisified, result.lastID tem o id
    res.status(201).json({ id: result.lastID, nome, status, descricao, trafego });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar VLANs do usuário (ou todas, se for admin você pode mudar)
router.get('/', autenticarTokenLocal, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM vlans WHERE usuario_id = ?', [req.usuario.id]);
    res.json(rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar VLAN
router.put('/:id', autenticarTokenLocal, async (req, res) => {
  try {
    const { nome, status, descricao, trafego } = req.body;
    const { id } = req.params;
    const result = await db.run(
      'UPDATE vlans SET nome = ?, status = ?, descricao = ?, trafego = ? WHERE id = ? AND usuario_id = ?',
      [nome, status, descricao, trafego, id, req.usuario.id]
    );
    registrarLog(`Usuário ${req.usuario.email} atualizou VLAN ${id}`);
    res.json({ changes: result.changes });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar VLAN
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
