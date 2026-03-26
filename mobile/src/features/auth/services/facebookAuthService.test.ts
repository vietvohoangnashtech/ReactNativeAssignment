import {facebookAuthService} from './facebookAuthService';
import apiClient from '../../../services/api/client';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('facebookAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should throw with configuration instructions', async () => {
      await expect(facebookAuthService.signIn()).rejects.toThrow(
        'Facebook Login requires',
      );
    });
  });

  describe('authenticateWithBackend', () => {
    it('should call POST /auth/facebook with correct payload', async () => {
      const fbResult = {
        accessToken: 'fb-access-token',
        user: {
          id: 'fb123',
          email: 'test@facebook.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      };
      const loginData = {
        token: 'jwt-token',
        user: {id: 2, username: 'test', email: 'test@facebook.com', role: 'user', age: 0, firstName: 'Jane', lastName: 'Doe'},
      };
      mockedApiClient.post.mockResolvedValue({data: {data: loginData}});

      const result = await facebookAuthService.authenticateWithBackend(fbResult);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/facebook', {
        accessToken: 'fb-access-token',
        user: {
          id: 'fb123',
          email: 'test@facebook.com',
          firstName: 'Jane',
          lastName: 'Doe',
          username: 'test',
        },
      });
      expect(result).toEqual(loginData);
    });

    it('should propagate errors from apiClient', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network'));
      await expect(
        facebookAuthService.authenticateWithBackend({
          accessToken: 'tok',
          user: {id: 'fb1', email: 'a@b.com', firstName: 'A', lastName: 'B'},
        }),
      ).rejects.toThrow('Network');
    });
  });
});
