# Technical Overview

Migrate from `AsyncStorage` (key-value string store) to a proper structured local database for the **Profile** and **Cart** features. The goal is schema-based persistence, type-safe queries, reactive data access, and reliable cart survival across app kills.

---

## Database Comparison & Recommendation

| Criterion | SQLite (op-sqlite + Drizzle) | **WatermelonDB** ✅ | Realm | PouchDB |
|---|---|---|---|---|
| **Foundation** | Pure SQLite | SQLite (C++ binding) | Object DB (custom C++) | LevelDB / IndexedDB |
| **RN-first design** | ✅ (with op-sqlite) | ✅✅ (purpose-built for RN) | ✅ | ⚠️ (needs adapters) |
| **TypeScript types** | ✅ (Drizzle schema) | ✅ (Model classes) | ✅ (Realm objects) | ⚠️ (manual) |
| **Reactive queries** | ❌ (poll manually) | ✅ (Observables / withObservables) | ✅ (Results live objects) | ⚠️ (changes feed) |
| **Schema migrations** | ✅ (Drizzle migrate) | ✅ (built-in versioned) | ✅ (versioned) | ❌ |
| **Bundle size** | ~300 KB (op-sqlite) | ~600 KB | ~7 MB | ~1.5 MB |
| **Setup complexity** | Medium | Medium | Low–Medium | High (adapters) |
| **Offline-first** | Manual | ✅✅ | ✅✅ | ✅✅ (CouchDB sync) |
| **Open-source / no vendor lock** | ✅ | ✅ | ⚠️ (MongoDB Atlas Sync = paid) | ✅ |
| **Performance (reads)** | ⚡⚡ | ⚡⚡⚡ (lazy loading) | ⚡⚡⚡ | ⚡ |
| **Best for this app** | ❌ (more boilerplate) | ✅✅ **Winner** | Good alt | ❌ (no CouchDB backend) |

### Why WatermelonDB is the best fit

1. **Purpose-built for React Native** — async, lazy C++ SQLite binding; never blocks the JS thread
2. **Reactive observables** — cart badge in `TabNavigator` stays live without explicit re-fetches
3. **Schema migrations built-in** — safe to evolve `CartItem` and `UserProfile` models over app versions
4. **Works alongside Redux** — WatermelonDB is the _persistence layer_; Redux remains the _UI state layer_
5. **Smaller than Realm** — ~600 KB vs ~7 MB native module; important for Android cold start
6. **No vendor lock-in** — fully open-source, unlike Realm's Atlas Device Sync pricing model
7. **Offline-first** — profile cache and cart persist without any extra coding effort

### When to choose the others instead
- **Realm** → If you need MongoDB Atlas Device Sync across devices, or prefer OOP model (`realm.write`)
- **SQLite + Drizzle** → If the team has SQL expertise and wants full query control + type-safe schema
- **PouchDB** → Only if your backend runs CouchDB/CouchBase and you want built-in cloud replication

---

# Task Breakdown

## Task 1 — Install & Configure WatermelonDB

- **Files**: `package.json`, `android/app/build.gradle`, `ios/Podfile`, `babel.config.js`, `src/services/database/database.ts`, `src/services/database/schema.ts`, `src/services/database/migrations.ts`
- **AC**: Local database initialises on app start without crash on Android and iOS
- **Technical Notes**:
  - Install `@nozbe/watermelondb` + `@nozbe/with-observables`
  - Add `@babel/plugin-proposal-decorators` to `babel.config.js`
  - Add JSI/C++ build flags to `android/app/build.gradle` (`pickFirst '**/libc++_shared.so'`)
  - Define schema with two tables: `profiles` (columns: `user_id`, `username`, `email`, `age`, `first_name`, `last_name`, `role`, `updated_at`) and `cart_items` (columns: `product_id`, `name`, `price`, `image`, `quantity`)
  - Versioned migrations starting at version 1
- **Platform Notes**:
  - iOS: run `pod install` after adding native dependency
  - Android: Hermes JSI enabled by default in RN 0.84 — WatermelonDB works without JSI flag

---

## Task 2 — Define WatermelonDB Models

