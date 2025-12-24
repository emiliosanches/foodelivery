# 🍕 FooDelivery - Food Delivery Platform

> Modern full-stack delivery platform built with NestJS, React, and enterprise-grade architecture

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

**Portfolio project demonstrating modern software engineering practices:** Clean Architecture, horizontal scaling, real-time WebSockets, Docker containerization, and production-ready infrastructure.

## 🎯 What This Project Demonstrates

### **Architecture & Design Patterns**

- ✅ **Hexagonal Architecture** (Ports & Adapters)
- ✅ **Clean Code** with SOLID principles
- ✅ **Domain-Driven Design** with clear bounded contexts
- ✅ **Repository Pattern** for data abstraction

### **Scalability & Performance**

- ✅ **Horizontal Scaling** with load balancer (Nginx)
- ✅ **WebSocket Scaling** via Redis pub/sub
- ✅ **Multi-instance deployment** with Docker Compose
- ✅ **Database optimization** with indexes and efficient queries

### **Real-Time Features**

- ✅ **WebSocket integration** (Socket.io)
- ✅ **Live order tracking** and notifications
- ✅ **Event-driven architecture**

### **DevOps & Infrastructure**

- ✅ **Docker containerization** with multi-stage builds
- ✅ **Production-ready stack** (Nginx + Backend + Redis + PostgreSQL)
- ✅ **Database migrations** with Prisma
- ✅ **Environment configuration** management

## 🏗️ Tech Stack

### Backend (NestJS)

- **Framework:** NestJS 10 with TypeScript
- **Architecture:** Hexagonal (Clean Architecture)
- **Database:** PostgreSQL 15 + Prisma ORM
- **Auth:** JWT with refresh tokens
- **Real-time:** Socket.io with Redis adapter
- **Validation:** class-validator, class-transformer

### Frontend (React)

- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context API
- **HTTP Client:** Fetch API
- **WebSocket:** Socket.io client

### Infrastructure

- **Containerization:** Docker + Docker Compose
- **Load Balancer:** Nginx (least connections)
- **Caching/Pub-Sub:** Redis 7
- **Database:** PostgreSQL 15

## 📁 Project Structure

```
mini-food/
├── backend/           # NestJS API with Hexagonal Architecture
│   ├── src/
│   │   ├── domain/          # Business logic & entities
│   │   ├── application/     # Use cases & DTOs
│   │   └── infra/           # Adapters (REST, Database, WebSocket)
│   ├── prisma/              # Database schema & migrations
│   └── test/                # E2E tests & WebSocket test tool
├── frontend/          # Next.js React application
├── docker-compose.yml # Full production stack
└── nginx.conf         # Load balancer configuration
```

### Hexagonal Architecture Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                         DOMAIN LAYER                        │
│  (Pure Business Logic - Framework Independent)              │
│                                                              │
│  • Entities (User, Restaurant, Order, Delivery)             │
│  • Domain Services (Business Rules)                         │
│  • Value Objects (Address, Money, Status)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  (Use Cases & Application Logic)                            │
│                                                              │
│  • Services (OrderService, DeliveryService)                 │
│  • DTOs (CreateOrderDto, UpdateRestaurantDto)               │
│  • Ports (IOrderRepository, IPaymentGateway)                │
└─────────┬────────────────────────────────────┬──────────────┘
          │                                    │
┌─────────┴────────────────┐      ┌───────────┴──────────────┐
│   INBOUND ADAPTERS       │      │   OUTBOUND ADAPTERS      │
│  (Driven - Input)        │      │  (Driving - Output)      │
│                          │      │                          │
│  • REST Controllers      │      │  • Prisma Repositories   │
│  • WebSocket Gateway     │      │  • Redis Adapter         │
│  • NestJS Guards         │      │  • Stripe Payment        │
└──────────────────────────┘      └──────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended - Test Full Stack)

**Runs complete infrastructure with load balancing and horizontal scaling:**

```bash
docker compose up --build
```

