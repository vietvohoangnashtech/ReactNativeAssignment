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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {clearCart, selectCartItems, selectCartTotal} from '../store/cartSlice';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';
import apiClient from '../../../services/api/client';
import {colors} from '../../../theme';
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

  const PAYMENT_ICONS: Record<string, string> = {
    credit_card: 'credit-card',
    cash_on_delivery: 'dollar-sign',
    paypal: 'globe',
    bank_transfer: 'briefcase',
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shopping-bag" size={18} color={colors.checkoutPrimary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
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

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color={colors.checkoutPrimary} />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <TextInput
            style={styles.addressInput}
            placeholder="Street, City, State, ZIP, Country"
            placeholderTextColor={colors.textDisabled}
            value={shippingAddress}
            onChangeText={setShippingAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={18} color={colors.checkoutPrimary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {fetchingMethods ? (
            <ActivityIndicator color={colors.checkoutPrimary} />
          ) : (
            paymentMethods.map(method => {
              const active = selectedPayment === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentOption,
                    active && styles.paymentOptionActive,
                  ]}
                  onPress={() => setSelectedPayment(method)}>
                  <View style={styles.paymentLeft}>
                    <Feather
                      name={PAYMENT_ICONS[method] ?? 'credit-card'}
                      size={18}
                      color={active ? colors.checkoutPrimary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.paymentText,
                        active && styles.paymentTextActive,
                      ]}>
                      {method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Text>
                  </View>
                  {active && (
                    <Feather name="check-circle" size={18} color={colors.checkoutPrimary} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.checkoutPrimary} />
        ) : (
          <TouchableOpacity
            style={[
              styles.placeOrderBtn,
              (!shippingAddress.trim() || items.length === 0) && styles.placeOrderBtnDisabled,
            ]}
            onPress={placeOrder}
            disabled={!shippingAddress.trim() || items.length === 0}>
            <Feather name="lock" size={16} color={colors.white} />
            <Text style={styles.placeOrderText}>
              Place Order · ${total.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: 16, paddingBottom: 24},
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: colors.textHeading},
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLeft: {flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8},
  qtyBadge: {
    backgroundColor: colors.checkoutPrimary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qtyBadgeText: {color: colors.white, fontSize: 12, fontWeight: '700'},
  itemName: {flex: 1, fontSize: 13, color: colors.textLabel},
  itemPrice: {fontSize: 13, fontWeight: '600', color: colors.textHeading},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 12},
  totalRow: {flexDirection: 'row', justifyContent: 'space-between'},
  totalLabel: {fontSize: 16, fontWeight: '700', color: colors.textHeading},
  totalValue: {fontSize: 18, fontWeight: '700', color: colors.checkoutPrimary},
  addressInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textBody,
    minHeight: 80,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  paymentOptionActive: {
    borderColor: colors.checkoutPrimary,
    backgroundColor: colors.checkoutLight,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentText: {fontSize: 14, color: colors.textBody},
  paymentTextActive: {color: colors.checkoutPrimary, fontWeight: '600'},
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.checkoutPrimary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  placeOrderBtnDisabled: {opacity: 0.5},
  placeOrderText: {color: colors.white, fontWeight: '700', fontSize: 16},
});

export {CheckoutScreen};
