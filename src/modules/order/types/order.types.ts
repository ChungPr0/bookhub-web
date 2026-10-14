export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderAction =
  | 'CANCEL'
  | 'CONFIRM_DELIVERY'
  | 'RETRY_PAYMENT'
  | 'REORDER'
  | 'REVIEW';

export interface VoucherDto {
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiresAt: string;
  isApplicable: boolean;
  unapplicableReason?: string;
}

export interface CheckoutPreviewRequest {
  shippingAddressId?: number;
  voucherCode?: string | null;
  usePoints?: boolean;
}

export interface CheckoutPreviewResponse {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsDiscount: number;
  pointsEarned: number;
  finalAmount: number;
  availableVouchers: VoucherDto[];
}

export interface CreateOrderRequest {
  shippingAddressId: number;
  paymentMethod: PaymentMethod;
  voucherCode?: string | null;
  usePoints?: boolean;
  expectedFinalAmount: number;
  customerNote?: string;
}

export interface CreateOrderResponse {
  orderId: number;
  orderCode: string;
  paymentMethod: PaymentMethod;
  paymentUrl?: string | null;
  finalAmount: number;
}

export interface OrderItemDto {
  bookId: number;
  title: string;
  authorName: string;
  primaryImageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description?: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface OrderSummaryDto {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  finalAmount: number;
  itemCount: number;
  firstItemTitle: string;
  firstItemImageUrl: string;
  createdAt: string;
}

export interface OrderDetailDto {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsDiscount: number;
  finalAmount: number;
  customerNote?: string;
  createdAt: string;
  items: OrderItemDto[];
  allowedActions: OrderAction[];
  timeline: OrderTimelineStep[];
}

export interface AdminOrderDto {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  finalAmount: number;
  createdAt: string;
}

