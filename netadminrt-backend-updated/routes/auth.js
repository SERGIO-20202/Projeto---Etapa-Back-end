import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dbPromise from '../db.js';
import db from '../models/init.js';
import { registrarLog } from '../server.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'troca_isto_em_producao';

// register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const db = await dbPromise;

    const result = await db.run(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );

    res.json({ id: result.lastID, message: 'registrado' });
  } catch (err) {
    const msg = err?.message?.includes('UNIQUE')
      ? 'Email já cadastrado'
      : err.message;
    res.status(400).json({ error: msg });
  }
});

export default router;
