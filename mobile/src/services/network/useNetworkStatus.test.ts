import {renderHook, act} from '@testing-library/react-native';
import {useNetworkStatus} from './useNetworkStatus';
import {networkService} from './NetworkService';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('./NetworkService', () => ({
  networkService: {
    isOnline: true,
    onStatusChange: jest.fn(() => jest.fn()),
  },
}));

const mockedService = networkService as jest.Mocked<typeof networkService>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedService as any).isOnline = true;
  });

  it('should return initial online status', () => {
    const {result} = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('should subscribe to status changes', () => {
    renderHook(() => useNetworkStatus());
    expect(mockedService.onStatusChange).toHaveBeenCalledTimes(1);
  });

  it('should update when status changes', () => {
    let callback: (isOnline: boolean) => void = () => {};
    mockedService.onStatusChange.mockImplementation((cb: any) => {
      callback = cb;
      return jest.fn();
    });

    const {result} = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      callback(false);
    });
    expect(result.current.isOnline).toBe(false);
  });

  it('should unsubscribe on unmount', () => {
    const unsubscribe = jest.fn();
    mockedService.onStatusChange.mockReturnValue(unsubscribe);

    const {unmount} = renderHook(() => useNetworkStatus());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