**What's running:**

- ⚖️ Nginx Load Balancer → `http://localhost:3000`
- 🚀 Backend Instance 1 → `http://localhost:2998`
- 🚀 Backend Instance 2 → `http://localhost:2999`
- 🗄️ PostgreSQL → `localhost:5432`
- ⚡ Redis → `localhost:6379`

📖 **See [DOCKER.md](DOCKER.md) for details and troubleshooting**

### Option 2: Local Development

```bash
# Prerequisites: Node.js 18+, PostgreSQL 14+

# Backend
cd backend
yarn install
cp .env.example .env  # Configure DATABASE_URL and JWT_SECRET
npx prisma migrate dev
yarn start:dev        # Runs on :3000

# Frontend (new terminal)
cd frontend
yarn install
yarn dev              # Runs on :3001
```

📖 **See [backend/README.md](backend/README.md) for API documentation**

## ✨ Key Features

### For Customers

- Browse restaurants by location
- View menus with categories and item details
- Place orders with multiple payment methods
- Real-time order status updates via WebSocket
- Manage delivery addresses

### For Restaurants

- Complete menu management (categories, items, prices)
- Receive and manage orders in real-time
- Update order status (preparing, ready, etc.)
- Track delivery assignments

### For Delivery Drivers

- Update location and availability status
- Receive delivery assignments
- Mark deliveries as picked up and delivered

## 🔧 Key Technical Decisions

### Why Hexagonal Architecture?

**Problem:** Tight coupling between business logic and infrastructure makes code hard to test and maintain.

**Solution:** Separate domain logic from external concerns (database, API, UI). Business rules in `domain/`, use cases in `application/`, infrastructure in `infra/`.

**Result:** Testable business logic, easy to swap implementations (e.g., change database or add GraphQL).

### Why Redis for WebSocket Scaling?

**Problem:** Socket.io stores connections in memory. With multiple instances behind a load balancer, clients connected to different servers don't receive events.

**Solution:** Redis pub/sub adapter synchronizes events across all backend instances.

**Result:** True horizontal scalability - deploy 2, 10, or 100 instances without losing real-time functionality.

**Test it:** Open [backend/test/websocket-test.html](backend/test/websocket-test.html) to see 3 clients receiving synchronized events.

### Why Multi-Stage Docker Builds?

**Problem:** Standard Node.js Docker images include dev dependencies and source code, resulting in 500MB+ images.

**Solution:** Separate build and runtime stages. Build stage compiles TypeScript, runtime stage only contains production dependencies and compiled code.

**Result:** Final image ~150MB, faster deployments, improved security.

## 📚 Documentation

| Document                                                     | Description                                      |
| ------------------------------------------------------------ | ------------------------------------------------ |
| [backend/README.md](backend/README.md)                       | API endpoints, architecture details, local setup |
| [frontend/README.md](frontend/README.md)                     | Frontend structure and components                |
| [DOCKER.md](DOCKER.md)                                       | Docker setup, services, and troubleshooting      |
| [backend/WEBSOCKET-SCALING.md](backend/WEBSOCKET-SCALING.md) | WebSocket scaling architecture and testing       |
| [CONTRIBUTING.md](CONTRIBUTING.md)                           | How to contribute to this project                |

---

<div align="center">

**Built by [Emilio Sanches](https://github.com/emiliosanches)**

[LinkedIn](https://linkedin.com/in/emiliosanches) • [GitHub](https://github.com/emiliosanches) • [Email](mailto:emiliosneto13@gmail.com)

_This is a portfolio project showcasing modern full-stack development practices_

[MIT License](LICENSE)

</div>

---

<div align="center">
  <p><strong>Developed with ❤️ by Emilio</strong></p>
  <p>
    <a href="https://linkedin.com/in/emiliosanches">LinkedIn</a> •
    <a href="https://github.com/emiliosanches">GitHub</a> •
    <a href="mailto:emiliosneto13@gmail.com">Email</a>
  </p>
</div>
