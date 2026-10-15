import React from 'react';
import { Lock, Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '../schemas/authSchemas';

export interface ConfirmPasswordInputProps {
  id: string;
  label: string;
  value: string;
  targetPassword: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  capsLockOn?: boolean;
}

export const ConfirmPasswordInput: React.FC<ConfirmPasswordInputProps> = ({
  id,
  label,
  value,
  targetPassword,
  onChange,
  placeholder = 'Nhập lại mật khẩu',
  disabled = false,
  error,
  required = false,
  autoComplete = 'new-password',
  onKeyDown,
  capsLockOn = false,
}) => {
  const hasValue = value.length > 0;
  const isMatching = hasValue && value === targetPassword;
  const isTargetValid = evaluatePasswordStrength(targetPassword).isValidBR01;

  // Real-time match state
  const isFullyMatched = isMatching && isTargetValid;
  const isMismatch = hasValue && !isMatching;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
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
          id={id}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={64}
          className={`w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
            isMismatch || error
              ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100'
              : isFullyMatched
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:border-emerald-500/80 dark:bg-emerald-950/10 focus:ring-emerald-600 focus:border-emerald-600'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100'
          }`}
        />
      </div>

      {/* Real-time Match Indicator */}
      <div className="min-h-5 flex items-center transition-all duration-200">
        {isMismatch ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1.5 animate-in fade-in-50 duration-150">
            <X className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span>Mật khẩu xác nhận chưa khớp</span>
          </p>
        ) : isFullyMatched ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in-50 duration-150">
            <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span>Mật khẩu trùng khớp</span>
          </p>
        ) : error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : null}
      </div>
    </div>
  );
};

