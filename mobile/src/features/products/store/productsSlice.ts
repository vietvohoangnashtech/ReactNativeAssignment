import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {productService} from '../services/productService';
import {productCacheRepository} from '../../../services/database/repositories/productCacheRepository';
import type {Product, ProductReview} from '../types/product.types';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  reviews: ProductReview[];
  loading: boolean;
  reviewsLoading: boolean;
  error: string | null;
  isOffline: boolean;
  isStale: boolean;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  reviews: [],
  loading: false,
  reviewsLoading: false,
  error: null,
  isOffline: false,
  isStale: false,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, {dispatch}) => {
  // Show cached data immediately
  const cached = await productCacheRepository.getCachedProducts();
  if (cached) {
    dispatch(productsSlice.actions.setCachedProducts({items: cached.products, isStale: cached.isStale}));
  }

  try {
    const products = await productService.getProducts();
    await productCacheRepository.cacheProducts(products);
    return {products, isOffline: false};
  } catch {
    if (cached) {
      return {products: cached.products, isOffline: true};
    }
    throw new Error('Failed to load products');
  }
});

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId: number) => {
    return productService.getProductById(productId);
  },
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchReviews',
  async (productId: number) => {
    return productService.getProductReviews(productId);
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.reviews = [];
    },
    setCachedProducts(state, action: {payload: {items: Product[]; isStale: boolean}}) {
      if (state.items.length === 0) {
        state.items = action.payload.items;
        state.isStale = action.payload.isStale;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = state.items.length === 0;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.items = payload.products;
        state.isOffline = payload.isOffline;
        state.isStale = false;
      })
      .addCase(fetchProducts.rejected, (state, {error}) => {
        state.loading = false;
        state.error = error.message ?? 'Failed to load products';
      })
      .addCase(fetchProductById.fulfilled, (state, {payload}) => {
        state.selectedProduct = payload;
      })
      .addCase(fetchProductReviews.pending, state => {
        state.reviewsLoading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, {payload}) => {
        state.reviewsLoading = false;
        state.reviews = payload;
      })
      .addCase(fetchProductReviews.rejected, state => {
        state.reviewsLoading = false;
      });
  },
});

export const {clearSelectedProduct} = productsSlice.actions;
export default productsSlice.reducer;
