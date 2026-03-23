import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {colors} from '../../../theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

const ScreenHeader = ({
  title,
  onBack,
  rightContent,
}: ScreenHeaderProps): React.JSX.Element => (
  <View style={styles.container}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.spacer} />
    )}
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
    <View style={styles.right}>{rightContent ?? <View style={styles.spacer} />}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  } as ViewStyle,
  backBtn: {
    padding: 8,
    minWidth: 40,
    borderRadius: 9999,
  } as ViewStyle,
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  } as TextStyle,
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  } as ViewStyle,
  spacer: {
    minWidth: 40,
  } as ViewStyle,
});

export {ScreenHeader};
