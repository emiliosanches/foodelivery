# ⚙️ FooDelivery Backend

> RESTful API with Hexagonal Architecture, WebSocket support, and production-ready infrastructure

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)

### 🏛️ Hexagonal Architecture (Clean Architecture)

```
📁 src/
├── 🏢 domain/              # Pure business rules
│   ├── /*/entities/           # Domain entities
│   ├── /*/services            # Domain services (business rules)
│   └── /*/value-objects       # Domain value objects
├── 🎯 application/         # Use cases and application logic
│   ├── services/              # Use case implementations
│   ├── dtos/                  # Data Transfer Objects
│   └── ports/                 # Hexagonal architecture ports (contracts)
├── 🔌 infra/               # External adapters (implementations - NestJS, database, etc)
│   ├── adapters/
│   │   ├── in/rest/           # REST Controllers, NestJS modules, NestJS guards
│   │   └── out/               # Hexagonal architecture output adapters (implementations)
│   |       ├── persistence/   # Repositories implementations (prisma module, entity repositories)
│   |       ├── payment/       # Payment gateways implementations
│   |       └── events/        # Events module, event bus adapters
│   └── config/                # Configurations
└── shared/                 # Utility functions
```

### ⚡ Cutting-edge Tech Stack

- **🚀 NestJS** - Professional and scalable Node.js framework
- **📘 TypeScript** - Type safety and superior developer experience
- **🗄️ Prisma ORM** - Type-safe database client with migrations
- **🐘 PostgreSQL** - Robust and high-performance relational database
- **🔐 JWT** - Stateless and secure authentication
- **🔌 Socket.io** - Real-time WebSocket communication with Redis adapter for horizontal scaling
- **🧪 Jest** - Complete testing framework
- **📊 Class Validator** - Declarative data validation

## � Core Features

- **User Management:** JWT auth, multi-role support (Customer/Restaurant/Driver), refresh tokens
- **Restaurant Operations:** CRUD, menu management, categories, location-based search
- **Order Flow:** Complete lifecycle from creation to delivery, status tracking, real-time updates
- **Delivery System:** Driver management, assignment logic, location tracking
- **Real-Time Events:** WebSocket notifications for orders, deliveries, and system events

## 🚀 How to Run

### 💻 Option 1: Local Development

**Prerequisites:**

```bash
Node.js >= 18.0.0
PostgreSQL >= 14.0
Yarn >= 1.22.0 (package manager)
Redis >= 6.0 (optional, for WebSocket scaling)
```

**Installation:**

```bash
# Clone and install dependencies
git clone <repository-url>
cd backend
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your configurations

# Run migrations
yarn prisma migrate dev
yarn prisma generate

# Start the server
yarn start:dev
```

### 🐳 Option 2: Docker (multiple containers + load balancer)

**Production-ready stack with horizontal scaling:**

```bash
# From the root directory (containing backend folder)

docker compose up --build

# Access the application:
# - Load Balancer: http://localhost:3000
# - Backend Instance 1: http://localhost:2998
# - Backend Instance 2: http://localhost:2999
```

See [DOCKER.md](../DOCKER.md) for complete documentation.

### 🌍 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/foodeliver"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis (Optional - for WebSocket horizontal scaling)
# Leave commented for single-instance development
# Uncomment when deploying multiple instances behind a load balancer
# REDIS_URL="redis://localhost:6379"

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3001/"
```

### 🔌 WebSocket Real-Time Features

The API includes real-time WebSocket support using Socket.io:

- **Namespace**: `/events`
- **Authentication**: JWT required (via header or auth object)
- **Events**:
  - `notification:new` - New notification for user
  - `order:new` - New order created
  - `order:status-updated` - Order status changed

**Horizontal Scaling**: The WebSocket implementation supports multiple instances via Redis adapter. See [WEBSOCKET-SCALING.md](./WEBSOCKET-SCALING.md) for detailed setup and deployment instructions.

```javascript
// Example client connection
const socket = io('http://localhost:3000/events', {
  auth: { token: 'YOUR_JWT_TOKEN' },
});

