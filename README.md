# React Native Shopping App

A full-stack mobile shopping application with React Native frontend, Node.js backend, and feature-first architecture. Includes user authentication, product browsing, cart management, order history, and user profile management.

---

## 📋 Table of Contents

- [React Native Shopping App](#react-native-shopping-app)
  - [📋 Table of Contents](#-table-of-contents)
  - [📁 Project Structure](#-project-structure)
  - [🛠️ Tech Stack](#️-tech-stack)
    - [Mobile (React Native)](#mobile-react-native)
    - [Backend](#backend)
  - [⚡ Quick Start](#-quick-start)
    - [Prerequisites](#prerequisites)
    - [Run Everything (Terminal 1 - Backend)](#run-everything-terminal-1---backend)
    - [Run App (Terminal 2 - Mobile)](#run-app-terminal-2---mobile)
  - [🔧 Backend Setup](#-backend-setup)
  - [📱 Mobile Setup](#-mobile-setup)
  - [📖 API Documentation](#-api-documentation)
  - [✅ Assignment Status](#-assignment-status)
  - [🏗️ Architecture](#️-architecture)
    - [Feature-First Structure](#feature-first-structure)
    - [State Management](#state-management)
    - [Networking](#networking)
  - [🧪 Testing](#-testing)
  - [🚀 Running the App](#-running-the-app)
  - [📝 Submission](#-submission)
  - [📚 References](#-references)

---

## 📁 Project Structure

```
ReactNativeAssignment/
├── mobile/                      # React Native app (RN 0.84.1)
│   ├── src/
│   │   ├── features/           # Feature-first architecture
│   │   │   ├── auth/           # Login, register, JWT, Social/Biometric auth
│   │   │   ├── products/       # Product list, detail, reviews, search history
│   │   │   ├── cart/           # Cart management, checkout
│   │   │   ├── orders/         # Order history, filtering
│   │   │   ├── profile/        # User profile, editing, offline cache, sync queue
│   │   │   └── wishlist/       # User wishlist tracking, sync to server
│   │   ├── components/         # Reusable UI components (Sync UI indicators)
│   │   ├── contexts/           # React Context (AuthContext)
│   │   ├── navigation/         # React Navigation 7 setup
│   │   ├── services/           # API client (Axios), Sync, Network, DB
│   │   ├── store/              # Redux Toolkit setup
│   │   └── types/              # TypeScript types
│   ├── __tests__/              # Jest tests (349 tests, ~87% coverage)
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
- **Navigation:** React Navigation 7 (bottom tabs + stack)
- **State Management:** Redux Toolkit + Context API
- **HTTP Client:** Axios with JWT interceptors
- **Storage & Offline:** WatermelonDB (SQLite) for offline-first architecture, react-native-encrypted-storage (tokens)
- **Network Status:** @react-native-community/netinfo
- **Authentication:** JWT + EncryptedStorage + Social/Biometric integration
- **Styling:** React Native StyleSheet
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + React Test Renderer (349 tests passing, ~87% coverage)

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
- ✅ User authentication (login/register/logout with 6 fields)
- ✅ Social & Biometric auth integrations
- ✅ JWT token storage (encrypted)
- ✅ Product listing (2-column grid, search, filters)
- ✅ Product details with reviews and rating system
- ✅ Wishlist tracking (offline & online sync)
- ✅ Search history persistence
- ✅ Recently viewed products
- ✅ Cart management (offline persistence)
- ✅ Checkout flow with payment methods
- ✅ Order history (with status filters)
- ✅ User profile (editable with offline queue caching)
- ✅ Advanced Offline-First Architecture (WatermelonDB + Sync Queue)
- ✅ Network status indicators and auto-sync
- ✅ Bottom tab navigation (Discover, Wishlist, Cart, Orders, Profile)
- ✅ Pull-to-refresh on lists
- ✅ TypeScript strict mode
- ✅ Interceptor-based auth with automatic retry

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
| 5 | Save profile to local database | ✅ Complete (WatermelonDB) | 2 |

**Bonus Features:**
- ✅ Product detail view with reviews and ratings
- ✅ Add/edit review functionality
- ✅ Shopping cart with quantity management
- ✅ Checkout with multiple payment methods
- ✅ Order history with detailed filtering
- ✅ User profile editing with offline queue fallback
- ✅ Advanced Offline-First Mode (WatermelonDB, NetInfo, Queued Sync)
- ✅ Pull-to-refresh on lists with sync indicators
- ✅ Wishlist feature with heart toggles and sync
- ✅ Search history tracking (last 20 queries)
- ✅ Recently viewed products carousel
- ✅ Bottom tab navigation (Discover, Wishlist, Cart, Orders, Profile)
- ✅ Comprehensive Test Suite (349 tests, ~87% coverage)
- ✅ TypeScript strict mode throughout
- ✅ Social & Biometric Auth Flows

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
- **React Context:** Auth state (user, token, isLoggedIn, biometric configs)
- **WatermelonDB:** Local SQLite performance cache & robust offline-first persistence
- **SyncQueue:** Background queueing engine with idempotency and exponential backoff
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
npm run test:coverage
```

Current coverage: **349 passing tests** across 47 test suites, achieving **~87% overall test coverage** (including Auth, Sync Service, Redux Thunks, and UI screens).

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
- ✅ User authentication (login, register, social, biometric)
- ✅ JWT token management with encrypted storage
- ✅ Product listing, search history, and recently viewed
- ✅ Product details and reviews with ratings
- ✅ Shopping cart and checkout with payment methods
- ✅ Order history with filtering
- ✅ User profile (editable + offline queue cache)
- ✅ Wishlist tracking (offline & online sync)
- ✅ Advanced Offline-first Sync Architecture with WatermelonDB
- ✅ Network status detection and auto-sync
- ✅ Bottom tab navigation
- ✅ ~87% Test Coverage (349 tests)
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
- [WatermelonDB](https://nozbe.github.io/WatermelonDB/)
- [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)

---

**Last Updated:** March 26, 2026

​
