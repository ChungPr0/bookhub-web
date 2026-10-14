export type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';
export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface AuthUserInfo {
  accountId?: number;
  id?: number;
  phone: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  tier?: CustomerTier | null;
  permissions?: string[];
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  mustChangePassword: boolean;
  user: AuthUserInfo;
}

export interface RequestOtpRequest {
  phone: string;
}

export interface RequestOtpResponse {
  phone: string;
  otpExpiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface RegisterRequest {
  phone: string;
  otpCode: string;
  fullName: string;
  password: string;
  gender: Gender;
  email?: string | null;
  birthday?: string | null;
}

export interface RegisterResponse {
  phone: string;
  fullName: string;
}

export interface ForgotPasswordVerifyRequest {
  phone: string;
  otpCode: string;
}

export interface ForgotPasswordVerifyResponse {
  resetToken: string;
  expiresInSeconds?: number;
}

export interface ResetPasswordRequest {
  phone: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
}
