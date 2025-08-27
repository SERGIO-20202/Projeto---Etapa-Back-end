import express from 'express';
import { initDB } from './models/init.js';

const app = express();
const db = await initDB(); // inicializa o banco antes de iniciar o servidor

app.use(express.json());

// Exemplo de rota para listar usuários
app.get('/usuarios', async (req, res) => {
  const usuarios = await db.all('SELECT id, nome, email, criado_em FROM usuarios');
  res.json(usuarios);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
