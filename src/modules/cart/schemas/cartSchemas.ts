import { z } from 'zod';

export const addToCartSchema = z.object({
  bookId: z.number().min(1, 'Mã sách không hợp lệ'),
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1').max(99, 'Số lượng tối đa mỗi đầu sách là 99'),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1').max(99, 'Số lượng tối đa mỗi đầu sách là 99'),
});

