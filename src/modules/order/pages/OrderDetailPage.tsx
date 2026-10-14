import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  XCircle,
  CheckCircle,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import {
  useOrderDetailQuery,
  useCancelOrderMutation,
  useConfirmDeliveryMutation,
  useRetryPaymentMutation,
  useReorderMutation,
} from '../hooks/useOrderQueries';
import { OrderTimeline } from '../components/OrderTimeline';
import { formatVND } from '@/core/utils/currency';
import { maskPhone } from '@/core/utils/masking';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';

export const OrderDetailPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: order, isLoading, isError } = useOrderDetailQuery(orderCode || '');

  const cancelMutation = useCancelOrderMutation(orderCode || '');
  const confirmDeliveryMutation = useConfirmDeliveryMutation(orderCode || '');
  const retryPaymentMutation = useRetryPaymentMutation(orderCode || '');
  const reorderMutation = useReorderMutation();

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải chi tiết đơn hàng...</div>;
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Không tìm thấy đơn hàng"
        description="Đơn hàng không tồn tại hoặc bạn không có quyền truy cập."
        actionLabel="Quay lại danh sách đơn"
        onAction={() => (window.location.href = '/me/orders')}
      />
    );
  }

  const allowedActions = order.allowedActions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/me/orders"
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              #{order.orderCode}
            </h1>
            <Badge variant="info">{order.status}</Badge>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex items-center gap-2">
          {allowedActions.includes('CANCEL') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Hủy đơn hàng
            </Button>
          )}

          {allowedActions.includes('CONFIRM_DELIVERY') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => confirmDeliveryMutation.mutate()}
              isLoading={confirmDeliveryMutation.isPending}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Đã nhận được hàng
            </Button>
          )}

          {allowedActions.includes('RETRY_PAYMENT') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => retryPaymentMutation.mutate()}
              isLoading={retryPaymentMutation.isPending}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Thanh toán lại
            </Button>
          )}

          {allowedActions.includes('REORDER') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => reorderMutation.mutate(order.orderCode)}
              isLoading={reorderMutation.isPending}
              leftIcon={<ShoppingBag className="w-4 h-4" />}
            >
              Mua lại
            </Button>
          )}
        </div>
      </div>

      {/* Timeline Card */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Tiến trình đơn hàng</h3>
          <OrderTimeline steps={order.timeline} />
        </div>
      )}

      {/* Recipient & Payment info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-blue-600" /> Thông tin giao hàng
          </div>
          <p className="font-bold text-slate-800">
            {order.recipientName} ({maskPhone(order.recipientPhone)})
          </p>
          <p className="text-slate-600">{order.shippingAddress}</p>
          {order.customerNote && (
            <p className="text-3xs text-slate-400 italic">Ghi chú: {order.customerNote}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Hình thức thanh toán
          </div>
          <p className="font-bold text-slate-800">
            Phương thức: {order.paymentMethod}
          </p>
          <p className="text-slate-600">
            Trạng thái thanh toán: <Badge size="sm">{order.paymentStatus}</Badge>
          </p>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Kiện hàng ({order.items.length} món)
        </h3>
        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                  alt={item.title}
                  className="w-10 h-14 object-cover rounded-md border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-slate-800">{item.title}</h5>
                  <p className="text-2xs text-slate-400">
                    Số lượng: {item.quantity} x {formatVND(item.unitPrice)}
                  </p>
                </div>
              </div>
              <span className="font-bold text-slate-900">{formatVND(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Tiền hàng:</span>
            <span>{formatVND(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Phí vận chuyển:</span>
            <span>{formatVND(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Giảm giá voucher:</span>
              <span>-{formatVND(order.discountAmount)}</span>
            </div>
          )}
          {order.pointsDiscount > 0 && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Giảm giá điểm thưởng:</span>
              <span>-{formatVND(order.pointsDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-blue-600 pt-2 border-t border-slate-100">
            <span>Tổng thanh toán:</span>
            <span>{formatVND(order.finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirm Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => {
          cancelMutation.mutate('Người mua thay đổi ý định');
          setIsCancelModalOpen(false);
        }}
        title="Xác nhận hủy đơn hàng"
        description="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmLabel="Hủy đơn hàng"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};

