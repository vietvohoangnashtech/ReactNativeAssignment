module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    node: true,
  },
  parserOptions: {
    requireConfigFile: false,
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'build/',
    '__tests__/',
    'coverage/',
    '.eslintrc.js',
  ],
  rules: {
    // React/React Native rules
    'react/no-unstable-nested-components': 'off',
    'react/prop-types': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // JavaScript best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'no-implicit-coercion': 'error',

    // Code quality
    // 'no-nested-ternary': 'warn',
    // 'max-depth': ['warn', 3],
    // 'complexity': ['warn', 10],
  },
};
