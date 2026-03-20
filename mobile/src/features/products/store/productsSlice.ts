import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {productService} from '../services/productService';
import type {Product, ProductReview} from '../types/product.types';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  reviews: ProductReview[];
  loading: boolean;
  reviewsLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  reviews: [],
  loading: false,
  reviewsLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  return productService.getProducts();
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
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.items = payload;
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
