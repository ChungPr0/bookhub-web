import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, ShieldCheck, Truck, Gift } from 'lucide-react';

export const AuthSidePanel: React.FC = React.memo(() => {
  return (
    <div className="w-full h-full bg-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden select-none border-r border-slate-800/80">
      {/* Subtle radial background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-600/15 via-indigo-600/10 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-lg shadow-white/10 shrink-0">
          <BookOpen className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight block leading-none">BookHub</span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">Nhà sách trực tuyến</span>
        </div>
      </div>

      {/* Middle Content: Quote & Value Propositions */}
      <div className="relative z-10 space-y-6 my-auto py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Trải nghiệm mua sách bản quyền</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug text-slate-50">
          Nuôi dưỡng tâm hồn với hàng ngàn tựa sách đặc sắc
        </h2>

        <div className="space-y-3.5 pt-1 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 p-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="leading-relaxed">100% sách thật, có bản quyền từ các nhà xuất bản uy tín</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 p-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="leading-relaxed">Giao hàng nhanh toàn quốc, đóng gói chống sốc an toàn</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 p-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <span className="leading-relaxed">Tích lũy điểm thưởng thành viên và đổi quà hấp dẫn</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer / Copyright */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-4">
        <span>BookHub Platform &copy; 2026</span>
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Hệ thống bảo mật SSL</span>
        </div>
      </div>
    </div>
  );
});

AuthSidePanel.displayName = 'AuthSidePanel';

