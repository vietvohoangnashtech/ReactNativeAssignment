import {renderHook, act} from '@testing-library/react-native';
import {useSyncStatus} from './useSyncStatus';
import {syncService} from './SyncService';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('./SyncService', () => ({
  syncService: {
    status: 'idle' as const,
    onStatusChange: jest.fn(() => jest.fn()),
    sync: jest.fn(),
  },
}));

const mockedService = syncService as jest.Mocked<typeof syncService>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useSyncStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial sync status', () => {
    const {result} = renderHook(() => useSyncStatus());
    expect(result.current.syncStatus).toBe('idle');
  });

  it('should subscribe to status changes', () => {
    renderHook(() => useSyncStatus());
    expect(mockedService.onStatusChange).toHaveBeenCalledTimes(1);
  });

  it('should update when status changes', () => {
    let callback: (status: any) => void = () => {};
    mockedService.onStatusChange.mockImplementation((cb: any) => {
      callback = cb;
      return jest.fn();
    });

    const {result} = renderHook(() => useSyncStatus());

    act(() => {
      callback('syncing');
    });
    expect(result.current.syncStatus).toBe('syncing');
  });

  it('should provide triggerSync function that calls sync', () => {
    mockedService.sync.mockResolvedValue(undefined);
    const {result} = renderHook(() => useSyncStatus());
    result.current.triggerSync();
    expect(mockedService.sync).toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const unsubscribe = jest.fn();
    mockedService.onStatusChange.mockReturnValue(unsubscribe);

    const {unmount} = renderHook(() => useSyncStatus());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
