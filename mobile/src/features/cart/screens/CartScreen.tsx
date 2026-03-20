import React, {useCallback} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {
  removeItem,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
} from '../store/cartSlice';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';
import type {CartItem} from '../types/cart.types';
import type {RootStackParamList} from '../../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CartScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  const handleClearCart = useCallback(() => dispatch(clearCart()), [dispatch]);

  const renderItem = useCallback(
    ({item}: {item: CartItem}) => (
      <View style={styles.card}>
        <View style={styles.imageBox}>
          {item.image ? (
            <Image source={{uri: item.image}} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🖼</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() =>
                item.quantity > 1
                  ? dispatch(updateQuantity({id: item.id, quantity: item.quantity - 1}))
                  : dispatch(removeItem(item.id))
              }>
              <Text style={styles.qtyBtnText}>{item.quantity > 1 ? '−' : '🗑'}</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() =>
                dispatch(updateQuantity({id: item.id, quantity: item.quantity + 1}))
              }>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => dispatch(removeItem(item.id))}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    ),
    [dispatch],
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`My Cart${items.length > 0 ? ` (${items.length})` : ''}`}
        rightContent={
          items.length > 0 ? (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items to get started</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={it => String(it.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, styles.freeShipping]}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

type CartStyles = {
  container: ViewStyle;
  list: ViewStyle;
  card: ViewStyle;
  imageBox: ViewStyle;
  productImage: ImageStyle;
  imagePlaceholder: ViewStyle;
  imagePlaceholderText: TextStyle;
  info: ViewStyle;
  name: TextStyle;
  price: TextStyle;
  qtyRow: ViewStyle;
  qtyBtn: ViewStyle;
  qtyBtnText: TextStyle;
  qtyText: TextStyle;
  removeBtn: ViewStyle;
  removeBtnText: TextStyle;
  clearText: TextStyle;
  empty: ViewStyle;
  emptyIcon: TextStyle;
  emptyTitle: TextStyle;
  emptySubtitle: TextStyle;
  summary: ViewStyle;
  summaryRow: ViewStyle;
  summaryLabel: TextStyle;
  summaryValue: TextStyle;
  freeShipping: TextStyle;
  divider: ViewStyle;
  totalLabel: TextStyle;
  totalValue: TextStyle;
  checkoutBtn: ViewStyle;
  checkoutText: TextStyle;
};

const styles = StyleSheet.create<CartStyles>({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  list: {padding: 16, gap: 12, paddingBottom: 8},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {width: '100%', height: '100%', resizeMode: 'cover'},
  imagePlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  imagePlaceholderText: {fontSize: 28},
  info: {flex: 1, justifyContent: 'space-between'},
  name: {fontSize: 14, fontWeight: '600', color: '#1F2937'},
  price: {fontSize: 16, fontWeight: '700', color: '#39B78D'},
  qtyRow: {flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8},
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {fontSize: 16, color: '#374151'},
  qtyText: {fontSize: 15, fontWeight: '700', color: '#1F2937', minWidth: 20, textAlign: 'center'},
  removeBtn: {position: 'absolute', top: 8, right: 8, padding: 4},
  removeBtnText: {color: '#9CA3AF', fontSize: 16},
  clearText: {color: '#e53935', fontSize: 14, fontWeight: '600'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  emptyIcon: {fontSize: 56},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: '#1F2937'},
  emptySubtitle: {fontSize: 14, color: '#9CA3AF'},
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  summaryLabel: {fontSize: 14, color: '#6B7280'},
  summaryValue: {fontSize: 14, color: '#1F2937', fontWeight: '500'},
  freeShipping: {color: '#10B981'},
  divider: {height: 1, backgroundColor: '#F3F4F6', marginVertical: 10},
  totalLabel: {fontSize: 16, fontWeight: '700', color: '#1F2937'},
  totalValue: {fontSize: 18, fontWeight: '700', color: '#39B78D'},
  checkoutBtn: {
    marginTop: 14,
    backgroundColor: '#39B78D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {color: '#fff', fontWeight: '700', fontSize: 16},
});

export {CartScreen};
