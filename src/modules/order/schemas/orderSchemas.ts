import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddressId: z.number().min(1, 'Vui lòng chọn địa chỉ giao hàng'),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'VNPAY']),
  voucherCode: z.string().optional().nullable(),
  usePoints: z.boolean().default(false),
  customerNote: z.string().max(255, 'Ghi chú tối đa 255 ký tự').optional(),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'Lý do hủy đơn tối thiểu 5 ký tự').max(200, 'Lý do hủy đơn tối đa 200 ký tự'),
});

export type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

