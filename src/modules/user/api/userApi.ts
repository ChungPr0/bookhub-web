import { axiosClient } from '@/core/http/axiosClient';
import { PageResponse } from '@/core/types/api.types';
import {
  AddressDto,
  AdminCustomerDto,
  AdminStaffDto,
  CreateAddressRequest,
  CreateStaffRequest,
  PointTransactionDto,
  UpdateProfileRequest,
  UserProfileDto,
} from '../types/user.types';
import { UserRole } from '@/modules/auth/store/useAuthStore';

export const userApi = {
  getProfile: async (): Promise<UserProfileDto> => {
    const res = await axiosClient.get<UserProfileDto>('/me/profile');
    return res.data;
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<UserProfileDto> => {
    const res = await axiosClient.put<UserProfileDto>('/me/profile', payload);
    return res.data;
  },

  getAddresses: async (): Promise<AddressDto[]> => {
    const res = await axiosClient.get<AddressDto[]>('/me/addresses');
    return res.data;
  },

  createAddress: async (payload: CreateAddressRequest): Promise<AddressDto> => {
    const res = await axiosClient.post<AddressDto>('/me/addresses', payload);
    return res.data;
  },

  updateAddress: async (id: number, payload: Partial<CreateAddressRequest>): Promise<AddressDto> => {
    const res = await axiosClient.put<AddressDto>(`/me/addresses/${id}`, payload);
    return res.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await axiosClient.delete<null>(`/me/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await axiosClient.patch<null>(`/me/addresses/${id}/default`);
  },

  getPointHistory: async (page = 0, size = 10): Promise<PageResponse<PointTransactionDto>> => {
    const res = await axiosClient.get<PageResponse<PointTransactionDto>>('/me/points/history', {
      params: { page, size },
    });
    return res.data;
  },

  getAdminCustomers: async (params: { page?: number; size?: number; search?: string } = {}): Promise<PageResponse<AdminCustomerDto>> => {
    const res = await axiosClient.get<PageResponse<AdminCustomerDto>>('/admin/customers', {
      params,
    });
    return res.data;
  },

  toggleCustomerLock: async (id: number): Promise<void> => {
    await axiosClient.patch<null>(`/admin/customers/${id}/status`);
  },

  getAdminStaff: async (): Promise<AdminStaffDto[]> => {
    const res = await axiosClient.get<AdminStaffDto[]>('/admin/staff');
    return res.data;
  },

  createAdminStaff: async (payload: CreateStaffRequest): Promise<AdminStaffDto> => {
    const res = await axiosClient.post<AdminStaffDto>('/admin/staff', payload);
    return res.data;
  },

  updateStaffRole: async (id: number, role: UserRole): Promise<void> => {
    await axiosClient.patch<null>(`/admin/staff/${id}/role`, { role });
  },
};

