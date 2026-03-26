import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {wishlistService} from '../services/wishlistService';

interface WishlistState {
  productIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  productIds: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async () => {
    const items = await wishlistService.getWishlist();
    return items.map(item => item.productId);
  },
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (productId: number) => {
    const result = await wishlistService.toggleWishlist(productId);
    return result;
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWishlist.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.productIds = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch wishlist';
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const {wishlisted, productId} = action.payload;
        if (wishlisted) {
          if (!state.productIds.includes(productId)) {
            state.productIds.push(productId);
          }
        } else {
          state.productIds = state.productIds.filter(id => id !== productId);
        }
      });
  },
});

export const {clearWishlist} = wishlistSlice.actions;
export const selectWishlistIds = (state: {wishlist: WishlistState}) =>
  state.wishlist.productIds;
export const selectIsWishlisted = (productId: number) => (state: {wishlist: WishlistState}) =>
  state.wishlist.productIds.includes(productId);

export default wishlistSlice.reducer;
