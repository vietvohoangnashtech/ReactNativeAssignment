import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import {AuthProvider} from './src/contexts/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {setupInterceptors} from './src/services/api/interceptors';

setupInterceptors();

const App = (): React.JSX.Element => (
  <SafeAreaProvider>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  </SafeAreaProvider>
);

export default App;
