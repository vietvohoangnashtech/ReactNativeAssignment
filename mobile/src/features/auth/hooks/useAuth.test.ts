import {renderHook} from '@testing-library/react-native';
import {useAuth} from './useAuth';
import {useAuthContext} from '../../../contexts/AuthContext';
import type {User} from '../types/auth.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn<ReturnType<typeof useAuthContext>, []>(),
}));
const mockedUseAuthContext = useAuthContext as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  age: 25,
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAuth hook', () => {
  beforeEach(() => {
    mockedUseAuthContext.mockReset();
  });

  it('should return the exact value from useAuthContext', () => {
    const contextValue = {
      isLoggedIn: true,
      token: 'token-abc',
      user: mockUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    };
    mockedUseAuthContext.mockReturnValue(contextValue);

    const {result} = renderHook(() => useAuth());

    expect(result.current).toBe(contextValue);
  });

  it('should reflect isLoggedIn=false when not authenticated', () => {
    mockedUseAuthContext.mockReturnValue({
      isLoggedIn: false,
      token: null,
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    const {result} = renderHook(() => useAuth());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should expose the login callback from context', () => {
    const mockLogin = jest.fn();
    mockedUseAuthContext.mockReturnValue({
      isLoggedIn: false,
      token: null,
      user: null,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    const {result} = renderHook(() => useAuth());

    expect(result.current.login).toBe(mockLogin);
  });
});
