import {authService} from './authService';
import apiClient from '../../../services/api/client';
import type {User} from '../types/auth.types';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 1,
  username: 'jdoe',
  email: 'jdoe@example.com',
  age: 28,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock.token';

const mockLoginResponse = {data: {data: {token: mockToken, user: mockUser}}};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockLoginResponse);
      const result = await authService.login({username: 'jdoe', password: 'pass123'});
      expect(result.token).toBe(mockToken);
      expect(result.user).toEqual(mockUser);
    });

    it('should call POST /login with correct payload', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockLoginResponse);
      await authService.login({username: 'jdoe', password: 'pass123'});
      expect(mockedApiClient.post).toHaveBeenCalledWith('/login', {
        username: 'jdoe',
        password: 'pass123',
      });
    });

    it('should propagate errors thrown by apiClient', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('401 Unauthorized'));
      await expect(
        authService.login({username: 'jdoe', password: 'wrong'}),
      ).rejects.toThrow('401 Unauthorized');
    });
  });

  describe('register', () => {
    const registerPayload = {
      username: 'jdoe',
      email: 'jdoe@example.com',
      password: 'secure123',
      age: 28,
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should return token and user on successful registration', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockLoginResponse);
      const result = await authService.register(registerPayload);
      expect(result.token).toBe(mockToken);
      expect(result.user).toEqual(mockUser);
    });

    it('should call POST /signup with correct payload', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockLoginResponse);
      await authService.register(registerPayload);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/signup', registerPayload);
    });

    it('should propagate errors from apiClient', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Conflict'));
      await expect(authService.register(registerPayload)).rejects.toThrow('Conflict');
    });
  });

  describe('logout', () => {
    it('should call POST /logout', async () => {
      mockedApiClient.post.mockResolvedValueOnce({data: {}});
      await authService.logout();
      expect(mockedApiClient.post).toHaveBeenCalledWith('/logout');
    });

    it('should propagate errors from apiClient', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network'));
      await expect(authService.logout()).rejects.toThrow('Network');
    });
  });
});
