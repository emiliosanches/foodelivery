# Contributing to FooDelivery

Thank you for your interest in this project! While this is primarily a portfolio/demonstration project, contributions are welcome.

## 📋 Project Purpose

This is a **portfolio project** designed to showcase:

- Clean Architecture implementation
- Scalable WebSocket infrastructure
- Production-ready Docker setup
- Modern TypeScript development

## 🔧 Local Setup

1. **Fork and clone** the repository
2. **Install dependencies:**
   ```bash
   cd backend && yarn install
   cd ../frontend && yarn install
   ```
3. **Setup database:**
   ```bash
   cd backend
   cp .env.example .env  # Configure your DATABASE_URL
   npx prisma migrate dev
   ```
4. **Run locally:**

   ```bash
   # Backend (terminal 1)
   cd backend && yarn start:dev

   # Frontend (terminal 2)
   cd frontend && yarn dev
   ```

## 📝 Code Style

- **TypeScript** for type safety
- **ESLint + Prettier** for formatting
- **Conventional Commits** for commit messages
- **Hexagonal Architecture** principles (domain → application → infra)

## 🧪 Testing

```bash
# Run tests (when implemented)
cd backend
yarn test
yarn test:e2e
```

## 🐳 Docker Testing

```bash
# Test full stack with load balancing
docker compose up --build

# Verify WebSocket scaling
open backend/test/websocket-test.html
```

## 🤝 Pull Request Process

1. Create a feature branch (`feature/amazing-feature`)
2. Make your changes following the code style
3. Test locally and with Docker
4. Commit with descriptive messages
5. Push and open a Pull Request

## 📚 Documentation

When adding features:

- Update relevant README files
- Add JSDoc comments to public APIs
- Update DOCKER.md if infrastructure changes
- Add examples to demonstrate usage

## 💡 Suggestions

Have ideas for improvements? Open an issue! Areas of interest:

- Additional tests (unit, integration, e2e)
- Performance optimizations
- Security enhancements
- Infrastructure improvements

## 📧 Contact

**Emilio Sanches**

- LinkedIn: [emiliosanches](https://linkedin.com/in/emiliosanches)
- GitHub: [@emiliosanches](https://github.com/emiliosanches)
- Email: emiliosneto13@gmail.com
