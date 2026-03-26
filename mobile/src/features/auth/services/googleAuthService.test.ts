import {googleAuthService} from './googleAuthService';
import apiClient from '../../../services/api/client';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('googleAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should throw with configuration instructions', async () => {
      await expect(googleAuthService.signIn()).rejects.toThrow(
        'Google Sign-In requires',
      );
    });
  });

  describe('authenticateWithBackend', () => {
    it('should call POST /auth/google with correct payload', async () => {
      const googleResult = {
        idToken: 'google-id-token',
        user: {
          id: 'g123',
          email: 'test@gmail.com',
          givenName: 'John',
          familyName: 'Doe',
        },
      };
      const loginData = {
        token: 'jwt-token',
        user: {id: 1, username: 'test', email: 'test@gmail.com', role: 'user', age: 0, firstName: 'John', lastName: 'Doe'},
      };
      mockedApiClient.post.mockResolvedValue({data: {data: loginData}});

      const result = await googleAuthService.authenticateWithBackend(googleResult);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/google', {
        idToken: 'google-id-token',
        user: {
          id: 'g123',
          email: 'test@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'test',
        },
      });
      expect(result).toEqual(loginData);
    });

    it('should propagate errors from apiClient', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Backend error'));
      await expect(
        googleAuthService.authenticateWithBackend({
          idToken: 'tok',
          user: {id: 'g1', email: 'a@b.com', givenName: 'A', familyName: 'B'},
        }),
      ).rejects.toThrow('Backend error');
    });
  });
});
