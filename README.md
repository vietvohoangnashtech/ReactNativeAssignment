# React Native Shopping App

A full-stack mobile shopping application with React Native frontend, Node.js backend, and feature-first architecture. Includes user authentication, product browsing, cart management, order history, and user profile management.

---

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Mobile Setup](#mobile-setup)
- [API Documentation](#api-documentation)
- [Assignment Status](#assignment-status)
- [Architecture](#architecture)
- [Submission](#submission)

---

## 📁 Project Structure

```
ReactNativeAssignment/
├── mobile/                      # React Native app (RN 0.84.1)
│   ├── src/
│   │   ├── features/           # Feature-first architecture
│   │   │   ├── auth/           # Login, register, JWT management
│   │   │   ├── products/       # Product list, detail, reviews
│   │   │   ├── cart/           # Cart management, checkout
│   │   │   ├── orders/         # Order history, filtering
│   │   │   └── profile/        # User profile, editing, offline cache
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React Context (Auth)
│   │   ├── navigation/         # React Navigation setup
│   │   ├── services/           # API client (Axios)
│   │   ├── store/              # Redux Toolkit setup
│   │   └── types/              # TypeScript types
│   ├── __tests__/              # Jest tests
│   └── package.json
│
├── backend/                     # Node.js REST API
│   ├── authorization/          # Login, register, JWT
│   ├── products/               # Product endpoints
│   ├── orders/                 # Order endpoints
│   ├── users/                  # User endpoints
│   ├── common/                 # Middleware, models
│   └── package.json
│
├── base-ref-coding-style/      # Reference for code conventions
├── old-project-need-convert/   # Original project (archived)
└── .gitignore                  # Optimized for monorepo

```

---

## 🛠️ Tech Stack

### Mobile (React Native)
- **Framework:** React Native 0.84.1, React 19.2.3
- **Navigation:** React Navigation (bottom tabs + stack)
- **State Management:** Redux Toolkit + Context API
- **HTTP Client:** Axios with JWT interceptors
- **Storage:** react-native-encrypted-storage (tokens), AsyncStorage (cache)
- **Authentication:** JWT + EncryptedStorage
- **Styling:** React Native StyleSheet
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + React Test Renderer

### Backend
- **Runtime:** Node.js with Express
- **Database:** SQLite (Sequelize ORM)
- **Authentication:** JWT
- **Validation:** Custom schema validation middleware
- **API Docs:** Swagger UI (`/swagger/`)

---

## ⚡ Quick Start

### Prerequisites
- **Node.js:** v22.11.0+
- **Android SDK/Emulator** or **iOS setup** (Xcode + CocoaPods)
- **npm** or **yarn**

### Run Everything (Terminal 1 - Backend)
```bash
cd backend
npm install
npm start
# Server runs at http://localhost:3000
# Swagger docs: http://localhost:3000/swagger/
```

### Run App (Terminal 2 - Mobile)
```bash
cd mobile
npm install
npm run android       # For Android emulator/device
# OR
npm run ios          # For iOS simulator
```

---

## 🔧 Backend Setup

See [backend/README.md](backend/README.md) for detailed instructions.

**Quick commands:**
```bash
cd backend
npm install
npm start
```

**Available Endpoints:**
- `POST /login` — User login (returns JWT token)
- `POST /signup` — User registration
- `POST /logout` — Invalidate token
- `GET /user` — Get profile (requires auth)
- `PATCH /user` — Update profile (requires auth)
- `GET /product` — List products
- `GET /product/:id` — Product details
- `GET /product/:id/review` — Product reviews
- `POST /product/:id/review` — Add review (requires auth)
- `GET /order` — User orders (requires auth)
- `POST /order` — Create order (requires auth)
- `GET /order/payment-methods` — Payment methods

---

## 📱 Mobile Setup

See [mobile/README.md](mobile/README.md) for detailed instructions.

**Quick commands:**
```bash
cd mobile
npm install
npm run android
```

**Features Implemented:**
- ✅ User authentication (login/register with 6 fields)
- ✅ JWT token storage (encrypted)
- ✅ Product listing (2-column grid, search)
- ✅ Product details with reviews
- ✅ Cart management
- ✅ Checkout flow
- ✅ Order history (with status filters)
- ✅ User profile (editable, offline cache)
- ✅ Bottom tab navigation
- ✅ TypeScript strict mode
- ✅ Interceptor-based auth

---

## 📖 API Documentation

**Base URL:** `http://10.0.2.2:3000` (Android emulator) or `http://localhost:3000`

**Interactive Docs:** Start backend and visit `http://localhost:3000/swagger/`

**Authentication:** All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Token is automatically injected via interceptors in the mobile app.

---

## ✅ Assignment Status

| # | Task | Status | Points |
|---|------|--------|--------|
| 1 | Integrate with login API | ✅ Complete | 2 |
| 2 | Store token in Encrypted Storage | ✅ Complete | 2 |
| 3 | Display Product List on Home Tab | ✅ Complete | 2 |
| 4 | Build Profile screen from API | ✅ Complete | 2 |
| 5 | Save profile to local database | ✅ Complete (AsyncStorage) | 2 |

**Bonus Features:**
- ✅ Product detail view with reviews
- ✅ Add review functionality
- ✅ Shopping cart with quantity management
- ✅ Checkout with payment methods
- ✅ Order history with status filtering
- ✅ User profile editing
- ✅ Offline mode detection
- ✅ Pull-to-refresh on lists
- ✅ Bottom tab navigation (Discover, Cart, Orders, Profile)
- ✅ TypeScript strict mode throughout

---

## 🏗️ Architecture

### Feature-First Structure
Code is organized by **business feature**, not by layer:
```
features/
├── auth/         # All auth-related code (screens, services, types, store)
├── products/     # All product-related code
├── cart/         # Cart management
├── orders/       # Order management
└── profile/      # User profile management
```

**Benefits:**
- Easy to locate feature code
- Minimal inter-feature dependencies
- Scales well as features grow
- Clear responsibility boundaries

### State Management
- **Redux Toolkit:** Server state (products, orders, cart)
- **React Context:** Auth state (user, token, isLoggedIn)
- **AsyncStorage:** Offline cache (profile, cart)
- **EncryptedStorage:** Sensitive data (JWT tokens)

### Networking
- Single Axios instance with base URL: `http://10.0.2.2:3000`
- JWT auto-injection via interceptors
- Automatic 401 handling (logout on token expiry)
- Error handling with typed responses

---

## 🧪 Testing

Run Jest tests:
```bash
cd mobile
npm test
```

Current coverage: `LoginScreen` component test with `AuthProvider` wrapper.

---

## 🚀 Running the App

**Step 1: Start Backend**
```bash
cd backend
npm start
```

**Step 2: Start Mobile (in new terminal)**
```bash
cd mobile
npm run android
```

**Step 3: Test the flow**
1. LoginScreen appears → enter credentials (admin/admin or register)
2. On success → redirects to ProductList (Discover tab)
3. Browse products → add to cart → proceed to checkout
4. View order history, profile, and edit account details

---

## 📝 Submission

**Subject Line:**
```
[Mobile][React Native Assignment] {Your Name} – {Your SD}
```

**Email Body:**
```
GitHub Repository: {link to your code}

Features Implemented:
- ✅ User authentication (login & register)
- ✅ JWT token management with encrypted storage
- ✅ Product listing with search
- ✅ Product details and reviews
- ✅ Shopping cart and checkout
- ✅ Order history with filtering
- ✅ User profile (editable + offline cache)
- ✅ Bottom tab navigation
- ✅ TypeScript strict mode
- [Add any custom features you built]
```

**Send to:** Your instructor's email

---

## 📚 References

- [React Native Docs](https://reactnative.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Axios Docs](https://axios-http.com/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [react-native-encrypted-storage](https://github.com/emeraldsanto/react-native-encrypted-storage)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

**Last Updated:** March 20, 2026

​
