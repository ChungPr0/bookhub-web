import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../api/userApi';
import { useAuthStore, UserRole } from '@/modules/auth/store/useAuthStore';
import { CreateAddressRequest, CreateStaffRequest, UpdateProfileRequest } from '../types/user.types';

export const useUserProfileQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => userApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data);
      toast.success('Cập nhật thông tin cá nhân thành công!');
    },
  });
};

export const useUserAddressesQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: () => userApi.getAddresses(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressRequest) => userApi.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      toast.success('Thêm địa chỉ nhận hàng thành công!');
    },
  });
};

export const useUpdateAddressMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateAddressRequest>) => userApi.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      toast.success('Cập nhật địa chỉ thành công!');
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      toast.info('Đã xóa địa chỉ');
    },
  });
};

export const useSetDefaultAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      toast.success('Đã đặt làm địa chỉ mặc định');
    },
  });
};

export const usePointHistoryQuery = (page = 0, size = 10) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['user', 'points', page, size],
    queryFn: () => userApi.getPointHistory(page, size),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useAdminCustomersQuery = (params: { page?: number; size?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['admin', 'customers', params],
    queryFn: () => userApi.getAdminCustomers(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useToggleCustomerLockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.toggleCustomerLock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      toast.success('Cập nhật trạng thái tài khoản khách hàng thành công!');
    },
  });
};

export const useAdminStaffQuery = () => {
  return useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => userApi.getAdminStaff(),
    staleTime: 60 * 1000,
  });
};

export const useCreateAdminStaffMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffRequest) => userApi.createAdminStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      toast.success('Tạo tài khoản nhân sự thành công!');
    },
  });
};

export const useUpdateStaffRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => userApi.updateStaffRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      toast.success('Cập nhật phân quyền nhân sự thành công!');
    },
  });
};

