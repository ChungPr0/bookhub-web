import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderApi } from '../api/orderApi';
import {
  CheckoutPreviewRequest,
  CreateOrderRequest,
  OrderStatus,
} from '../types/order.types';

export const useCheckoutPreviewQuery = (params: CheckoutPreviewRequest) => {
  return useQuery({
    queryKey: ['checkout', 'preview', params],
    queryFn: () => orderApi.previewCheckout(params),
    staleTime: 30 * 1000,
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => orderApi.createOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (data.paymentUrl) {
        // VNPay Hosted Gateway Redirect
        window.location.href = data.paymentUrl;
      } else {
        toast.success(`Đặt hàng thành công! Mã đơn: ${data.orderCode}`);
      }
    },
  });
};

export const useOrdersQuery = (status?: OrderStatus, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['orders', 'list', status, page, size],
    queryFn: () => orderApi.getOrders(status, page, size),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useOrderDetailQuery = (orderCode: string) => {
  return useQuery({
    queryKey: ['orders', 'detail', orderCode],
    queryFn: () => orderApi.getOrderDetail(orderCode),
    enabled: Boolean(orderCode),
    staleTime: 30 * 1000,
  });
};

export const useCancelOrderMutation = (orderCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => orderApi.cancelOrder(orderCode, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.info('Đã hủy đơn hàng');
    },
    onError: () => {
      toast.error('Không thể hủy đơn hàng vào lúc này');
    },
  });
};

export const useConfirmDeliveryMutation = (orderCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orderApi.confirmDelivery(orderCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Xác nhận đã nhận hàng thành công! Bạn đã được cộng điểm thưởng.');
    },
  });
};

export const useRetryPaymentMutation = (orderCode: string) => {
  return useMutation({
    mutationFn: () => orderApi.retryPayment(orderCode),
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: () => {
      toast.error('Không thể mở cổng thanh toán. Vui lòng thử lại sau.');
    },
  });
};

export const useReorderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderCode: string) => orderApi.reorder(orderCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm toàn bộ sản phẩm của đơn hàng vào giỏ hàng');
    },
  });
};

export const useAdminOrdersQuery = (params: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  size?: number;
} = {}) => {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => orderApi.getAdminOrders(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateAdminOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderCode, status }: { orderCode: string; status: OrderStatus }) =>
      orderApi.updateAdminOrderStatus(orderCode, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    },
  });
};

