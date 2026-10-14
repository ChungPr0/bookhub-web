import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface PriceSlippageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRefresh: () => void;
}

export const PriceSlippageModal: React.FC<PriceSlippageModalProps> = ({
  isOpen,
  onClose,
  onConfirmRefresh,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Biến Động Giá Hoặc Khuyến Mãi</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Giá bán một số đầu sách hoặc chương trình voucher vừa được cập nhật trong hệ thống.
            Vui lòng làm mới đơn hàng để kiểm tra số tiền thanh toán chính xác nhất trước khi tiếp tục.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            Quay lại giỏ hàng
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1 font-bold"
            onClick={() => {
              onConfirmRefresh();
              onClose();
            }}
          >
            Cập nhật lại giá
          </Button>
        </div>
      </div>
    </Modal>
  );
};

