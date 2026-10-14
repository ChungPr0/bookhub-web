import { axiosClient } from '@/core/http/axiosClient';
import {
  ChangePasswordRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
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

  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    const res = await axiosClient.post<LoginResponse>('/auth/register', payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post<null>('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    await axiosClient.post<null>('/auth/logout-all');
  },

  getMe: async (): Promise<LoginResponse['user']> => {
    const res = await axiosClient.get<LoginResponse['user']>('/auth/me');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await axiosClient.put<null>('/auth/password', payload);
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

