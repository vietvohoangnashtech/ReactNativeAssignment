import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {ProfileScreen} from './ProfileScreen';
import {userService} from '../services/userService';
import {authService} from '../../auth/services/authService';
import {AuthProvider} from '../../../contexts/AuthContext';
import rootReducer from '../../../store/rootReducer';
import type {UserProfile} from '../types/profile.types';

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

jest.mock('../../../services/database/repositories/cartRepository', () => ({
  cartRepository: {
    loadCart: jest.fn().mockResolvedValue([]),
    saveCart: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/profileRepository', () => ({
  profileRepository: {
    getProfile: jest.fn().mockResolvedValue(null),
    saveProfile: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/productCacheRepository', () => ({
  productCacheRepository: {
    getCachedProducts: jest.fn().mockResolvedValue({products: [], isStale: false}),
    cacheProducts: jest.fn().mockResolvedValue(undefined),
    getCachedCategories: jest.fn().mockResolvedValue([]),
    cacheCategories: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/orderCacheRepository', () => ({
  orderCacheRepository: {
    cacheOrders: jest.fn().mockResolvedValue(undefined),
    getCachedOrders: jest.fn().mockResolvedValue([]),
    createPendingOrder: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock('../../../services/database/repositories/syncQueueRepository', () => ({
  syncQueueRepository: {
    enqueue: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-native-vector-icons/Feather', () => 'Feather');

jest.mock('../services/userService');
jest.mock('../../auth/services/authService');

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProfile: UserProfile = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  age: 30,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderProfileScreen() {
  const store = configureStore({reducer: rootReducer});
  return {
    store,
    ...render(
      <Provider store={store}>
        <AuthProvider>
          <ProfileScreen />
        </AuthProvider>
      </Provider>,
    ),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const {profileRepository: mockRepo} = jest.requireMock(
      '../../../services/database/repositories/profileRepository',
    ) as {profileRepository: {getProfile: jest.Mock; saveProfile: jest.Mock}};
    mockRepo.getProfile.mockResolvedValue(null);
    mockRepo.saveProfile.mockResolvedValue(undefined);
    mockUserService.getProfile.mockResolvedValue(mockProfile);
    mockUserService.updateProfile.mockResolvedValue(mockProfile);
    mockAuthService.logout.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('should show a loading indicator before profile is fetched', () => {
      mockUserService.getProfile.mockReturnValue(new Promise(() => {}));
      const {ActivityIndicator} = require('react-native');
      const {UNSAFE_getByType} = renderProfileScreen();
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should render the Profile header', async () => {
      const {getByText} = renderProfileScreen();
      await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
      });
    });

    it('should render the user display name', async () => {
      const {getByText} = renderProfileScreen();
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });
    });

    it('should render the username handle', async () => {
      const {getByText} = renderProfileScreen();
      await waitFor(() => {
        expect(getByText('@johndoe')).toBeTruthy();
      });
    });

    it('should render account details (email, first name, last name, age)', async () => {
      // email appears twice: identityCard row + Account Details readonly row
      const {getAllByText, getByText} = renderProfileScreen();
      await waitFor(() => {
        expect(getAllByText('john@example.com').length).toBeGreaterThanOrEqual(2);
        expect(getByText('John')).toBeTruthy();
        expect(getByText('Doe')).toBeTruthy();
        expect(getByText('30')).toBeTruthy();
      });
    });

    it('should render the Logout button', async () => {
      const {getByText} = renderProfileScreen();
      await waitFor(() => {
        expect(getByText('Logout')).toBeTruthy();
      });
    });

    it('should render offline banner when profile is served from cache', async () => {
      const {profileRepository: mockRepo} = jest.requireMock(
        '../../../services/database/repositories/profileRepository',
      ) as {profileRepository: {getProfile: jest.Mock; saveProfile: jest.Mock}};

      mockUserService.getProfile.mockRejectedValue(new Error('Network error'));
      mockRepo.getProfile.mockResolvedValue(mockProfile);

      const {getByText} = renderProfileScreen();
      await waitFor(() => {
        expect(getByText('Showing cached profile (offline)')).toBeTruthy();
      });
    });

    it('should show avatar initial letter from display name', async () => {
      const {getByText} = renderProfileScreen();
      await waitFor(() => {
        // Avatar shows first letter of "John Doe" → "J"
        expect(getByText('J')).toBeTruthy();
      });
    });
  });

  describe('edit mode', () => {
    it('should toggle edit mode when Edit button is pressed', async () => {
      const {getByText} = renderProfileScreen();
      await waitFor(() => getByText('Edit'));
      fireEvent.press(getByText('Edit'));
      await waitFor(() => {
        expect(getByText('Cancel')).toBeTruthy();
        expect(getByText('Save Changes')).toBeTruthy();
      });
    });

    it('should exit edit mode when Cancel is pressed', async () => {
      const {getByText, queryByText} = renderProfileScreen();
      await waitFor(() => getByText('Edit'));

      fireEvent.press(getByText('Edit'));
      await waitFor(() => getByText('Cancel'));

      fireEvent.press(getByText('Cancel'));
      await waitFor(() => {
        expect(queryByText('Save Changes')).toBeNull();
        expect(getByText('Edit')).toBeTruthy();
      });
    });

    it('should call userService.updateProfile when Save Changes is pressed', async () => {
      const updatedProfile = {...mockProfile, firstName: 'Jane'};
      mockUserService.updateProfile.mockResolvedValue(updatedProfile);

      const {getByText, getByDisplayValue} = renderProfileScreen();
      await waitFor(() => getByText('Edit'));

      fireEvent.press(getByText('Edit'));
      await waitFor(() => getByDisplayValue('John'));

      fireEvent.changeText(getByDisplayValue('John'), 'Jane');
      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(mockUserService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({firstName: 'Jane'}),
        );
      });
    });

    it('should show validation error for invalid age', async () => {
      const {getByText, getByDisplayValue} = renderProfileScreen();
      await waitFor(() => getByText('Edit'));

      fireEvent.press(getByText('Edit'));
      await waitFor(() => getByDisplayValue('30'));

      fireEvent.changeText(getByDisplayValue('30'), '-5');
      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(getByText('Please enter a valid age')).toBeTruthy();
      });
    });

    it('should show "Failed to save profile" when updateProfile throws', async () => {
      mockUserService.updateProfile.mockRejectedValue(new Error('Server error'));

      const {getByText, getByDisplayValue} = renderProfileScreen();
      await waitFor(() => getByText('Edit'));

      fireEvent.press(getByText('Edit'));
      await waitFor(() => getByDisplayValue('John'));

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(getByText('Failed to save profile')).toBeTruthy();
      });
    });
  });

  describe('logout', () => {
    it('should show confirmation alert when Logout is pressed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const {getByText} = renderProfileScreen();
      await waitFor(() => getByText('Logout'));

      fireEvent.press(getByText('Logout'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.any(Array),
      );
    });

    it('should call authService.logout when confirm logout is selected', async () => {
      let confirmHandler: (() => Promise<void>) | undefined;
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const destructiveBtn = buttons?.find(b => b.style === 'destructive');
        confirmHandler = destructiveBtn?.onPress as () => Promise<void>;
      });

      const {getByText} = renderProfileScreen();
      await waitFor(() => getByText('Logout'));

      fireEvent.press(getByText('Logout'));
      expect(confirmHandler).toBeDefined();

      await act(async () => {
        await confirmHandler!();
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
