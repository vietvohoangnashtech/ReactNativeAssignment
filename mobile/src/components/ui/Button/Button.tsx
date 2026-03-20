import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const Button = ({label, onPress, style, disabled}: ButtonProps): React.JSX.Element => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}>
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
);

type ButtonStyles = {
  button: ViewStyle;
  disabled: ViewStyle;
  text: TextStyle;
};

const styles = StyleSheet.create<ButtonStyles>({
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: '#39B78D',
    alignItems: 'center',
    borderRadius: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 22,
    color: 'white',
  },
});

export {Button};
