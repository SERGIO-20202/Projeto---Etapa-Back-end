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
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    }

    const hash = await bcrypt.hash(senha, 10);

    db.run(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash],
      function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        registrarLog(`Usuário ${email} registrado`);
        res.json({ id: this.lastID, message: 'registrado' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
