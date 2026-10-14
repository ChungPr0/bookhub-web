import React from 'react';

export interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      id = 'auth-phone-input',
      value,
      onChange,
      disabled = false,
      error,
      placeholder = 'Nhập số điện thoại',
      autoFocus = false,
      className = '',
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div
          className={`relative flex items-center h-11 rounded-xl border bg-white dark:bg-slate-900 transition-colors focus-within:ring-1 focus-within:ring-slate-950 focus-within:border-slate-950 dark:focus-within:ring-slate-100 dark:focus-within:border-slate-100 ${
            error
              ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
          } ${disabled ? 'opacity-50 bg-slate-50 dark:bg-slate-800 pointer-events-none' : ''} ${className}`}
        >
          {/* Prefix +84 seamlessly integrated with identical font and height */}
          <div className="flex items-center px-3.5 h-full border-r border-slate-200 dark:border-slate-800 select-none shrink-0">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              +84
            </span>
          </div>

          {/* Phone input with full typing and pasting flexibility */}
          <input
            ref={ref}
            id={id}
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            className="w-full h-full px-3.5 text-sm font-medium rounded-r-xl bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
