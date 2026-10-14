import React, { useRef } from 'react';
import { cn } from '@/core/utils/cn';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, disabled, error }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    const char = val.slice(-1);
    if (!/^[0-9]$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextVal = newDigits.join('').trimEnd();
    onChange(nextVal);

    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] || digits[index] === ' ') {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        const newDigits = [...digits];
        newDigits[index] = ' ';
        onChange(newDigits.join('').trimEnd());
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^[0-9]{6}$/.test(pasted)) {
      onChange(pasted);
      inputsRef.current[5]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-2 max-w-xs mx-auto">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digits[index] === ' ' ? '' : digits[index]}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'w-11 h-12 text-center text-lg font-bold rounded-lg border bg-white text-slate-900 transition-all select-none',
              'focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 hover:border-slate-400',
              disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
            aria-label={`Ký tự OTP thứ ${index + 1}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-rose-600 text-center font-medium">{error}</p>}
    </div>
  );
};

