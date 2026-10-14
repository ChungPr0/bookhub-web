import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import { LoginRequest, RegisterRequest } from '../types/auth.types';

export const useAuthMutations = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Chào mừng trở lại, ${data.user.fullName}!`);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Đăng ký tài khoản thành công!');
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

