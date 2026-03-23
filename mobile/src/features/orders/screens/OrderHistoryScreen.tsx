import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useOrders} from '../hooks/useOrders';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';
import {colors} from '../../../theme';
import type {Order} from '../types/order.types';

type FilterTab = 'All' | 'Ongoing' | 'Completed' | 'Cancelled';

const TABS: FilterTab[] = ['All', 'Ongoing', 'Completed', 'Cancelled'];
const ONGOING_STATUSES = ['pending', 'processing', 'shipped'];

const STATUS_CONFIG: Record<string, {bg: string; color: string; icon: string}> = {
  delivered: {bg: colors.statusDeliveredBg, color: colors.statusDelivered, icon: 'check-circle'},
  shipped: {bg: colors.statusShippedBg, color: colors.statusShipped, icon: 'truck'},
  processing: {bg: colors.statusShippedBg, color: colors.statusShipped, icon: 'loader'},
  pending: {bg: colors.statusPendingBg, color: colors.statusPending, icon: 'clock'},
  cancelled: {bg: colors.statusCancelledBg, color: colors.statusCancelled, icon: 'x-circle'},
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const OrderHistoryScreen = (): React.JSX.Element => {
  const {orders, loading, error, refetch} = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = orders.filter(o => {
    if (activeTab === 'All') {return true;}
    if (activeTab === 'Ongoing') {return ONGOING_STATUSES.includes(o.status);}
    if (activeTab === 'Completed') {return o.status === 'delivered';}
    if (activeTab === 'Cancelled') {return o.status === 'cancelled';}
    return true;
  });

  const renderOrder = useCallback(({item}: {item: Order}) => {
    const sc = STATUS_CONFIG[item.status] ?? {bg: colors.inputBg, color: colors.textBody, icon: 'package'};
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <View style={[styles.orderIconWrap, {backgroundColor: sc.bg}]}>
              <Feather name={sc.icon} size={18} color={sc.color} />
            </View>
            <View>
              <Text style={styles.orderId}>
                {'ORDER #ORD-' + String(item.id).padStart(5, '0')}
              </Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View>
            <View style={[styles.statusBadge, {backgroundColor: sc.bg}]}>
              <Text style={[styles.statusText, {color: sc.color}]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.orderTotal}>
              ${Number(item.totalAmount).toFixed(2)}
            </Text>
          </View>
        </View>
        {item.shippingAddress ? (
          <View style={styles.shippingRow}>
            <Feather name="map-pin" size={12} color={colors.textMuted} />
            <Text style={styles.shippingAddress} numberOfLines={1}>
              {item.shippingAddress}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Order History" />

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="inbox" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {fontSize: 13, color: colors.textDisabled, fontWeight: '500'},
  tabTextActive: {color: colors.primary, fontWeight: '700'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20},
  errorText: {color: colors.error, fontSize: 14, textAlign: 'center'},
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryText: {color: colors.textHeading, fontWeight: '600'},
  emptyText: {color: colors.textDisabled, fontSize: 15, marginTop: 8},
  list: {padding: 16},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderId: {fontSize: 13, fontWeight: '700', color: colors.textHeading},
  orderDate: {fontSize: 12, color: colors.textDisabled, marginTop: 2},
  statusBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusText: {fontSize: 11, fontWeight: '700'},
  orderTotal: {
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shippingAddress: {fontSize: 12, color: colors.textMuted, flex: 1},
});

export {OrderHistoryScreen};
