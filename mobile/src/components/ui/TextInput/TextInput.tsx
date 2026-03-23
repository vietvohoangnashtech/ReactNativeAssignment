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
import {colors} from '../../../theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  errorText?: string;
  description?: string;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
  readOnly?: boolean;
}

const TextInput = ({
  label,
  errorText,
  description,
  inputStyle,
  containerStyle,
  readOnly,
  ...props
}: AppTextInputProps): React.JSX.Element => (
  <View style={[styles.container, containerStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <RNTextInput
      style={[
        styles.input,
        readOnly && styles.inputReadOnly,
        errorText ? styles.inputError : null,
        inputStyle,
      ]}
      placeholderTextColor={colors.textMuted}
      editable={!readOnly}
      {...props}
    />
    {description && !errorText ? (
      <Text style={styles.description}>{description}</Text>
    ) : null}
    {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  } as ViewStyle,
  label: {
    fontSize: 14,
    color: colors.textLabel,
    marginBottom: 6,
    fontWeight: '500',
  } as TextStyle,
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: colors.textHeading,
  } as TextStyle,
  inputReadOnly: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.textMuted,
  } as TextStyle,
  inputError: {
    borderColor: colors.error,
  } as TextStyle,
  description: {
    fontSize: 12,
    color: colors.textMuted,
    paddingTop: 4,
  } as TextStyle,
  error: {
    fontSize: 12,
    color: colors.error,
    paddingTop: 4,
  } as TextStyle,
});

export {TextInput};
