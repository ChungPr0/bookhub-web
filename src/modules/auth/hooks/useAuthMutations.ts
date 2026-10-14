import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '@/modules/cart/store/useCartStore';
import { cartApi } from '@/modules/cart/api/cartApi';
import { LoginRequest, RegisterRequest } from '../types/auth.types';

export const useAuthMutations = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: async (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);

      if (!data.mustChangePassword) {
        toast.success(`Chào mừng trở lại, ${data.user.fullName}!`);

        // BR-13: CRT-07 Smart Cart Merge immediately after login
        const guestItems = useCartStore.getState().guestItems;
        if (guestItems && guestItems.length > 0) {
          try {
            const itemsToMerge = guestItems.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
            }));
            await cartApi.mergeCart({ items: itemsToMerge });
            useCartStore.getState().clearGuestCart();
            await queryClient.invalidateQueries({ queryKey: ['cart'] });
          } catch (err) {
            console.warn('Smart cart merge error:', err);
          }
        }
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: () => {
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      toast.info('Đã đăng xuất tài khoản.');
    },
  });

  return {
    loginMutation,
    registerMutation,
    logoutMutation,
  };
};
