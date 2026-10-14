import { Gender } from '../types/auth.types';

const DRAFT_STORAGE_KEY = 'bookhub_auth_draft';

export interface RegisterDraft {
  phone: string;
  fullName: string;
  gender: Gender;
  email: string;
  birthday: string;
  isOtpSent: boolean;
  resendAvailableAt: number | null; // epoch timestamp ms
  otpExpiresAt: number | null; // epoch timestamp ms
}

export interface ForgotDraft {
  phone: string;
  resendAvailableAt: number | null; // epoch timestamp ms
  otpExpiresAt: number | null; // epoch timestamp ms
}

export interface AuthDraftState {
  activeView: 'login' | 'register' | 'forgot_password';
  loginPhone: string;
  registerStep: 1 | 2;
  registerDraft: RegisterDraft;
  forgotStep: 1 | 2 | 3;
  forgotDraft: ForgotDraft;
}

export const defaultAuthDraft: AuthDraftState = {
  activeView: 'login',
  loginPhone: '',
  registerStep: 1,
  registerDraft: {
    phone: '',
    fullName: '',
    gender: 'OTHER',
    email: '',
    birthday: '',
    isOtpSent: false,
    resendAvailableAt: null,
    otpExpiresAt: null,
  },
  forgotStep: 1,
  forgotDraft: {
    phone: '',
    resendAvailableAt: null,
    otpExpiresAt: null,
  },
};

/**
 * In-memory storage for sensitive credentials.
 * TUYỆT ĐỐI KHÔNG lưu mật khẩu hoặc resetToken vào sessionStorage/localStorage.
 */
export const authMemoryState = {
  loginPassword: '',
  registerPassword: '',
  registerConfirmPassword: '',
  registerOtp: '',
  forgotOtp: '',
  resetToken: '',
  forgotNewPassword: '',
  forgotConfirmPassword: '',
  currentPassword: '',
  forcedNewPassword: '',
  forcedConfirmPassword: '',
};

export const clearAuthMemoryState = (): void => {
  authMemoryState.loginPassword = '';
  authMemoryState.registerPassword = '';
  authMemoryState.registerConfirmPassword = '';
  authMemoryState.registerOtp = '';
  authMemoryState.forgotOtp = '';
  authMemoryState.resetToken = '';
  authMemoryState.forgotNewPassword = '';
  authMemoryState.forgotConfirmPassword = '';
  authMemoryState.currentPassword = '';
  authMemoryState.forcedNewPassword = '';
  authMemoryState.forcedConfirmPassword = '';
};

export const loadAuthDraft = (): AuthDraftState => {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return defaultAuthDraft;
    const parsed = JSON.parse(raw) as Partial<AuthDraftState>;
    return {
      activeView: parsed.activeView || 'login',
      loginPhone: parsed.loginPhone || '',
      registerStep: parsed.registerStep === 2 ? 2 : 1,
      registerDraft: {
        ...defaultAuthDraft.registerDraft,
        ...(parsed.registerDraft || {}),
      },
      forgotStep: parsed.forgotStep || 1,
      forgotDraft: {
        ...defaultAuthDraft.forgotDraft,
        ...(parsed.forgotDraft || {}),
      },
    };
  } catch {
    return defaultAuthDraft;
  }
};

export const saveAuthDraft = (patch: Partial<AuthDraftState>): void => {
  try {
    const current = loadAuthDraft();
    const updated: AuthDraftState = {
      ...current,
      ...patch,
      registerDraft: {
        ...current.registerDraft,
        ...(patch.registerDraft || {}),
      },
      forgotDraft: {
        ...current.forgotDraft,
        ...(patch.forgotDraft || {}),
      },
    };
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota/permission issues
  }
};

export const clearRegisterDraft = (): void => {
  try {
    const current = loadAuthDraft();
    current.registerStep = 1;
    current.registerDraft = { ...defaultAuthDraft.registerDraft };
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(current));
    authMemoryState.registerPassword = '';
    authMemoryState.registerConfirmPassword = '';
    authMemoryState.registerOtp = '';
  } catch {
    // Ignore storage issues
  }
};

export const clearForgotDraft = (): void => {
  try {
    const current = loadAuthDraft();
    current.forgotStep = 1;
    current.forgotDraft = { ...defaultAuthDraft.forgotDraft };
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(current));
    authMemoryState.forgotOtp = '';
    authMemoryState.resetToken = '';
    authMemoryState.forgotNewPassword = '';
    authMemoryState.forgotConfirmPassword = '';
  } catch {
    // Ignore storage issues
  }
};

export const clearAllAuthDraft = (): void => {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    clearAuthMemoryState();
  } catch {
    // Ignore storage issues
  }
};

