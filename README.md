# 📡 NetAdmin RT - Backend

Este é o **backend** da aplicação **NetAdmin RT (Real-Time)**, responsável por autenticação, gerenciamento de VLANs, métricas e integração com WebSocket.  

O projeto usa:  
- **Node.js + Express.js**  
- **SQLite** para persistência  
- **JWT** para autenticação  
- **bcrypt** para hashing de senhas  
- **WebSocket** para envio de métricas em tempo real  

---

## 🚀 Instalação e Execução

```bash
# Clone o repositório
git clone (https://github.com/SERGIO-20202/Projeto---Etapa-Back-end.git)
cd Projeto---Etapa-Back-end/backend

# Instale as dependências
npm install

# Crie a pasta de banco de dados
mkdir -p db

# Rode o servidor
npm start
```

O servidor iniciará em:  
👉 `http://localhost:3000`

---

## ⚙️ Estrutura de Pastas

```
backend/
│── db/                # Banco SQLite
│── logs/              # Logs de atividades
│── routes/            # Rotas (auth, vlans, etc.)
│── server.js          # Inicialização do servidor
│── db.js              # Módulo de conexão SQLite
│── package.json
```

---

## 🔑 Endpoints Principais

### 🟢 Autenticação

- **Registro**  
  `POST /api/auth/register`
  ```json
  { "nome":"Sergio", "email":"sergio@ifpb.edu.br", "senha":"123456" }
  ```

- **Login**  
  `POST /api/auth/login`
  ```json
  { "email":"sergio@ifpb.edu.br", "senha":"123456" }
  ```

Resposta:  
```json
{ "token": "JWT_AQUI" }
```

---

### 🟢 VLANs

> **Todas as rotas exigem Header**  
`Authorization: Bearer SEU_TOKEN`

- **Criar VLAN**  
  `POST /api/vlans`
  ```json
  { "nome":"VLAN10", "status":"ativa", "descricao":"rede teste" }
  ```

- **Listar VLANs**  
  `GET /api/vlans`

- **Atualizar VLAN**  
  `PUT /api/vlans/:id`
  ```json
  { "nome":"VLAN10", "status":"inativa", "descricao":"rede atualizada" }
  ```

- **Deletar VLAN**  
  `DELETE /api/vlans/:id`

---

## 🧪 Testando com cURL

Aqui está o fluxo completo de testes:

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3000/api/auth/register   -H "Content-Type: application/json"   -d '{"nome":"Sergio","email":"sergio@ifpb.edu.br","senha":"123456"}'

# 2. Fazer login (guarde o token retornado)
curl -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"sergio@ifpb.edu.br","senha":"123456"}'

# 3. Criar VLAN
curl -X POST http://localhost:3000/api/vlans   -H "Content-Type: application/json"   -H "Authorization: Bearer SEU_TOKEN_AQUI"   -d '{"nome":"VLAN10","status":"ativa","descricao":"rede teste"}'

# 4. Listar VLANs
curl -X GET http://localhost:3000/api/vlans   -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 5. Atualizar VLAN
curl -X PUT http://localhost:3000/api/vlans/1   -H "Content-Type: application/json"   -H "Authorization: Bearer SEU_TOKEN_AQUI"   -d '{"nome":"VLAN10","status":"inativa","descricao":"rede atualizada"}'

# 6. Deletar VLAN
curl -X DELETE http://localhost:3000/api/vlans/1   -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📊 Métricas

- `GET /api/metrics`  
Retorna número de VLANs, usuários e tráfego total.

Exemplo de resposta:
```json
{
  "vlanCount": 2,
  "userCount": 1,
  "traffic": 350
}
```

---

## 📡 WebSocket

O backend envia métricas a cada **5 segundos** pelo WebSocket.  
Conecte em:  
👉 `ws://localhost:3000`  

Exemplo de mensagem recebida:
```json
{
  "type": "metrics",
  "data": {
    "vlanCount": 2,
    "userCount": 1,
    "traffic": 742
  }
}
```
