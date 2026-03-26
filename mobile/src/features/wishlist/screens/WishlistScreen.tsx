import React, {useCallback, useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
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
import {fetchWishlist, toggleWishlist, selectWishlistIds} from '../store/wishlistSlice';
import {colors} from '../../../theme';
import type {Product} from '../../products/types/product.types';
import type {RootStackParamList} from '../../../navigation/types';

const PRICE_SYMBOL: Record<string, string> = {
  dollar: '$',
  euro: '€',
  inr: '₹',
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const WishlistScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector(selectWishlistIds);
  const allProducts = useAppSelector(state => state.products.items);
  const loading = useAppSelector(state => state.wishlist.loading);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const wishlistProducts = useMemo(() => {
    const idSet = new Set(wishlistIds);
    return allProducts.filter(p => idSet.has(p.id));
  }, [wishlistIds, allProducts]);

  const handleRemove = useCallback(
    (productId: number) => {
      dispatch(toggleWishlist(productId));
    },
    [dispatch],
  );

  const renderProduct = useCallback(
    ({item}: {item: Product}) => {
      const symbol = PRICE_SYMBOL[item.priceUnit] ?? '$';
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('ProductDetail', {productId: item.id})
          }
          activeOpacity={0.85}>
          <View style={styles.imageWrap}>
            {item.image ? (
              <Image source={{uri: item.image}} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={32} color={colors.textDisabled} />
              </View>
            )}
            <TouchableOpacity
              style={styles.heartBtn}
              activeOpacity={0.7}
              onPress={() => handleRemove(item.id)}>
              <Feather name="heart" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.price}>
              {symbol}
              {Number(item.price).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, handleRemove],
  );

  if (loading && wishlistProducts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.count}>{wishlistProducts.length} items</Text>
      </View>

      {wishlistProducts.length === 0 ? (
        <View style={styles.center}>
          <Feather name="heart" size={48} color={colors.textDisabled} />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on products to save them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistProducts}
          keyExtractor={item => String(item.id)}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20},
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {fontSize: 22, fontWeight: '700', color: colors.textHeading},
  count: {fontSize: 14, color: colors.textMuted},
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textDisabled,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  list: {padding: 12},
  row: {justifyContent: 'space-between'},
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrap: {
    width: '100%',
    height: 140,
    backgroundColor: colors.inputBg,
  },
  image: {width: '100%', height: '100%', resizeMode: 'cover'},
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {padding: 10},
  name: {fontSize: 13, fontWeight: '600', color: colors.textHeading, marginBottom: 4},
  price: {fontSize: 14, fontWeight: '700', color: colors.primary},
});

export {WishlistScreen};
