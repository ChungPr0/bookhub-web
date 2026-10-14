import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartApi } from '../api/cartApi';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useCartStore, mapGuestItemsToCartItems } from '../store/useCartStore';
import { AddToCartRequest, CartResponse, UpdateCartItemRequest } from '../types/cart.types';

export const useCartQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestItems = useCartStore((state) => state.guestItems);

  return useQuery({
    queryKey: ['cart', isAuthenticated],
    queryFn: async (): Promise<CartResponse> => {
      if (isAuthenticated) {
        return await cartApi.getCart();
      }
      // Offline Guest Cart fallback
      const items = mapGuestItemsToCartItems(guestItems);
      const selectableSubtotal = items
        .filter((i) => i.selected && i.inStock)
        .reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
      const grandTotal = items
        .filter((i) => i.inStock)
        .reduce((sum, i) => sum + i.salePrice * i.quantity, 0);

      return {
        items,
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
        selectableSubtotal,
        grandTotal,
      };
    },
    staleTime: 0,
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addGuestItem = useCartStore((state) => state.addGuestItem);

  return useMutation({
    mutationFn: async (payload: AddToCartRequest & {
      title?: string;
      authorName?: string;
      salePrice?: number;
      listPrice?: number;
      primaryImageUrl?: string;
      stockQuantity?: number;
      inStock?: boolean;
    }) => {
      if (isAuthenticated) {
        return await cartApi.addItem({ bookId: payload.bookId, quantity: payload.quantity });
      }
      // Save to guest store
      addGuestItem({
        bookId: payload.bookId,
        quantity: payload.quantity,
        title: payload.title || 'Sách',
        authorName: payload.authorName || '',
        salePrice: payload.salePrice || 0,
        listPrice: payload.listPrice || 0,
        primaryImageUrl: payload.primaryImageUrl || '',
        stockQuantity: payload.stockQuantity || 99,
        inStock: payload.inStock !== false,
      });
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm sách vào giỏ hàng');
    },
    onError: () => {
      toast.error('Không thể thêm vào giỏ hàng. Vui lòng kiểm tra lại');
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateGuestQuantity = useCartStore((state) => state.updateGuestQuantity);

  return useMutation({
    mutationFn: async ({ itemId, bookId, payload }: { itemId: number; bookId: number; payload: UpdateCartItemRequest }) => {
      if (isAuthenticated) {
        return await cartApi.updateItem(itemId, payload);
      }
      updateGuestQuantity(bookId, payload.quantity);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const removeGuestItem = useCartStore((state) => state.removeGuestItem);

  return useMutation({
    mutationFn: async ({ itemId, bookId }: { itemId: number; bookId: number }) => {
      if (isAuthenticated) {
        return await cartApi.removeItem(itemId);
      }
      removeGuestItem(bookId);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.info('Đã xóa sách khỏi giỏ hàng');
    },
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearGuestCart = useCartStore((state) => state.clearGuestCart);

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        return await cartApi.clearCart();
      }
      clearGuestCart();
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.info('Đã xóa toàn bộ giỏ hàng');
    },
  });
};

export const useMergeCartMutation = () => {
  const queryClient = useQueryClient();
  const clearGuestCart = useCartStore((state) => state.clearGuestCart);

  return useMutation({
    mutationFn: async (items: Array<{ bookId: number; quantity: number }>) => {
      if (items.length === 0) return null;
      return await cartApi.mergeCart({ items });
    },
    onSuccess: () => {
      clearGuestCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useWishlistQuery = (page = 0, size = 20) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['wishlist', page, size],
    queryFn: () => cartApi.getWishlist(page, size),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
};

export const useAddToWishlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: number) => cartApi.addToWishlist(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã lưu vào danh sách yêu thích');
    },
    onError: () => {
      toast.error('Vui lòng đăng nhập để lưu sách yêu thích');
    },
  });
};

export const useRemoveFromWishlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: number) => cartApi.removeFromWishlist(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.info('Đã xóa khỏi danh sách yêu thích');
    },
  });
};

