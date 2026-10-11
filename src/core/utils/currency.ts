/**
 * Currency Utility for VND (64-bit integer standard)
 */
export const formatVND = (value: number | bigint | null | undefined): string => {
  if (value === null || value === undefined) return '0 ₫';
  const num = typeof value === 'bigint' ? Number(value) : value;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
};

