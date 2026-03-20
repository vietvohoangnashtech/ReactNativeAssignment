import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useOrders} from '../hooks/useOrders';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';
import type {Order} from '../types/order.types';

type FilterTab = 'All' | 'Ongoing' | 'Completed' | 'Cancelled';

const TABS: FilterTab[] = ['All', 'Ongoing', 'Completed', 'Cancelled'];
const ONGOING_STATUSES = ['pending', 'processing', 'shipped'];

const STATUS_CONFIG: Record<string, {bg: string; color: string}> = {
  delivered: {bg: '#DCFCE7', color: '#15803D'},
  shipped: {bg: '#E0F2FE', color: '#0369A1'},
  processing: {bg: '#E0F2FE', color: '#0369A1'},
  pending: {bg: '#FEF9C3', color: '#92400E'},
  cancelled: {bg: '#FEE2E2', color: '#DC2626'},
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
    const sc = STATUS_CONFIG[item.status] ?? {bg: '#E2E8F0', color: '#475569'};
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>
              {'ORDER #ORD-' + String(item.id).padStart(5, '0')}
            </Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
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
          <Text style={styles.shippingAddress} numberOfLines={1}>
            📦 {item.shippingAddress}
          </Text>
        ) : null}
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Order History" />

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
          <ActivityIndicator size="large" color="#39B78D" />
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
              tintColor="#39B78D"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

type OrderHistoryStyles = {
  container: ViewStyle;
  tabBar: ViewStyle;
  tab: ViewStyle;
  tabActive: ViewStyle;
  tabText: TextStyle;
  tabTextActive: TextStyle;
  center: ViewStyle;
  errorText: TextStyle;
  retryBtn: ViewStyle;
  retryText: TextStyle;
  emptyIcon: TextStyle;
  emptyText: TextStyle;
  list: ViewStyle;
  card: ViewStyle;
  cardTop: ViewStyle;
  orderId: TextStyle;
  orderDate: TextStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  orderTotal: TextStyle;
  shippingAddress: TextStyle;
};

const styles = StyleSheet.create<OrderHistoryStyles>({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#39B78D',
  },
  tabText: {fontSize: 12, color: '#9CA3AF', fontWeight: '500'},
  tabTextActive: {color: '#39B78D', fontWeight: '700'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20},
  errorText: {color: '#e53935', fontSize: 14, textAlign: 'center'},
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#39B78D',
    borderRadius: 8,
  },
  retryText: {color: '#fff', fontWeight: '600'},
  emptyIcon: {fontSize: 48, marginBottom: 8},
  emptyText: {color: '#9CA3AF', fontSize: 15},
  list: {padding: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
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
  orderId: {fontSize: 13, fontWeight: '700', color: '#1F2937'},
  orderDate: {fontSize: 12, color: '#9CA3AF', marginTop: 2},
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
    color: '#39B78D',
  },
  shippingAddress: {fontSize: 12, color: '#6B7280'},
});

export {OrderHistoryScreen};
