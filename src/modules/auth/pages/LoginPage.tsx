import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { ApiErrorResponse } from '@/core/types/api.types';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginMutation } = useAuthMutations();

  const redirectUrl = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  // Countdown timer for 423 lockout
  useEffect(() => {
    if (!lockoutSeconds || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const onSubmit = (data: LoginFormData) => {
    if (lockoutSeconds) return;

    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate(redirectUrl, { replace: true });
      },
      onError: (err: unknown) => {
        const error = err as ApiErrorResponse;
        if (error?.code === 'ACCOUNT_TEMPORARILY_LOCKED') {
          // Locked for 15 minutes = 900s (BR-03)
          setLockoutSeconds(900);
        } else if (error?.code === 'VALIDATION_FAILED' && error?.errors) {
          error.errors.forEach((item) => {
            setError(item.field as keyof LoginFormData, { message: item.message });
          });
        } else if (error?.code === 'INVALID_CREDENTIALS') {
          setError('password', { message: 'Số điện thoại hoặc mật khẩu không chính xác' });
        }
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập BookHub</h2>
        <p className="text-xs text-slate-500">Nhập số điện thoại và mật khẩu để tiếp tục</p>
      </div>

      {lockoutSeconds !== null && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Tài khoản bị tạm khóa vì nhập sai 5 lần liên tiếp</p>
            <p className="mt-0.5 text-amber-700">
              Vui lòng thử lại sau:{' '}
              <span className="font-mono font-bold text-amber-900">{formatCountdown(lockoutSeconds)}</span>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Số điện thoại"
          type="tel"
          placeholder="0988888888"
          disabled={loginMutation.isPending || lockoutSeconds !== null}
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="space-y-1">
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={loginMutation.isPending || lockoutSeconds !== null}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end pt-0.5">
            <Link
              to="/forgot-password"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {loginMutation.isError && (loginMutation.error as unknown as ApiErrorResponse)?.message && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{(loginMutation.error as unknown as ApiErrorResponse).message}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={loginMutation.isPending}
          disabled={lockoutSeconds !== null}
        >
          Đăng nhập
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
