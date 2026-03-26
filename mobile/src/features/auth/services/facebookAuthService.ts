import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {User} from '../types/auth.types';

interface FacebookLoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface LoginData {
  token: string;
  user: User;
}

/**
 * Facebook Login service.
 * In production, requires react-native-fbsdk-next package
 * with proper Facebook App ID configuration.
 */
const facebookAuthService = {
  /**
   * Initiates Facebook Login flow.
   * Replace the mock implementation with actual Facebook SDK calls:
   *
   * ```ts
   * import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';
   *
   * const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
   * const tokenData = await AccessToken.getCurrentAccessToken();
   * const profile = await Profile.getCurrentProfile();
   * ```
   */
  signIn: async (): Promise<FacebookLoginResult> => {
    // TODO: Replace with actual Facebook SDK
    throw new Error(
      'Facebook Login requires react-native-fbsdk-next package and configuration. ' +
      'See: https://github.com/thebergamo/react-native-fbsdk-next',
    );
  },

  /**
   * Sends the Facebook access token to the backend for verification and JWT generation.
   */
  authenticateWithBackend: async (fbResult: FacebookLoginResult): Promise<LoginData> => {
    const response = await apiClient.post<ApiResponse<LoginData>>('/auth/facebook', {
      accessToken: fbResult.accessToken,
      user: {
        id: fbResult.user.id,
        email: fbResult.user.email,
        firstName: fbResult.user.firstName,
        lastName: fbResult.user.lastName,
        username: fbResult.user.email.split('@')[0],
      },
    });
    return response.data.data;
  },
};

export {facebookAuthService};
export type {FacebookLoginResult};
