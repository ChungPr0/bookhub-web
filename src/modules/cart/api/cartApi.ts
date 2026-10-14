import { axiosClient } from '@/core/http/axiosClient';
import { PageResponse } from '@/core/types/api.types';
import {
  AddToCartRequest,
  CartItemDto,
  CartResponse,
  MergeCartRequest,
  UpdateCartItemRequest,
  WishlistItemDto,
} from '../types/cart.types';

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const res = await axiosClient.get<CartResponse>('/me/cart');
    return res.data;
  },

  addItem: async (payload: AddToCartRequest): Promise<CartItemDto> => {
    const res = await axiosClient.post<CartItemDto>('/me/cart/items', payload);
    return res.data;
  },

  updateItem: async (itemId: number, payload: UpdateCartItemRequest): Promise<CartItemDto> => {
    const res = await axiosClient.put<CartItemDto>(`/me/cart/items/${itemId}`, payload);
    return res.data;
  },

  removeItem: async (itemId: number): Promise<void> => {
    await axiosClient.delete<null>(`/me/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await axiosClient.delete<null>('/me/cart');
  },

  mergeCart: async (payload: MergeCartRequest): Promise<CartResponse> => {
    const res = await axiosClient.post<CartResponse>('/me/cart/merge', payload);
    return res.data;
  },

  getWishlist: async (page = 0, size = 20): Promise<PageResponse<WishlistItemDto>> => {
    const res = await axiosClient.get<PageResponse<WishlistItemDto>>('/me/wishlist', {
      params: { page, size },
    });
    return res.data;
  },

  addToWishlist: async (bookId: number): Promise<void> => {
    await axiosClient.post<null>(`/me/wishlist/${bookId}`);
  },

  removeFromWishlist: async (bookId: number): Promise<void> => {
    await axiosClient.delete<null>(`/me/wishlist/${bookId}`);
  },
};

