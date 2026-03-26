import {AppState, AppStateStatus} from 'react-native';
import {syncService} from '../sync/SyncService';
import {networkService} from '../network/NetworkService';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

class AppStateHandler {
  private subscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private lastActiveAt = Date.now();

  start(): void {
    this.subscription = AppState.addEventListener('change', this.handleChange);
  }

  stop(): void {
    this.subscription?.remove();
    this.subscription = null;
  }

  private handleChange = (nextState: AppStateStatus): void => {
    if (nextState === 'active') {
      const elapsed = Date.now() - this.lastActiveAt;
      if (elapsed > STALE_THRESHOLD_MS && networkService.isOnline) {
        syncService.sync();
      }
      this.lastActiveAt = Date.now();
    }
  };
}

export const appStateHandler = new AppStateHandler();
