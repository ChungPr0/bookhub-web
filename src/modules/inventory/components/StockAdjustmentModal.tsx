import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Sliders } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import {
  stockAdjustmentSchema,
  StockAdjustmentFormData,
} from '../schemas/inventorySchemas';
import { useStockAdjustmentMutation } from '../hooks/useInventoryQueries';

export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle: string;
  systemQuantity: number;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  systemQuantity,
}) => {
  const adjustmentMutation = useStockAdjustmentMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      bookId,
      systemQuantity,
      actualQuantity: systemQuantity,
      reason: '',
    },
    values: {
      bookId,
      systemQuantity,
      actualQuantity: systemQuantity,
      reason: '',
    },
  });

  const actualQty = useWatch({ control, name: 'actualQuantity' });
  const difference = (Number(actualQty) || 0) - systemQuantity;

  const onSubmit = (data: StockAdjustmentFormData) => {
    adjustmentMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phiếu Điều Chỉnh Kiểm Kê Kho"
      description={`Cân đối chênh lệch số lượng thực tế cho tác phẩm "${bookTitle}"`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Tồn kho trên hệ thống:</span>
            <span className="font-bold text-slate-900 font-mono">{systemQuantity} cuốn</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Chênh lệch kiểm đếm:</span>
            <Badge
              variant={difference === 0 ? 'default' : difference > 0 ? 'success' : 'destructive'}
              size="sm"
            >
              {difference > 0 ? `Thừa +${difference}` : difference < 0 ? `Thiếu ${difference}` : 'Khớp 0'}
            </Badge>
          </div>
        </div>

        <Input
          label="Số lượng thực tế kiểm đếm"
          type="number"
          min={0}
          required
          error={errors.actualQuantity?.message}
          {...register('actualQuantity', { valueAsNumber: true })}
        />

        <Textarea
          label="Lý do điều chỉnh kiểm kê"
          placeholder="VD: Kiểm kê định kỳ tháng 10 phát hiện thất lạc/rách nát..."
          required
          rows={3}
          error={errors.reason?.message}
          {...register('reason')}
        />

        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2 text-2xs text-blue-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Hành động này sẽ ghi nhận một chứng từ điều chỉnh vào Thẻ kho điện tử kèm mã bảo vệ Idempotency-Key chống trùng lặp.
          </span>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={adjustmentMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={adjustmentMutation.isPending}
            leftIcon={<Sliders className="w-4 h-4" />}
          >
            Xác nhận điều chỉnh
          </Button>
        </div>
      </form>
    </Modal>
  );
};
