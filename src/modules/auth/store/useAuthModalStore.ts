import { create } from 'zustand';

export type AuthModalMode = 'login' | 'register' | 'forgot_password' | 'forced_change_password';

export interface OpenModalOptions {
  mode?: AuthModalMode;
  redirectUrl?: string;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  redirectUrl: string | null;
  title?: string;
  subtitle?: string;
  onSuccessCallback: (() => void) | null;
  setMode: (mode: AuthModalMode) => void;
  openModal: (options?: OpenModalOptions) => void;
  openLoginModal: (options?: OpenModalOptions) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'login',
  redirectUrl: null,
  title: undefined,
  subtitle: undefined,
  onSuccessCallback: null,

  setMode: (mode) => set({ mode }),

  openModal: (options) => {
    set((state) => ({
      isOpen: true,
      mode: options?.mode || state.mode || 'login',
      redirectUrl: options?.redirectUrl || null,
      title: options?.title,
      subtitle: options?.subtitle,
      onSuccessCallback: options?.onSuccess || null,
    }));
  },

  openLoginModal: (options) => {
    set({
      isOpen: true,
      mode: options?.mode || 'login',
      redirectUrl: options?.redirectUrl || null,
      title: options?.title,
      subtitle: options?.subtitle,
      onSuccessCallback: options?.onSuccess || null,
    });
  },

  closeModal: () => {
    set({
      isOpen: false,
      // Retain current mode and active draft state for seamless re-opening
      redirectUrl: null,
      title: undefined,
      subtitle: undefined,
      onSuccessCallback: null,
    });
  },
}));
