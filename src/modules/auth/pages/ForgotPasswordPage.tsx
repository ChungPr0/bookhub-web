import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '../components/OtpInput';
import {
  requestOtpSchema,
  RequestOtpFormData,
  resetPasswordSchema,
  ResetPasswordFormData,
} from '../schemas/authSchemas';
import { authApi } from '../api/authApi';
import { ApiErrorResponse } from '@/core/types/api.types';
import { maskPhone } from '@/core/utils/masking';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Step 1 Form
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    setError: setErrorStep1,
    formState: { errors: errorsStep1 },
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { phone: '' },
  });

  // Step 3 Form
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    setValue: setValueStep3,
    setError: setErrorStep3,
    formState: { errors: errorsStep3 },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSendOtp = async (data: RequestOtpFormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.requestForgotOtp({ phone: data.phone });
      setPhone(data.phone);
      setResendCooldown(res.resendAfterSeconds || 60);
      setStep(2);
      toast.success(`Mã OTP đặt lại mật khẩu đã gửi tới ${maskPhone(data.phone)}`);
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      if (error?.code === 'RESOURCE_NOT_FOUND') {
        setErrorStep1('phone', { message: 'Số điện thoại chưa được đăng ký trong hệ thống' });
      } else {
        toast.error(error?.message || 'Không thể gửi mã OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }
    setOtpError(undefined);
    setIsLoading(true);
    try {
      const res = await authApi.verifyForgotOtp({ phone, otp });
      setValueStep3('resetToken', res.resetToken);
      setStep(3);
      toast.success('Xác thực OTP thành công, vui lòng nhập mật khẩu mới');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      setOtpError(error?.message || 'Mã OTP không chính xác hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        resetToken: data.resetToken,
        newPassword: data.newPassword,
      });
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      if (error?.code === 'RESET_TOKEN_EXPIRED') {
        toast.error('Phiên làm việc đã hết hạn. Vui lòng thử lại từ đầu.');
        setStep(1);
      } else if (error?.code === 'VALIDATION_FAILED' && error?.errors) {
        error.errors.forEach((item) => {
          setErrorStep3(item.field as keyof ResetPasswordFormData, { message: item.message });
        });
      } else {
        toast.error(error?.message || 'Không thể đặt lại mật khẩu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {step === 1 && 'Khôi phục Mật khẩu'}
          {step === 2 && 'Xác thực Mã OTP'}
          {step === 3 && 'Tạo Mật khẩu Mới'}
        </h2>
        <p className="text-xs text-slate-500">
          {step === 1 && 'Nhập số điện thoại tài khoản để nhận mã khôi phục'}
          {step === 2 && `Mã OTP gồm 6 chữ số đã được gửi tới ${maskPhone(phone)}`}
          {step === 3 && 'Thiết lập mật khẩu mới an toàn cho tài khoản'}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmitStep1(onSendOtp)} className="space-y-4">
          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="0988888888"
            leftIcon={<Phone className="w-4 h-4" />}
            disabled={isLoading}
            error={errorsStep1.phone?.message}
            {...registerStep1('phone')}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Gửi mã OTP
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (otpError) setOtpError(undefined);
            }}
            disabled={isLoading}
            error={otpError}
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => onSendOtp({ phone })}
              disabled={resendCooldown > 0 || isLoading}
              className="text-xs text-blue-600 hover:underline font-medium disabled:text-slate-400 disabled:no-underline cursor-pointer"
            >
              {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              disabled={isLoading}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              className="flex-1"
              size="lg"
              isLoading={isLoading}
              onClick={onVerifyOtp}
            >
              Xác thực OTP
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmitStep3(onResetPassword)} className="space-y-4">
          <Input
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            helperText="8-64 ký tự, có chữ hoa, chữ thường và số"
            disabled={isLoading}
            error={errorsStep3.newPassword?.message}
            {...registerStep3('newPassword')}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            disabled={isLoading}
            error={errorsStep3.confirmPassword?.message}
            {...registerStep3('confirmPassword')}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Lưu mật khẩu mới
          </Button>
        </form>
      )}

      <div className="text-center text-xs text-slate-500">
        Nhớ mật khẩu?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
