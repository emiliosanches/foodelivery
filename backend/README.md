# 🏗️ FooDelivery Backend - REST API

> **Robust and scalable RESTful API built with NestJS, TypeScript, and Hexagonal Architecture**

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## 🎯 About the Project

This API is the heart of **FooDelivery**, a modern delivery platform that manages **restaurants**, **orders**, **deliveries**, and **users**. Built with focus on **performance**, **security**, and **maintainability**.

### 🏛️ Hexagonal Architecture (Clean Architecture)

```
📁 src/
├── 🏢 domain/              # Pure business rules
│   └── entities/           # Domain entities
├── 🎯 application/         # Use cases and application logic
│   ├── services/           # Use case implementations
│   ├── dtos/              # Data Transfer Objects
│   └── ports/             # Interfaces (contracts)
└── 🔌 infra/              # External adapters
    ├── adapters/
    │   ├── in/rest/       # REST Controllers
    │   └── out/persistence/ # Repositories
    └── config/            # Configurations
```

### ⚡ Cutting-edge Tech Stack

- **🚀 NestJS** - Professional and scalable Node.js framework
- **📘 TypeScript** - Type safety and superior developer experience
- **🗄️ Prisma ORM** - Type-safe database client with migrations
- **🐘 PostgreSQL** - Robust and high-performance relational database
- **🔐 JWT** - Stateless and secure authentication
- **🧪 Jest** - Complete testing framework
- **📊 Class Validator** - Declarative data validation

## 🌟 Implemented Features

### 👥 User Management
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Multi-profiles** (Customer, Restaurant, Driver)
- ✅ **Robust validation** of input data
- ✅ **Password encryption** with bcrypt

### 🏪 Restaurant Module
- ✅ **Complete CRUD** for restaurants
- ✅ **Category management** organized
- ✅ **Dynamic menu** with items and prices
- ✅ **Activation/deactivation system**
- ✅ **Location-based search** (city)

### 📦 Order System
- ✅ **Complete order flow**
- ✅ **Multiple status** tracking
- ✅ **Automatic calculations** of values
- ✅ **Detailed history** of transactions

### 🚚 Smart Deliveries
- ✅ **Real-time tracking**
- ✅ **Driver management**
- ✅ **Route optimization**
- ✅ **Rating system**

## 🚀 How to Run

### Prerequisites
```bash
Node.js >= 18.0.0
PostgreSQL >= 14.0
npm >= 8.0.0
```

### 🔧 Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configurations

# Run migrations
npx prisma migrate dev
npx prisma generate

# Start the server
npm run start:dev
```

### 🌍 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/foodeliver"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV="development"
```

## 📋 API Endpoints

### 🔐 Authentication
```http
POST   /auth/register     # User registration
POST   /auth/login        # Login with JWT
POST   /auth/refresh      # Refresh token
GET    /auth/profile      # User profile
```

### 🏪 Restaurants
```http
GET    /restaurants                    # List restaurants (paginated)
GET    /restaurants/search/city/:city  # Search by city
GET    /restaurants/:id               # Restaurant details
POST   /restaurants                   # Create restaurant (auth)
PUT    /restaurants/:id               # Update restaurant (auth)
PATCH  /restaurants/:id/toggle-active # Activate/deactivate (auth)
```

### 📂 Categories
```http
GET    /restaurants/:id/categories     # List categories
POST   /restaurants/:id/categories     # Create category (auth)
PUT    /restaurants/:id/categories/:id # Update category (auth)
DELETE /restaurants/:id/categories/:id # Delete category (auth)
```

### 🍕 Menu Items
```http
GET    /categories/:id/menu-items      # Items by category
GET    /restaurants/:id/menu-items     # All restaurant items
POST   /categories/:id/menu-items      # Create item (auth)
PUT    /menu-items/:id                # Update item (auth)
PATCH  /menu-items/:id/toggle-active  # Activate/deactivate (auth)
```

## 🧪 Tests (In Development)

```bash
# Tests will be implemented soon
# - Unit tests with Jest
# - Integration tests
# - Complete code coverage
```

## 🏗️ Code Patterns

### 📐 Architecture

- **🎯 Ports & Adapters** - Dependency inversion
- **🧩 Dependency Injection** - NestJS IoC container
- **📦 Repository Pattern** - Persistence abstraction
- **🎭 Service Layer** - Isolated business logic

## 🔒 Implemented Security

- 🛡️ **Rigorous validation** of input with class-validator
- 🔐 **JWT Authentication** with custom guards  
- 🧹 **Data sanitization** of input
- 🔑 **Secure hashing** of passwords with bcrypt
- 🚫 **CORS** properly configured

## 📊 Performance & Monitoring

- ⚡ **Optimized queries** with Prisma
- 🔍 **Strategic database indexes**
- 📈 **Pagination** in listing endpoints
- 🕒 **Timeout** configured in operations
- 📝 **Structured logging** for debugging

## 🚀 Deploy & DevOps

```bash
# Build for production
npm run build

# Run in production
npm run start:prod

# Docker
docker build -t delivery-api .
docker run -p 3000:3000 delivery-api
```

## 🎯 Next Steps

- [ ] 🧪 **Unit Tests** - Complete coverage with Jest
- [ ] 🧪 **E2E Tests** - End-to-end integration tests
- [ ] 📚 **Swagger Documentation** - Interactive API docs
- [ ] 🔔 **WebSockets** - Real-time notifications
- [ ] 📊 **In-App Payment** - Stripe API (Sandbox) to simulate payments
- [ ] 🐳 **Kubernetes** - Container orchestration
- [ ] 🚀 **CI/CD** - Automated pipeline

---

<div align="center">
  <p><strong>🚀 REST API ready to scale</strong></p>
  <p><em>Developed with market best practices</em></p>
</div>