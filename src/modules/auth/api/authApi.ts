import { axiosClient } from '@/core/http/axiosClient';
import {
  AuthUserInfo,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RequestOtpRequest,
  RequestOtpResponse,
  ResetPasswordRequest,
} from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await axiosClient.post<LoginResponse>('/auth/login', payload);
    return res.data;
  },

  requestRegisterOtp: async (payload: RequestOtpRequest): Promise<RequestOtpResponse> => {
    const res = await axiosClient.post<RequestOtpResponse>('/auth/register/otp', payload);
    return res.data;
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const res = await axiosClient.post<RegisterResponse>('/auth/register', payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post<null>('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    await axiosClient.post<null>('/auth/logout-all');
  },

  getMe: async (): Promise<AuthUserInfo> => {
    const res = await axiosClient.get<AuthUserInfo>('/auth/me');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const res = await axiosClient.put<ChangePasswordResponse>('/auth/password', payload);
    return res.data;
  },

  requestForgotOtp: async (payload: RequestOtpRequest): Promise<RequestOtpResponse> => {
    const res = await axiosClient.post<RequestOtpResponse>('/auth/password/forgot/otp', payload);
    return res.data;
  },

  verifyForgotOtp: async (payload: ForgotPasswordVerifyRequest): Promise<ForgotPasswordVerifyResponse> => {
    const res = await axiosClient.post<ForgotPasswordVerifyResponse>('/auth/password/forgot/verify', payload);
    return res.data;
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await axiosClient.post<null>('/auth/password/forgot/reset', payload);
  },
};
