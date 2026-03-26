module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@reduxjs/toolkit|immer|react-redux|@testing-library|react-native-vector-icons|react-native-encrypted-storage)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // ── Always exclude ──────────────────────────────────────────────────────
    '!src/**/*.d.ts',           // TypeScript declaration files
    '!src/**/*.types.ts',       // Pure type-definition files
    '!src/**/index.ts',         // Barrel re-export files
    // ── Framework / infrastructure wiring ───────────────────────────────────
    '!src/navigation/**',       // React Navigation declarative config (no logic)
    '!src/store/store.ts',      // configureStore() call + type exports only
    '!src/store/rootReducer.ts',// combineReducers() wiring – slices are tested instead
    '!src/services/api/client.ts',       // axios.create() config – mocked in all tests
    '!src/services/api/interceptors.ts', // Axios interceptor setup
    '!src/services/database/**',         // WatermelonDB ORM schema/models/repos
    // ── Constants / design tokens ────────────────────────────────────────────
    '!src/theme/**',            // Color/spacing/typography constants – no logic
  ],
  coverageReporters: ['text', 'lcov'],
};
