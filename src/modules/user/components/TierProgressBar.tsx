import React from 'react';
import { Award, Zap } from 'lucide-react';
import { formatVND } from '@/core/utils/currency';

export interface TierProgressBarProps {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  progressPercent: number;
  totalSpent: number;
  pointsToNextTier: number;
}

export const TierProgressBar: React.FC<TierProgressBarProps> = ({
  tier,
  progressPercent,
  totalSpent,
  pointsToNextTier,
}) => {
  const tierConfig: Record<string, { label: string; color: string; nextTier: string }> = {
    BRONZE: { label: 'Thành viên Đồng', color: 'from-amber-700 to-amber-900', nextTier: 'Bạc' },
    SILVER: { label: 'Thành viên Bạc', color: 'from-slate-400 to-slate-600', nextTier: 'Vàng' },
    GOLD: { label: 'Thành viên Vàng', color: 'from-amber-400 to-amber-600', nextTier: 'Bạch Kim' },
    PLATINUM: { label: 'Thành viên Bạch Kim', color: 'from-cyan-500 to-blue-700', nextTier: 'Tối đa' },
  };

  const current = tierConfig[tier] || tierConfig.BRONZE;

  return (
    <div className={`p-6 rounded-3xl bg-linear-to-r ${current.color} text-white shadow-xl space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold">{current.label}</h4>
            <p className="text-2xs text-white/80">Tổng chi tiêu: {formatVND(totalSpent)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Hạng VIP</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-2xs text-white/90">
          <span>Tiến trình thăng hạng {current.nextTier}</span>
          <span className="font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
        {pointsToNextTier > 0 && (
          <p className="text-3xs text-white/80 text-right">
            Còn thiếu {pointsToNextTier} điểm để lên hạng tiếp theo
          </p>
        )}
      </div>
    </div>
  );
};

