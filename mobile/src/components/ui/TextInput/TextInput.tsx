import React from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TextInputProps,
} from 'react-native';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  errorText?: string;
  description?: string;
}

const TextInput = ({
  label,
  errorText,
  description,
  ...props
}: AppTextInputProps): React.JSX.Element => (
  <View style={styles.container}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <RNTextInput
      style={styles.input}
      placeholderTextColor="#999"
      {...props}
    />
    {description && !errorText ? (
      <Text style={styles.description}>{description}</Text>
    ) : null}
    {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
  </View>
);

type TextInputStyles = {
  container: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  description: TextStyle;
  error: TextStyle;
};

const styles = StyleSheet.create<TextInputStyles>({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 15,
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#888',
    paddingTop: 4,
  },
  error: {
    fontSize: 12,
    color: '#e53935',
    paddingTop: 4,
  },
});

export {TextInput};
