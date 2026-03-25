const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // WatermelonDB (0.28) uses rxjs internally. Metro's package-exports enforcement
    // (enabled by default in RN 0.73+) causes it to misroute relative requires
    // inside rxjs/dist/cjs via the "./internal/*" wildcard in rxjs's exports map,
    // landing on the ESM5 build from a CJS module context and failing to resolve.
    // Disabling package exports reverts Metro to classic node_modules resolution
    // which resolves the relative paths correctly.
    unstable_enablePackageExports: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
