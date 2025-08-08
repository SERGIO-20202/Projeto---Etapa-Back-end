import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db, registrarLog } from '../server.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'troca_isto_em_producao';

// register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if(!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    const hash = await bcrypt.hash(senha, 10);
    await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash]);
    registrarLog(`Usuário ${email} registrado`);
    res.json({ message: 'registrado' });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const row = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if(!row) return res.status(401).json({ error: 'credenciais inválidas' });
    const match = await bcrypt.compare(senha, row.senha);
    if(!match) return res.status(401).json({ error: 'credenciais inválidas' });
    const token = jwt.sign({ id: row.id, email: row.email, nome: row.nome }, JWT_SECRET, { expiresIn: '1h' });
    registrarLog(`Usuário ${email} autenticado`);
    res.json({ token });
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

export default router;
