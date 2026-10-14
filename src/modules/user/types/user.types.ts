import { UserRole } from '@/modules/auth/store/useAuthStore';

export interface UserProfileDto {
  id: number;
  phone: string;
  fullName: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  avatarUrl?: string;
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  tierProgressPercent: number;
  currentPoints: number;
  totalSpent: number;
  pointsToNextTier: number;
}

export interface UpdateProfileRequest {
  fullName: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface AddressDto {
  id: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface PointTransactionDto {
  id: number;
  amount: number;
  balanceAfter: number;
  type: 'EARN' | 'REDEEM' | 'EXPIRE';
  description: string;
  createdAt: string;
}

export interface AdminCustomerDto {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  membershipTier: string;
  totalOrders: number;
  totalSpent: number;
  isLocked: boolean;
  createdAt: string;
}

export interface AdminStaffDto {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffRequest {
  fullName: string;
  phone: string;
  password: string;
  role: UserRole;
}

