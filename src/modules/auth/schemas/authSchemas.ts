import { z } from 'zod';

export const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,64}$/;
export const otpRegex = /^[0-9]{6}$/;

/**
 * Normalizes any phone input format to the authoritative 10-digit Vietnamese format starting with 0:
 * 1. Xóa toàn bộ khoảng trắng, dấu gạch ngang, dấu chấm.
 * 2. Nếu bắt đầu bằng +84 -> thay +84 bằng 0.
 * 3. Nếu bắt đầu bằng 84 (và tổng độ dài là 11 số) -> thay 84 bằng 0.
 * 4. Nếu bắt đầu bằng 3, 5, 7, 8, 9 (và có 9 chữ số) -> tự động nối thêm số 0 vào đầu.
 * Output: Chuỗi 10 chữ số bắt đầu bằng 0 (ví dụ: "0833190583").
 */
export const normalizePhoneToZero = (raw: string): string => {
  if (!raw) return '';
  let cleaned = raw.trim().replace(/[\s.()-]+/g, '');

  if (cleaned.startsWith('+84')) {
    const after = cleaned.slice(3);
    cleaned = after.startsWith('0') ? after : '0' + after;
  } else if (cleaned.startsWith('84') && (cleaned.length === 11 || cleaned.length === 12)) {
    const after = cleaned.slice(2);
    cleaned = after.startsWith('0') ? after : '0' + after;
  } else if (/^[35789][0-9]{8}$/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }

  // Lọc chỉ giữ chữ số
  cleaned = cleaned.replace(/\D/g, '');

  return cleaned;
};

/**
 * Extracts national 9 digits behind +84 for UI display in PhoneInput:
 * e.g. "0833190583" -> "833190583", "+84833190583" -> "833190583"
 */
export const extractNationalNumber = (raw: string): string => {
  if (!raw) return '';
  let cleaned = raw.trim().replace(/[\s.-]+/g, '');

  if (cleaned.startsWith('+84')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('84') && cleaned.length >= 11) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  return cleaned.replace(/\D/g, '').slice(0, 9);
};

export const isValidPhone = (input: string): boolean => {
  const normalized = normalizePhoneToZero(input);
  return phoneRegex.test(normalized);
};

export interface PasswordStrengthResult {
  length: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  noSpace: boolean;
  hasSpace: boolean;
  hasSpecial: boolean;
  isValidBR01: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

/**
 * BR-01: Password strength evaluation
 * Mandatory:
 * 1. 8-64 characters
 * 2. At least 1 uppercase letter ([A-Z])
 * 3. At least 1 lowercase letter ([a-z])
 * 4. At least 1 number ([0-9])
 * 5. No whitespace
 * Bonus:
 * - Special character or length >= 12
 */
export const evaluatePasswordStrength = (value: string): PasswordStrengthResult => {
  if (!value) {
    return {
      length: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      noSpace: true,
      hasSpace: false,
      hasSpecial: false,
      isValidBR01: false,
      score: 0,
      label: '',
    };
  }

  const length = value.length >= 8 && value.length <= 64;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpace = /\s/.test(value);
  const noSpace = !hasSpace;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\\/~`[\]]/.test(value);

  const isValidBR01 = length && hasUpper && hasLower && hasNumber && noSpace;

  let score: 0 | 1 | 2 | 3 | 4 = 1;
  let label = 'Rất yếu - Chưa đạt chuẩn';

  if (!length || hasSpace) {
    score = 1;
    label = 'Rất yếu - Chưa đạt chuẩn';
  } else {
    const criteriaCount = (hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + (hasNumber ? 1 : 0);
    if (criteriaCount < 3) {
      score = 2;
      label = 'Yếu - Cần thêm ký tự bắt buộc';
    } else {
      if (hasSpecial || value.length >= 12) {
        score = 4;
        label = 'Mật khẩu mạnh';
      } else {
        score = 3;
        label = 'Đạt chuẩn';
      }
    }
  }

  return {
    length,
    hasUpper,
    hasLower,
    hasNumber,
    noSpace,
    hasSpace,
    hasSpecial,
    isValidBR01,
    score,
    label,
  };
};

export const isValidPassword = (password: string): boolean => {
  return evaluatePasswordStrength(password).isValidBR01;
};

export const loginSchema = z.object({
  phone: z.string().refine(isValidPhone, { message: 'Số điện thoại không đúng định dạng' }),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const requestOtpSchema = z.object({
  phone: z.string().refine(isValidPhone, { message: 'Số điện thoại không đúng định dạng' }),
});

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>;

export const registerSchema = z
  .object({
    phone: z.string().refine(isValidPhone, { message: 'Số điện thoại không đúng định dạng' }),
    otpCode: z.string().length(6, 'Mã OTP gồm đúng 6 chữ số').regex(otpRegex, 'Mã OTP gồm đúng 6 chữ số'),
    fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100, 'Họ và tên tối đa 100 ký tự'),
    password: z.string().regex(passwordRegex, 'Mật khẩu phải từ 8 ký tự trở lên'),
    confirmPassword: z.string(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    email: z.string().email('Email không đúng định dạng').optional().nullable(),
    birthday: z.string().optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    phone: z.string().refine(isValidPhone, { message: 'Số điện thoại không đúng định dạng' }),
    resetToken: z.string().min(1, 'Mã xác thực không hợp lệ'),
    newPassword: z.string().regex(passwordRegex, 'Mật khẩu mới phải từ 8 ký tự trở lên'),
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
    newPassword: z.string().regex(passwordRegex, 'Mật khẩu mới phải từ 8 ký tự trở lên'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
