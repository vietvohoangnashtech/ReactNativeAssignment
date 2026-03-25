# Mobile — React Native Shopping App

A React Native shopping app (v0.84.1 + TypeScript) with feature-first architecture, Redux Toolkit state management, JWT authentication, WatermelonDB local persistence, and a cyan-accented design system.

---

## Prerequisites

- Node.js >= 22.11.0
- Java 17 (for Android builds)
- Android Studio with an emulator (API 33+) **or** a physical device
- React Native CLI environment configured — follow the [official setup guide](https://reactnative.dev/docs/set-up-your-environment)

> The backend server must be running before you launch the app. See [`../backend/README.md`](../backend/README.md).

---

## Quick Start

\`\`\`sh
# 1. Install dependencies
npm install

# 2. Start Metro bundler (keep this terminal open)
npm start

# 3. In a second terminal — run on Android emulator
npm run android

# 4. Run on iOS simulator (macOS only)
bundle install && bundle exec pod install
npm run ios
\`\`\`

> **Android emulator note:** The API base URL is hardcoded to `http://10.0.2.2:3000` which routes to `localhost` on the host machine.

---

## Project Structure

\`\`\`
mobile/
├── App.tsx                     # Entry point — providers wiring
├── src/
│   ├── theme/                  # Design tokens (colors, typography, spacing)
│   ├── components/
│   │   ├── ui/                 # Button, TextInput, ScreenHeader
│   │   └── layout/             # Background wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx     # JWT session state
│   ├── features/               # Feature-first modules
│   │   ├── auth/               # Login / Register
│   │   ├── products/           # Product list, detail, reviews
│   │   ├── cart/               # Cart management, Checkout (persisted locally)
│   │   ├── orders/             # Order history
│   │   └── profile/            # User profile (offline cache via WatermelonDB)
│   ├── navigation/             # React Navigation setup
│   ├── services/
│   │   ├── api/                # Axios client + JWT interceptors
│   │   └── database/           # WatermelonDB setup, models, repositories
│   │       ├── database.ts     # DB instance + DatabaseProvider
│   │       ├── schema.ts       # Table definitions (profiles, cart_items, …)
│   │       ├── migrations.ts   # Versioned schema migrations
│   │       ├── models/         # WatermelonDB Model classes
│   │       └── repositories/   # CRUD helpers (profileRepository, cartRepository)
│   ├── store/                  # Redux Toolkit store + rootReducer
│   └── types/api/              # Shared API response types
└── __tests__/
\`\`\`

---

## Tech Stack

| Area | Library |
|---|---|
| Framework | React Native 0.84.1 + React 19 |
| Language | TypeScript (strict) |
| Navigation | React Navigation 7 (NativeStack + BottomTabs) |
| State | Redux Toolkit 2 + React Context |
| HTTP | Axios with JWT interceptors |
| Secure storage | react-native-encrypted-storage |
| Local database | @nozbe/watermelondb (SQLite, reactive, offline-first) |
| Cache (key-value) | @react-native-async-storage/async-storage |
| Icons | react-native-vector-icons (Feather set) |
| Testing | Jest + React Test Renderer |

---

## Key Scripts

| Command | Description |
|---|---|
| `npm start` | Start Metro bundler |
| `npm run android` | Build & launch on Android |
| `npm run ios` | Build & launch on iOS |
| `npm test` | Run Jest test suite |
| `npm run lint` | ESLint check |

---

## Design System

All design tokens live in `src/theme/`:

- **Primary accent:** `#0DF2F2` (cyan)
- **Checkout accent:** `#F97316` (orange)
- **Background:** `#F9FAFB`
- **Surface:** `#FFFFFF`
- **Icons:** Feather icon set via `react-native-vector-icons`

---

## Architecture Overview

The app follows a **feature-first** structure. Each feature folder (`auth`, `products`, `cart`, `orders`, `profile`) contains its own:
- `screens/` — React Native screens
- `store/` — Redux slice (createSlice / createAsyncThunk)
- `services/` — API calls (Axios)
- `hooks/` — Custom React hooks
- `types/` — TypeScript interfaces

Navigation is split into three layers:
1. **RootNavigator** — Auth gate (logged in vs. not)
2. **AuthNavigator** — Login/Register stack
3. **TabNavigator** — Bottom tabs (Discover / Cart / Orders / Profile) + stack screens (ProductDetail, Checkout)

---

## Local Database (WatermelonDB)

The app uses **WatermelonDB** (built on SQLite) as its local persistence layer. Redux Toolkit remains the UI state layer; WatermelonDB is the on-device storage layer.

### Why WatermelonDB over AsyncStorage / Realm / PouchDB

| | AsyncStorage | **WatermelonDB** | Realm | PouchDB |
|---|---|---|---|---|
| Structured queries | ❌ | ✅ | ✅ | ⚠️ |
| Reactive live data | ❌ | ✅ | ✅ | ⚠️ |
| Schema migrations | ❌ | ✅ | ✅ | ❌ |
| Bundle size | tiny | ~600 KB | ~7 MB | ~1.5 MB |
| Offline-first | ⚠️ | ✅ | ✅ | ✅ |
| Open-source / no lock | ✅ | ✅ | ⚠️ (Atlas Sync = paid) | ✅ |

**AsyncStorage** is a flat key-value store — it has no schema, no migrations, and no query capability. It is kept for small primitives (auth token, preferences) but is **no longer used for structured feature data**.

**Realm** was ruled out due to its ~7 MB native module size and MongoDB Atlas Sync vendor lock-in.

**PouchDB** was ruled out because there is no CouchDB/CouchBase backend and React Native adapter support is fragile.

### Persisted data

| Table | Feature | Behaviour |
|---|---|---|
| `profiles` | Profile | Cached after successful `GET /user`; served offline with banner |
| `cart_items` | Cart | Synced on every cart change via debounced `store.subscribe()`; restored on app boot |
| `search_history` *(planned)* | Products | Last 20 queries; drives search dropdown |
| `wishlist_items` *(planned)* | Wishlist | Heart-toggled products; synced to server when online |
| `recently_viewed` *(planned)* | Products | Last 10 viewed products; horizontal carousel on list screen |

### Data flow

```
App boot  →  WatermelonDB  →  dispatch loadCartFromDB  →  Redux store
User action  →  Redux store  →  WatermelonDB write (debounced 300 ms)
API success  →  WatermelonDB write  →  Redux store update
```

---

## Planned Features

| Feature | Description | Requires |
|---|---|---|
| **Search History** | Persist last 20 queries; show in search bar dropdown; clear from Profile | WatermelonDB `search_history` table |
| **Wishlist / Saved Items** | Heart icon on product cards; dedicated screen; sync to `POST /user/wishlist` | WatermelonDB `wishlist_items` table |
| **Recently Viewed** | Track last 10 viewed products; horizontal carousel on Discover screen | WatermelonDB `recently_viewed` table |
| **Order History Cache** | Cache fetched orders; show stale data offline with badge | WatermelonDB `orders` table |
| **Cart Abandonment Banner** | Sticky banner when cart has items and user navigates away | Reactive WatermelonDB cart count |
| **Price Drop Alerts** | Push notification when a wishlisted item's price drops | Wishlist feature + FCM integration |

Planning documents for these features live in `docs/planning/features/`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Metro can't connect | Run `npm start -- --reset-cache` |
| Android build fails | Check `ANDROID_HOME` env var and JDK 17 |
| Icons not rendering | Rebuild the app after `npm install` (native module) |
| 401 Unauthorized | Backend JWT is 1 hr — re-login or restart backend |
| Network error on device | Replace `10.0.2.2` with your machine's LAN IP in `src/services/api/client.ts` |
| WatermelonDB crash on Android | Ensure `pickFirst '**/libc++_shared.so'` is set in `android/app/build.gradle` `packagingOptions` |
| WatermelonDB crash on iOS | Run `bundle exec pod install` after `npm install` |
| Decorators not recognised | Confirm `@babel/plugin-proposal-decorators` is listed in `babel.config.js` with `legacy: true` |
| Cart not restoring on boot | Check `loadCartFromDB` thunk is dispatched in `App.tsx` before navigator renders |
| DB migration error | Bump `migrations.ts` version and add `addColumns`/`addTable` migration step |

---

## Further Reading

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Detailed implementation guide](../IMPLEMENTATION_GUIDE.md)
