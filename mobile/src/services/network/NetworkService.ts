import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

type StatusCallback = (isOnline: boolean) => void;

const DEBOUNCE_MS = 2000;

class NetworkService {
  private listeners: Set<StatusCallback> = new Set();
  private _isOnline = true;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribe: (() => void) | null = null;

  get isOnline(): boolean {
    return this._isOnline;
  }

  start(): void {
    if (this.unsubscribe) {return;}
    this.unsubscribe = NetInfo.addEventListener(this.handleChange);
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleChange = (state: NetInfoState): void => {
    const online = Boolean(state.isConnected && state.isInternetReachable !== false);
    if (online === this._isOnline) {return;}

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this._isOnline = online;
      this.listeners.forEach(cb => cb(online));
    }, DEBOUNCE_MS);
  };
}

export const networkService = new NetworkService();
