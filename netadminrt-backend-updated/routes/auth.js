import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../server.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'troca_isto_em_producao';

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha todos os campos' });

    const existingUser = await db.get('SELECT * FROM usuarios WHERE email = ?', email);
    if (existingUser) return res.status(409).json({ error: 'Usuário já existe' });

    const hash = await bcrypt.hash(senha, 10);
    await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', nome, email, hash);

    res.json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos' });

    const user = await db.get('SELECT * FROM usuarios WHERE email = ?', email);
    if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const valido = await bcrypt.compare(senha, user.senha);
    if (!valido) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

export default router;
