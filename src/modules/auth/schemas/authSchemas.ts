import { z } from 'zod';

export const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,64}$/;

export const loginSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ (10 chữ số, đầu 03/05/07/08/09)'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const requestOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ'),
});

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>;

export const registerSchema = z
  .object({
    phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ'),
    otp: z.string().length(6, 'Mã OTP gồm đúng 6 chữ số').regex(/^[0-9]{6}$/, 'OTP chỉ bao gồm chữ số'),
    fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100, 'Họ và tên tối đa 100 ký tự'),
    password: z
      .string()
      .regex(
        passwordRegex,
        'Mật khẩu phải từ 8-64 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số, không có khoảng trắng'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, 'Mã xác thực không hợp lệ'),
    newPassword: z
      .string()
      .regex(
        passwordRegex,
        'Mật khẩu phải từ 8-64 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số, không có khoảng trắng'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .regex(
        passwordRegex,
        'Mật khẩu mới phải từ 8-64 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

