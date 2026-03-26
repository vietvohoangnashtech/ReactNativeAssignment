import {AppState} from 'react-native';
import {appStateHandler} from './AppStateHandler';
import {syncService} from '../sync/SyncService';
import {networkService} from '../network/NetworkService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../sync/SyncService', () => ({
  syncService: {
    sync: jest.fn(),
  },
}));

jest.mock('../network/NetworkService', () => ({
  networkService: {
    isOnline: true,
  },
}));

const mockedSync = syncService as jest.Mocked<typeof syncService>;
const mockedNetwork = networkService as any;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppStateHandler', () => {
  let addEventSpy: jest.SpyInstance;
  let handler: (state: any) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedNetwork.isOnline = true;

    addEventSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (_type: string, cb: any) => {
        handler = cb;
        return {remove: jest.fn()} as any;
      },
    );

    appStateHandler.stop();
    appStateHandler.start();
  });

  afterEach(() => {
    appStateHandler.stop();
    jest.useRealTimers();
    addEventSpy.mockRestore();
  });

  it('should register AppState listener on start', () => {
    expect(addEventSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should not sync when going active within stale threshold', () => {
    handler('active');
    expect(mockedSync.sync).not.toHaveBeenCalled();
  });

  it('should sync when going active after stale threshold (>5min)', () => {
    // Move time forward past threshold
    jest.advanceTimersByTime(6 * 60 * 1000);
    handler('active');
    expect(mockedSync.sync).toHaveBeenCalledTimes(1);
  });

  it('should not sync when offline even after stale threshold', () => {
    mockedNetwork.isOnline = false;
    jest.advanceTimersByTime(6 * 60 * 1000);
    handler('active');
    expect(mockedSync.sync).not.toHaveBeenCalled();
  });

  it('should not sync on background state change', () => {
    jest.advanceTimersByTime(6 * 60 * 1000);
    handler('background');
    expect(mockedSync.sync).not.toHaveBeenCalled();
  });
});
