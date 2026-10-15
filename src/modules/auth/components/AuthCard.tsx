import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingBag,
  KeyRound,
  ChevronDown,
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
  initialMode = 'login',
  onSuccess,
  onClose,
  redirectUrl,
  isModal = true,
}) => {
  const navigate = useNavigate();
  const initialDraft = loadAuthDraft();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // -------------------------------------------------------------
  // LUỒNG A: ĐĂNG NHẬP (AUTH-03)
  // -------------------------------------------------------------
  const [loginPhone, setLoginPhone] = useState(() => initialDraft.loginPhone || '');
  const [loginPassword, setLoginPassword] = useState(() => authMemoryState.loginPassword || '');
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // -------------------------------------------------------------
  // LUỒNG B: ĐĂNG KÝ (AUTH-01 & AUTH-02) — COMPACT 5-ROW FORM
  // -------------------------------------------------------------
  const [registerPhone, setRegisterPhone] = useState(() => initialDraft.registerDraft.phone || '');
  const [registerFullName, setRegisterFullName] = useState(() => initialDraft.registerDraft.fullName || '');
  const [registerGender, setRegisterGender] = useState<Gender>(() => initialDraft.registerDraft.gender || 'OTHER');
  const [registerEmail, setRegisterEmail] = useState(() => initialDraft.registerDraft.email || '');
  const [registerBirthday, setRegisterBirthday] = useState(() => initialDraft.registerDraft.birthday || '');
  const [registerPassword, setRegisterPassword] = useState(() => authMemoryState.registerPassword || '');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState(() => authMemoryState.registerConfirmPassword || '');
  const [registerOtp, setRegisterOtp] = useState(() => authMemoryState.registerOtp || '');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isOtpSent, setIsOtpSent] = useState<boolean>(() => {
    return Boolean(
      initialDraft.registerDraft.isOtpSent ||
      initialDraft.registerDraft.resendAvailableAt ||
      initialDraft.registerDraft.otpExpiresAt
    );
  });

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
    if (newMode !== 'forced_change_password') {
      saveAuthDraft({ activeView: newMode });
    }
    if (isModal) {
      useAuthModalStore.getState().setMode(newMode);
    }
  };

  const handleSwitchMode = (newMode: AuthModalMode) => {
    switchMode(newMode);
    if (!isModal) {
      if (newMode === 'login') navigate('/login');
      else if (newMode === 'register') navigate('/register');
      else if (newMode === 'forgot_password') navigate('/forgot-password');
    }
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

    saveAuthDraft({ loginPhone: normalized });

    loginMutation.mutate(
      { phone: normalized, password: loginPassword },
      {
        onSuccess: (data) => {
          setIsSubmitting(false);
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
  const handleRegisterRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || isSendingOtp || registerCooldown > 0) return;

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

    setIsSendingOtp(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      const res = await authApi.requestRegisterOtp({ phone: normalized });
      const now = Date.now();
      const resendAt = now + (res.resendAfterSeconds || 60) * 1000;
      const expiresAt = now + (res.otpExpiresInSeconds || 300) * 1000;

      setRegisterResendAvailableAt(resendAt);
      setRegisterOtpExpiresAt(expiresAt);
      setIsOtpSent(true);

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

      toast.success('Mã xác thực OTP đã được gửi đến số điện thoại của bạn');
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
      setIsSendingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const normalized = normalizePhoneToZero(registerPhone);
    const trimmedOtp = registerOtp.trim();
    const trimmedName = registerFullName.trim();
    const trimmedEmail = registerEmail.trim();

    if (!registerPhone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhone(registerPhone)) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    } else if (!isOtpSent) {
      errors.phone = 'Vui lòng nhấn nút Gửi OTP để nhận mã xác thực';
    }

    if (isOtpSent && (!trimmedOtp || trimmedOtp.length !== 6)) {
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

    const payload: RegisterRequest = {
      phone: normalized,
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
      setIsOtpSent(false);
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');

      setLoginPhone(res.phone || normalized);
      setLoginPassword('');
      saveAuthDraft({ activeView: 'login', loginPhone: res.phone || normalized });
      handleSwitchMode('login');
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
          setFieldErrors({ otpCode: 'Mã OTP đã hết hiệu lực, vui lòng gửi lại mã mới' });
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

      setLoginPhone(normalizePhoneToZero(forgotPhone));
      setLoginPassword('');
      saveAuthDraft({ activeView: 'login', loginPhone: normalizePhoneToZero(forgotPhone) });
      handleSwitchMode('login');
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

  const isShortForm = mode === 'login' || (mode === 'forgot_password' && forgotStep !== 3);

  return (
    <div className="w-full h-full flex flex-col justify-between min-h-0 px-6 py-4 sm:px-8 sm:py-5 bg-white dark:bg-slate-950 relative overflow-hidden text-slate-900 dark:text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* HEADER: Dynamic Title + Segmented Switcher Pill                 */}
      {/* ------------------------------------------------------------- */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Dynamic Mode Title */}
          <div>
            <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {mode === 'login' && 'Đăng nhập tài khoản'}
              {mode === 'register' && 'Đăng ký tài khoản'}
              {mode === 'forgot_password' && 'Khôi phục mật khẩu'}
              {mode === 'forced_change_password' && 'Đổi mật khẩu bắt buộc'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1">
              {mode === 'login' && 'Chào mừng bạn trở lại!'}
              {mode === 'register' && 'Nhập số điện thoại và thông tin.'}
              {mode === 'forgot_password' &&
                (forgotStep === 1
                  ? 'Nhập số điện thoại đăng ký để nhận mã OTP khôi phục.'
                  : forgotStep === 2
                    ? `Nhập mã 6 chữ số đã gửi đến ${maskPhone(normalizePhoneToZero(forgotPhone))}.`
                    : 'Thiết lập mật khẩu mới an toàn cho tài khoản.')}
              {mode === 'forced_change_password' &&
                'Tài khoản mới cần cập nhật mật khẩu lần đầu để tiếp tục sử dụng.'}
            </p>
          </div>

          {/* Quick Switcher / Back Link */}
          {(mode === 'login' || mode === 'register') && (
            <div className={`flex p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-semibold shrink-0 ${isModal ? 'mr-7 sm:mr-8' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  if (registerPhone.trim()) {
                    setLoginPhone(registerPhone);
                    saveAuthDraft({ loginPhone: registerPhone });
                  }
                  handleSwitchMode('login');
                }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  if (loginPhone.trim()) {
                    setRegisterPhone(loginPhone);
                    saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, phone: loginPhone } });
                  }
                  handleSwitchMode('register');
                }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}

          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer shrink-0 ${isModal ? 'mr-7 sm:mr-8' : ''}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>

        {/* Checkout pill if user was on checkout path */}
        {redirectUrl === '/checkout' && (
          <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/80 dark:border-slate-800">
            <ShoppingBag className="w-3 h-3 text-slate-900 dark:text-slate-100" />
            <span>Đăng nhập để hoàn tất đơn hàng</span>
          </div>
        )}

        {/* General Alert Message */}
        {generalError && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2 animate-in fade-in-50 duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{generalError}</div>
          </div>
        )}

        {/* Lockout Box for BR-03 */}
        {lockoutSeconds !== null && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 auth-lockout-pulse" />
              <div>
                <p className="font-semibold">Tài khoản tạm thời bị khóa</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Nhập sai 5 lần liên tiếp. Vui lòng chờ mở khóa.
                </p>
              </div>
            </div>
            <span className="font-mono text-sm font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              {formatCountdown(lockoutSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MIDDLE CONTENT: Form Area (Centered or Scrollable)            */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`w-full min-h-0 ${
          isShortForm
            ? 'flex-1 flex flex-col justify-center'
            : 'flex-1 flex flex-col justify-start overflow-y-auto scrollbar-thin pr-1.5 py-1'
        }`}
      >
        {/* ========================================================================= */}
        {/* LUỒNG A: ĐĂNG NHẬP (AUTH-03) — CĂN GIỮA THEO TRỤC DỌC                     */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="auth-view-transition w-full space-y-4">
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
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
                    type="password"
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
                    className={`w-full h-10 pl-10 pr-3.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
                      fieldErrors.password
                        ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  />
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
                    if (loginPhone.trim()) {
                      setForgotPhone(loginPhone);
                      saveAuthDraft({ forgotDraft: { ...initialDraft.forgotDraft, phone: loginPhone } });
                    }
                    handleSwitchMode('forgot_password');
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
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
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

            <div className="text-center text-xs text-slate-500 pt-1">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  if (loginPhone.trim()) {
                    setRegisterPhone(loginPhone);
                    saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, phone: loginPhone } });
                  }
                  handleSwitchMode('register');
                }}
                className="font-semibold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer"
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LUỒNG B: ĐĂNG KÝ (COMPACT 5-ROW FORM VỪA KHÍT KHUNG 620PX)                */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div className="auth-view-transition w-full py-0.5">
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-2.5">
              {/* HÀNG 1: Số điện thoại + Nút Gửi OTP nằm cùng 1 hàng */}
              <div className="space-y-1">
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <PhoneInput
                      id="reg-phone"
                      value={registerPhone}
                      onChange={(val) => {
                        setRegisterPhone(val);
                        clearFieldError('phone');
                        saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, phone: val } });
                      }}
                      disabled={isSubmitting}
                      error={fieldErrors.phone}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRegisterRequestOtp}
                    disabled={isSubmitting || isSendingOtp || registerCooldown > 0 || !registerPhone.trim()}
                    className="h-10 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : registerCooldown > 0 ? (
                      `Gửi lại (${registerCooldown}s)`
                    ) : isOtpSent ? (
                      'Gửi lại OTP'
                    ) : (
                      'Gửi mã OTP'
                    )}
                  </button>
                </div>
              </div>

              {/* HÀNG 2: Mã xác thực OTP (chỉ mở ra sau khi bấm gửi OTP) */}
              {isOtpSent && (
                <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800/80 space-y-1.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mã OTP đã gửi tới {maskPhone(normalizePhoneToZero(registerPhone))}
                    </span>
                    {registerOtpExpires > 0 && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Hết hạn: <strong className="text-slate-800 dark:text-slate-200">{formatCountdown(registerOtpExpires)}</strong>
                      </span>
                    )}
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
                </div>
              )}

              {/* HÀNG 3: Họ và tên (60%) + Giới tính (40%) nằm cùng 1 hàng */}
              <div className="grid grid-cols-[3fr_2fr] gap-2.5 items-start">
                <div className="space-y-1">
                  <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400 pointer-events-none">
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
                      className={`w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 ${
                        fieldErrors.fullName
                          ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-500 font-medium mt-0.5">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-gender" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Giới tính <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="reg-gender"
                      value={registerGender}
                      onChange={(e) => {
                        setRegisterGender(e.target.value as Gender);
                        clearFieldError('gender');
                        saveAuthDraft({ registerDraft: { ...initialDraft.registerDraft, gender: e.target.value as Gender } });
                      }}
                      disabled={isSubmitting}
                      className="w-full h-10 px-3 pr-8 text-xs sm:text-sm font-medium rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 appearance-none cursor-pointer"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.gender && (
                    <p className="text-[11px] text-rose-500 font-medium mt-0.5">{fieldErrors.gender}</p>
                  )}
                </div>
              </div>

              {/* HÀNG 4: Email + Ngày sinh nằm cùng 1 hàng */}
              <div className="grid grid-cols-2 gap-2.5 items-start">
                <div className="space-y-1">
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
                    <p className="text-[11px] text-rose-500 font-medium mt-0.5">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
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
                    <p className="text-[11px] text-rose-500 font-medium mt-0.5">{fieldErrors.birthday}</p>
                  )}
                </div>
              </div>

              {/* HÀNG 5: Mật khẩu + Xác nhận mật khẩu nằm cùng 1 hàng */}
              <div className="grid grid-cols-2 gap-2.5 items-start">
                <div>
                  <PasswordInputWithStrength
                    id="reg-password"
                    label="Mật khẩu"
                    value={registerPassword}
                    onChange={(val) => {
                      setRegisterPassword(val);
                      authMemoryState.registerPassword = val;
                      clearFieldError('password');
                    }}
                    placeholder="8–64 ký tự"
                    disabled={isSubmitting}
                    error={fieldErrors.password}
                    required
                    autoComplete="new-password"
                    onKeyDown={handlePasswordKeyDown}
                    capsLockOn={capsLockOn}
                  />
                </div>
                <div>
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
                </div>
              </div>

              {/* Forgot Password link */}
              <div className="flex items-center justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (registerPhone.trim()) {
                      setForgotPhone(registerPhone);
                      saveAuthDraft({ forgotDraft: { ...initialDraft.forgotDraft, phone: registerPhone } });
                    }
                    handleSwitchMode('forgot_password');
                  }}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !isOtpSent ||
                  registerOtp.trim().length !== 6 ||
                  !registerFullName.trim() ||
                  !evaluatePasswordStrength(registerPassword).isValidBR01 ||
                  registerPassword !== registerConfirmPassword
                }
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý</span>
                  </>
                ) : (
                  <span>Đăng ký</span>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-1">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  if (registerPhone.trim()) {
                    setLoginPhone(registerPhone);
                    saveAuthDraft({ loginPhone: registerPhone });
                  }
                  handleSwitchMode('login');
                }}
                className="font-semibold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LUỒNG C: QUÊN MẬT KHẨU 3 BƯỚC (CĂN GIỮA THEO TRỤC DỌC)                     */}
        {/* ========================================================================= */}
        {mode === 'forgot_password' && (
          <div className="auth-view-transition w-full space-y-4">
            {/* Stepper indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[
                { num: 1, label: 'Số điện thoại' },
                { num: 2, label: 'Mã OTP' },
                { num: 3, label: 'Mật khẩu mới' },
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        forgotStep >= step.num
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.num}
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />}
                </React.Fragment>
              ))}
            </div>

            {/* Bước 1: Yêu cầu OTP */}
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
                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý</span>
                    </>
                  ) : (
                    <span>Tiếp tục</span>
                  )}
                </button>
              </form>
            )}

            {/* Bước 2: Xác thực OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyOtp} noValidate className="space-y-4">
                <div className="text-center py-1">
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
                      {forgotCooldown > 0 ? `${forgotCooldown}s` : 'Gửi lại mã'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || forgotOtp.trim().length !== 6}
                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý</span>
                    </>
                  ) : (
                    <span>Tiếp tục</span>
                  )}
                </button>
              </form>
            )}

            {/* Bước 3: Đặt lại mật khẩu mới */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotResetPassword} noValidate className="space-y-3.5">
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

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !evaluatePasswordStrength(forgotNewPassword).isValidBR01 ||
                    forgotNewPassword !== forgotConfirmPassword
                  }
                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý</span>
                    </>
                  ) : (
                    <span>Đặt lại mật khẩu</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LUỒNG D: ĐỔI MẬT KHẨU BẮT BUỘC (AUTH-08)                                  */}
        {/* ========================================================================= */}
        {mode === 'forced_change_password' && (
          <div className="auth-view-transition w-full space-y-3.5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Tài khoản mới cần cập nhật mật khẩu lần đầu để tiếp tục sử dụng.
              </div>
            </div>

            <form onSubmit={handleForcedChangePassword} noValidate className="space-y-3">
              {/* Mật khẩu hiện tại */}
              <div className="space-y-1">
                <label htmlFor="forced-current-pwd" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mật khẩu hiện tại
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="forced-current-pwd"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      authMemoryState.currentPassword = e.target.value;
                      clearFieldError('currentPassword');
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={isSubmitting}
                    className={`w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 ${
                      fieldErrors.currentPassword
                        ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  />
                </div>
                {fieldErrors.currentPassword && (
                  <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.currentPassword}</p>
                )}
              </div>

              {/* Mật khẩu mới */}
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
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý</span>
                  </>
                ) : (
                  <span>Đổi mật khẩu</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER: Fixed at bottom of 620px panel                         */}
      {/* ------------------------------------------------------------- */}
      <div className="shrink-0 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>Bảo mật & Điều khoản sử dụng BookHub</span>
        <span>Hỗ trợ: 1900 6868</span>
      </div>
    </div>
  );
};
