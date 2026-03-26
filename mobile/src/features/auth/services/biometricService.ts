import EncryptedStorage from 'react-native-encrypted-storage';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_TOKEN_KEY = 'biometric_token';
const BIOMETRIC_USER_KEY = 'biometric_user';

/**
 * Biometric authentication service.
 * Uses react-native-encrypted-storage as the secure store.
 * In production, integrate react-native-biometrics or react-native-keychain
 * for hardware-backed biometric verification.
 */
const biometricService = {
  /**
   * Check if biometric login has been enabled by the user.
   */
  isBiometricEnabled: async (): Promise<boolean> => {
    const enabled = await EncryptedStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  },

  /**
   * Store credentials after successful password login for future biometric use.
   */
  enableBiometric: async (token: string, userJson: string): Promise<void> => {
    await EncryptedStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    await EncryptedStorage.setItem(BIOMETRIC_TOKEN_KEY, token);
    await EncryptedStorage.setItem(BIOMETRIC_USER_KEY, userJson);
  },

  /**
   * Disable biometric login and clear stored credentials.
   */
  disableBiometric: async (): Promise<void> => {
    await EncryptedStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await EncryptedStorage.removeItem(BIOMETRIC_TOKEN_KEY);
    await EncryptedStorage.removeItem(BIOMETRIC_USER_KEY);
  },

  /**
   * Retrieve stored credentials for biometric login.
   * Returns null if no credentials are stored or biometric is not enabled.
   */
  getStoredCredentials: async (): Promise<{token: string; userJson: string} | null> => {
    const enabled = await EncryptedStorage.getItem(BIOMETRIC_ENABLED_KEY);
    if (enabled !== 'true') {
      return null;
    }
    const token = await EncryptedStorage.getItem(BIOMETRIC_TOKEN_KEY);
    const userJson = await EncryptedStorage.getItem(BIOMETRIC_USER_KEY);
    if (!token || !userJson) {
      return null;
    }
    return {token, userJson};
  },
};

export {biometricService};
