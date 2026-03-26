import {biometricService} from './biometricService';
import EncryptedStorage from 'react-native-encrypted-storage';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedStorage = EncryptedStorage as jest.Mocked<typeof EncryptedStorage>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('biometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBiometricEnabled', () => {
    it('should return true when enabled', async () => {
      mockedStorage.getItem.mockResolvedValue('true');
      const result = await biometricService.isBiometricEnabled();
      expect(result).toBe(true);
      expect(mockedStorage.getItem).toHaveBeenCalledWith('biometric_enabled');
    });

    it('should return false when not enabled', async () => {
      mockedStorage.getItem.mockResolvedValue(null);
      const result = await biometricService.isBiometricEnabled();
      expect(result).toBe(false);
    });

    it('should return false for non-true values', async () => {
      mockedStorage.getItem.mockResolvedValue('false');
      const result = await biometricService.isBiometricEnabled();
      expect(result).toBe(false);
    });
  });

  describe('enableBiometric', () => {
    it('should store enabled flag, token, and user json', async () => {
      mockedStorage.setItem.mockResolvedValue(undefined);
      await biometricService.enableBiometric('token123', '{"id":1}');
      expect(mockedStorage.setItem).toHaveBeenCalledWith('biometric_enabled', 'true');
      expect(mockedStorage.setItem).toHaveBeenCalledWith('biometric_token', 'token123');
      expect(mockedStorage.setItem).toHaveBeenCalledWith('biometric_user', '{"id":1}');
    });
  });

  describe('disableBiometric', () => {
    it('should remove all biometric storage keys', async () => {
      mockedStorage.removeItem.mockResolvedValue(undefined);
      await biometricService.disableBiometric();
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('biometric_enabled');
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('biometric_token');
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('biometric_user');
    });
  });

  describe('getStoredCredentials', () => {
    it('should return null when biometric is not enabled', async () => {
      mockedStorage.getItem.mockResolvedValue(null);
      const result = await biometricService.getStoredCredentials();
      expect(result).toBeNull();
    });

    it('should return null when enabled but token is missing', async () => {
      mockedStorage.getItem
        .mockResolvedValueOnce('true') // biometric_enabled
        .mockResolvedValueOnce(null)   // biometric_token
        .mockResolvedValueOnce('{"id":1}'); // biometric_user
      const result = await biometricService.getStoredCredentials();
      expect(result).toBeNull();
    });

    it('should return null when enabled but userJson is missing', async () => {
      mockedStorage.getItem
        .mockResolvedValueOnce('true')    // biometric_enabled
        .mockResolvedValueOnce('token123') // biometric_token
        .mockResolvedValueOnce(null);      // biometric_user
      const result = await biometricService.getStoredCredentials();
      expect(result).toBeNull();
    });

    it('should return credentials when all values exist', async () => {
      mockedStorage.getItem
        .mockResolvedValueOnce('true')
        .mockResolvedValueOnce('token123')
        .mockResolvedValueOnce('{"id":1}');
      const result = await biometricService.getStoredCredentials();
      expect(result).toEqual({token: 'token123', userJson: '{"id":1}'});
    });
  });
});
