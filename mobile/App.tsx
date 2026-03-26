import React, {useEffect} from 'react';
import {StatusBar, View, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import {useAppDispatch} from './src/store/store';
import {AuthProvider} from './src/contexts/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {NetworkStatusBanner} from './src/components/ui/NetworkStatusBanner';
import {setupInterceptors} from './src/services/api/interceptors';
import {loadCartFromDB} from './src/features/cart/store/cartSlice';
import {networkService} from './src/services/network/NetworkService';
import {syncService} from './src/services/sync/SyncService';
import {appStateHandler} from './src/services/lifecycle/AppStateHandler';
import {setOnlineStatus} from './src/store/networkSlice';
import {setSyncStatus} from './src/store/syncSlice';

setupInterceptors();
networkService.start();
syncService.start();
appStateHandler.start();

// Wire network + sync status into Redux
networkService.onStatusChange(isOnline => {
  store.dispatch(setOnlineStatus(isOnline));
});
syncService.onStatusChange(status => {
  store.dispatch(setSyncStatus(status));
});

const AppInner = (): React.JSX.Element => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCartFromDB());
    // Trigger background sync on app start
    if (networkService.isOnline) {
      syncService.sync();
    }
  }, [dispatch]);

  return (
    <AuthProvider>
      <View style={styles.flex}>
        <NetworkStatusBanner />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
});

const App = (): React.JSX.Element => (
  <SafeAreaProvider>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <Provider store={store}>
      <AppInner />
    </Provider>
  </SafeAreaProvider>
);

export default App;