- **Files**: `src/services/database/models/ProfileModel.ts`, `src/services/database/models/CartItemModel.ts`
- **AC**: TypeScript model classes match existing `UserProfile` and `CartItem` interfaces
- **Technical Notes**:
  ```ts
  // ProfileModel.ts
  import { Model } from '@nozbe/watermelondb';
  import { field, date } from '@nozbe/watermelondb/decorators';

  export class ProfileModel extends Model {
    static table = 'profiles';
    @field('user_id') userId!: number;
    @field('username') username!: string;
    @field('email') email!: string;
    @field('age') age!: number;
    @field('first_name') firstName!: string;
    @field('last_name') lastName!: string;
    @field('role') role!: string;
    @date('updated_at') updatedAt!: Date;
  }
  ```
  ```ts
  // CartItemModel.ts
  import { Model } from '@nozbe/watermelondb';
  import { field } from '@nozbe/watermelondb/decorators';

  export class CartItemModel extends Model {
    static table = 'cart_items';
    @field('product_id') productId!: number;
    @field('name') name!: string;
    @field('price') price!: number;
    @field('image') image!: string;
    @field('quantity') quantity!: number;
  }
  ```
- **Platform Notes**: Decorators require `@babel/plugin-proposal-decorators` on both platforms

---

## Task 3 — Profile Repository (replace AsyncStorage)

- **Files**: `src/services/database/repositories/profileRepository.ts`, `src/features/profile/store/profileSlice.ts`
- **AC**: Profile is read from WatermelonDB on app launch; written on API success and update; works offline with last-cached data
- **Technical Notes**:
  - Repository exposes: `saveProfile(profile: UserProfile): Promise<void>`, `getProfile(): Promise<UserProfile | null>`, `clearProfile(): Promise<void>`
  - Uses `database.write()` transactions for upsert (find existing record by `user_id`, update or create)
  - `profileSlice.ts` replaces all `AsyncStorage.setItem/getItem` calls with `profileRepository.saveProfile()` / `profileRepository.getProfile()` — thunk logic stays identical
  - Remove `@react-native-async-storage/async-storage` import from profileSlice (keep package for other usages if any)
- **Platform Notes**: Same behaviour on both platforms; no platform-specific code needed

---

## Task 4 — Cart Repository & Persistence Middleware

- **Files**: `src/services/database/repositories/cartRepository.ts`, `src/features/cart/store/cartSlice.ts`, `src/store/store.ts`
- **AC**: Cart survives app close and reopen; items restored on boot; cart operations (add, remove, update qty, clear) sync to DB
- **Technical Notes**:
  - Repository exposes: `saveCart(items: CartItem[]): Promise<void>`, `loadCart(): Promise<CartItem[]>`, `clearCart(): Promise<void>`
  - `saveCart` uses a single `database.write()` transaction: delete all existing rows then bulk-insert current items (simple replace strategy)
  - Add `loadCartFromDB` async thunk in `cartSlice.ts` — dispatched once in `App.tsx` after DB init
  - Add Redux middleware (or `store.subscribe()`) that calls `cartRepository.saveCart(state.cart.items)` on every cart state change
  - Alternative pattern: call `cartRepository.saveCart` explicitly in each thunk/action — easier to test
  - Recommended: use `store.subscribe()` debounced (300ms) to avoid write on every keystroke
- **Platform Notes**: No platform-specific differences

---

## Task 5 — App Initialisation

- **Files**: `App.tsx`, `src/store/store.ts`
- **AC**: DB is ready before first Redux action that requires it; cart is rehydrated before `TabNavigator` renders
- **Technical Notes**:
  - Add `DatabaseProvider` from `@nozbe/watermelondb/DatabaseProvider` wrapping `Provider`
  - Dispatch `loadCartFromDB` thunk in `App.tsx` inside `useEffect` after store is ready
  - Show `ActivityIndicator` during DB init (same pattern as current `loading` in `RootNavigator`)
- **Platform Notes**: Database file location: Android → `data/data/<package>/databases/`, iOS → `Library/`

---

## Task 6 — Suggested New Features (requires local DB to be truly useful)

### 6a — Search History Persistence
- **Files**: `src/services/database/models/SearchHistoryModel.ts`, `src/features/products/store/productsSlice.ts`
- Store last 20 search queries; show in search bar dropdown; clear from profile settings
- Uses new WatermelonDB table `search_history` (columns: `query`, `searched_at`)

### 6b — Wishlist / Saved Items
- **Files**: `src/features/wishlist/` (new feature module)
- Add heart icon to `ProductCard`; tap toggles wishlist; dedicated tab or section in Profile
- WatermelonDB table `wishlist_items` (columns: `product_id`, `name`, `price`, `image`, `added_at`)
- Sync to server endpoint `POST /user/wishlist` when online

