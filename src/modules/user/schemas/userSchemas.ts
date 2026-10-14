import { z } from 'zod';
import { passwordRegex, phoneRegex } from '@/modules/auth/schemas/authSchemas';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100, 'Họ và tên tối đa 100 ký tự'),
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').optional().or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  recipientName: z.string().min(2, 'Tên người nhận tối thiểu 2 ký tự').max(100),
  phone: z.string().regex(phoneRegex, 'Số điện thoại người nhận không hợp lệ (10 chữ số)'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  detailAddress: z.string().min(5, 'Địa chỉ cụ thể tối thiểu 5 ký tự').max(255),
  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100),
  phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ'),
  password: z.string().regex(passwordRegex, 'Mật khẩu phải từ 8-64 ký tự, có chữ hoa, chữ thường và số'),
  role: z.enum(['STAFF', 'MANAGER', 'ADMIN']),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
