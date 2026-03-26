import React from 'react';
import {StyleSheet, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {colors} from '../../theme';

interface Props {
  status: 'synced' | 'pending' | 'syncing' | 'failed';
  size?: number;
}

const SyncStatusBadge = ({status, size = 14}: Props): React.JSX.Element | null => {
  if (status === 'synced') {return null;}

  const config = {
    pending: {icon: 'clock' as const, color: '#F59E0B'},
    syncing: {icon: 'refresh-cw' as const, color: '#3B82F6'},
    failed: {icon: 'alert-triangle' as const, color: '#EF4444'},
  }[status];

  return (
    <View style={[styles.badge, {backgroundColor: config.color + '20'}]}>
      <Feather name={config.icon} size={size} color={config.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {SyncStatusBadge};
