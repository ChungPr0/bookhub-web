/**
 * Data Masking utilities conforming to rules.md BR rules
 */

/**
 * Mask phone numbers: "0988888888" -> "098****888"
 */
export const maskPhone = (phone: string | null | undefined): string => {
  if (!phone || phone.length < 10) return phone || '';
  return `${phone.substring(0, 3)}****${phone.substring(phone.length - 3)}`;
};

/**
 * Mask customer full name in public reviews: "Nguyễn Văn A" -> "Nguyễn V. A."
 */
export const maskFullName = (fullName: string | null | undefined): string => {
  if (!fullName) return 'Khách hàng';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const maskedMiddle = parts.slice(1).map((p) => `${p.charAt(0).toUpperCase()}.`).join(' ');
  return `${firstName} ${maskedMiddle}`;
};

