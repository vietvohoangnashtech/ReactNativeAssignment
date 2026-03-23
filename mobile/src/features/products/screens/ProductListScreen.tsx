import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import {useProducts} from '../hooks/useProducts';
import {useAppDispatch} from '../../../store/store';
import {addItem} from '../../cart/store/cartSlice';
import {colors} from '../../../theme';
import type {Product} from '../types/product.types';
import type {RootStackParamList} from '../../../navigation/types';

const PRICE_SYMBOL: Record<string, string> = {
  dollar: '$',
  euro: '€',
  inr: '₹',
};

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food', 'Books'];

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ProductListScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const {products, loading, error, refetch} = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (category !== 'All') {
      const q = category.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [products, search, category]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      dispatch(
        addItem({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
        }),
      );
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
            <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
              <Feather name="heart" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {symbol}
                {Number(item.price).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddToCart(item)}>
                <Feather name="plus" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, handleAddToCart],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity>
          <Feather name="bell" size={22} color={colors.textHeading} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Feather
            name="search"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.textDisabled}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={c => c}
          contentContainerStyle={styles.categoryList}
          renderItem={({item: cat}) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}>
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product Grid */}
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
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
              <Feather name="inbox" size={40} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.surface,
  },
  title: {fontSize: 22, fontWeight: '700', color: colors.textHeading},
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {marginRight: 8},
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textBody,
  },
  categoryWrap: {
    backgroundColor: colors.surface,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryList: {paddingHorizontal: 16, gap: 8},
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  categoryChipTextActive: {
    color: colors.textHeading,
    fontWeight: '600',
  },
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
  name: {fontSize: 13, fontWeight: '600', color: colors.textHeading, marginBottom: 6},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {fontSize: 14, fontWeight: '700', color: colors.primary},
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {ProductListScreen};
