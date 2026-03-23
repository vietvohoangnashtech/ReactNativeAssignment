# Mobile — React Native Shopping App

A React Native shopping app (v0.84.1 + TypeScript) with feature-first architecture, Redux Toolkit state management, JWT authentication, and a cyan-accented design system.

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
│   │   ├── cart/               # Cart management, Checkout
│   │   ├── orders/             # Order history
│   │   └── profile/            # User profile (with offline cache)
│   ├── navigation/             # React Navigation setup
│   ├── services/api/           # Axios client + JWT interceptors
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
| Cache | @react-native-async-storage/async-storage |
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

## Troubleshooting

| Problem | Fix |
|---|---|
| Metro can't connect | Run `npm start -- --reset-cache` |
| Android build fails | Check `ANDROID_HOME` env var and JDK 17 |
| Icons not rendering | Rebuild the app after `npm install` (native module) |
| 401 Unauthorized | Backend JWT is 1 hr — re-login or restart backend |
| Network error on device | Replace `10.0.2.2` with your machine's LAN IP in `src/services/api/client.ts` |

---

## Further Reading

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Detailed implementation guide](../IMPLEMENTATION_GUIDE.md)
