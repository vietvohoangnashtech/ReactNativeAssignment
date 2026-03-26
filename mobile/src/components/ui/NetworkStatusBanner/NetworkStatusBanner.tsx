import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useNetworkStatus} from '../../../services/network/useNetworkStatus';
import {useSyncStatus} from '../../../services/sync/useSyncStatus';
import {colors} from '../../../theme';

type BannerState = 'hidden' | 'offline' | 'syncing' | 'error' | 'reconnected';

const NetworkStatusBanner = (): React.JSX.Element | null => {
  const {isOnline} = useNetworkStatus();
  const {syncStatus, triggerSync} = useSyncStatus();
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const wasOffline = useRef(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setBannerState('offline');
    } else if (wasOffline.current) {
      wasOffline.current = false;
      setBannerState('reconnected');
      const timer = setTimeout(() => setBannerState('hidden'), 3000);
      return () => clearTimeout(timer);
    } else {
      setBannerState('hidden');
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) {return;}
    if (syncStatus === 'syncing') {
      setBannerState('syncing');
    } else if (syncStatus === 'error') {
      setBannerState('error');
    } else if (syncStatus === 'completed' && bannerState === 'syncing') {
      setBannerState('hidden');
    }
  }, [syncStatus, isOnline, bannerState]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: bannerState === 'hidden' ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [bannerState, slideAnim]);

  if (bannerState === 'hidden') {return null;}

  const config = {
    offline: {bg: '#F59E0B', text: "You're offline", icon: '⚠'},
    syncing: {bg: '#3B82F6', text: 'Syncing...', icon: '↻'},
    error: {bg: '#EF4444', text: 'Sync failed. Tap to retry.', icon: '✕'},
    reconnected: {bg: '#10B981', text: 'Back online!', icon: '✓'},
  }[bannerState];

  return (
    <Animated.View
      style={[
        styles.banner,
        {backgroundColor: config.bg, transform: [{translateY: slideAnim}]},
      ]}>
      <TouchableOpacity
        style={styles.content}
        disabled={bannerState !== 'error'}
        onPress={triggerSync}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.text}>{config.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 14,
    color: colors.white,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
});

export {NetworkStatusBanner};
