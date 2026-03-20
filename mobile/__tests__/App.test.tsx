/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {LoginScreen} from '../src/features/auth/screens/LoginScreen';
import {AuthProvider} from '../src/contexts/AuthContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
  useRoute: () => ({params: {}}),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

test('LoginScreen renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>,
    );
  });
});
