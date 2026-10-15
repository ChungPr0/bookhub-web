import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Award, Coins, KeyRound, Lock } from 'lucide-react';
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
  usePointHistoryQuery,
} from '../hooks/useUserQueries';
import { TierProgressBar } from '../components/TierProgressBar';
import { updateProfileSchema, UpdateProfileFormData } from '../schemas/userSchemas';
import { evaluatePasswordStrength } from '@/modules/auth/schemas/authSchemas';
import { authApi } from '@/modules/auth/api/authApi';
import { PasswordInputWithStrength } from '@/modules/auth/components/PasswordInputWithStrength';
import { ConfirmPasswordInput } from '@/modules/auth/components/ConfirmPasswordInput';
import { tokenManager } from '@/core/http/tokenManager';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { maskPhone } from '@/core/utils/masking';
import { formatVNDateTime } from '@/core/utils/dateTime';
import { toast } from 'sonner';

export const CustomerProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'tier' | 'points' | 'password'>('info');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: profile, isLoading } = useUserProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const { data: pointsData } = usePointHistoryQuery(0, 10);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      gender: profile?.gender || 'MALE',
      dateOfBirth: profile?.dateOfBirth || '',
      avatarUrl: profile?.avatarUrl || '',
    },
  });

  const [capsLockOn, setCapsLockOn] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const onUpdateProfile = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!currentPassword.trim()) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (!newPassword.trim()) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (!evaluatePasswordStrength(newPassword).isValidBR01) {
      errors.newPassword = 'Mật khẩu mới chưa đáp ứng đầy đủ tiêu chuẩn BR-01';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }
    if (Object.keys(errors).length > 0) {
      setPasswordFieldErrors(errors);
      return;
    }
    setPasswordFieldErrors({});
    setIsChangingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      tokenManager.setTokens(res.accessToken, res.refreshToken);
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'CURRENT_PASSWORD_INCORRECT') {
        setPasswordFieldErrors({ currentPassword: 'Mật khẩu hiện tại không chính xác' });
        toast.error('Mật khẩu hiện tại không chính xác');
      } else if (error?.code === 'PASSWORD_REUSED') {
        setPasswordFieldErrors({ newPassword: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' });
        toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      } else {
        toast.error(error?.message || 'Đổi mật khẩu không thành công');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải thông tin tài khoản...</div>;
  }

  const pointTransactions = pointsData?.items || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Tài Khoản Của Tôi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin hồ sơ cá nhân, hạng thành viên và điểm thưởng tích lũy
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'info', label: 'Thông tin cá nhân', icon: <User className="w-4 h-4" /> },
          { key: 'tier', label: 'Hạng thành viên', icon: <Award className="w-4 h-4" /> },
          { key: 'points', label: 'Lịch sử điểm thưởng', icon: <Coins className="w-4 h-4" /> },
          { key: 'password', label: 'Đổi mật khẩu', icon: <KeyRound className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Profile Info */}
      {activeTab === 'info' && (
        <form
          onSubmit={handleSubmitProfile(onUpdateProfile)}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{profile?.fullName}</h4>
              <p className="text-xs text-slate-500 font-mono">
                Số điện thoại: {maskPhone(profile?.phone)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              error={profileErrors.fullName?.message}
              {...registerProfile('fullName')}
            />
            <Input
              label="Email"
              type="email"
              error={profileErrors.email?.message}
              {...registerProfile('email')}
            />
            <Select
              label="Giới tính"
              options={[
                { label: 'Nam', value: 'MALE' },
                { label: 'Nữ', value: 'FEMALE' },
                { label: 'Khác', value: 'OTHER' },
              ]}
              {...registerProfile('gender')}
            />
            <Input
              label="Ngày sinh"
              type="date"
              error={profileErrors.dateOfBirth?.message}
              {...registerProfile('dateOfBirth')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="md"
              isLoading={updateProfileMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Tier Progression */}
      {activeTab === 'tier' && profile && (
        <div className="space-y-6">
          <TierProgressBar
            tier={profile.membershipTier}
            progressPercent={profile.tierProgressPercent}
            totalSpent={profile.totalSpent}
            pointsToNextTier={profile.pointsToNextTier}
          />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Quyền lợi thành viên BookHub</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">🎁 Tích lũy điểm thưởng</span>
                <p>Tích lũy 1% giá trị đơn hàng thành điểm để trừ tiền cho các đơn mua tiếp theo.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">🚚 Miễn phí vận chuyển</span>
                <p>Hạng Vàng &amp; Bạch Kim được hưởng voucher miễn phí giao hàng hàng tháng.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Points History */}
      {activeTab === 'points' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-sm">Điểm tích lũy hiện có:</span>
            </div>
            <span className="text-lg font-black text-amber-600">
              {profile?.currentPoints || 0} điểm
            </span>
          </div>

          {pointTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có lịch sử biến động điểm thưởng
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold border-b border-slate-200 uppercase text-slate-700">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-right">Biến động</th>
                  <th className="py-3 px-4 text-right">Số dư sau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pointTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 px-4">{formatVNDateTime(tx.createdAt)}</td>
                    <td className="py-3 px-4">{tx.description}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      <Badge variant={tx.amount > 0 ? 'success' : 'destructive'} size="sm">
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {tx.balanceAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 4: Change Password */}
      {activeTab === 'password' && (
        <form
          onSubmit={onChangePassword}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 max-w-lg"
          noValidate
        >
          {/* Mật khẩu hiện tại */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="profile-current-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
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
                id="profile-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordFieldErrors.currentPassword) {
                    setPasswordFieldErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.currentPassword;
                      return updated;
                    });
                  }
                }}
                onKeyDown={handlePasswordKeyDown}
                onKeyUp={handlePasswordKeyDown}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isChangingPassword}
                autoComplete="current-password"
                className={`w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
                  passwordFieldErrors.currentPassword
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                }`}
              />
            </div>
            {passwordFieldErrors.currentPassword && (
              <p className="text-xs text-rose-500 font-medium mt-1">
                {passwordFieldErrors.currentPassword}
              </p>
            )}
          </div>

          {/* Mật khẩu mới chuẩn BR-01 với Thanh đo độ mạnh & Checklist */}
          <PasswordInputWithStrength
            id="profile-new-password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={(val) => {
              setNewPassword(val);
              if (passwordFieldErrors.newPassword) {
                setPasswordFieldErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.newPassword;
                  return updated;
                });
              }
            }}
            placeholder="Nhập mật khẩu mới (8–64 ký tự)"
            disabled={isChangingPassword}
            error={passwordFieldErrors.newPassword}
            required
            autoComplete="new-password"
            onKeyDown={handlePasswordKeyDown}
            capsLockOn={capsLockOn}
          />

          {/* Xác nhận mật khẩu mới */}
          <ConfirmPasswordInput
            id="profile-confirm-password"
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            targetPassword={newPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              if (passwordFieldErrors.confirmPassword) {
                setPasswordFieldErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.confirmPassword;
                  return updated;
                });
              }
            }}
            placeholder="Nhập lại mật khẩu mới"
            disabled={isChangingPassword}
            error={passwordFieldErrors.confirmPassword}
            required
            autoComplete="new-password"
            onKeyDown={handlePasswordKeyDown}
            capsLockOn={capsLockOn}
          />

          <Button
            type="submit"
            size="md"
            isLoading={isChangingPassword}
            disabled={
              isChangingPassword ||
              !newPassword ||
              !evaluatePasswordStrength(newPassword).isValidBR01 ||
              newPassword !== confirmPassword
            }
            className="w-full sm:w-auto h-10 px-6 rounded-xl font-semibold text-sm transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white shadow-sm"
          >
            {isChangingPassword ? 'Đang xử lý' : 'Đổi mật khẩu'}
          </Button>
        </form>
      )}
    </div>
  );
};

