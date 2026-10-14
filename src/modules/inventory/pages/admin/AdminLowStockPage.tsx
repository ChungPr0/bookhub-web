import React, { useState } from 'react';
import { AlertTriangle, Sliders } from 'lucide-react';
import { useLowStockQuery } from '../../hooks/useInventoryQueries';
import { StockAdjustmentModal } from '../../components/StockAdjustmentModal';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LowStockBookDto } from '../../types/inventory.types';

export const AdminLowStockPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<LowStockBookDto | null>(null);

  const { data, isLoading } = useLowStockQuery();
  const lowStockBooks = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cảnh Báo Tồn Kho Thấp"
        description="Danh sách các tác phẩm có lượng tồn kho chạm hoặc thấp hơn ngưỡng an toàn"
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang quét mức tồn kho...</div>
        ) : lowStockBooks.length === 0 ? (
          <EmptyState
            title="Tất cả sản phẩm đều đảm bảo tồn kho"
            description="Không có đầu sách nào dưới ngưỡng an toàn."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tác phẩm</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4 text-center">Tồn hiện tại</th>
                  <th className="py-3 px-4 text-center">Ngưỡng tối thiểu</th>
                  <th className="py-3 px-4 text-center">Mức độ cảnh báo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockBooks.map((b) => (
                  <tr key={b.bookId} className="hover:bg-slate-50/80 transition-colors">
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
                    <td className="py-3 px-4 text-center font-bold text-rose-600 font-mono">
                      {b.currentStock}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{b.minThreshold}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={b.currentStock === 0 ? 'destructive' : 'warning'} size="sm">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {b.currentStock === 0 ? 'Hết hàng (0)' : 'Sắp hết'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setSelectedBook(b)}
                        leftIcon={<Sliders className="w-3 h-3" />}
                      >
                        Kiểm kê điều chỉnh
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {selectedBook && (
        <StockAdjustmentModal
          isOpen={selectedBook !== null}
          onClose={() => setSelectedBook(null)}
          bookId={selectedBook.bookId}
          bookTitle={selectedBook.title}
          systemQuantity={selectedBook.currentStock}
        />
      )}
    </div>
  );
};

