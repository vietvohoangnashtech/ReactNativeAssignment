import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

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
        <Text style={styles.backText}>{'← Back'}</Text>
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

type ScreenHeaderStyles = {
  container: ViewStyle;
  backBtn: ViewStyle;
  backText: TextStyle;
  title: TextStyle;
  right: ViewStyle;
  spacer: ViewStyle;
};

const styles = StyleSheet.create<ScreenHeaderStyles>({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 8,
    minWidth: 64,
  },
  backText: {
    color: '#39B78D',
    fontSize: 15,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  right: {
    minWidth: 64,
    alignItems: 'flex-end',
  },
  spacer: {
    minWidth: 64,
  },
});

export {ScreenHeader};
