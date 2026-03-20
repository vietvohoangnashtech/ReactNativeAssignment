import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
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
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {fetchProductById, fetchProductReviews, clearSelectedProduct} from '../store/productsSlice';
import {addItem} from '../../cart/store/cartSlice';
import {productService} from '../services/productService';
import type {RootStackParamList} from '../../../navigation/types';
import type {CreateReviewPayload} from '../types/product.types';

const PRICE_SYMBOL: Record<string, string> = {
  dollar: '$',
  euro: '€',
  inr: '₹',
};

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ProductDetailScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const {productId} = route.params;
  const dispatch = useAppDispatch();
  const product = useAppSelector(state => state.products.selectedProduct);
  const reviews = useAppSelector(state => state.products.reviews);
  const reviewsLoading = useAppSelector(state => state.products.reviewsLoading);

  const [added, setAdded] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(productId));
    dispatch(fetchProductReviews(productId));
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, productId]);

  const handleAddToCart = useCallback(() => {
    if (!product) {return;}
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
      }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [dispatch, product]);

  const handleBuyNow = useCallback(() => {
    if (!product) {return;}
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
      }),
    );
    navigation.navigate('Checkout');
  }, [dispatch, product, navigation]);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewText.trim()) {return;}
    setSubmittingReview(true);
    try {
      const payload: CreateReviewPayload = {
        rating: reviewRating,
        message: reviewText.trim(),
      };
      await productService.addProductReview(productId, payload);
      setReviewText('');
      dispatch(fetchProductReviews(productId));
    } catch {
      // ignore
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewText, reviewRating, productId, dispatch]);

  if (!product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#39B78D" />
      </View>
    );
  }

  const symbol = PRICE_SYMBOL[product.priceUnit] ?? '$';
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {product.image ? (
            <Image source={{uri: product.image}} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🖼</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRatingRow}>
            <Text style={styles.price}>
              {symbol}
              {Number(product.price).toFixed(2)}
            </Text>
            {reviews.length > 0 && (
              <Text style={styles.rating}>
                ★ {avgRating.toFixed(1)} ({reviews.length})
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviews.length})
          </Text>
          {reviewsLoading ? (
            <ActivityIndicator color="#39B78D" />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyReviews}>No reviews yet. Be the first!</Text>
          ) : (
            reviews.map(r => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>
                    {r.User?.username ?? 'User'}
                  </Text>
                  <Text style={styles.reviewRating}>{'★'.repeat(r.rating)}</Text>
                </View>
                <Text style={styles.reviewMessage}>{r.message}</Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.section, styles.writeReview]}>
          <Text style={styles.sectionTitle}>Write a Review</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                <Text style={[styles.star, s <= reviewRating && styles.starActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="#999"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.submitBtn, (!reviewText.trim() || submittingReview) && styles.submitBtnDisabled]}
            onPress={handleSubmitReview}
            disabled={!reviewText.trim() || submittingReview}>
            <Text style={styles.submitBtnText}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addCartText}>{added ? 'Added!' : 'Add to Cart'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type ProductDetailStyles = {
  container: ViewStyle;
  center: ViewStyle;
  header: ViewStyle;
  headerBtn: ViewStyle;
  backText: TextStyle;
  headerTitle: TextStyle;
  imageSection: ViewStyle;
  productImage: ImageStyle;
  imagePlaceholder: ViewStyle;
  imagePlaceholderText: TextStyle;
  infoSection: ViewStyle;
  productName: TextStyle;
  priceRatingRow: ViewStyle;
  price: TextStyle;
  rating: TextStyle;
  section: ViewStyle;
  writeReview: ViewStyle;
  sectionTitle: TextStyle;
  description: TextStyle;
  emptyReviews: TextStyle;
  reviewItem: ViewStyle;
  reviewHeader: ViewStyle;
  reviewAuthor: TextStyle;
  reviewRating: TextStyle;
  reviewMessage: TextStyle;
  ratingRow: ViewStyle;
  star: TextStyle;
  starActive: TextStyle;
  reviewInput: ViewStyle & TextStyle;
  submitBtn: ViewStyle;
  submitBtnDisabled: ViewStyle;
  submitBtnText: TextStyle;
  actionBar: ViewStyle;
  addCartBtn: ViewStyle;
  addCartText: TextStyle;
  buyNowBtn: ViewStyle;
  buyNowText: TextStyle;
};

const styles = StyleSheet.create<ProductDetailStyles>({
  container: {flex: 1, backgroundColor: '#fff'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerBtn: {minWidth: 60},
  backText: {color: '#39B78D', fontSize: 15},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: '#1F2937'},
  imageSection: {
    height: 280,
    backgroundColor: '#F3F4F6',
  },
  productImage: {width: '100%', height: '100%', resizeMode: 'cover'},
  imagePlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  imagePlaceholderText: {fontSize: 64},
  infoSection: {padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  productName: {fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8},
  priceRatingRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  price: {fontSize: 22, fontWeight: '700', color: '#39B78D'},
  rating: {fontSize: 14, color: '#F59E0B', fontWeight: '600'},
  section: {padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  writeReview: {borderBottomWidth: 0, paddingBottom: 24},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 10},
  description: {fontSize: 14, color: '#4B5563', lineHeight: 22},
  emptyReviews: {color: '#9CA3AF', fontSize: 14},
  reviewItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewAuthor: {fontWeight: '600', color: '#1F2937', fontSize: 13},
  reviewRating: {color: '#F59E0B', fontSize: 13},
  reviewMessage: {fontSize: 13, color: '#4B5563', lineHeight: 18},
  ratingRow: {flexDirection: 'row', gap: 6, marginBottom: 10},
  star: {fontSize: 28, color: '#D1D5DB'},
  starActive: {color: '#F59E0B'},
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#39B78D',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {opacity: 0.5},
  submitBtnText: {color: '#fff', fontWeight: '600', fontSize: 14},
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addCartBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#39B78D',
  },
  addCartText: {color: '#39B78D', fontWeight: '700', fontSize: 15},
  buyNowBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#39B78D',
  },
  buyNowText: {color: '#fff', fontWeight: '700', fontSize: 15},
});

export {ProductDetailScreen};
