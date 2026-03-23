import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {colors} from '../../../theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

const Button = ({
  label,
  onPress,
  style,
  textStyle,
  disabled,
  variant = 'primary',
  icon,
}: ButtonProps): React.JSX.Element => {
  const buttonStyle = [
    styles.button,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    variant === 'outline' && styles.outlineText,
    variant === 'ghost' && styles.ghostText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      {icon ? (
        <View style={styles.iconRow}>
          {icon}
          <Text style={labelStyle}>{label}</Text>
        </View>
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  ghost: {
    backgroundColor: colors.transparent,
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  disabled: {
    opacity: 0.6,
  } as ViewStyle,
  text: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: colors.textHeading,
  } as TextStyle,
  outlineText: {
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,
  ghostText: {
    color: colors.primary,
    fontWeight: '500',
  } as TextStyle,
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,
});

export {Button};
