import React, {useCallback} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {
  removeItem,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
} from '../store/cartSlice';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';
import {colors} from '../../../theme';
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
              <Feather name="image" size={28} color={colors.textDisabled} />
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
              <Feather
                name={item.quantity > 1 ? 'minus' : 'trash-2'}
                size={14}
                color={item.quantity > 1 ? colors.textLabel : colors.error}
              />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() =>
                dispatch(updateQuantity({id: item.id, quantity: item.quantity + 1}))
              }>
              <Feather name="plus" size={14} color={colors.textLabel} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => dispatch(removeItem(item.id))}>
          <Feather name="x" size={16} color={colors.textDisabled} />
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
          <View style={styles.emptyIconWrap}>
            <Feather name="shopping-cart" size={40} color={colors.textDisabled} />
          </View>
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
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Feather name="arrow-right" size={18} color={colors.textHeading} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  list: {padding: 16, gap: 12, paddingBottom: 8},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {width: '100%', height: '100%', resizeMode: 'cover'},
  imagePlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  info: {flex: 1, justifyContent: 'space-between'},
  name: {fontSize: 14, fontWeight: '600', color: colors.textHeading},
  price: {fontSize: 16, fontWeight: '700', color: colors.primary},
  qtyRow: {flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8},
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textHeading,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {position: 'absolute', top: 8, right: 8, padding: 4},
  clearText: {color: colors.error, fontSize: 14, fontWeight: '600'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {fontSize: 20, fontWeight: '700', color: colors.textHeading},
  emptySubtitle: {fontSize: 14, color: colors.textDisabled},
  summary: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  summaryLabel: {fontSize: 14, color: colors.textMuted},
  summaryValue: {fontSize: 14, color: colors.textHeading, fontWeight: '500'},
  freeShipping: {color: colors.success},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 10},
  totalLabel: {fontSize: 16, fontWeight: '700', color: colors.textHeading},
  totalValue: {fontSize: 18, fontWeight: '700', color: colors.primary},
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutText: {color: colors.textHeading, fontWeight: '700', fontSize: 16},
});

export {CartScreen};
