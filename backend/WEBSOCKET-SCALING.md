# 🔌 WebSocket Horizontal Scaling

Socket.io with Redis adapter enables multiple backend instances to share WebSocket connections and synchronize real-time events.

## 🧪 Quick Test

**Visual proof that scaling works:**

1. Configure backend `.env` with Live Server URL:
   ```bash
   FRONTEND_URL=http://127.0.0.1:5500  # or your Live Server port
   ```
2. Run `docker compose up --build` (from project root) or `yarn dev` for single instance
3. Serve [test/websocket-test.html](test/websocket-test.html) using **Live Server extension** in VS Code:
   - Right-click on `test/websocket-test.html` → "Open with Live Server"
   - Or install Live Server: `ext install ritwickdey.liveserver`
4. Get JWT token from `/auth/register` or `/auth/login`
5. Paste token → "Connect All Clients" → "Send Test Event"
6. ✅ All 3 clients receive the event (proves Redis synchronization)

> **Note:** The HTML file must be served via Live Server (not opened directly as `file://`) due to CORS policy. The backend CORS is configured to accept requests from `FRONTEND_URL` only.

## 🏗️ Architecture

```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼───┐ ┌─▼────┐
│ App1 │ │ App2 │  (Both connected to Redis)
└───┬──┘ └──┬───┘
    │       │
    └───┬───┘
        │
    ┌───▼───┐
    │ Redis │  (Pub/Sub broker)
    └───────┘
```

### Without Redis (Single Instance)

- Each instance stores connections in memory only
- Event in App1 only reaches clients connected to App1
- ❌ Doesn't work with load balancer

### With Redis (Multi Instance)

- Redis acts as pub/sub broker between instances
- Event in App1 is published to Redis
- Redis broadcasts to App2
- ✅ All clients receive events regardless of connection point

## 📦 Implementation

### Dependencies

```json
{
  "@socket.io/redis-adapter": "^8.3.0",
  "redis": "^5.10.0"
}
```

### Configuration

**Environment Variable:**

```env
REDIS_URL=redis://localhost:6379  # Optional - enables scaling
```

**Behavior:**

- `REDIS_URL` present → Redis adapter enabled (multi-instance mode)
- `REDIS_URL` absent → In-memory adapter (single-instance mode)

### Code Structure

**1. Custom Adapter** (`infra/adapters/out/websocket/redis-io.adapter.ts`):

```typescript
export class RedisIoAdapter extends IoAdapter {
  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

**2. Main Bootstrap** (`main.ts`):

```typescript
const redisIoAdapter = new RedisIoAdapter(app, configService);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

**3. Gateway** (`infra/adapters/out/websocket/events.gateway.ts`):

```typescript
@WebSocketGateway({ namespace: '/events' })
export class EventsGateway {
  @SubscribeMessage('test-event')
  handleTestEvent(client: Socket, payload: any) {
    // Broadcast to ALL clients across ALL instances
    this.server.emit('test-event', payload);
  }
}
```

## 🚀 Running Locally

### Option 1: Docker (Easiest)

```bash
docker compose up --build
# Redis + 2 backend instances + load balancer ready!
```

### Option 2: Manual Setup

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Terminal 1
PORT=3000 REDIS_URL=redis://localhost:6379 yarn start

# Terminal 2
PORT=3001 REDIS_URL=redis://localhost:6379 yarn start

# Connect clients to :3000 and :3001 - they'll sync via Redis
```

## 📊 Verification

**Console Logs:**

✅ With Redis:

```
[EventsGateway] Redis adapter configured for WebSocket scalability
```

⚠️ Without Redis:

```
[EventsGateway] REDIS_URL not configured. Running in single-instance mode
```

## 💡 Key Takeaways

1. **No Sticky Sessions Required:** Redis handles synchronization automatically
2. **Graceful Fallback:** App works without Redis (single-instance mode)
3. **Broadcast to All:** `server.emit()` reaches every client on every instance
4. **Production Ready:** Just set `REDIS_URL` environment variable

## 🔗 Related Docs

- [DOCKER.md](../DOCKER.md) - Full production stack setup
- [test/websocket-test.html](test/websocket-test.html) - Interactive testing tool
