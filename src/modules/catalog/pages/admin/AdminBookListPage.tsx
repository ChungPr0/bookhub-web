import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Power } from 'lucide-react';
import { useAdminBooksQuery, useToggleBookStatusMutation } from '../../hooks/useCatalogQueries';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatVND } from '@/core/utils/currency';
import { formatVNDate } from '@/core/utils/dateTime';

export const AdminBookListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminBooksQuery({ page, size: 10, search: search || undefined });
  const toggleMutation = useToggleBookStatusMutation();

  const books = data?.items || [];
  const pageMetadata = data?.page;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Danh Mục Sách"
        description="Xem danh sách, cập nhật thông tin và quản lý trạng thái kinh doanh sách"
        actions={
          <Link to="/admin/books/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Thêm sách mới
            </Button>
          </Link>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Tìm theo tên sách, ISBN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải dữ liệu sách...</div>
        ) : books.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sách nào"
            description="Chưa có sách nào phù hợp với điều kiện tìm kiếm hiện tại."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tác phẩm</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4 text-right">Giá bán</th>
                  <th className="py-3 px-4 text-center">Tồn kho</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                          alt={b.title}
                          className="w-8 h-11 object-cover rounded-sm bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{b.title}</p>
                          <p className="text-2xs text-slate-400">{b.authorName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{b.isbn}</td>
                    <td className="py-3 px-4">{b.categoryName}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600">
                      {formatVND(b.salePrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={b.stockQuantity > 0 ? 'default' : 'destructive'} size="sm">
                        {b.stockQuantity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={b.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                        {b.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatVNDate(b.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/books/${b.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" aria-label="Sửa sách">
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-amber-600"
                          onClick={() => toggleMutation.mutate(b.id)}
                          isLoading={toggleMutation.isPending}
                          aria-label="Đổi trạng thái"
                        >
                          <Power className="w-3.5 h-3.5" />
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

