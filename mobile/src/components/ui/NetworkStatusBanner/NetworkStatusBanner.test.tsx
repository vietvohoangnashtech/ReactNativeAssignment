import React from 'react';
import {render} from '@testing-library/react-native';
import {NetworkStatusBanner} from './NetworkStatusBanner';

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockIsOnline = true;
let mockSyncStatus = 'idle';
const mockTriggerSync = jest.fn();

jest.mock('../../../services/network/useNetworkStatus', () => ({
  useNetworkStatus: () => ({isOnline: mockIsOnline}),
}));

jest.mock('../../../services/sync/useSyncStatus', () => ({
  useSyncStatus: () => ({syncStatus: mockSyncStatus, triggerSync: mockTriggerSync}),
}));

jest.mock('../../../theme', () => ({
  colors: {
    white: '#fff',
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NetworkStatusBanner', () => {
  beforeEach(() => {
    mockIsOnline = true;
    mockSyncStatus = 'idle';
    jest.clearAllMocks();
  });

  it('should render nothing when online and idle', () => {
    const {toJSON} = render(<NetworkStatusBanner />);
    expect(toJSON()).toBeNull();
  });

  it('should show offline banner when offline', () => {
    mockIsOnline = false;
    const {getByText} = render(<NetworkStatusBanner />);
    expect(getByText("You're offline")).toBeTruthy();
  });

  it('should show syncing banner when syncing and online', () => {
    mockSyncStatus = 'syncing';
    const {getByText} = render(<NetworkStatusBanner />);
    expect(getByText('Syncing...')).toBeTruthy();
  });

  it('should show error banner when sync fails and online', () => {
    mockSyncStatus = 'error';
    const {getByText} = render(<NetworkStatusBanner />);
    expect(getByText('Sync failed. Tap to retry.')).toBeTruthy();
  });
});
