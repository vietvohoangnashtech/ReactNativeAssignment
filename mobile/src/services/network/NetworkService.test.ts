import NetInfo from '@react-native-community/netinfo';
import {networkService} from './NetworkService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NetworkService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Reset the service by stopping it
    networkService.stop();
  });

  afterEach(() => {
    networkService.stop();
    jest.useRealTimers();
  });

  it('should default to online', () => {
    expect(networkService.isOnline).toBe(true);
  });

  it('should subscribe to NetInfo on start', () => {
    networkService.start();
    expect(mockedNetInfo.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('should not double-subscribe on multiple start calls', () => {
    networkService.start();
    networkService.start();
    expect(mockedNetInfo.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on stop', () => {
    const unsubscribe = jest.fn();
    mockedNetInfo.addEventListener.mockReturnValue(unsubscribe);
    networkService.start();
    networkService.stop();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should debounce status changes and notify listeners', () => {
    let handler: (state: any) => void = () => {};
    mockedNetInfo.addEventListener.mockImplementation((cb: any) => {
      handler = cb;
      return jest.fn();
    });

    networkService.start();
    const listener = jest.fn();
    networkService.onStatusChange(listener);

    // Simulate going offline
    handler({isConnected: false, isInternetReachable: false});
    expect(listener).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);
    expect(listener).toHaveBeenCalledWith(false);
    expect(networkService.isOnline).toBe(false);
  });

  it('should not notify if status does not change', () => {
    let handler: (state: any) => void = () => {};
    mockedNetInfo.addEventListener.mockImplementation((cb: any) => {
      handler = cb;
      return jest.fn();
    });

    networkService.start();
    const listener = jest.fn();
    networkService.onStatusChange(listener);

    // Fire with current status (whatever it is) to verify no notification
    const currentOnline = networkService.isOnline;
    handler({isConnected: currentOnline, isInternetReachable: currentOnline});
    jest.advanceTimersByTime(2000);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should allow unsubscribing a listener', () => {
    let handler: (state: any) => void = () => {};
    mockedNetInfo.addEventListener.mockImplementation((cb: any) => {
      handler = cb;
      return jest.fn();
    });

    networkService.start();
    const listener = jest.fn();
    const unsub = networkService.onStatusChange(listener);
    unsub();

    handler({isConnected: false, isInternetReachable: false});
    jest.advanceTimersByTime(2000);
    expect(listener).not.toHaveBeenCalled();
  });
});