socket.on('notification:new', (data) => {
  console.log('New notification:', data);
});
```

## 📋 API Endpoints

### 🔐 Authentication

```http
POST   /auth/register     # User registration
POST   /auth/login        # Login with JWT
POST   /auth/refresh      # Refresh token
```

### 👤 User

GET /users/me # Authenticated user profile (auth)
PATCH /users/me # Update profile (auth)
GET /users/:id # User profile by ID (auth, admin)

### 🏪 Restaurants

```http
GET    /restaurants                    # List all restaurants (paginated)
GET    /restaurants/search/city/:city  # Search by city (paginated)
GET    /restaurants/:id                # Restaurant details
GET    /restaurants/my-restaurant      # Get restaurant of authenticated user (auth)
POST   /restaurants                    # Create restaurant (auth)
PATCH  /restaurants/:id                # Update restaurant (auth)
PATCH  /restaurants/:id/toggle-active  # Activate/deactivate (auth)
```

### 📂 Categories

```http
GET    /restaurants/:id/categories     # List restaurant categories
GET    /restaurants/:id/categories/:id # Get category details
POST   /restaurants/:id/categories     # Create category (auth)
PUT    /restaurants/:id/categories/:id # Update category (auth)
DELETE /restaurants/:id/categories/:id # Delete category (auth)
```

### 🍕 Menu Items

```http
GET    /restaurants/:id/menu-items                                   # All restaurant items
GET    /menu-items/:id                                               # Get item
POST   /restaurants/:id/menu-items                                   # Create item (auth)
PUT    /restaurants/:restaurantId/menu-items/:id                     # Update item (auth)
DELETE /restaurants/:restaurantId/menu-items/:id                     # Delete item (auth)
PATCH  /restaurants/:restaurantId/menu-items/:id/toggle-active       # Activate/deactivate (auth)
PATCH  /restaurants/:restaurantId/menu-items/:id/toggle-availability # Make available/unavailable (auth)
```

### 🍕 Addresses

```http
GET    /addresses     # Get addresses of authenticated user (auth)
POST   /addresses     # Create address (auth)
GET    /addresses/:id # Get address (auth)
PUT    /addresses/:id # Update address (auth)
DELETE /addresses/:id # Delete address (auth)
```

### 🍕 Payment Methods

```http
GET    /payment-methods     # Get payment methods of authenticated user (auth)
POST   /payment-methods     # Create payment method (auth)
GET    /payment-methods/:id # Get payment method (auth)
PUT    /payment-methods/:id # Update payment method (auth)
DELETE /payment-methods/:id # Delete payment method (auth)
```

### 🍕 Orders

```http
POST  /orders                                           # Create order (auth)
GET   /orders/:id                                       # Get order (auth, restaurant/customer)
PATCH /orders/:id/cancel                                # Cancel order (auth, restaurant/customer)
GET   /customers/me/orders                              # Get orders of authenticated user (auth)
GET   /restaurants/:restaurantId/orders                 # Get restaurant orders (auth, restaurant)
PATCH /restaurants/:restaurantId/orders/:orderId/accept # Mark order as preparing (auth, restaurant)
PATCH /restaurants/:restaurantId/orders/:orderId/reject # Mark order as cancelled, with reason rejected (auth, restaurant)
PATCH /restaurants/:restaurantId/orders/:orderId/ready  # Mark order as ready (auth, restaurant)
```

### 🍕 Delivery Person

```http
POST /users/me/delivery-profile              # Create a delivery person profile
GET  /users/me/delivery-profile              # Get delivery person profile of authenticated user (auth, delivery person)
PUT  /users/me/delivery-profile              # Update delivery person profile (auth, delivery person)
PUT  /users/me/delivery-profile/location     # Update current location (auth, delivery person)
PUT  /users/me/delivery-profile/availability # Change availability for deliveries (auth, delivery person)
```

### Delivery Person's Deliveries

```http
GET  /users/me/delivery-profile/deliveries                     # Get currently and previously assigned deliveries (auth, delivery person)
GET  /users/me/delivery-profile/deliveries/:deliveryId         # Get information of a delivery (auth, delivery person)
POST /users/me/delivery-profile/deliveries/:deliveryId/accept  # Accept a delivery opportunity (auth, delivery person)
POST /users/me/delivery-profile/deliveries/:deliveryId/pickup  # Mark a delivery as picked up (auth, delivery person)
POST /users/me/delivery-profile/deliveries/:deliveryId/deliver # Mark a delivery as delivered (auth, delivery person)
```

## 🏗️ Architecture Patterns

- **Ports & Adapters (Hexagonal):** Domain logic independent of infrastructure
- **Repository Pattern:** Data access abstraction
- **Dependency Injection:** NestJS IoC container
- **Event-Driven:** Domain events for cross-module communication

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with class-validator
- Custom NestJS Guards for route protection
- CORS configured for frontend origin

## 📊 Performance

- Database indexes on foreign keys and search fields
- Pagination on list endpoints
- Prisma query optimization
- Redis for WebSocket scaling (optional)

## 🧪 Testing WebSocket Scaling

Open [test/websocket-test.html](test/websocket-test.html) in a browser after running Docker Compose. Connect 3 clients and send an event - all should receive it, proving Redis synchronization works.

See [WEBSOCKET-SCALING.md](WEBSOCKET-SCALING.md) for technical details.
