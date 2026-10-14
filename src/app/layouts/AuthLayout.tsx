import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-stretch">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="p-2.5 bg-white text-blue-600 rounded-2xl shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight">BookHub</span>
              <span className="text-xs block text-blue-200">Kho tàng tri thức vô tận</span>
            </div>
          </Link>
        </div>

        <div className="space-y-6 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Trải nghiệm mua sách bản quyền</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Nuôi dưỡng tâm hồn với hàng ngàn tựa sách đặc sắc
          </h2>
          <div className="space-y-3 text-xs text-blue-100/90 pt-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% sách thật, có bản quyền từ các nhà xuất bản uy tín</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Giao hàng nhanh chóng và đóng gói chống sốc an toàn</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tích lũy điểm thưởng thành viên và đổi quà hấp dẫn</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-3xs text-blue-300/80">
          BookHub Web Platform &copy; 2026. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

