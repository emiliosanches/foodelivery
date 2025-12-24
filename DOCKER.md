# 🐳 Docker Production Environment

Production-ready stack with horizontal scaling, load balancing, and WebSocket synchronization.

## 🎯 What's Included

- **🔀 Nginx Load Balancer** - Distributes traffic using least connections algorithm
- **🚀 2x Backend Instances** - Horizontal scaling with auto-migrations
- **⚡ Redis** - WebSocket pub/sub for real-time event synchronization
- **🗄️ PostgreSQL** - Database with persistent volumes
- **📦 Multi-stage Builds** - Optimized Docker images (~150MB)

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

```bash
# Start all services
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Stop and remove volumes (cleans database)
docker compose down -v
```

**Access:**

- 🌐 Load Balancer: http://localhost:3000
- 🚀 Backend 1: http://localhost:2998
- 🚀 Backend 2: http://localhost:2999
- 🗄️ PostgreSQL: localhost:5432
- ⚡ Redis: localhost:6379

## 🔧 Services Overview

| Service       | Port | Description                                          |
| ------------- | ---- | ---------------------------------------------------- |
| **nginx**     | 3000 | Load balancer (least connections), WebSocket support |
| **backend-1** | 2998 | NestJS instance with Redis adapter                   |
| **backend-2** | 2999 | NestJS instance with Redis adapter                   |
| **postgres**  | 5432 | PostgreSQL 15 with persistent volume                 |
| **redis**     | 6379 | Pub/sub broker for WebSocket sync                    |

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

````bash
# Make multiple requests - they'll be distributed across instances
1. Start Docker Compose: `docker compose up --build`
2. Open [backend/test/websocket-test.html](backend/test/websocket-test.html) in browser
3. Get JWT token:
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@test.com",
       "password": "test123",
       "name": "Test User",
       "role": "CUSTOMER",
       "phone": "+5511999999999"
     }'
````

4. Paste token in test interface
5. Click "Connect All Clients" (creates 3 WebSocket connections)
6. Click "Send Test Event"
7. **✅ All 3 clients receive it = Redis is synchronizing!**

### Manual Testing

````bash
# Test load distribution
for i in {1..10}; do curl http://localhost:3000/health; done

# View which instance handles each connection
docker compose logs -f backend-1 backend-2 | grep "New client connected

Verifique se o Redis está healthy:

```bash
docker-compose ps redis
````

�️ Troubleshooting

### Backend won't connect to Redis

```bash
docker compose ps redis  # Check if healthy
docker exec -it mini-food-redis redis-cli ping  # Should return PONG
```

### Migrations not running

```bash
docker exec -it mini-food-backend-1 npx prisma migrate deploy
```

### WebSocket not syncing

```bash
# Check if both instances connected to Redis
docker compose logs backend-1 backend-2 | grep "Redis adapter configured"
```

### Port already in use

Edit `docker-compose.yml` to use different ports.

## 🧹 Cleanup

```bash
# Remove everything (containers, volumes, networks)
docker compose down -v --remove-orphans

# Remove old images
docker image prune -a
```

## 📝 Production Notes

- Migrations run automatically on backend startup
- Redis ensures WebSocket events reach all instances
- Nginx uses least connections for optimal distribution
- PostgreSQL volumes persist between restarts
- **Change JWT_SECRET and database credentials for production!**
