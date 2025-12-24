# WebSocket Horizontal Scaling

## 🎯 Overview

This application supports horizontal WebSocket scaling through Socket.io's **Redis Adapter**. This allows multiple application instances to share information about connections and real-time events.

## 🧪 Quick Test

**Want to test if scaling is working?** Open the interactive test tool:

**📍 [backend/test/websocket-test.html](test/websocket-test.html)**

1. Start the Docker Compose stack (see [DOCKER.md](../DOCKER.md))
2. Open `websocket-test.html` in your browser
3. Get a JWT token from the API (register/login)
4. Paste the token and click "Connect All Clients"
5. Click "Send Test Event" - all 3 clients should receive it! ✨

This proves that Redis is synchronizing events across all backend instances.

## 🏗️ Architecture

```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼───┐ ┌─▼────┐
│ App1 │ │ App2 │
│:3000 │ │:3001 │
└───┬──┘ └──┬───┘
    │       │
    └───┬───┘
        │
    ┌───▼───┐
    │ Redis │
    │ :6379 │
    └───────┘
```

### Como Funciona

1. **Sem Redis** (Single Instance):

   - Cada instância mantém suas conexões WebSocket apenas em memória local
   - Um evento processado na Instância A só notifica usuários conectados na Instância A
   - ❌ Não funciona com load balancer

2. **Com Redis** (Multi Instance):
   - Redis atua como um pub/sub broker entre todas as instâncias
   - Um evento processado na Instância A é propagado via Redis para todas as outras instâncias
   - ✅ Funciona perfeitamente com load balancer

## 📦 Dependências Instaladas

```json
{
  "@socket.io/redis-adapter": "^8.3.0",
  "redis": "^5.10.0"
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

Defina no seu arquivo `.env`:

```env
REDIS_URL=redis://localhost:6379
```

### Comportamento

- **REDIS_URL presente**: Redis adapter configurado automaticamente
- **REDIS_URL ausente**: Aplicação roda em modo single-instance (desenvolvimento local)

## 🚀 Execução

### Redis Local (Docker)

```bash
# Rodar Redis via Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

## 🧪 Testando Escalabilidade

### 1. Subir Redis

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 2. Subir Múltiplas Instâncias

```bash
# Remova a variavel PORT do .env para settar manualmente em cada terminal

# Terminal 1 - Instância na porta 3000
PORT=3000 REDIS_URL=redis://localhost:6379 yarn start

# Terminal 2 - Instância na porta 3001
PORT=3001 REDIS_URL=redis://localhost:6379 yarn start
```

### 3. Testar Comunicação entre Instâncias

```javascript
// Cliente conecta na instância :3000
const socket1 = io('http://localhost:3000/events', {
  auth: { token: 'JWT_TOKEN_USER_123' },
});

// Cliente conecta na instância :3001
const socket2 = io('http://localhost:3001/events', {
  auth: { token: 'JWT_TOKEN_USER_123' },
});

// Criar um pedido (processado em qualquer instância)
// AMBOS os clientes receberão a notificação via Redis
```

## 📊 Logs

Com Redis configurado, você verá no console:

```
[Nest] INFO [EventsGateway] WebSocket Gateway initialized
[Nest] INFO [EventsGateway] Redis adapter configured for WebSocket scalability
```

Sem Redis:

```
[Nest] WARN [EventsGateway] REDIS_URL not configured. WebSocket will run in single-instance mode
```

## ⚠️ Importante

### Sticky Sessions

Com Socket.io + Redis, você **NÃO precisa** de sticky sessions no load balancer. O Redis garante que os eventos sejam entregues corretamente independente de qual instância o cliente está conectado.

### Fallback

Se o Redis falhar durante a inicialização, a aplicação continuará funcionando em modo single-instance. Isso é útil para desenvolvimento local sem Redis.

