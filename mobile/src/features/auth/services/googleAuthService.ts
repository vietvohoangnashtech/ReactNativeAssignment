import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {User} from '../types/auth.types';

interface GoogleSignInResult {
  idToken: string;
  user: {
    id: string;
    email: string;
    givenName: string;
    familyName: string;
  };
}

interface LoginData {
  token: string;
  user: User;
}

/**
 * Google Sign-In service.
 * In production, requires @react-native-google-signin/google-signin package
 * with proper Google Cloud Console client ID configuration.
 */
const googleAuthService = {
  /**
   * Initiates Google Sign-In flow.
   * Replace the mock implementation with actual Google Sign-In SDK calls:
   *
   * ```ts
   * import { GoogleSignin } from '@react-native-google-signin/google-signin';
   *
   * GoogleSignin.configure({ webClientId: 'YOUR_CLIENT_ID' });
   * const userInfo = await GoogleSignin.signIn();
   * return { idToken: userInfo.idToken, user: userInfo.user };
   * ```
   */
  signIn: async (): Promise<GoogleSignInResult> => {
    // TODO: Replace with actual Google Sign-In SDK
    throw new Error(
      'Google Sign-In requires @react-native-google-signin/google-signin package and configuration. ' +
      'See: https://github.com/react-native-google-signin/google-signin',
    );
  },

  /**
   * Sends the Google ID token to the backend for verification and JWT generation.
   */
  authenticateWithBackend: async (googleResult: GoogleSignInResult): Promise<LoginData> => {
    const response = await apiClient.post<ApiResponse<LoginData>>('/auth/google', {
      idToken: googleResult.idToken,
      user: {
        id: googleResult.user.id,
        email: googleResult.user.email,
        firstName: googleResult.user.givenName,
        lastName: googleResult.user.familyName,
        username: googleResult.user.email.split('@')[0],
      },
    });
    return response.data.data;
  },
};

export {googleAuthService};
export type {GoogleSignInResult};
