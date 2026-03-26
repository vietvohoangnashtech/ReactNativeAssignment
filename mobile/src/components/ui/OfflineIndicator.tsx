import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {colors} from '../../theme';

interface Props {
  lastUpdatedAt: number | null;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {return 'just now';}
  if (minutes < 60) {return `${minutes}m ago`;}
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {return `${hours}h ago`;}
  return `${Math.floor(hours / 24)}d ago`;
}

const OfflineIndicator = ({lastUpdatedAt}: Props): React.JSX.Element | null => {
  if (!lastUpdatedAt) {return null;}

  return (
    <View style={styles.container}>
      <Feather name="wifi-off" size={12} color={colors.textMuted} />
      <Text style={styles.text}>Last updated {timeAgo(lastUpdatedAt)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
    backgroundColor: colors.inputBg,
  },
  text: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

export {OfflineIndicator};
