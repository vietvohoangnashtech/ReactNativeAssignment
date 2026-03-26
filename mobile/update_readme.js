const fs = require('fs');
const path = 'd:/Work/Learn/2025/ReactNativeAssignment/README.md';

let content = fs.readFileSync(path, 'utf-8');

// Project Structure
const new_mobile_structure = `ReactNativeAssignment/
├── mobile/                      # React Native app (RN 0.84.1)
│   ├── src/
│   │   ├── features/           # Feature-first architecture
│   │   │   ├── auth/           # Login, register, JWT, Social/Biometric auth
│   │   │   ├── products/       # Product list, detail, reviews, search
│   │   │   ├── cart/           # Cart management, checkout
│   │   │   ├── orders/         # Order history, filtering
│   │   │   ├── profile/        # User profile, editing, offline cache
│   │   │   └── wishlist/       # User wishlist
│   │   ├── components/         # Reusable UI components (Sync UI)
│   │   ├── contexts/           # React Context (AuthContext)
│   │   ├── navigation/         # React Navigation 7 setup
│   │   ├── services/           # API client (Axios), Sync, Network, DB
│   │   ├── store/              # Redux Toolkit setup
│   │   └── types/              # TypeScript types
│   ├── __tests__/              # Jest tests (349 tests, ~87% coverage)
│   └── package.json`;

content = content.replace(/ReactNativeAssignment\/.*?└── package\.json/s, new_mobile_structure);

// Tech Stack
const new_tech_stack = `### Mobile (React Native)
- **Framework:** React Native 0.84.1, React 19.2.3
- **Navigation:** React Navigation 7 (bottom tabs + stack)
- **State Management:** Redux Toolkit + Context API
- **HTTP Client:** Axios with JWT interceptors
- **Storage & Offline:** WatermelonDB (SQLite) for offline-first architecture, react-native-encrypted-storage (tokens)
- **Network Status:** @react-native-community/netinfo
- **Authentication:** JWT + EncryptedStorage + Social/Biometric integration
- **Styling:** React Native StyleSheet
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + React Test Renderer (349 tests passing, ~87% coverage)`;

content = content.replace(/### Mobile \(React Native\).*?### Backend/s, new_tech_stack + '\n\n### Backend');

// Mobile Setup
const new_features = `**Features Implemented:**
- ✅ User authentication (login/register with 6 fields)
- ✅ Social & Biometric auth integrations
- ✅ JWT token storage (encrypted)
- ✅ Product listing (2-column grid, search, filters)
- ✅ Product details with reviews
- ✅ Wishlist tracking and syncing
- ✅ Cart management & checkout flow
- ✅ Order history (with status filters)
- ✅ User profile (editable with offline queue caching)
- ✅ Advanced Offline-First Architecture (WatermelonDB + Sync Queue)
- ✅ Bottom tab navigation
- ✅ TypeScript strict mode
- ✅ Interceptor-based auth with automatic retry`;

content = content.replace(/\*\*Features Implemented:\*\*.*?---/s, new_features + '\n\n---');

// Assignment Status Bonus Features
const new_bonus = `**Bonus Features:**
- ✅ Product detail view with reviews
- ✅ Add review functionality
- ✅ Shopping cart with quantity management
- ✅ Checkout with payment methods
- ✅ Order history with status filtering
- ✅ User profile editing
- ✅ Advanced Offline-First Mode (WatermelonDB, NetInfo, Queued Sync)
- ✅ Pull-to-refresh on lists & Sync status indicators
- ✅ Bottom tab navigation (Discover, Wishlist, Cart, Orders, Profile)
- ✅ Comprehensive Test Suite (349 tests, ~87% coverage)
- ✅ TypeScript strict mode throughout
- ✅ Social & Biometric Auth Flows`;

content = content.replace(/\*\*Bonus Features:\*\*.*?---/s, new_bonus + '\n\n---');

// Architecture State Management
const new_state_mgmt = `### State Management
- **Redux Toolkit:** Server state (products, orders, cart)
- **React Context:** Auth state (user, token, isLoggedIn, biometric configs)
- **WatermelonDB:** Local SQLite performance cache & robust offline-first persistence
- **SyncQueue:** Background queueing engine with idempotency and exponential backoff
- **EncryptedStorage:** Sensitive data (JWT tokens)`;

content = content.replace(/### State Management.*?### Networking/s, new_state_mgmt + '\n\n### Networking');

// Testing
const new_testing = `## ��� Testing

Run Jest tests:
\`\`\`bash
cd mobile
npm test
npm run test:coverage
\`\`\`

Current coverage: **349 passing tests** across 47 test suites, achieving **~87% overall test coverage** (including Auth, Sync Service, Redux Thunks, and UI screens).`;

content = content.replace(/## ��� Testing.*?---/s, new_testing + '\n\n---');

// Submission Features
const new_submission_features = `Features Implemented:
- ✅ User authentication (login, register, social, biometric)
- ✅ JWT token management with encrypted storage
- ✅ Product listing, search history, and recently viewed
- ✅ Product details and reviews
- ✅ Shopping cart and checkout
- ✅ Order history with filtering
- ✅ User profile (editable + offline queue cache)
- ✅ Wishlist tracking (offline & online sync)
- ✅ Advanced Offline-first Sync Architecture with WatermelonDB
- ✅ Bottom tab navigation
- ✅ ~87% Test Coverage (349 tests)
- ✅ TypeScript strict mode`;

content = content.replace(/Features Implemented:.*?```/s, new_submission_features + '\n```');

// References
content = content.replace('- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)', '- [WatermelonDB](https://nozbe.github.io/WatermelonDB/)\n- [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)');

fs.writeFileSync(path, content, 'utf-8');
console.log("Updated README.md");
