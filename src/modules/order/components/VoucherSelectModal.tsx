import React from 'react';
import { Tag, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VoucherDto } from '../types/order.types';
import { formatVND } from '@/core/utils/currency';
import { formatVNDate } from '@/core/utils/dateTime';

export interface VoucherSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: VoucherDto[];
  selectedCode?: string | null;
  onSelect: (code: string) => void;
}

export const VoucherSelectModal: React.FC<VoucherSelectModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  selectedCode,
  onSelect,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn Mã Giảm Giá BookHub"
      description="Áp dụng voucher để nhận ưu đãi giảm giá tốt nhất cho đơn hàng của bạn"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {vouchers.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">
            Hiện tại bạn chưa có mã giảm giá nào khả dụng
          </p>
        ) : (
          vouchers.map((v) => {
            const isSelected = selectedCode === v.code;
            return (
              <div
                key={v.code}
                className={`p-3.5 rounded-xl border transition-all ${
                  !v.isApplicable
                    ? 'border-slate-200 bg-slate-50/70 opacity-60'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={isSelected ? 'info' : 'default'} className="font-mono">
                        <Tag className="w-3 h-3 mr-1" />
                        {v.code}
                      </Badge>
                      <span className="text-xs font-bold text-slate-900">{v.title}</span>
                    </div>
                    <p className="text-2xs text-slate-500">{v.description}</p>
                    <p className="text-3xs text-slate-400">
                      Đơn tối thiểu: {formatVND(v.minOrderAmount)} • HSD: {formatVNDate(v.expiresAt)}
                    </p>
                    {!v.isApplicable && v.unapplicableReason && (
                      <p className="text-3xs text-rose-500 font-medium">{v.unapplicableReason}</p>
                    )}
                  </div>

                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    disabled={!v.isApplicable}
                    onClick={() => {
                      onSelect(v.code);
                      onClose();
                    }}
                    className="h-8 text-xs shrink-0"
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> Đã chọn
                      </>
                    ) : (
                      'Áp dụng'
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