### 6c — Recently Viewed Products
- **Files**: `src/features/products/store/productsSlice.ts`, new `RecentlyViewedModel.ts`
- Track last 10 product views; show horizontal carousel on product list screen
- WatermelonDB table `recently_viewed` (columns: `product_id`, `name`, `price`, `image`, `viewed_at`)

### 6d — Order History Offline Cache
- **Files**: `src/features/orders/store/ordersSlice.ts`, new `OrderModel.ts`
- Cache fetched orders locally; show stale orders when offline with "Offline" badge
- Mirrors the pattern already implemented for profile cache

### 6e — Cart Abandonment Banner
- **Files**: `src/features/cart/screens/CartScreen.tsx`, `src/features/products/screens/ProductListScreen.tsx`
- When user has items in cart and navigates away, show sticky banner "You have X items in your cart"
- Uses reactive WatermelonDB observable on `cart_items` count

### 6f — Price Drop Alerts (Wishlist + Push)
- **Requires**: 6b (Wishlist) + Firebase Cloud Messaging integration approval
- Backend sends push when a wishlisted product's price changes
- Client shows in-app notification using React Native Modal or `react-native-toast-message`

---

# Mobile UI Implementation

- **Figma Reference**: No Figma link provided — implementation follows existing design tokens in `src/theme/`
- **Key Components**: No new screens required for Tasks 1–5; new screens for Wishlist (6b)
- **Design Tokens**: Existing `colors.ts`, `spacing.ts`, `typography.ts` apply
- **Navigation**: Wishlist (6b) would add a new tab or profile sub-screen
- **Platform Adaptations**:
  - Android: SQLite WAL mode enabled by default in WatermelonDB — no extra config
  - iOS: App Group not required (single-target app)

---

# Technical Requirements

## State Management
- WatermelonDB = **persistence layer** (source of DB truth)
- Redux Toolkit = **UI state layer** (source of runtime truth)
- Flow: App boot → load from DB into Redux → user actions → update Redux → sync to DB

## New Dependencies
| Package | Version | Purpose |
|---|---|---|
| `@nozbe/watermelondb` | `^0.28` | Core local DB |
| `@nozbe/with-observables` | `^1.6` | React hooks for reactive queries |
| `@babel/plugin-proposal-decorators` | `^7` | Required for WatermelonDB model decorators |

> All new libraries must be approved before install per project rules.

## Removed Usage
- `AsyncStorage` in `profileSlice.ts` — replaced by `profileRepository`
- Keep `@react-native-async-storage/async-storage` package (may be used by other libraries)

## API Endpoints (no change)
- `GET /user` — profile fetch (unchanged)
- `PATCH /user` — profile update (unchanged)
- `POST /order` — checkout (unchanged)

## Permissions Required
None — SQLite database is app-sandboxed on both platforms.

## Performance Considerations
- WatermelonDB uses lazy loading and C++ bridge — reads are off the JS thread
- `saveCart` uses debounced `store.subscribe()` (300ms) to avoid write on every stepper tap
- Profile is a single-row table — upsert is O(1)
- Use `database.batch()` for cart bulk writes (single transaction)

## Error Handling
- DB write failures → log error + fallback to in-memory Redux state (non-blocking)
- DB corruption → delete and recreate database file (last resort, prompt user)
- Profile offline → show `isOffline` banner (already implemented)

## Testing Approach
- Unit: Mock WatermelonDB `Database` and repository methods using `jest.mock`
- Integration: Use `@nozbe/watermelondb/testing` helpers to spin up in-memory SQLite
- E2E: Cart persistence test — add items → kill app → reopen → verify items restored

---

# Definition of Done

| Criterion | Verification |
|---|---|
| Profile no longer uses AsyncStorage | No `AsyncStorage` import in `profileSlice.ts` |
| Profile survives app restart | Manual test: update profile → force-kill → reopen → data intact |
| Profile works offline | Disable network → open app → cached profile displayed with offline banner |
| Cart survives app restart | Manual test: add 3 items → force-kill → reopen → Cart tab badge = 3 |
| Cart clears after order | Place order → cart empty in DB and Redux |
| No JS thread blocking | No ANR / jank on Android during cart operations (verified with Systrace) |
| Schema migrations versioned | `migrations.ts` at version 1 with addTable for `profiles` and `cart_items` |
| TypeScript strict | No `any`, no `!` assertions in repository and model files |
| Unit tests pass | `profileRepository.test.ts`, `cartRepository.test.ts` with mocked WatermelonDB |
| Both platforms build | `npm run android` and `npm run ios` succeed with new native dependency |
