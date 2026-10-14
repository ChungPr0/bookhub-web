export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    phone: string;
    fullName: string;
    role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';
    permissions: string[];
  };
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
  otp: string;
  fullName: string;
  password: string;
}

export interface ForgotPasswordVerifyRequest {
  phone: string;
  otp: string;
}

export interface ForgotPasswordVerifyResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

