import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, User, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '../components/OtpInput';
import {
  requestOtpSchema,
  RequestOtpFormData,
  registerSchema,
  RegisterFormData,
} from '../schemas/authSchemas';
import { authApi } from '../api/authApi';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { ApiErrorResponse } from '@/core/types/api.types';
import { maskPhone } from '@/core/utils/masking';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { registerMutation } = useAuthMutations();

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

  // Step 2 Form
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    setValue: setValueStep2,
    control: controlStep2,
    setError: setErrorStep2,
    formState: { errors: errorsStep2 },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '',
      otp: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const otpValue = useWatch({ control: controlStep2, name: 'otp' });

  // Cooldown countdown for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSendOtp = async (data: RequestOtpFormData) => {
    setIsSendingOtp(true);
    try {
      const res = await authApi.requestRegisterOtp({ phone: data.phone });
      setPhone(data.phone);
      setValueStep2('phone', data.phone);
      setResendCooldown(res.resendAfterSeconds || 60);
      setStep(2);
      toast.success(`Mã OTP đã gửi tới ${maskPhone(data.phone)}`);
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      if (error?.code === 'PHONE_ALREADY_REGISTERED') {
        setErrorStep1('phone', { message: 'Số điện thoại này đã được đăng ký, vui lòng đăng nhập' });
      } else if (error?.code === 'OTP_REQUEST_TOO_FREQUENT') {
        toast.warning(error.message || 'Vui lòng đợi trước khi yêu cầu lại');
      } else {
        toast.error(error?.message || 'Không thể gửi mã OTP');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      const res = await authApi.requestRegisterOtp({ phone });
      setResendCooldown(res.resendAfterSeconds || 60);
      toast.success('Đã gửi lại mã OTP');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      toast.error(error?.message || 'Không thể gửi lại OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate('/', { replace: true });
      },
      onError: (err: unknown) => {
        const error = err as ApiErrorResponse;
        if (error?.code === 'INVALID_OTP' || error?.code === 'OTP_EXPIRED') {
          setErrorStep2('otp', { message: error.message || 'Mã OTP không chính xác hoặc đã hết hạn' });
        } else if (error?.code === 'VALIDATION_FAILED' && error?.errors) {
          error.errors.forEach((item) => {
            setErrorStep2(item.field as keyof RegisterFormData, { message: item.message });
          });
        }
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {step === 1 ? 'Đăng ký Tài khoản' : 'Xác thực & Tạo tài khoản'}
        </h2>
        <p className="text-xs text-slate-500">
          {step === 1
            ? 'Nhập số điện thoại để nhận mã xác thực OTP'
            : `Nhập mã OTP đã gửi đến ${maskPhone(phone)}`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmitStep1(onSendOtp)} className="space-y-4">
          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="0988888888"
            leftIcon={<Phone className="w-4 h-4" />}
            disabled={isSendingOtp}
            error={errorsStep1.phone?.message}
            {...registerStep1('phone')}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isSendingOtp}>
            Tiếp tục & Nhận OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitStep2(onRegister)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 text-center">
              Mã xác thực OTP (6 chữ số)
            </label>
            <OtpInput
              value={otpValue || ''}
              onChange={(val) => setValueStep2('otp', val, { shouldValidate: true })}
              disabled={registerMutation.isPending}
              error={errorsStep2.otp?.message}
            />
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isSendingOtp}
                className="text-xs text-blue-600 hover:underline font-medium disabled:text-slate-400 disabled:no-underline cursor-pointer"
              >
                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
              </button>
            </div>
          </div>

          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            leftIcon={<User className="w-4 h-4" />}
            disabled={registerMutation.isPending}
            error={errorsStep2.fullName?.message}
            {...registerStep2('fullName')}
          />

          <Input
            label="Mật khẩu"
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
            helperText="8-64 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
            disabled={registerMutation.isPending}
            error={errorsStep2.password?.message}
            {...registerStep2('password')}
          />

          <Input
            label="Xác nhận mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            disabled={registerMutation.isPending}
            error={errorsStep2.confirmPassword?.message}
            {...registerStep2('confirmPassword')}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              disabled={registerMutation.isPending}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              isLoading={registerMutation.isPending}
            >
              Hoàn tất đăng ký
            </Button>
          </div>
        </form>
      )}

      <div className="text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
