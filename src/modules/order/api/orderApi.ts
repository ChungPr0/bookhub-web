import { axiosClient } from '@/core/http/axiosClient';
import { PageResponse } from '@/core/types/api.types';
import {
  AdminOrderDto,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetailDto,
  OrderStatus,
  OrderSummaryDto,
  VoucherDto,
} from '../types/order.types';

export const orderApi = {
  previewCheckout: async (payload: CheckoutPreviewRequest): Promise<CheckoutPreviewResponse> => {
    const res = await axiosClient.post<CheckoutPreviewResponse>('/me/checkout/preview', payload);
    return res.data;
  },

  createOrder: async (payload: CreateOrderRequest): Promise<CreateOrderResponse> => {
    // Inject Idempotency-Key header (UUID v4) as mandated by Rule 5.3
    const res = await axiosClient.post<CreateOrderResponse>('/me/orders', payload, {
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    });
    return res.data;
  },

  getOrders: async (status?: OrderStatus, page = 0, size = 10): Promise<PageResponse<OrderSummaryDto>> => {
    const res = await axiosClient.get<PageResponse<OrderSummaryDto>>('/me/orders', {
      params: { status, page, size },
    });
    return res.data;
  },

  getOrderDetail: async (orderCode: string): Promise<OrderDetailDto> => {
    const res = await axiosClient.get<OrderDetailDto>(`/me/orders/${orderCode}`);
    return res.data;
  },

  cancelOrder: async (orderCode: string, reason: string): Promise<void> => {
    await axiosClient.post<null>(`/me/orders/${orderCode}/cancel`, { reason });
  },

  confirmDelivery: async (orderCode: string): Promise<void> => {
    await axiosClient.post<null>(`/me/orders/${orderCode}/confirm-delivery`);
  },

  retryPayment: async (orderCode: string): Promise<{ paymentUrl: string }> => {
    const res = await axiosClient.post<{ paymentUrl: string }>(
      `/me/orders/${orderCode}/retry-payment`
    );
    return res.data;
  },

  reorder: async (orderCode: string): Promise<void> => {
    await axiosClient.post<null>(`/me/orders/${orderCode}/reorder`);
  },

  getAvailableVouchers: async (): Promise<VoucherDto[]> => {
    const res = await axiosClient.get<VoucherDto[]>('/me/vouchers/available');
    return res.data;
  },

  getAdminOrders: async (params: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<AdminOrderDto>> => {
    const res = await axiosClient.get<PageResponse<AdminOrderDto>>('/admin/orders', {
      params,
    });
    return res.data;
  },

  updateAdminOrderStatus: async (orderCode: string, status: OrderStatus): Promise<void> => {
    await axiosClient.patch<null>(`/admin/orders/${orderCode}/status`, { status });
  },
};

