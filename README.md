# 🍕 FooDelivery - Complete Food Delivery Platform

> **A modern and scalable food delivery solution built with development best practices**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## 🚀 Overview

**FooDelivery** is a complete delivery platform that connects **restaurants**, **drivers**, and **customers** in a robust and efficient digital ecosystem. Developed with focus on **performance**, **scalability**, and **user experience**.

### ✨ Key Features

- 🏪 **Complete Restaurant Management** - Menus, categories, and orders
- 🚚 **Smart Delivery System** - Real-time tracking
- 👥 **Multi-user Profiles** - Customers, restaurants, and drivers
- 💳 **Payment Processing** - Multiple secure payment methods
- 📱 **Responsive Interface** - Optimized experience across all devices
- 🔔 **Real-time Notifications** - Instant status updates
- 📊 **Analytics Dashboard** - Detailed reports and metrics

## 🏗️ Project Architecture

```
FooDelivery/
├── 🎨 frontend/          # Modern and responsive React interface
└── ⚙️  backend/           # Robust API with NestJS and hexagonal architecture
```

### 🎯 Backend - Enterprise RESTful API

- **🏛️ Hexagonal Architecture** - Clean, testable, and maintainable code
- **🔐 JWT Authentication** - Robust and stateless security
- **📊 Prisma ORM** - Type-safe database access
- **🗄️ PostgreSQL** - High-performance relational database
- **📝 TypeScript** - Type safety and better DX
- **🧪 Automated Testing** - Complete test coverage

### 🎨 Frontend - Modern Interface

- **⚛️ React 18** - Functional components and hooks
- **📱 Responsive Design** - Mobile-first approach
- **🎭 Intuitive UI/UX** - Focused on user experience
- **⚡ Optimized Performance** - Fast and efficient loading

## 🚀 How to Run

### 📦 Option 1: Docker (Recommended for Production)

**Complete stack with horizontal scaling and load balancer:**

```bash
# Start all services (nginx + 2 backend instances + redis + postgres)
docker compose up --build

# Access the application:
# - Load Balancer: http://localhost:3000
# - Backend Instance 1: http://localhost:2998
# - Backend Instance 2: http://localhost:2999
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

**Services included:**

- 🔀 **Nginx Load Balancer** - Distributes traffic between backend instances
- 🚀 **2x Backend Instances** - Horizontal scaling with WebSocket sync via Redis
- 📊 **PostgreSQL** - Production database with persistent volumes
- ⚡ **Redis** - WebSocket pub/sub for event synchronization

📖 **See [DOCKER.md](DOCKER.md) for complete documentation**

### 🔧 Option 2: Local Development

**Prerequisites:**

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 🔧 Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-username/delivery-app.git
cd delivery-app

# Backend
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run prisma:migrate
npm run dev

# Frontend (in another terminal)
cd ../frontend
npm install
npm run dev
```

## 🌟 Technical Highlights

### 💎 Code Quality

- ✅ **Clean Architecture** - Clear separation of concerns
- ✅ **SOLID Principles** - Extensible and maintainable code
- ✅ **Design Patterns** - Repository, Strategy
- ✅ **Type Safety** - 100% TypeScript throughout the project

### 🚀 Performance & Scalability

- ⚡ **Query Optimizations** - Efficient indexes and relationships
- 🔄 **Smart Caching** - Redis for frequent data
- 📊 **Monitoring** - Structured logs and metrics
- 🐳 **Containerization** - Multi-stage Docker builds for production
- 🔀 **Horizontal Scaling** - Load balancer + multiple backend instances
- 🌐 **WebSocket Scalability** - Redis adapter for real-time sync across instances
- 📡 **Real-time Events** - Order updates, notifications, and delivery tracking
- 🧪 **[WebSocket Test Tool](backend/test/websocket-test.html)** - Interactive testing interface

### 🔒 Security

- 🛡️ **Robust Authentication** - JWT with refresh tokens
- 🔐 **Data Validation** - Rigorous sanitization and validation
- 🔑 **Encryption** - Protected sensitive data

## � Documentation

- 📖 **[DOCKER.md](DOCKER.md)** - Complete Docker deployment guide
- 🔌 **[WEBSOCKET-SCALING.md](WEBSOCKET-SCALING.md)** - WebSocket horizontal scaling architecture
- ⚙️ **[Backend README](backend/README.md)** - API documentation and setup
- 🧪 **[WebSocket Test](backend/test/websocket-test.html)** - Interactive scalability testing

## 📈 Roadmap

- [x] 🔔 **Real-time WebSockets** - Order and delivery updates
- [x] 🔀 **Horizontal Scaling** - Load balanced architecture with Redis
- [ ] 💳 **In-App Payments** - Direct payment processing
- [ ] 🔔 **Push Notifications** - WebSockets for real-time updates
- [ ] 📊 **Analytics Dashboard** - Restaurant performance metrics (daily orders, monthly revenue, best-selling products)
- [ ] 🌍 **Multi-language** - Internationalization support

---

<div align="center">
  <p><strong>Developed with ❤️ by Emilio</strong></p>
  <p>
    <a href="https://linkedin.com/in/emiliosanches">LinkedIn</a> •
    <a href="https://github.com/emiliosanches">GitHub</a> •
    <a href="mailto:emiliosneto13@gmail.com">Email</a>
  </p>
</div>
