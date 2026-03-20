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
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useProducts} from '../hooks/useProducts';
import {useAppDispatch} from '../../../store/store';
import {addItem} from '../../cart/store/cartSlice';
import type {Product} from '../types/product.types';
import type {RootStackParamList} from '../../../navigation/types';

const PRICE_SYMBOL: Record<string, string> = {
  dollar: '$',
  euro: '€',
  inr: '₹',
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ProductListScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const {products, loading, error, refetch} = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return products;
    }
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, search]);

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
                <Text style={styles.imagePlaceholderText}>🖼</Text>
              </View>
            )}
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
                <Text style={styles.addBtnText}>+</Text>
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
      <View style={styles.headerBar}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
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
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

type ProductListStyles = {
  container: ViewStyle;
  headerBar: ViewStyle;
  title: TextStyle;
  searchWrap: ViewStyle;
  searchInput: ViewStyle & TextStyle;
  center: ViewStyle;
  errorText: TextStyle;
  retryBtn: ViewStyle;
  retryText: TextStyle;
  emptyText: TextStyle;
  list: ViewStyle;
  row: ViewStyle;
  card: ViewStyle;
  imageWrap: ViewStyle;
  image: ImageStyle;
  imagePlaceholder: ViewStyle;
  imagePlaceholderText: TextStyle;
  cardBody: ViewStyle;
  name: TextStyle;
  priceRow: ViewStyle;
  price: TextStyle;
  addBtn: ViewStyle;
  addBtnText: TextStyle;
};

const styles = StyleSheet.create<ProductListStyles>({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {fontSize: 22, fontWeight: '700', color: '#1F2937'},
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: '#333',
  },
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
  emptyText: {color: '#9CA3AF', fontSize: 15},
  list: {padding: 12},
  row: {justifyContent: 'space-between'},
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrap: {width: '100%', height: 140, backgroundColor: '#F3F4F6'},
  image: {width: '100%', height: '100%', resizeMode: 'cover'},
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {fontSize: 32},
  cardBody: {padding: 10},
  name: {fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 6},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {fontSize: 14, fontWeight: '700', color: '#39B78D'},
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#39B78D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {color: '#fff', fontSize: 18, lineHeight: 22},
});

export {ProductListScreen};
