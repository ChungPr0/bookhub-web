import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Tag,
  CreditCard,
  Truck,
  ShieldCheck,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { useCartQuery } from '@/modules/cart/hooks/useCartQueries';
import { useUserAddressesQuery } from '@/modules/user/hooks/useUserQueries';
import {
  useCheckoutPreviewQuery,
  useCreateOrderMutation,
} from '../hooks/useOrderQueries';
import { VoucherSelectModal } from '../components/VoucherSelectModal';
import { PriceSlippageModal } from '../components/PriceSlippageModal';
import { PaymentMethod } from '../types/order.types';
import { formatVND } from '@/core/utils/currency';
import { maskPhone } from '@/core/utils/masking';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiErrorResponse } from '@/core/types/api.types';
import { toast } from 'sonner';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>();
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);

  // Queries
  const { data: cart } = useCartQuery();
  const { data: addresses = [], isLoading: isLoadingAddresses } = useUserAddressesQuery();

  // Derive active shipping address without cascading renders
  const effectiveAddressId =
    selectedAddressId ?? (addresses.find((a) => a.isDefault)?.id || addresses[0]?.id);

  const {
    data: preview,
    isLoading: isLoadingPreview,
    refetch: refetchPreview,
  } = useCheckoutPreviewQuery({
    shippingAddressId: effectiveAddressId,
    voucherCode: selectedVoucherCode,
    usePoints,
  });

  const createOrderMutation = useCreateOrderMutation();

  const selectedItems = (cart?.items || []).filter((i) => i.selected && i.inStock);

  const handlePlaceOrder = () => {
    if (!effectiveAddressId) {
      toast.error('Vui lòng chọn hoặc thêm địa chỉ nhận hàng');
      return;
    }

    if (!preview) {
      toast.error('Đang cập nhật thông tin đơn hàng, vui lòng chờ trong giây lát');
      return;
    }

    createOrderMutation.mutate(
      {
        shippingAddressId: effectiveAddressId,
        paymentMethod,
        voucherCode: selectedVoucherCode,
        usePoints,
        // Anti-price slippage invariant from Rule 5.4
        expectedFinalAmount: preview.finalAmount,
      },
      {
        onSuccess: (data) => {
          if (!data.paymentUrl) {
            navigate(`/me/orders/${data.orderCode}`, { replace: true });
          }
        },
        onError: (err: unknown) => {
          const error = err as ApiErrorResponse;
          if (error?.code === 'PRICE_SLIPPAGE_DETECTED') {
            setIsSlippageModalOpen(true);
          } else {
            toast.error(error?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
          }
        },
      }
    );
  };

  const selectedAddress = addresses.find((a) => a.id === effectiveAddressId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          Xác Nhận &amp; Thanh Toán Đơn Hàng
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kiểm tra thông tin người nhận, chương trình khuyến mãi và phương thức thanh toán
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checkout Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Shipping Address */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <MapPin className="w-4 h-4 text-blue-600" /> Địa chỉ giao hàng
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/me/addresses')}
                className="text-xs"
              >
                {addresses.length > 0 ? 'Thay đổi địa chỉ' : 'Thêm địa chỉ mới'}
              </Button>
            </div>

            {isLoadingAddresses ? (
              <Skeleton className="h-16 w-full" />
            ) : selectedAddress ? (
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedAddress.recipientName}
                    </span>
                    <span className="text-slate-500 font-mono">
                      ({maskPhone(selectedAddress.phone)})
                    </span>
                    {selectedAddress.isDefault && <Badge variant="info">Mặc định</Badge>}
                  </div>
                  <p className="text-slate-600">
                    {selectedAddress.detailAddress}, {selectedAddress.ward}, {selectedAddress.district},{' '}
                    {selectedAddress.province}
                  </p>
                </div>

                {addresses.length > 1 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Chọn địa chỉ nhận hàng khác:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`text-left p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                            addr.id === effectiveAddressId
                              ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="font-semibold truncate">
                            {addr.recipientName} ({maskPhone(addr.phone)})
                          </div>
                          <div className="text-2xs text-slate-500 truncate mt-0.5">
                            {addr.detailAddress}, {addr.province}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Bạn chưa có địa chỉ nhận hàng nào. Vui lòng bấm &ldquo;Thêm địa chỉ mới&rdquo; để tiếp tục.
              </p>
            )}
          </div>

          {/* Section 2: Selected Items Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Truck className="w-4 h-4 text-emerald-600" /> Danh sách sách đặt mua ({selectedItems.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cart')}
                className="text-xs text-blue-600 hover:underline p-0 h-auto"
              >
                Chỉnh sửa giỏ hàng
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {selectedItems.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-2xs text-slate-400">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 text-right shrink-0">
                    {formatVND(item.salePrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Promotions & Vouchers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Tag className="w-4 h-4 text-purple-600" /> Khuyến mãi &amp; Điểm thưởng
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVoucherModalOpen(true)}
                className="text-xs"
              >
                {selectedVoucherCode ? 'Đổi mã khác' : 'Chọn Voucher'}
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Voucher áp dụng:</span>
              {selectedVoucherCode ? (
                <Badge variant="success" className="font-mono">
                  {selectedVoucherCode}
                </Badge>
              ) : (
                <span className="text-slate-400">Chưa chọn mã giảm giá</span>
              )}
            </div>

            {/* Member points toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-700">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Sử dụng điểm tích lũy thành viên</span>
              </div>
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Payment Methods */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-blue-600" /> Phương thức thanh toán
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'COD' as PaymentMethod,
                  title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                  desc: 'Thanh toán trực tiếp cho nhân viên bưu tá khi nhận kiện hàng',
                },
                {
                  id: 'VNPAY' as PaymentMethod,
                  title: 'Cổng thanh toán VNPay (Thẻ ATM / QR Pay / Visa)',
                  desc: 'Chuyển hướng cổng VNPay bảo mật, hỗ trợ quét mã VietQR ngân hàng',
                },
                {
                  id: 'BANK_TRANSFER' as PaymentMethod,
                  title: 'Chuyển khoản trực tiếp qua ngân hàng',
                  desc: 'Chuyển khoản theo số tài khoản đính kèm mã đơn hàng',
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'border-blue-500 bg-blue-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{m.title}</h5>
                    <p className="text-3xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing Box */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Chi tiết thanh toán
          </h3>

          {isLoadingPreview ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền hàng ({selectedItems.length} sản phẩm):</span>
                <span className="font-bold text-slate-900">
                  {formatVND(preview?.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-slate-900">
                  {formatVND(preview?.shippingFee || 0)}
                </span>
              </div>
              {preview?.discountAmount && preview.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá voucher:</span>
                  <span>-{formatVND(preview.discountAmount)}</span>
                </div>
              ) : null}
              {preview?.pointsDiscount && preview.pointsDiscount > 0 ? (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Điểm thưởng tích lũy:</span>
                  <span>-{formatVND(preview.pointsDiscount)}</span>
                </div>
              ) : null}

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-xl font-black text-blue-600">
                  {formatVND(preview?.finalAmount || 0)}
                </span>
              </div>

              {preview?.pointsEarned && preview.pointsEarned > 0 ? (
                <p className="text-3xs text-emerald-600 text-center font-medium bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                  Đơn hàng này tích lũy được +{preview.pointsEarned} điểm thưởng
                </p>
              ) : null}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md"
            isLoading={createOrderMutation.isPending}
            disabled={!effectiveAddressId || selectedItems.length === 0 || isLoadingPreview}
            onClick={handlePlaceOrder}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPay' : 'Xác nhận đặt hàng'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-2xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Thanh toán bảo mật chuẩn SSL 256-bit</span>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {preview && (
        <VoucherSelectModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          vouchers={preview.availableVouchers || []}
          selectedCode={selectedVoucherCode}
          onSelect={(code) => setSelectedVoucherCode(code)}
        />
      )}

      {/* Price Slippage Catch Modal */}
      <PriceSlippageModal
        isOpen={isSlippageModalOpen}
        onClose={() => setIsSlippageModalOpen(false)}
        onConfirmRefresh={() => refetchPreview()}
      />
    </div>
  );
};
