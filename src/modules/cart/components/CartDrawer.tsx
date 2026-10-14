import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import {
  useCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from '../hooks/useCartQueries';
import { CartItemRow } from './CartItemRow';
import { CartSkeleton } from './CartSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatVND } from '@/core/utils/currency';

export const CartDrawer: React.FC = () => {
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const toggleGuestSelect = useCartStore((state) => state.toggleGuestSelect);
  const navigate = useNavigate();

  const { data: cart, isLoading } = useCartQuery();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.selectableSubtotal || 0;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleGoToCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Giỏ hàng của bạn ({cart?.totalItems || 0})
            </h3>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              title="Giỏ hàng trống"
              description="Bạn chưa chọn cuốn sách nào vào giỏ hàng."
              actionLabel="Khám phá ngay"
              onAction={() => {
                closeDrawer();
                navigate('/books');
              }}
            />
          ) : (
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
          )}
        </div>

        {/* Footer Summary & Action */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-500">Tạm tính:</span>
              <span className="text-base font-extrabold text-blue-600">
                {formatVND(subtotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" size="md" onClick={handleGoToCart}>
                Xem giỏ hàng
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckout}
                disabled={subtotal === 0}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
