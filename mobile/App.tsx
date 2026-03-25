import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import {useAppDispatch} from './src/store/store';
import {AuthProvider} from './src/contexts/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {setupInterceptors} from './src/services/api/interceptors';
import {loadCartFromDB} from './src/features/cart/store/cartSlice';

setupInterceptors();

const AppInner = (): React.JSX.Element => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCartFromDB());
  }, [dispatch]);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const App = (): React.JSX.Element => (
  <SafeAreaProvider>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <Provider store={store}>
      <AppInner />
    </Provider>
  </SafeAreaProvider>
);

export default App;
