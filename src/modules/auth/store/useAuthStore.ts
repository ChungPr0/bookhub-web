import { create } from 'zustand';
import { tokenManager } from '@/core/http/tokenManager';
import { AuthUserInfo, UserRole } from '../types/auth.types';

export type { UserRole };
export type AuthUser = AuthUserInfo;

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: tokenManager.hasTokens(),
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    tokenManager.setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    tokenManager.clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
