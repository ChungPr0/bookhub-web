import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { formatVND } from '@/core/utils/currency';
import { Button } from '@/components/ui/Button';

export const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const responseCode = searchParams.get('vnp_ResponseCode');
  const orderCode = searchParams.get('vnp_TxnRef') || '';
  const amountStr = searchParams.get('vnp_Amount');
  const amount = amountStr ? Number(amountStr) / 100 : 0;
  const isSuccess = responseCode === '00';

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}
      >
        {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-black text-slate-900">
          {isSuccess ? 'Thanh Toán Thành Công!' : 'Giao Dịch Không Thành Công'}
        </h2>
        <p className="text-xs text-slate-500">
          {isSuccess
            ? 'Cổng thanh toán VNPay đã ghi nhận giao dịch của bạn thành công.'
            : 'Giao dịch bị từ chối hoặc đã bị hủy bởi người dùng. Bạn có thể thanh toán lại trong vòng 15 phút.'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2 text-left">
        <div className="flex justify-between">
          <span className="text-slate-500">Mã đơn hàng:</span>
          <span className="font-bold text-slate-900 font-mono">{orderCode || 'N/A'}</span>
        </div>
        {amount > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Số tiền:</span>
            <span className="font-bold text-blue-600">{formatVND(amount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Phương thức:</span>
          <span className="font-medium text-slate-800">Cổng VNPay</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Mã kết quả:</span>
          <span className="font-mono text-slate-700">{responseCode || 'FAILED'}</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {isSuccess ? (
          <Link to={`/me/orders/${orderCode}`} className="block">
            <Button variant="primary" size="lg" className="w-full font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Xem chi tiết đơn hàng
            </Button>
          </Link>
        ) : (
          <Link to={`/me/orders/${orderCode}`} className="block">
            <Button variant="primary" size="lg" className="w-full font-bold" leftIcon={<RotateCcw className="w-4 h-4" />}>
              Thanh toán lại đơn hàng
            </Button>
          </Link>
        )}

        <Link to="/" className="block">
          <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500">
            Quay về trang chủ BookHub
          </Button>
        </Link>
      </div>
    </div>
  );
};

