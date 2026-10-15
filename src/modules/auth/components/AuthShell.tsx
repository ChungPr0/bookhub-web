import React from 'react';
import { X } from 'lucide-react';
import { AuthSidePanel } from './AuthSidePanel';

export interface AuthShellProps {
  children: React.ReactNode;
  isModal?: boolean;
  onClose?: () => void;
  className?: string;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  children,
  isModal = false,
  onClose,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-[960px] md:h-[620px] max-md:h-auto max-md:max-h-[92vh] max-md:overflow-y-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col md:flex-row relative transition-all duration-300 ${className}`}
      role="region"
      aria-label="Khung xác thực BookHub"
    >
      {/* Cột trái (Side Panel / Branding BookHub - cố định 45% chiều rộng, h-full 620px) */}
      <div className="hidden md:flex md:w-[45%] h-full shrink-0">
        <AuthSidePanel />
      </div>

      {/* Cột phải (Form Area - chiếm 55% chiều rộng, h-full 620px, flex flex-col min-h-0) */}
      <div className="w-full md:w-[55%] h-full flex flex-col min-h-0 relative bg-white dark:bg-slate-950 overflow-hidden">
        {/* Nút đóng modal ở góc trên bên phải nếu là Popup */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-30 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Nội dung form thay đổi linh hoạt bên trong cột phải */}
        <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

