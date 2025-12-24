# Docker Production Environment

Complete guide for running the application with horizontal scaling using Docker Compose.

## 🎯 What's Included

This Docker Compose stack provides a **production-ready environment** with:

- 🔀 **Load Balancer** - Nginx distributing traffic between instances
- 🚀 **Horizontal Scaling** - 2 backend instances for high availability
- 📡 **WebSocket Sync** - Redis ensuring real-time events reach all clients
- 🗄️ **Database** - PostgreSQL with persistent storage
- ⚡ **Caching** - Redis for WebSocket pub/sub
- 🐳 **Optimized Images** - Multi-stage builds for minimal size

## 🏗️ Architecture

```
┌─────────────────┐
│   Nginx :3000   │  Load Balancer (least_conn)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│App :1│  │App :2│  Backend Instances (NestJS + Socket.io)
│ 2998 │  │ 2999 │
└───┬──┘  └──┬───┘
    │        │
    └───┬────┘
        │
    ┌───▼────┐
    │ Redis  │  WebSocket Pub/Sub Synchronization
    │  6379  │
    └────────┘
        │
    ┌───▼────┐
    │Postgres│  Database with Persistent Volume
    │  5432  │
    └────────┘
```

### How It Works

1. **Client** connects to `http://localhost:3000`
2. **Nginx** routes the request to `backend-1` or `backend-2` (load balanced)
3. **Backend** processes the request and connects to PostgreSQL
4. **WebSocket events** are published to **Redis**
5. **Redis** broadcasts to **all backend instances**
6. **All clients** receive the event, regardless of which instance they're connected to

## 🚀 Quick Start

### Iniciar todos os serviços

```bash
docker-compose up --build
```

### Iniciar em background

```bash
docker-compose up -d --build
```

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend-1
docker-compose logs -f backend-2
docker-compose logs -f nginx
```

### Parar serviços

```bash
docker-compose down
```

### Parar e remover volumes (limpa banco de dados)

```bash
docker-compose down -v
```

## 🔧 Serviços

### Nginx Load Balancer

- **Porta**: 3000
- **Algoritmo**: Least connections
- **WebSocket**: Suportado via `/socket.io/`
- **Rate Limit**: 100 req/s com burst de 20

### Backend Instance 1

- **Porta Externa**: 2998
- **Porta Interna**: 3000
- **Redis**: Habilitado
- **Auto Migration**: Sim

### Backend Instance 2

- **Porta Externa**: 2999
- **Porta Interna**: 3000
- **Redis**: Habilitado
- **Auto Migration**: Sim

### PostgreSQL

- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: postgres
- **Volume**: Persistente

### Redis

- **Porta**: 6379
- **Uso**: Sincronização de WebSocket entre instâncias

## 🧪 Testing Scalability

### Interactive WebSocket Test

Open the **visual testing tool** included in the project:

```bash
# 1. Start the Docker Compose stack
docker compose up --build

# 2. Open the test file in your browser
open backend/test/websocket-test.html
# or navigate to: file:///<path>/backend/test/websocket-test.html

# 3. Get a JWT token from the API
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test123", "name": "Test", "role": "CUSTOMER", "phone": "+5511999999999"}'

# 4. Paste the token in the test interface
# 5. Click "Connect All Clients" - creates 3 WebSocket connections
# 6. Click "Send Test Event" - all 3 should receive it!
```

**Expected Result:** All 3 clients receive the event, proving Redis is synchronizing across instances! ✅

### 1. Test Load Balancer

```bash
# Make multiple requests - they'll be distributed across instances
for i in {1..10}; do
  curl http://localhost:3000/health
done
```

### 2. Manual WebSocket Test

```javascript
// Client 1 (may connect to backend-1)
const socket1 = io("http://localhost:3000/events", {
  auth: { token: "JWT_TOKEN" },
});

// Client 2 (may connect to backend-2)
const socket2 = io("http://localhost:3000/events", {
  auth: { token: "JWT_TOKEN" },
});

// Both should receive events regardless of instance
socket1.on("test-event", (data) => console.log("Client 1:", data));
socket2.on("test-event", (data) => console.log("Client 2:", data));

// Send from client 1 - both should receive
socket1.emit("test-event", { message: "Hello from client 1!" });
```

### 3. Verify Load Distribution

```bash
# View logs from both instances simultaneously
docker compose logs -f backend-1 backend-2 | grep "connected as user"
```

## 📊 Monitoramento

### Ver status dos containers

```bash
docker-compose ps
```

### Ver uso de recursos

```bash
docker stats
```

### Acessar logs do Nginx

```bash
docker exec -it mini-food-nginx cat /var/log/nginx/access.log
docker exec -it mini-food-nginx cat /var/log/nginx/error.log
```

## 🛠️ Troubleshooting

### Backend não conecta ao Redis

Verifique se o Redis está healthy:

```bash
docker-compose ps redis
```

Teste a conexão:

```bash
docker exec -it mini-food-redis redis-cli ping
# Deve retornar: PONG
```

### Migrations não executam

Execute manualmente:

```bash
docker exec -it mini-food-backend-1 npx prisma migrate deploy
```

### WebSocket não sincroniza entre instâncias

Verifique os logs para confirmar que ambas instâncias conectaram ao Redis:

```bash
docker-compose logs backend-1 backend-2 | grep "Redis adapter configured"
```

### Port já em uso

Se a porta 3000, 2998 ou 2999 já estiver em uso, edite o `docker-compose.yml` para usar outras portas.

## 🔄 Rebuild de uma instância específica

```bash
# Rebuild backend-1
docker-compose up -d --build --no-deps backend-1

# Rebuild backend-2
docker-compose up -d --build --no-deps backend-2
```

## 🧹 Limpeza

### Remover tudo (containers, volumes, networks)

```bash
docker-compose down -v --remove-orphans
```

### Remover imagens antigas

```bash
docker image prune -a
```

## 📝 Notas

- As migrations são executadas automaticamente na inicialização de cada backend
- O Redis garante que eventos WebSocket sejam entregues em todas as instâncias
- O Nginx distribui as requisições usando least connections (menor número de conexões ativas)
- Os volumes do PostgreSQL são persistentes entre reinicializações
- Para produção, altere `JWT_SECRET` e as credenciais do banco
