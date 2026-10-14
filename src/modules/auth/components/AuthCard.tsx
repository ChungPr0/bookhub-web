import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingBag,
  BookOpen,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { authApi } from '../api/authApi';
import { ApiErrorResponse } from '@/core/types/api.types';
import { AuthUser } from '../store/useAuthStore';
import { AuthModalMode, useAuthModalStore } from '../store/useAuthModalStore';
import { maskPhone } from '@/core/utils/masking';
import { tokenManager } from '@/core/http/tokenManager';
import { OtpInput } from './OtpInput';
import { PhoneInput } from './PhoneInput';
import { PasswordInputWithStrength } from './PasswordInputWithStrength';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';
import {
  normalizePhoneToZero,
  isValidPhone,
  evaluatePasswordStrength,
} from '../schemas/authSchemas';
import { Gender, RegisterRequest } from '../types/auth.types';
import {
  loadAuthDraft,
  saveAuthDraft,
  clearRegisterDraft,
  clearForgotDraft,
  authMemoryState,
  clearAuthMemoryState,
} from '../utils/authDraftManager';
import { toast } from 'sonner';
import './auth-modal.css';

export interface AuthCardProps {
  initialMode?: AuthModalMode;
  onSuccess?: (user: AuthUser) => void;
  onClose?: () => void;
  redirectUrl?: string | null;
  isModal?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode,
  onSuccess,
  onClose,
  redirectUrl,
  isModal = true,
}) => {
  const navigate = useNavigate();
  const setStoreMode = useAuthModalStore((state) => state.setMode);

  // Load persisted draft state from sessionStorage
  const [initialDraft] = useState(() => loadAuthDraft());

  // Determine starting mode: priority given to explicit prop, then store, then saved draft
  const [mode, setModeState] = useState<AuthModalMode>(() => {
    if (initialMode) return initialMode;
    return initialDraft.activeView || 'login';
  });

  const setMode = (newMode: AuthModalMode) => {
    setModeState(newMode);
    setStoreMode(newMode);
    if (newMode === 'login' || newMode === 'register' || newMode === 'forgot_password') {
      saveAuthDraft({ activeView: newMode });
    }
  };

  // Common UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // LUỒNG A: ĐĂNG NHẬP (AUTH-03)
  // -------------------------------------------------------------
  const [loginPhone, setLoginPhone] = useState<string>(() => initialDraft.loginPhone || '');
  const [loginPassword, setLoginPassword] = useState(() => authMemoryState.loginPassword || '');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // -------------------------------------------------------------
  // LUỒNG B: ĐĂNG KÝ (AUTH-01 & AUTH-02)
  // -------------------------------------------------------------
  const [registerStep, setRegisterStep] = useState<1 | 2>(() => initialDraft.registerStep || 1);
  const [registerPhone, setRegisterPhone] = useState(() => initialDraft.registerDraft.phone || '');
  const [registerFullName, setRegisterFullName] = useState(() => initialDraft.registerDraft.fullName || '');
  const [registerGender, setRegisterGender] = useState<Gender>(() => initialDraft.registerDraft.gender || 'OTHER');
  const [registerEmail, setRegisterEmail] = useState(() => initialDraft.registerDraft.email || '');
  const [registerBirthday, setRegisterBirthday] = useState(() => initialDraft.registerDraft.birthday || '');
  const [registerPassword, setRegisterPassword] = useState(() => authMemoryState.registerPassword || '');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState(() => authMemoryState.registerConfirmPassword || '');
  const [registerOtp, setRegisterOtp] = useState(() => authMemoryState.registerOtp || '');

  // Timestamps for real-time countdown persistence
  const [registerResendAvailableAt, setRegisterResendAvailableAt] = useState<number | null>(
    () => initialDraft.registerDraft.resendAvailableAt
  );
  const [registerOtpExpiresAt, setRegisterOtpExpiresAt] = useState<number | null>(
    () => initialDraft.registerDraft.otpExpiresAt
  );

  // -------------------------------------------------------------
  // LUỒNG C: QUÊN MẬT KHẨU 3 BƯỚC (AUTH-09 -> AUTH-10 -> AUTH-11)
  // -------------------------------------------------------------
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(() => initialDraft.forgotStep || 1);
  const [forgotPhone, setForgotPhone] = useState(() => initialDraft.forgotDraft.phone || '');
  const [forgotOtp, setForgotOtp] = useState(() => authMemoryState.forgotOtp || '');
  const [resetToken, setResetToken] = useState(() => authMemoryState.resetToken || '');
  const [forgotNewPassword, setForgotNewPassword] = useState(() => authMemoryState.forgotNewPassword || '');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState(() => authMemoryState.forgotConfirmPassword || '');

  const [forgotResendAvailableAt, setForgotResendAvailableAt] = useState<number | null>(
    () => initialDraft.forgotDraft.resendAvailableAt
  );

  // -------------------------------------------------------------
  // LUỒNG D: ĐỔI MẬT KHẨU BẮT BUỘC (AUTH-08)
  // -------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState(() => authMemoryState.currentPassword || '');
  const [forcedNewPassword, setForcedNewPassword] = useState(() => authMemoryState.forcedNewPassword || '');
  const [forcedConfirmPassword, setForcedConfirmPassword] = useState(() => authMemoryState.forcedConfirmPassword || '');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const { loginMutation } = useAuthMutations();
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Unified timestamp ticker for active OTP timers
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const hasActiveTimers = Boolean(
    (registerResendAvailableAt && registerResendAvailableAt > currentTime) ||
    (registerOtpExpiresAt && registerOtpExpiresAt > currentTime) ||
    (forgotResendAvailableAt && forgotResendAvailableAt > currentTime)
  );

  useEffect(() => {
    if (!hasActiveTimers) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [hasActiveTimers]);

  const registerCooldown = registerResendAvailableAt
    ? Math.max(0, Math.ceil((registerResendAvailableAt - currentTime) / 1000))
    : 0;

  const registerOtpExpires = registerOtpExpiresAt
    ? Math.max(0, Math.ceil((registerOtpExpiresAt - currentTime) / 1000))
    : 0;

  const forgotCooldown = forgotResendAvailableAt
    ? Math.max(0, Math.ceil((forgotResendAvailableAt - currentTime) / 1000))
    : 0;

  // BR-03: Real-time countdown for Account Lockout
  useEffect(() => {
    if (!lockoutSeconds || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Caps lock detection
  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const switchMode = (newMode: AuthModalMode) => {
    setMode(newMode);
    setFieldErrors({});
    setGeneralError(null);
    setShowLoginPassword(false);
    setShowCurrentPassword(false);
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const handleFinishSuccess = (user: AuthUser) => {
    setIsSubmitting(false);
    clearAuthMemoryState();
    if (onSuccess) {
      onSuccess(user);
    } else if (redirectUrl) {
      navigate(redirectUrl, { replace: true });
    } else if (onClose) {
      onClose();
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * Helper: Map backend 400 VALIDATION_FAILED errors[] directly into form field errors
   */
  const handleValidationErrors = (error: ApiErrorResponse) => {
    if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      const mapped: Record<string, string> = {};
      error.errors.forEach((item) => {
        if (item.field) {
          mapped[item.field] = item.message;
        }
      });
      setFieldErrors(mapped);
    } else {
      setGeneralError(error?.message || 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại');
    }
  };

  // =========================================================================
  // 1. XỬ LÝ LUỒNG A: ĐĂNG NHẬP (AUTH-03)
  // =========================================================================
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || lockoutSeconds) return;

    const errors: Record<string, string> = {};
    const normalized = normalizePhoneToZero(loginPhone);

    if (!loginPhone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhone(loginPhone)) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    }

    if (!loginPassword.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    // Save phone to draft
    saveAuthDraft({ loginPhone: normalized });

    loginMutation.mutate(
      { phone: normalized, password: loginPassword },
      {
        onSuccess: (data) => {
          setIsSubmitting(false);

          // Kiểm tra đặc biệt: mustChangePassword === true (tài khoản UNVERIFIED)
          if (data.mustChangePassword) {
            setMode('forced_change_password');
            setCurrentPassword(loginPassword);
            authMemoryState.currentPassword = loginPassword;
            toast.info('Tài khoản yêu cầu đổi mật khẩu lần đầu để tiếp tục.');
          } else {
            handleFinishSuccess(data.user);
          }
        },
        onError: (err: unknown) => {
          setIsSubmitting(false);
          const error = err as ApiErrorResponse;

          // Rẽ nhánh logic chặt chẽ theo error.code
          switch (error?.code) {
            case 'ACCOUNT_TEMPORARILY_LOCKED': {
              const retryAfter =
                typeof error.details?.retryAfterSeconds === 'number'
                  ? error.details.retryAfterSeconds
                  : 900;
              setLockoutSeconds(retryAfter);
              setGeneralError('Tài khoản tạm thời bị khóa do nhập sai mật khẩu nhiều lần');
              break;
            }
            case 'INVALID_CREDENTIALS': {
              const remaining = error.details?.remainingAttempts;
              const msg =
                typeof remaining === 'number'
                  ? `Số điện thoại hoặc mật khẩu không chính xác. Còn ${remaining} lần thử trước khi tạm khóa`
                  : 'Số điện thoại hoặc mật khẩu không chính xác';
              setGeneralError(msg);
              break;
            }
            case 'ACCOUNT_LOCKED': {
              const reason = typeof error.details?.reason === 'string' ? `: ${error.details.reason}` : '';
              setGeneralError(`Tài khoản của bạn đã bị khóa bởi quản trị viên${reason}`);
              break;
            }
            case 'VALIDATION_FAILED': {
              handleValidationErrors(error);
              break;
            }
            default: {
              setGeneralError(error?.message || 'Đăng nhập không thành công');
              break;
            }
          }
        },
      }
    );
  };

  // =========================================================================
  // 2. XỬ LÝ LUỒNG B: ĐĂNG KÝ (AUTH-01 & AUTH-02)
  // =========================================================================
  // Bước 1: Yêu cầu OTP đăng ký (AUTH-01)
  const handleRegisterRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const normalized = normalizePhoneToZero(registerPhone);

    if (!registerPhone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhone(registerPhone)) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      const res = await authApi.requestRegisterOtp({ phone: normalized });
      const now = Date.now();
      const resendAt = now + (res.resendAfterSeconds || 60) * 1000;
      const expiresAt = now + (res.otpExpiresInSeconds || 300) * 1000;

      setRegisterResendAvailableAt(resendAt);
      setRegisterOtpExpiresAt(expiresAt);
      setRegisterStep(2);

      // Save draft state to sessionStorage
      saveAuthDraft({
        registerStep: 2,
        registerDraft: {
          phone: normalized,
          fullName: registerFullName,
          gender: registerGender,
          email: registerEmail,
          birthday: registerBirthday,
          isOtpSent: true,
          resendAvailableAt: resendAt,
          otpExpiresAt: expiresAt,
        },
      });

      toast.success(`Mã xác thực OTP đã được gửi đến số điện thoại của bạn.`);
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      switch (error?.code) {
        case 'PHONE_ALREADY_REGISTERED': {
          setFieldErrors({ phone: 'Số điện thoại này đã được đăng ký, vui lòng đăng nhập' });
          break;
        }
        case 'OTP_REQUEST_TOO_FREQUENT': {
          const waitSecs = (error.details?.retryAfterSeconds as number) || 60;
          setRegisterResendAvailableAt(Date.now() + waitSecs * 1000);
          setGeneralError(`Vui lòng đợi ${waitSecs} giây trước khi yêu cầu mã OTP mới`);
          break;
        }
        case 'OTP_DAILY_LIMIT_EXCEEDED': {
          setGeneralError('Bạn đã vượt quá số lần nhận mã OTP cho phép trong ngày');
          break;
        }
        case 'VALIDATION_FAILED': {
          handleValidationErrors(error);
          break;
        }
        default: {
          setGeneralError(error?.message || 'Không thể gửi mã xác thực OTP');
          break;
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gửi lại mã OTP đăng ký
  const handleResendRegisterOtp = async () => {
    if (registerCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const normalized = normalizePhoneToZero(registerPhone);
      const res = await authApi.requestRegisterOtp({ phone: normalized });
      const now = Date.now();
      const resendAt = now + (res.resendAfterSeconds || 60) * 1000;
      const expiresAt = now + (res.otpExpiresInSeconds || 300) * 1000;

      setRegisterResendAvailableAt(resendAt);
      setRegisterOtpExpiresAt(expiresAt);

      saveAuthDraft({
        registerDraft: {
          phone: normalized,
          fullName: registerFullName,
          gender: registerGender,
          email: registerEmail,
          birthday: registerBirthday,
          isOtpSent: true,
          resendAvailableAt: resendAt,
          otpExpiresAt: expiresAt,
        },
      });

      toast.success('Đã gửi lại mã xác thực OTP');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      toast.error(error?.message || 'Gửi lại mã OTP thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đổi số điện thoại khác / Làm mới form Đăng ký
  const handleResetRegisterForm = () => {
    clearRegisterDraft();
    setRegisterStep(1);
    setRegisterOtp('');
    setRegisterResendAvailableAt(null);
    setRegisterOtpExpiresAt(null);
    setFieldErrors({});
    setGeneralError(null);
  };

  // Bước 2: Hoàn tất Đăng ký (AUTH-02)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const trimmedOtp = registerOtp.trim();
    const trimmedName = registerFullName.trim();
    const trimmedEmail = registerEmail.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      errors.otpCode = 'Mã OTP gồm đúng 6 chữ số';
    }

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      errors.fullName = 'Họ và tên tối thiểu 2 ký tự';
    }

    const pwdStrength = evaluatePasswordStrength(registerPassword);
    if (!registerPassword) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (!pwdStrength.isValidBR01) {
      errors.password = 'Mật khẩu chưa đáp ứng đầy đủ tiêu chuẩn BR-01';
    }

    if (registerPassword !== registerConfirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Email không đúng định dạng';
    }

    if (registerBirthday) {
      const selected = new Date(registerBirthday);
      const today = new Date();
      if (selected >= today) {
        errors.birthday = 'Ngày sinh phải trong quá khứ';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    // Chuẩn payload JSON: Trường rỗng gửi null hoặc lược bỏ, tuyệt đối không gửi ""
    const payload: RegisterRequest = {
      phone: normalizePhoneToZero(registerPhone),
      otpCode: trimmedOtp,
      fullName: trimmedName,
      password: registerPassword,
      gender: registerGender,
      email: trimmedEmail || null,
      birthday: registerBirthday || null,
    };

    try {
      const res = await authApi.register(payload);
      clearRegisterDraft();
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');

      // Hệ thống KHÔNG tự động đăng nhập. Chuyển về màn Đăng nhập và điền sẵn SĐT
      setLoginPhone(res.phone || normalizePhoneToZero(registerPhone));
      setLoginPassword('');
      saveAuthDraft({ activeView: 'login', loginPhone: res.phone || normalizePhoneToZero(registerPhone) });
      switchMode('login');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      switch (error?.code) {
        case 'OTP_INVALID': {
          const rem = error.details?.remainingAttempts;
          const msg =
            typeof rem === 'number'
              ? `Mã xác thực OTP không chính xác. Còn ${rem} lần thử`
              : 'Mã xác thực OTP không chính xác';
          setFieldErrors({ otpCode: msg });
          break;
        }
        case 'OTP_EXPIRED': {
          setFieldErrors({ otpCode: 'Mã OTP đã hết hiệu lực, vui lòng yêu cầu mã mới' });
          break;
        }
        case 'OTP_ATTEMPTS_EXCEEDED': {
          setFieldErrors({ otpCode: 'Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy' });
          break;
        }
        case 'EMAIL_ALREADY_IN_USE': {
          setFieldErrors({ email: 'Địa chỉ email đã được sử dụng bởi một tài khoản khác' });
          break;
        }
        case 'PHONE_ALREADY_REGISTERED': {
          setFieldErrors({ phone: 'Số điện thoại này đã được đăng ký, vui lòng đăng nhập' });
          break;
        }
        case 'VALIDATION_FAILED': {
          handleValidationErrors(error);
          break;
        }
        default: {
          setGeneralError(error?.message || 'Đăng ký tài khoản không thành công');
          break;
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 3. XỬ LÝ LUỒNG C: QUÊN MẬT KHẨU 3 BƯỚC (AUTH-09 -> AUTH-10 -> AUTH-11)
  // =========================================================================
  // Bước 1: Yêu cầu OTP khôi phục (AUTH-09)
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const normalized = normalizePhoneToZero(forgotPhone);

    if (!forgotPhone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhone(forgotPhone)) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      const res = await authApi.requestForgotOtp({ phone: normalized });
      const now = Date.now();
      const resendAt = now + (res.resendAfterSeconds || 60) * 1000;
      const expiresAt = now + (res.otpExpiresInSeconds || 300) * 1000;

      setForgotResendAvailableAt(resendAt);
      setForgotStep(2);

      saveAuthDraft({
        forgotStep: 2,
        forgotDraft: {
          phone: normalized,
          resendAvailableAt: resendAt,
          otpExpiresAt: expiresAt,
        },
      });

      toast.success('Mã xác thực OTP đã được gửi đến số điện thoại của bạn.');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      switch (error?.code) {
        case 'ACCOUNT_LOCKED': {
          setGeneralError('Tài khoản của bạn đã bị khóa, không thể khôi phục mật khẩu');
          break;
        }
        case 'OTP_REQUEST_TOO_FREQUENT': {
          const waitSecs = (error.details?.retryAfterSeconds as number) || 60;
          setForgotResendAvailableAt(Date.now() + waitSecs * 1000);
          setGeneralError(`Vui lòng đợi ${waitSecs} giây trước khi yêu cầu mã OTP mới`);
          break;
        }
        case 'OTP_DAILY_LIMIT_EXCEEDED': {
          setGeneralError('Bạn đã vượt quá số lần nhận mã OTP cho phép trong ngày');
          break;
        }
        case 'VALIDATION_FAILED': {
          handleValidationErrors(error);
          break;
        }
        default: {
          setGeneralError(error?.message || 'Không thể gửi mã xác thực khôi phục');
          break;
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 2: Xác thực OTP nhận resetToken (AUTH-10)
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedOtp = forgotOtp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setFieldErrors({ otpCode: 'Mã OTP gồm đúng 6 chữ số' });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      const res = await authApi.verifyForgotOtp({
        phone: normalizePhoneToZero(forgotPhone),
        otpCode: trimmedOtp,
      });
      setResetToken(res.resetToken);
      authMemoryState.resetToken = res.resetToken;
      setForgotStep(3);

      saveAuthDraft({ forgotStep: 3 });
      toast.success('Xác thực mã OTP thành công. Vui lòng thiết lập mật khẩu mới');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      switch (error?.code) {
        case 'OTP_INVALID': {
          const rem = error.details?.remainingAttempts;
          const msg =
            typeof rem === 'number'
              ? `Mã xác thực OTP không chính xác. Còn ${rem} lần thử`
              : 'Mã xác thực OTP không chính xác';
          setFieldErrors({ otpCode: msg });
          break;
        }
        case 'OTP_EXPIRED': {
          setFieldErrors({ otpCode: 'Mã OTP đã hết hiệu lực, vui lòng yêu cầu mã mới' });
          break;
        }
        case 'OTP_ATTEMPTS_EXCEEDED': {
          setFieldErrors({ otpCode: 'Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy' });
          break;
        }
        case 'VALIDATION_FAILED': {
          handleValidationErrors(error);
          break;
        }
        default: {
          setGeneralError(error?.message || 'Xác thực mã OTP không thành công');
          break;
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu mới (AUTH-11)
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const pwdStrength = evaluatePasswordStrength(forgotNewPassword);
    if (!forgotNewPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (!pwdStrength.isValidBR01) {
      errors.newPassword = 'Mật khẩu mới chưa đáp ứng đầy đủ tiêu chuẩn BR-01';
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      await authApi.resetPassword({
        phone: normalizePhoneToZero(forgotPhone),
        resetToken,
        newPassword: forgotNewPassword,
      });
      clearForgotDraft();
      setResetToken('');
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');

      // Chuyển về màn Đăng nhập và điền sẵn SĐT
      setLoginPhone(normalizePhoneToZero(forgotPhone));
      setLoginPassword('');
      saveAuthDraft({ activeView: 'login', loginPhone: normalizePhoneToZero(forgotPhone) });
      switchMode('login');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      switch (error?.code) {
        case 'RESET_TOKEN_EXPIRED':
        case 'RESET_TOKEN_INVALID': {
          toast.error('Phiên khôi phục mật khẩu đã hết hạn. Vui lòng thực hiện lại từ đầu');
          setForgotStep(1);
          setResetToken('');
          clearForgotDraft();
          break;
        }
        case 'VALIDATION_FAILED': {
          handleValidationErrors(error);
          break;
        }
        default: {
          setGeneralError(error?.message || 'Không thể đặt lại mật khẩu');
          break;
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 4. XỬ LÝ LUỒNG D: ĐỔI MẬT KHẨU BẮT BUỘC (AUTH-08)
  // =========================================================================
  const handleForcedChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    if (!currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    const pwdStrength = evaluatePasswordStrength(forcedNewPassword);
    if (!forcedNewPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (!pwdStrength.isValidBR01) {
      errors.newPassword = 'Mật khẩu mới chưa đáp ứng đầy đủ tiêu chuẩn BR-01';
    }

    if (forcedNewPassword !== forcedConfirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword: forcedNewPassword,
      });

      tokenManager.setTokens(res.accessToken, res.refreshToken);
      clearAuthMemoryState();
      toast.success('Đổi mật khẩu thành công! Tài khoản của bạn đã được kích hoạt.');

      if (onClose) onClose();
      else if (redirectUrl) navigate(redirectUrl, { replace: true });
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      switch (error?.code) {
        case 'CURRENT_PASSWORD_INCORRECT': {
          setFieldErrors({ currentPassword: 'Mật khẩu hiện tại không chính xác' });
          break;
        }
        case 'PASSWORD_REUSED': {
          setFieldErrors({ newPassword: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' });
          break;
        }
        case 'VALIDATION_FAILED': {
          handleValidationErrors(error);
          break;
        }
        default: {
          setGeneralError(error?.message || 'Đổi mật khẩu không thành công');
          break;
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative text-slate-900 dark:text-slate-100 transition-all duration-200"
      role="region"
      aria-label="Cửa sổ xác thực BookHub"
    >
      {/* Nút đóng X ở góc trên bên phải */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight block leading-none">BookHub</span>
            <span className="text-[11px] text-slate-500 font-medium leading-none">Nhà sách trực tuyến</span>
          </div>
        </div>

        {/* Dynamic Mode Heading */}
        <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {mode === 'login' && 'Đăng nhập tài khoản'}
          {mode === 'register' && (registerStep === 1 ? 'Đăng ký tài khoản' : 'Hoàn tất thông tin')}
          {mode === 'forgot_password' && 'Khôi phục mật khẩu'}
          {mode === 'forced_change_password' && 'Đổi mật khẩu bắt buộc'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {mode === 'login' && 'Chào mừng bạn trở lại! Nhập số điện thoại để tiếp tục.'}
          {mode === 'register' &&
            (registerStep === 1
              ? 'Nhập số điện thoại của bạn để nhận mã xác thực OTP.'
              : `Xác thực OTP và điền thông tin để tạo tài khoản mới.`)}
          {mode === 'forgot_password' &&
            (forgotStep === 1
              ? 'Nhập số điện thoại đăng ký tài khoản để nhận mã OTP khôi phục.'
              : forgotStep === 2
                ? `Nhập mã 6 chữ số đã gửi đến ${maskPhone(normalizePhoneToZero(forgotPhone))}.`
                : 'Thiết lập mật khẩu mới an toàn cho tài khoản.')}
          {mode === 'forced_change_password' &&
            'Tài khoản mới cần cập nhật mật khẩu lần đầu để tiếp tục sử dụng.'}
        </p>

        {/* Checkout pill if user was on checkout path */}
        {redirectUrl === '/checkout' && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-800">
            <ShoppingBag className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />
            <span>Đăng nhập để hoàn tất đơn hàng</span>
          </div>
        )}
      </div>

      {/* Segmented Tabs (Login / Register) */}
      {mode === 'login' || mode === 'register' ? (
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Đăng ký
          </button>
        </div>
      ) : mode === 'forgot_password' ? (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại đăng nhập</span>
          </button>
        </div>
      ) : null}

      {/* General Alert Message */}
      {generalError && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{generalError}</div>
        </div>
      )}

      {/* Lockout Box for BR-03 */}
      {lockoutSeconds !== null && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 auth-lockout-pulse" />
            <div>
              <p className="font-semibold">Tài khoản tạm thời bị khóa</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Nhập sai 5 lần liên tiếp. Vui lòng chờ mở khóa.
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
            {formatCountdown(lockoutSeconds)}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LUỒNG A: ĐĂNG NHẬP (AUTH-03) */}
      {/* ========================================================================= */}
      {mode === 'login' && (
        <div className="auth-view-transition">
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            {/* PhoneInput */}
            <div className="space-y-1.5">
              <label htmlFor="login-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Số điện thoại
              </label>
              <PhoneInput
                ref={phoneInputRef}
                id="login-phone"
                value={loginPhone}
                onChange={(val) => {
                  setLoginPhone(val);
                  clearFieldError('phone');
                  saveAuthDraft({ loginPhone: val });
                }}
                disabled={isSubmitting || lockoutSeconds !== null}
                error={fieldErrors.phone}
              />
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mật khẩu
                </label>
                {capsLockOn && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                    Bật Caps Lock
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    authMemoryState.loginPassword = e.target.value;
                    clearFieldError('password');
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  onKeyUp={handlePasswordKeyDown}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  disabled={isSubmitting || lockoutSeconds !== null}
                  className={`w-full h-11 pl-10 pr-10 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
                    fieldErrors.password
                      ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot Password link */}
            <div className="flex items-center justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setForgotPhone(loginPhone);
                  switchMode('forgot_password');
                }}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds !== null}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => {
                setRegisterPhone(loginPhone);
                switchMode('register');
              }}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LUỒNG B: ĐĂNG KÝ (AUTH-01 & AUTH-02) */}
      {/* ========================================================================= */}
      {mode === 'register' && (
        <div className="auth-view-transition">
          {registerStep === 1 ? (
            /* Bước 1: Gửi mã OTP đăng ký */
            <form onSubmit={handleRegisterRequestOtp} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-step1-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại đăng ký
                </label>
                <PhoneInput
                  id="reg-step1-phone"
                  value={registerPhone}
                  onChange={(val) => {
                    setRegisterPhone(val);
                    clearFieldError('phone');
                    saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, phone: val } });
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.phone}
                />
                {fieldErrors.phone && fieldErrors.phone.includes('đã được đăng ký') && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginPhone(registerPhone);
                        switchMode('login');
                      }}
                      className="text-xs font-bold underline text-slate-900 dark:text-slate-100"
                    >
                      Chuyển sang Đăng nhập với số này
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi mã</span>
                  </>
                ) : (
                  <span>Gửi mã OTP</span>
                )}
              </button>
            </form>
          ) : (
            /* Bước 2: Điền thông tin & xác thực OTP hoàn tất */
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
              {/* OTP Input Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mã xác thực OTP gửi đến
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {maskPhone(normalizePhoneToZero(registerPhone))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetRegisterForm}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                    title="Đổi số điện thoại khác"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đổi số</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500 mb-2">
                  Mã có hiệu lực trong: <strong className="text-slate-700 dark:text-slate-300">{formatCountdown(registerOtpExpires)}</strong>
                </div>

                <OtpInput
                  value={registerOtp}
                  onChange={(val) => {
                    setRegisterOtp(val);
                    authMemoryState.registerOtp = val;
                    clearFieldError('otpCode');
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.otpCode}
                />

                <div className="mt-2.5 text-right">
                  <button
                    type="button"
                    onClick={handleResendRegisterOtp}
                    disabled={registerCooldown > 0 || isSubmitting}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                  >
                    {registerCooldown > 0 ? `Gửi lại sau ${registerCooldown}s` : 'Gửi lại mã OTP'}
                  </button>
                </div>
              </div>

              {/* Họ và tên */}
              <div className="space-y-1.5">
                <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={registerFullName}
                    onChange={(e) => {
                      setRegisterFullName(e.target.value);
                      clearFieldError('fullName');
                      saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, fullName: e.target.value } });
                    }}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    disabled={isSubmitting}
                    className={`w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 ${
                      fieldErrors.fullName
                        ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Giới tính */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Giới tính <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'MALE', label: 'Nam' },
                    { value: 'FEMALE', label: 'Nữ' },
                    { value: 'OTHER', label: 'Khác' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setRegisterGender(item.value as Gender);
                        clearFieldError('gender');
                        saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, gender: item.value as Gender } });
                      }}
                      className={`h-10 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        registerGender === item.value
                          ? 'border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {fieldErrors.gender && (
                  <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.gender}</p>
                )}
              </div>

              {/* Email & Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email <span className="text-slate-400 font-normal">(tùy chọn)</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        clearFieldError('email');
                        saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, email: e.target.value } });
                      }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className={`w-full h-10 pl-9 pr-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 ${
                        fieldErrors.email
                          ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-birthday" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày sinh <span className="text-slate-400 font-normal">(tùy chọn)</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400 pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-birthday"
                      type="date"
                      value={registerBirthday}
                      onChange={(e) => {
                        setRegisterBirthday(e.target.value);
                        clearFieldError('birthday');
                        saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, birthday: e.target.value } });
                      }}
                      disabled={isSubmitting}
                      className={`w-full h-10 pl-9 pr-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 ${
                        fieldErrors.birthday
                          ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.birthday && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.birthday}</p>
                  )}
                </div>
              </div>

              {/* Mật khẩu */}
              {/* Mật khẩu chuẩn BR-01 với Thanh đo độ mạnh & Checklist */}
              <PasswordInputWithStrength
                id="reg-password"
                label="Mật khẩu"
                value={registerPassword}
                onChange={(val) => {
                  setRegisterPassword(val);
                  authMemoryState.registerPassword = val;
                  clearFieldError('password');
                }}
                placeholder="Nhập mật khẩu (8–64 ký tự)"
                disabled={isSubmitting}
                error={fieldErrors.password}
                required
                autoComplete="new-password"
                onKeyDown={handlePasswordKeyDown}
                capsLockOn={capsLockOn}
              />

              {/* Xác nhận mật khẩu với chỉ báo khớp theo thời gian thực */}
              <ConfirmPasswordInput
                id="reg-confirm-password"
                label="Xác nhận mật khẩu"
                value={registerConfirmPassword}
                targetPassword={registerPassword}
                onChange={(val) => {
                  setRegisterConfirmPassword(val);
                  authMemoryState.registerConfirmPassword = val;
                  clearFieldError('confirmPassword');
                }}
                placeholder="Nhập lại mật khẩu"
                disabled={isSubmitting}
                error={fieldErrors.confirmPassword}
                required
                autoComplete="new-password"
                onKeyDown={handlePasswordKeyDown}
                capsLockOn={capsLockOn}
              />

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
                  disabled={isSubmitting}
                  className="px-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !evaluatePasswordStrength(registerPassword).isValidBR01 ||
                    registerPassword !== registerConfirmPassword ||
                    !registerFullName.trim() ||
                    registerOtp.trim().length !== 6
                  }
                  className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang hoàn tất</span>
                    </>
                  ) : (
                    <span>Đăng ký</span>
                  )}
                </button>
              </div>

              {/* Reassuring Draft Auto-saved Indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Đã tự động lưu nháp thông tin</span>
              </div>
            </form>
          )}

          {/* Bottom Switch Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => {
                setLoginPhone(registerPhone);
                switchMode('login');
              }}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LUỒNG C: QUÊN MẬT KHẨU (AUTH-09 -> AUTH-10 -> AUTH-11) */}
      {/* ========================================================================= */}
      {mode === 'forgot_password' && (
        <div className="auth-view-transition">
          {/* Stepper Progress */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  forgotStep >= 1
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Gửi OTP</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  forgotStep >= 2
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Xác thực</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  forgotStep >= 3
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Mật khẩu mới</span>
            </div>
          </div>

          {/* Bước 1: Nhập Số điện thoại yêu cầu OTP (AUTH-09) */}
          {forgotStep === 1 && (
            <form onSubmit={handleForgotRequestOtp} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="forgot-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại tài khoản
                </label>
                <PhoneInput
                  id="forgot-phone"
                  value={forgotPhone}
                  onChange={(val) => {
                    setForgotPhone(val);
                    clearFieldError('phone');
                    saveAuthDraft({ forgotDraft: { ...initialDraft.forgotDraft, phone: val } });
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.phone}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi mã</span>
                  </>
                ) : (
                  <span>Tiếp tục</span>
                )}
              </button>
            </form>
          )}

          {/* Bước 2: Xác thực OTP nhận resetToken (AUTH-10) */}
          {forgotStep === 2 && (
            <form onSubmit={handleForgotVerifyOtp} noValidate className="space-y-4">
              <div className="text-center py-2">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Nhập mã 6 chữ số đã gửi đến {maskPhone(normalizePhoneToZero(forgotPhone))}
                </span>
                <OtpInput
                  value={forgotOtp}
                  onChange={(val) => {
                    setForgotOtp(val);
                    authMemoryState.forgotOtp = val;
                    clearFieldError('otpCode');
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.otpCode}
                />
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleForgotRequestOtp({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={forgotCooldown > 0 || isSubmitting}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                  >
                    {forgotCooldown > 0 ? `Gửi lại sau ${forgotCooldown}s` : 'Gửi lại mã OTP'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    saveAuthDraft({ forgotStep: 1 });
                  }}
                  disabled={isSubmitting}
                  className="px-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực</span>
                    </>
                  ) : (
                    <span>Tiếp tục</span>
                  )}
                </button>
              </div>

              {/* Draft auto-saved indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Đã tự động lưu nháp thông tin</span>
              </div>
            </form>
          )}

          {/* Bước 3: Đặt lại mật khẩu mới (AUTH-11) */}
          {forgotStep === 3 && (
            <form onSubmit={handleForgotResetPassword} noValidate className="space-y-3.5">
              {/* Mật khẩu mới chuẩn BR-01 với Thanh đo độ mạnh & Checklist */}
              <PasswordInputWithStrength
                id="forgot-new-pwd"
                label="Mật khẩu mới"
                value={forgotNewPassword}
                onChange={(val) => {
                  setForgotNewPassword(val);
                  authMemoryState.forgotNewPassword = val;
                  clearFieldError('newPassword');
                }}
                placeholder="Nhập mật khẩu mới (8–64 ký tự)"
                disabled={isSubmitting}
                error={fieldErrors.newPassword}
                required
                autoComplete="new-password"
                onKeyDown={handlePasswordKeyDown}
                capsLockOn={capsLockOn}
              />

              {/* Xác nhận mật khẩu mới */}
              <ConfirmPasswordInput
                id="forgot-confirm-pwd"
                label="Xác nhận mật khẩu mới"
                value={forgotConfirmPassword}
                targetPassword={forgotNewPassword}
                onChange={(val) => {
                  setForgotConfirmPassword(val);
                  authMemoryState.forgotConfirmPassword = val;
                  clearFieldError('confirmPassword');
                }}
                placeholder="Nhập lại mật khẩu mới"
                disabled={isSubmitting}
                error={fieldErrors.confirmPassword}
                required
                autoComplete="new-password"
                onKeyDown={handlePasswordKeyDown}
                capsLockOn={capsLockOn}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !evaluatePasswordStrength(forgotNewPassword).isValidBR01 ||
                  forgotNewPassword !== forgotConfirmPassword
                }
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật</span>
                  </>
                ) : (
                  <span>Đặt lại mật khẩu</span>
                )}
              </button>
            </form>
          )}

          {/* Bottom Back Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại đăng nhập</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LUỒNG D: ĐỔI MẬT KHẨU BẮT BUỘC (AUTH-08) */}
      {/* ========================================================================= */}
      {mode === 'forced_change_password' && (
        <div className="auth-view-transition">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Tài khoản của bạn được cấp mới ở trạng thái chờ kích hoạt. Vui lòng thiết lập mật khẩu mới để bắt đầu sử dụng.
            </div>
          </div>

          <form onSubmit={handleForcedChangePassword} noValidate className="space-y-3.5">
            {/* Mật khẩu hiện tại */}
            <div className="space-y-1.5">
              <label htmlFor="forced-current-pwd" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu hiện tại (được cấp)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="forced-current-pwd"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    authMemoryState.currentPassword = e.target.value;
                    clearFieldError('currentPassword');
                  }}
                  placeholder="Nhập mật khẩu hiện tại"
                  disabled={isSubmitting}
                  className={`w-full h-11 pl-10 pr-10 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 ${
                    fieldErrors.currentPassword
                      ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.currentPassword && (
                <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.currentPassword}</p>
              )}
            </div>

            {/* Mật khẩu mới */}
            {/* Mật khẩu mới chuẩn BR-01 với Thanh đo độ mạnh & Checklist */}
            <PasswordInputWithStrength
              id="forced-new-pwd"
              label="Mật khẩu mới"
              value={forcedNewPassword}
              onChange={(val) => {
                setForcedNewPassword(val);
                authMemoryState.forcedNewPassword = val;
                clearFieldError('newPassword');
              }}
              placeholder="Nhập mật khẩu mới (8–64 ký tự)"
              disabled={isSubmitting}
              error={fieldErrors.newPassword}
              required
              autoComplete="new-password"
              onKeyDown={handlePasswordKeyDown}
              capsLockOn={capsLockOn}
            />

            {/* Xác nhận mật khẩu mới */}
            <ConfirmPasswordInput
              id="forced-confirm-pwd"
              label="Xác nhận mật khẩu mới"
              value={forcedConfirmPassword}
              targetPassword={forcedNewPassword}
              onChange={(val) => {
                setForcedConfirmPassword(val);
                authMemoryState.forcedConfirmPassword = val;
                clearFieldError('confirmPassword');
              }}
              placeholder="Nhập lại mật khẩu mới"
              disabled={isSubmitting}
              error={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
              onKeyDown={handlePasswordKeyDown}
              capsLockOn={capsLockOn}
            />

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !currentPassword.trim() ||
                !evaluatePasswordStrength(forcedNewPassword).isValidBR01 ||
                forcedNewPassword !== forcedConfirmPassword
              }
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật</span>
                </>
              ) : (
                <span>Đổi mật khẩu & Kích hoạt</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
