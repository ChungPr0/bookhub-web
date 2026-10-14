import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  useCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '../hooks/useCartQueries';
import { useCartStore } from '../store/useCartStore';
import { CartItemRow } from '../components/CartItemRow';
import { CartSkeleton } from '../components/CartSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatVND } from '@/core/utils/currency';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const toggleGuestSelect = useCartStore((state) => state.toggleGuestSelect);
  const toggleGuestSelectAll = useCartStore((state) => state.toggleGuestSelectAll);

  const { data: cart, isLoading } = useCartQuery();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const clearMutation = useClearCartMutation();

  const items = cart?.items || [];
  const selectableSubtotal = cart?.selectableSubtotal || 0;
  const isAllSelected = items.length > 0 && items.every((i) => i.selected);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <h1 className="text-2xl font-bold text-slate-900">Giỏ Hàng Của Bạn</h1>
        <CartSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-slate-400 stroke-[1.5]" />}
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá các tác phẩm đặc sắc tại BookHub và thêm vào giỏ hàng ngay hôm nay!"
          actionLabel="Tiếp tục mua sắm"
          onAction={() => navigate('/books')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Có {cart?.totalItems || 0} sản phẩm trong giỏ hàng
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearMutation.mutate()}
          isLoading={clearMutation.isPending}
          className="text-xs text-slate-500 hover:text-rose-600"
        >
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleGuestSelectAll(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Chọn tất cả ({items.length} món)</span>
            </label>
            <span>Đơn giá</span>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <CartItemRow
                key={item.itemId}
                item={item}
                onUpdateQuantity={(itemId, bookId, qty) =>
                  updateMutation.mutate({ itemId, bookId, payload: { quantity: qty } })
                }
                onRemove={(itemId, bookId) => removeMutation.mutate({ itemId, bookId })}
                onToggleSelect={(bookId) => toggleGuestSelect(bookId)}
                isUpdating={updateMutation.isPending || removeMutation.isPending}
              />
            ))}
          </div>

          <div className="pt-4">
            <Link
              to="/books"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Tiếp tục lựa chọn thêm sách
            </Link>
          </div>
        </div>

        {/* Sticky Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Tóm tắt đơn hàng
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-bold text-slate-900">{formatVND(selectableSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển:</span>
              <span className="text-slate-500">Tính khi đặt hàng</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Giảm giá voucher:</span>
              <span className="text-emerald-600 font-semibold">- 0 ₫</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
            <span className="text-xl font-black text-blue-600">
              {formatVND(selectableSubtotal)}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md"
            disabled={selectableSubtotal === 0}
            onClick={() => navigate('/checkout')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Tiến hành đặt hàng
          </Button>

          <p className="text-3xs text-slate-400 text-center leading-relaxed">
            Bằng việc tiến hành đặt hàng, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Đổi trả của BookHub.
          </p>
        </div>
      </div>
    </div>
  );
};

