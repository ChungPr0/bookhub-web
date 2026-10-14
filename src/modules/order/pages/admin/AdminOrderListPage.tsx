import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import {
  useAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} from '../../hooks/useOrderQueries';
import { OrderStatus } from '../../types/order.types';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatVND } from '@/core/utils/currency';
import { formatVNDateTime } from '@/core/utils/dateTime';

export const AdminOrderListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminOrdersQuery({
    search: search || undefined,
    status,
    page,
    size: 10,
  });

  const updateStatusMutation = useUpdateAdminOrderStatusMutation();

  const orders = data?.items || [];
  const pageMetadata = data?.page;

  const getStatusBadge = (s: OrderStatus) => {
    switch (s) {
      case 'PENDING':
        return <Badge variant="warning">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info">Đã xác nhận</Badge>;
      case 'SHIPPING':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Đang giao</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Đơn Hàng"
        description="Theo dõi toàn bộ đơn hàng, phê duyệt và cập nhật trạng thái vận chuyển"
      />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Tìm theo mã đơn hàng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Trạng thái:</span>
          <Select
            value={status || ''}
            onChange={(e) => {
              setStatus((e.target.value as OrderStatus) || undefined);
              setPage(0);
            }}
            className="w-44 h-9 text-xs"
            options={[
              { label: 'Tất cả trạng thái', value: '' },
              { label: 'Chờ xử lý (PENDING)', value: 'PENDING' },
              { label: 'Đã xác nhận (CONFIRMED)', value: 'CONFIRMED' },
              { label: 'Đang vận chuyển (SHIPPING)', value: 'SHIPPING' },
              { label: 'Đã giao hàng (DELIVERED)', value: 'DELIVERED' },
              { label: 'Đã hủy (CANCELLED)', value: 'CANCELLED' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="Không tìm thấy đơn hàng nào"
            description="Chưa có đơn hàng nào phù hợp với bộ lọc hiện tại."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-center">Thanh toán</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chuyển trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{ord.orderCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{ord.customerName}</p>
                      <p className="text-2xs text-slate-400">{ord.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4">{formatVNDateTime(ord.createdAt)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-blue-600">
                      {formatVND(ord.finalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" size="sm">
                        {ord.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                orderCode: ord.orderCode,
                                status: 'CONFIRMED',
                              })
                            }
                            isLoading={updateStatusMutation.isPending}
                          >
                            Xác nhận
                          </Button>
                        )}
                        {ord.status === 'CONFIRMED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                orderCode: ord.orderCode,
                                status: 'SHIPPING',
                              })
                            }
                            isLoading={updateStatusMutation.isPending}
                          >
                            Giao bưu tá
                          </Button>
                        )}
                        {ord.status === 'SHIPPING' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                orderCode: ord.orderCode,
                                status: 'DELIVERED',
                              })
                            }
                            isLoading={updateStatusMutation.isPending}
                          >
                            Hoàn tất
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-blue-600"
                          onClick={() => (window.location.href = `/me/orders/${ord.orderCode}`)}
                          aria-label="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageMetadata && pageMetadata.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination page={pageMetadata} onPageChange={(p) => setPage(p)} />
          </div>
        )}
      </div>
    </div>
  );
};

