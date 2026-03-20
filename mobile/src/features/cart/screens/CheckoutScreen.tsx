import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {clearCart, selectCartItems, selectCartTotal} from '../store/cartSlice';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';
import apiClient from '../../../services/api/client';
import type {RootStackParamList} from '../../../navigation/types';
import type {ApiResponse} from '../../../types/api/response.types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CheckoutScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [fetchingMethods, setFetchingMethods] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFetchingMethods(true);
    apiClient
      .get<ApiResponse<string[]>>('/order/payment-methods')
      .then(r => {
        const methods = r.data.data;
        if (Array.isArray(methods) && methods.length > 0) {
          setPaymentMethods(methods);
          setSelectedPayment(methods[0] ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setFetchingMethods(false));
  }, []);

  const placeOrder = useCallback(async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter a shipping address.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: total,
        shippingAddress: shippingAddress.trim(),
        paymentMethod: selectedPayment,
      };
      await apiClient.post('/order', payload);
      dispatch(clearCart());
      Alert.alert('Order Placed!', 'Your order has been placed successfully.', [
        {
          text: 'View Orders',
          onPress: () => navigation.navigate('Main'),
        },
        {
          text: 'Continue Shopping',
          onPress: () => navigation.navigate('Main'),
        },
      ]);
    } catch (err: unknown) {
      const axiosErr = err as {response?: {data?: {message?: string | string[]}}};
      const msg = axiosErr.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg[0] : msg ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }, [shippingAddress, items, total, selectedPayment, dispatch, navigation]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map(item => (
            <View key={item.id} style={styles.summaryItem}>
              <View style={styles.summaryLeft}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{item.quantity}</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TextInput
            style={styles.addressInput}
            placeholder="Street, City, State, ZIP, Country"
            placeholderTextColor="#999"
            value={shippingAddress}
            onChangeText={setShippingAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {fetchingMethods ? (
            <ActivityIndicator color="#39B78D" />
          ) : (
            paymentMethods.map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  selectedPayment === method && styles.paymentOptionActive,
                ]}
                onPress={() => setSelectedPayment(method)}>
                <Text
                  style={[
                    styles.paymentText,
                    selectedPayment === method && styles.paymentTextActive,
                  ]}>
                  {method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Text>
                {selectedPayment === method && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#39B78D" />
        ) : (
          <TouchableOpacity
            style={[
              styles.placeOrderBtn,
              (!shippingAddress.trim() || items.length === 0) && styles.placeOrderBtnDisabled,
            ]}
            onPress={placeOrder}
            disabled={!shippingAddress.trim() || items.length === 0}>
            <Text style={styles.placeOrderText}>
              Place Order · ${total.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

type CheckoutStyles = {
  container: ViewStyle;
  content: ViewStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  summaryItem: ViewStyle;
  summaryLeft: ViewStyle;
  qtyBadge: ViewStyle;
  qtyBadgeText: TextStyle;
  itemName: TextStyle;
  itemPrice: TextStyle;
  divider: ViewStyle;
  totalRow: ViewStyle;
  totalLabel: TextStyle;
  totalValue: TextStyle;
  addressInput: ViewStyle & TextStyle;
  paymentOption: ViewStyle;
  paymentOptionActive: ViewStyle;
  paymentText: TextStyle;
  paymentTextActive: TextStyle;
  checkMark: TextStyle;
  footer: ViewStyle;
  placeOrderBtn: ViewStyle;
  placeOrderBtnDisabled: ViewStyle;
  placeOrderText: TextStyle;
};

const styles = StyleSheet.create<CheckoutStyles>({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  content: {padding: 16, paddingBottom: 24},
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12},
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLeft: {flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8},
  qtyBadge: {
    backgroundColor: '#39B78D',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qtyBadgeText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  itemName: {flex: 1, fontSize: 13, color: '#374151'},
  itemPrice: {fontSize: 13, fontWeight: '600', color: '#1F2937'},
  divider: {height: 1, backgroundColor: '#F3F4F6', marginVertical: 12},
  totalRow: {flexDirection: 'row', justifyContent: 'space-between'},
  totalLabel: {fontSize: 16, fontWeight: '700', color: '#1F2937'},
  totalValue: {fontSize: 18, fontWeight: '700', color: '#39B78D'},
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  paymentOptionActive: {
    borderColor: '#39B78D',
    backgroundColor: '#F0FAF6',
  },
  paymentText: {fontSize: 14, color: '#4B5563'},
  paymentTextActive: {color: '#39B78D', fontWeight: '600'},
  checkMark: {color: '#39B78D', fontWeight: '700', fontSize: 16},
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderBtn: {
    backgroundColor: '#39B78D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderBtnDisabled: {opacity: 0.5},
  placeOrderText: {color: '#fff', fontWeight: '700', fontSize: 16},
});

export {CheckoutScreen};
