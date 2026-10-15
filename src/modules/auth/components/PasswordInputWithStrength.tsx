import React, { useState } from 'react';
import { Lock, Check, Circle, X } from 'lucide-react';
import { evaluatePasswordStrength, PasswordStrengthResult } from '../schemas/authSchemas';

export interface PasswordInputWithStrengthProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  capsLockOn?: boolean;
}

export const PasswordInputWithStrength: React.FC<PasswordInputWithStrengthProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Nhập mật khẩu',
  disabled = false,
  error,
  required = false,
  autoComplete = 'new-password',
  onKeyDown,
  capsLockOn = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const strength: PasswordStrengthResult = evaluatePasswordStrength(value);

  // Block spacebar key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // 1. Thanh 4 vạch luôn hiển thị gọn khi đã nhập ký tự
  const showMeter = value.length > 0 && !disabled;

  // 2. Checklist chỉ mở ra khi đang FOCUS VÀ CHƯA ĐẠT CHUẨN BR-01
  const showChecklist = isFocused && !strength.isValidBR01 && !disabled;

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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={64}
          className={`w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 dark:focus:ring-slate-100 dark:focus:border-slate-100 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
            error
              ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
              : strength.isValidBR01
                ? 'border-emerald-500/70 dark:border-emerald-500/70'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
          }`}
        />
      </div>

      {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}

      {/* Thanh đo độ mạnh (4 vạch - luôn hiện gọn khi có ký tự) */}
      {showMeter && (
        <div className="space-y-1 pt-0.5 animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[10px]">Độ mạnh:</span>
            {strength.label && (
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  strength.score === 1
                    ? 'text-red-500 dark:text-red-400'
                    : strength.score === 2
                      ? 'text-amber-500 dark:text-amber-400'
                      : strength.score === 3
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {strength.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score === 0
                  ? 'bg-slate-200 dark:bg-slate-800'
                  : strength.score === 1
                    ? 'bg-red-500'
                    : strength.score === 2
                      ? 'bg-amber-500'
                      : strength.score === 3
                        ? 'bg-emerald-400'
                        : 'bg-emerald-600'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score < 2
                  ? 'bg-slate-200 dark:bg-slate-800'
                  : strength.score === 2
                    ? 'bg-amber-500'
                    : strength.score === 3
                      ? 'bg-emerald-400'
                      : 'bg-emerald-600'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score < 3
                  ? 'bg-slate-200 dark:bg-slate-800'
                  : strength.score === 3
                    ? 'bg-emerald-400'
                    : 'bg-emerald-600'
              }`}
            />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score < 4 ? 'bg-slate-200 dark:bg-slate-800' : 'bg-emerald-600'
              }`}
            />
          </div>
        </div>
      )}

      {/* Checklist hướng dẫn chi tiết BR-01 (Thu gọn thông minh khi đã đạt chuẩn hoặc blur) */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          showChecklist ? 'max-h-40 opacity-100 mt-1.5' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs">
            {/* 1. Độ dài 8-64 ký tự */}
            <div className="flex items-center gap-1.5">
              {strength.length ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 stroke-[2]" />
              )}
              <span
                className={`text-[10px] transition-colors ${
                  strength.length
                    ? 'text-slate-800 dark:text-slate-200 font-medium'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                8–64 ký tự ({value.length}/64)
              </span>
            </div>

            {/* 2. Chữ hoa & Chữ thường */}
            <div className="flex items-center gap-1.5">
              {strength.hasUpper && strength.hasLower ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 stroke-[2]" />
              )}
              <span
                className={`text-[10px] transition-colors ${
                  strength.hasUpper && strength.hasLower
                    ? 'text-slate-800 dark:text-slate-200 font-medium'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Chữ HOA & thường
              </span>
            </div>

            {/* 3. Ít nhất 1 chữ số */}
            <div className="flex items-center gap-1.5">
              {strength.hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 stroke-[2]" />
              )}
              <span
                className={`text-[10px] transition-colors ${
                  strength.hasNumber
                    ? 'text-slate-800 dark:text-slate-200 font-medium'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Ít nhất 1 chữ số
              </span>
            </div>

            {/* 4. Không chứa khoảng trắng */}
            <div className="flex items-center gap-1.5">
              {strength.hasSpace ? (
                <X className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 stroke-[2.5]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              )}
              <span
                className={`text-[10px] transition-colors ${
                  strength.hasSpace
                    ? 'text-rose-500 dark:text-rose-400 font-semibold'
                    : 'text-slate-800 dark:text-slate-200 font-medium'
                }`}
              >
                {strength.hasSpace ? 'Có khoảng trắng' : 'Không khoảng trắng'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
