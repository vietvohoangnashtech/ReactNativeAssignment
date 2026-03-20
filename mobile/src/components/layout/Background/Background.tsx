import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface BackgroundProps {
  children: React.ReactNode;
}

const Background = ({children}: BackgroundProps): React.JSX.Element => (
  <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {children}
    </KeyboardAvoidingView>
  </SafeAreaView>
);

type BackgroundStyles = {
  safeArea: ViewStyle;
  container: ViewStyle;
};

const styles = StyleSheet.create<BackgroundStyles>({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  container: {
    flex: 1,
  },
});

export {Background};
