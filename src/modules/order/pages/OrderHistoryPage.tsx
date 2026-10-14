import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { useOrdersQuery } from '../hooks/useOrderQueries';
import { OrderStatus } from '../types/order.types';
import { formatVND } from '@/core/utils/currency';
import { formatVNDateTime } from '@/core/utils/dateTime';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';

export const OrderHistoryPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useOrdersQuery(selectedStatus, page, 10);

  const orders = data?.items || [];
  const pageMetadata = data?.page;

  const statusTabs: Array<{ label: string; status?: OrderStatus }> = [
    { label: 'Tất cả' },
    { label: 'Chờ xử lý', status: 'PENDING' },
    { label: 'Đã xác nhận', status: 'CONFIRMED' },
    { label: 'Đang vận chuyển', status: 'SHIPPING' },
    { label: 'Đã giao hàng', status: 'DELIVERED' },
    { label: 'Đã hủy', status: 'CANCELLED' },
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info">Đã xác nhận</Badge>;
      case 'SHIPPING':
        return <Badge variant="default" className="bg-purple-50 text-purple-700 border-purple-200">Đang giao</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Giao thành công</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Đơn Hàng Của Tôi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi tiến độ vận chuyển và lịch sử mua sắm của bạn tại BookHub
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {statusTabs.map((tab, idx) => {
          const isActive = selectedStatus === tab.status;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.status);
                setPage(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải lịch sử đơn hàng...</div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-10 h-10 text-slate-400 stroke-[1.5]" />}
            title="Không tìm thấy đơn hàng nào"
            description="Bạn chưa có đơn hàng nào trong trạng thái này."
            actionLabel="Mua sách ngay"
            onAction={() => (window.location.href = '/books')}
          />
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono">{ord.orderCode}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{formatVNDateTime(ord.createdAt)}</span>
                </div>
                {getStatusBadge(ord.status)}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={ord.firstItemImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                    alt={ord.firstItemTitle}
                    className="w-12 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                      {ord.firstItemTitle}
                    </h4>
                    {ord.itemCount > 1 && (
                      <p className="text-2xs text-slate-400">
                        Và {ord.itemCount - 1} tác phẩm khác
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-3xs text-slate-400 block">Tổng tiền</span>
                  <span className="text-sm sm:text-base font-extrabold text-blue-600">
                    {formatVND(ord.finalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Link to={`/me/orders/${ord.orderCode}`}>
                  <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Xem chi tiết đơn hàng
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}

        {pageMetadata && pageMetadata.totalPages > 1 && (
          <Pagination page={pageMetadata} onPageChange={(p) => setPage(p)} />
        )}
      </div>
    </div>
  );
};

