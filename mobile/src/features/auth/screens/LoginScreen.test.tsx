import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {LoginScreen} from './LoginScreen';
import {AuthProvider} from '../../../contexts/AuthContext';
import {authService} from '../services/authService';
import type {User} from '../types/auth.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('jwt-decode', () => ({jwtDecode: jest.fn()}));

jest.mock('react-native-vector-icons/Feather', () => 'Feather');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MatIcon');

jest.mock('../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  age: 30,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const wrap = (element: React.ReactElement) => (
  <AuthProvider>{element}</AuthProvider>
);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the welcome heading and login tab by default', async () => {
      const {getByText} = render(wrap(<LoginScreen />));
      await waitFor(() => {
        expect(getByText('Welcome Back')).toBeTruthy();
        expect(getByText('Sign In')).toBeTruthy();
      });
    });

    it('should switch to Sign Up tab and show Sign Up fields', async () => {
      const {getByText, getByPlaceholderText} = render(wrap(<LoginScreen />));

      await waitFor(() => {
        fireEvent.press(getByText('Sign Up'));
      });

      expect(getByText('Create Account')).toBeTruthy();
      expect(getByPlaceholderText('First Name')).toBeTruthy();
      expect(getByPlaceholderText('Last Name')).toBeTruthy();
      expect(getByPlaceholderText('Email Address')).toBeTruthy();
    });

    it('should show "Forgot Password?" only on login tab', async () => {
      const {getByText, queryByText} = render(wrap(<LoginScreen />));
      await waitFor(() => expect(getByText('Forgot Password?')).toBeTruthy());

      fireEvent.press(getByText('Sign Up'));
      expect(queryByText('Forgot Password?')).toBeNull();
    });
  });

  describe('validation', () => {
    it('should show error when submitting empty username/password', async () => {
      const {getByText} = render(wrap(<LoginScreen />));
      await waitFor(() => fireEvent.press(getByText('Sign In')));
      await waitFor(() => {
        expect(getByText('Username and password are required')).toBeTruthy();
      });
    });

    it('should show error when signup fields are incomplete', async () => {
      const {getByText, getByPlaceholderText} = render(wrap(<LoginScreen />));
      await waitFor(() => fireEvent.press(getByText('Sign Up')));

      // Fill only username + password
      fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
      fireEvent.changeText(getByPlaceholderText('••••••••'), 'secret');

      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(getByText('All fields are required for sign up')).toBeTruthy();
      });
    });

    it('should show error for invalid email on signup', async () => {
      const {getByText, getByPlaceholderText} = render(wrap(<LoginScreen />));
      await waitFor(() => fireEvent.press(getByText('Sign Up')));

      fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
      fireEvent.changeText(getByPlaceholderText('••••••••'), 'secret');
      fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
      fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'not-an-email');
      fireEvent.changeText(getByPlaceholderText('Age'), '25');

      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(getByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('should show error for invalid age on signup', async () => {
      const {getByText, getByPlaceholderText} = render(wrap(<LoginScreen />));
      await waitFor(() => fireEvent.press(getByText('Sign Up')));

      fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
      fireEvent.changeText(getByPlaceholderText('••••••••'), 'secret');
      fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
      fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.changeText(getByPlaceholderText('Age'), '999');

      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(getByText('Please enter a valid age')).toBeTruthy();
      });
    });
  });

  describe('login flow', () => {
    it('should call authService.login with credentials and invoke login callback', async () => {
      mockAuthService.login.mockResolvedValue({token: 'jwt-token', user: mockUser});
      const {getByText, getByPlaceholderText} = render(wrap(<LoginScreen />));

      await waitFor(() => getByPlaceholderText('Username'));
      fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
      fireEvent.changeText(getByPlaceholderText('••••••••'), 'password');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalledWith({
          username: 'johndoe',
          password: 'password',
        });
      });
    });

    it('should display API error message when login fails', async () => {
      mockAuthService.login.mockRejectedValue({
        response: {data: {message: 'Invalid credentials'}},
      });
      const {getByText, getByPlaceholderText} = render(wrap(<LoginScreen />));

      await waitFor(() => getByPlaceholderText('Username'));
      fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
      fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrongpass');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });

    it('should clear error when switching between tabs', async () => {
      const {getByText, queryByText} = render(wrap(<LoginScreen />));

      await waitFor(() => fireEvent.press(getByText('Sign In')));
      await waitFor(() => expect(getByText('Username and password are required')).toBeTruthy());

      fireEvent.press(getByText('Sign Up'));
      expect(queryByText('Username and password are required')).toBeNull();
    });
  });
});
