import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  bookId: z.number().min(1, 'Vui lòng chọn sách cần kiểm kê'),
  actualQuantity: z.number().min(0, 'Số lượng thực tế kiểm đếm không được âm'),
  systemQuantity: z.number().min(0),
  reason: z.string().min(5, 'Lý do điều chỉnh tối thiểu 5 ký tự').max(255, 'Lý do tối đa 255 ký tự'),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

