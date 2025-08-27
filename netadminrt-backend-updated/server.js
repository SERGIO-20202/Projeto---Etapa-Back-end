import express from 'express';
import authRoutes, { authMiddleware } from './routes/auth.js';
import { initDB } from './models/init.js';

const app = express();
const db = await initDB();

app.use(express.json());

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rota protegida de exemplo
app.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Bem-vindo ${req.usuario.nome}! Esta rota é protegida.` });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
