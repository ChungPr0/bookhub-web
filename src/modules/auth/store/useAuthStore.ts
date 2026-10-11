import { create } from 'zustand';
import { tokenManager } from '@/core/http/tokenManager';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';

export interface AuthUser {
  id: number;
  phone: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
}

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

