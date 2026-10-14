import React, { useState } from 'react';
import { Search, Lock, Unlock } from 'lucide-react';
import {
  useAdminCustomersQuery,
  useToggleCustomerLockMutation,
} from '../../hooks/useUserQueries';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatVND } from '@/core/utils/currency';
import { formatVNDate } from '@/core/utils/dateTime';

export const AdminCustomerListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminCustomersQuery({
    search: search || undefined,
    page,
    size: 10,
  });

  const toggleLockMutation = useToggleCustomerLockMutation();

  const customers = data?.items || [];
  const pageMetadata = data?.page;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Khách Hàng"
        description="Xem danh sách tài khoản khách hàng, tổng chi tiêu và kiểm soát trạng thái khóa tài khoản"
      />

      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách khách hàng...</div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy khách hàng nào"
            description="Chưa có khách hàng nào phù hợp với từ khóa tìm kiếm."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Hạng thành viên</th>
                  <th className="py-3 px-4 text-center">Đơn hàng</th>
                  <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Ngày đăng ký</th>
                  <th className="py-3 px-4 text-right">Khóa / Mở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.fullName}</td>
                    <td className="py-3 px-4 font-mono">{c.phone}</td>
                    <td className="py-3 px-4">
                      <Badge variant="info" size="sm">
                        {c.membershipTier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{c.totalOrders}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-blue-600">
                      {formatVND(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={c.isLocked ? 'destructive' : 'success'} size="sm">
                        {c.isLocked ? 'Đã khóa' : 'Hoạt động'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatVNDate(c.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={c.isLocked ? 'outline' : 'destructive'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleLockMutation.mutate(c.id)}
                        isLoading={toggleLockMutation.isPending}
                        leftIcon={
                          c.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />
                        }
                      >
                        {c.isLocked ? 'Mở khóa' : 'Khóa'}
                      </Button>
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

