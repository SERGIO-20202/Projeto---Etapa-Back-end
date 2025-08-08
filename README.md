# NetAdmin RT - Back-end atualizado (Express + SQLite + JWT + WebSocket)

## Como usar

1. Copie `.env.example` para `.env` e ajuste se necessário.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Inicie (cria DB + sobe servidor):
   ```bash
   npm start
   ```

Usuário admin padrão (criado se não existir):
- email: admin@netadmin.com
- senha: admin123

## Endpoints principais
- POST /api/auth/register
- POST /api/auth/login  -> retorna `{ token }`
- GET/POST/PUT/DELETE /api/vlans  (protegidas, enviar header `Authorization: Bearer TOKEN`)
- GET /api/metrics (protegida) -> { vlanCount, userCount, traffic }
- WebSocket (mesma origem): recebe mensagens periódicas `{ type: 'metrics', data: { vlanCount, userCount, traffic } }`

## Exemplo de consumo no front-end
Login:
```js
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@netadmin.com', senha: 'admin123' })
});
const body = await res.json();
const token = body.token;
```

Buscar VLANs:
```js
const res = await fetch('http://localhost:3000/api/vlans', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const vlans = await res.json();
```

Conectar WebSocket (exemplo):
```js
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if(msg.type === 'metrics') {
    console.log('Métricas:', msg.data);
    // Atualize o Chart.js aqui
  }
};
```
