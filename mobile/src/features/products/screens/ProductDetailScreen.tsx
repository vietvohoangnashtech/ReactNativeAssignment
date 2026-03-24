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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {fetchProductById, fetchProductReviews, clearSelectedProduct} from '../store/productsSlice';
import {addItem} from '../../cart/store/cartSlice';
import {productService} from '../services/productService';
import {colors} from '../../../theme';
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
        <ActivityIndicator size="large" color={colors.primary} />
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Feather name="chevron-left" size={24} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Feather name="heart" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageSection}>
          {product.image ? (
            <Image source={{uri: product.image}} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={64} color={colors.textDisabled} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.category ? (
            <Text style={styles.categoryLabel}>{product.category}</Text>
          ) : null}
          <View style={styles.priceRatingRow}>
            <Text style={styles.price}>
              {symbol}
              {Number(product.price).toFixed(2)}
            </Text>
            {reviews.length > 0 && (
              <View style={styles.ratingBadge}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {avgRating.toFixed(1)} ({reviews.length})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureGrid}>
            {[
              {icon: 'shield', label: 'Quality Assured'},
              {icon: 'truck', label: 'Free Shipping'},
              {icon: 'refresh-cw', label: 'Easy Returns'},
              {icon: 'award', label: 'Top Rated'},
            ].map(f => (
              <View key={f.icon} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviews.length})
          </Text>
          {reviewsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyReviews}>No reviews yet. Be the first!</Text>
          ) : (
            reviews.map(r => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatarWrap}>
                    <View style={styles.reviewAvatar}>
                      <Feather name="user" size={14} color={colors.primary} />
                    </View>
                    <Text style={styles.reviewAuthor}>
                      {r.User?.username ?? 'User'}
                    </Text>
                  </View>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Feather
                        key={s}
                        name="star"
                        size={12}
                        color={s <= r.rating ? '#F59E0B' : colors.borderLight}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewMessage}>{r.message}</Text>
              </View>
            ))
          )}
        </View>

        {/* Write Review */}
        <View style={[styles.section, styles.writeReview]}>
          <Text style={styles.sectionTitle}>Write a Review</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                <Feather
                  name="star"
                  size={28}
                  color={s <= reviewRating ? '#F59E0B' : colors.inputBorder}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your thoughts..."
            placeholderTextColor={colors.textDisabled}
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

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Feather name="shopping-cart" size={18} color={colors.primary} />
          <Text style={styles.addCartText}>{added ? 'Added!' : 'Add to Cart'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.surface},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.textHeading,
  },
  imageSection: {
    height: 280,
    backgroundColor: colors.inputBg,
  },
  productImage: {width: '100%', height: '100%', resizeMode: 'cover'},
  imagePlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  infoSection: {padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border},
  productName: {fontSize: 20, fontWeight: '700', color: colors.textHeading, marginBottom: 4},
  categoryLabel: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceRatingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  price: {fontSize: 22, fontWeight: '700', color: colors.primary},
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {fontSize: 13, fontWeight: '600', color: '#F59E0B'},
  section: {padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border},
  writeReview: {borderBottomWidth: 0, paddingBottom: 24},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: colors.textHeading, marginBottom: 10},
  description: {fontSize: 14, color: colors.textBody, lineHeight: 22},
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {fontSize: 12, fontWeight: '500', color: colors.textLabel, flex: 1},
  emptyReviews: {color: colors.textDisabled, fontSize: 14},
  reviewItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAvatarWrap: {flexDirection: 'row', alignItems: 'center', gap: 8},
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAuthor: {fontWeight: '600', color: colors.textHeading, fontSize: 13},
  reviewStarsRow: {flexDirection: 'row', gap: 2},
  reviewMessage: {fontSize: 13, color: colors.textBody, lineHeight: 18, marginLeft: 36},
  starRow: {flexDirection: 'row', gap: 6, marginBottom: 10},
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textBody,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {opacity: 0.5},
  submitBtnText: {color: colors.textHeading, fontWeight: '600', fontSize: 14},
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  addCartText: {color: colors.primary, fontWeight: '700', fontSize: 15},
  buyNowBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buyNowText: {color: colors.textHeading, fontWeight: '700', fontSize: 15},
});

export {ProductDetailScreen};
