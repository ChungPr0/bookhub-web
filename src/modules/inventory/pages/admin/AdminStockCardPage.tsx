import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { useStockCardQuery } from '../../hooks/useInventoryQueries';
import { useAdminBooksQuery } from '@/modules/catalog/hooks/useCatalogQueries';
import { StockAdjustmentModal } from '../../components/StockAdjustmentModal';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatVNDateTime } from '@/core/utils/dateTime';

export const AdminStockCardPage: React.FC = () => {
  const [selectedBookId, setSelectedBookId] = useState<number>(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  const { data: booksData } = useAdminBooksQuery({ size: 100 });
  const books = booksData?.items || [];

  const { data: stockCard, isLoading } = useStockCardQuery(
    selectedBookId,
    fromDate || undefined,
    toDate || undefined
  );

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const entries = stockCard?.entries || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thẻ Kho Điện Tử (STK-06)"
        description="Bảng cân đối Nhập - Xuất - Tồn theo thời gian thực và lịch sử biến động kho"
        actions={
          <Button
            size="sm"
            onClick={() => setIsAdjustmentModalOpen(true)}
            leftIcon={<Sliders className="w-4 h-4" />}
          >
            Lập phiếu điều chỉnh kho
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <Select
            label="Chọn tác phẩm"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(Number(e.target.value))}
            options={books.map((b) => ({ label: `${b.title} (ISBN: ${b.isbn})`, value: b.id }))}
          />
        </div>
        <div>
          <Input
            label="Từ ngày"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <Input
            label="Đến ngày"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Stock Card Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải số liệu thẻ kho...</div>
        ) : entries.length === 0 ? (
          <EmptyState
            title="Chưa có phát sinh biến động kho"
            description="Tác phẩm này chưa có giao dịch nhập hoặc xuất kho nào trong khoảng thời gian đã chọn."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mã chứng từ</th>
                  <th className="py-3 px-4">Diễn giải</th>
                  <th className="py-3 px-4 text-center">Tồn đầu</th>
                  <th className="py-3 px-4 text-center text-emerald-600">Nhập (+)</th>
                  <th className="py-3 px-4 text-center text-rose-600">Xuất (-)</th>
                  <th className="py-3 px-4 text-center font-bold">Tồn cuối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">{formatVNDateTime(item.transactionDate)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Badge variant="outline" size="sm">
                        {item.documentCode}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4 text-center font-mono">{item.openingStock}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                      {item.quantityIn > 0 ? `+${item.quantityIn}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                      {item.quantityOut > 0 ? `-${item.quantityOut}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-blue-600">
                      {item.closingStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {selectedBook && (
        <StockAdjustmentModal
          isOpen={isAdjustmentModalOpen}
          onClose={() => setIsAdjustmentModalOpen(false)}
          bookId={selectedBook.id}
          bookTitle={selectedBook.title}
          systemQuantity={selectedBook.stockQuantity}
        />
      )}
    </div>
  );
};

