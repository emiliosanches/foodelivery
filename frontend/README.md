# 🎨 FooDelivery Frontend

> Next.js 14 application with TypeScript, Tailwind CSS, and WebSocket integration

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Auth:** JWT stored in httpOnly cookies + Context API
- **Real-time:** Socket.io client for WebSocket events
- **HTTP Client:** Native Fetch API

## 📁 Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Login/Register pages
│   ├── profile/           # User profile pages
│   ├── actions/           # Server actions
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components (Header, Footer)
│   └── ui/                # Reusable UI components (Button, Card, etc.)
├── contexts/
│   └── auth-context.tsx   # Authentication state management
├── lib/
│   ├── auth-utils.ts      # JWT helpers
│   └── service/           # API service layer
└── middleware.ts          # Route protection
```

## 🚀 Running Locally

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Access at http://localhost:3001
```

## 🔐 Authentication Flow

1. User logs in via `/auth/login`
2. Backend returns JWT access + refresh tokens
3. Tokens stored in httpOnly cookies
4. `middleware.ts` protects routes requiring auth
5. `AuthContext` provides auth state globally
6. Refresh token automatically renews access token

## 🔌 WebSocket Integration

```typescript
// Connection established in AuthContext
const socket = io("http://localhost:3000/events", {
  auth: { token: accessToken },
});

// Listen to order updates
socket.on("order:status-updated", (data) => {
  // Update UI
});
```

## 🎨 UI Components

Using **shadcn/ui** - a collection of accessible, customizable components built with Radix UI and Tailwind.

- Pre-configured in `components/ui/`
- Consistent design system
- Dark mode support (if needed)

## 📝 Key Features

- ✅ **Protected Routes** - Middleware-based auth
- ✅ **Real-time Updates** - WebSocket events for orders
- ✅ **Responsive Design** - Mobile-first Tailwind CSS
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **API Layer** - Centralized service functions

## 🔗 API Integration

All API calls go through `lib/service/` modules:

```typescript
// lib/service/auth.service.ts
export async function login(email: string, password: string) {
  const response = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}
```

## 🌐 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```
