import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw } from 'lucide-react';
import { useBooksQuery, useCategoryTreeQuery } from '../hooks/useCatalogQueries';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton } from '../components/BookCardSkeleton';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { BookFilterParams } from '../types/catalog.types';

export const BookCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters: BookFilterParams = useMemo(() => {
    return {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      coverFormat: (searchParams.get('coverFormat') as 'PAPERBACK' | 'HARDCOVER') || undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sortBy') as BookFilterParams['sortBy']) || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
      size: 12,
    };
  }, [searchParams]);

  const { data, isLoading } = useBooksQuery(filters);
  const { data: categories = [] } = useCategoryTreeQuery();

  const updateFilters = (newParams: Partial<BookFilterParams>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });
    // Reset to page 0 if filters other than page change
    if (!('page' in newParams)) {
      updated.set('page', '0');
    }
    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const books = data?.items || [];
  const pageMetadata = data?.page;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {filters.search ? `Kết quả tìm kiếm cho "${filters.search}"` : 'Tất Cả Tựa Sách'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {pageMetadata ? `Hiển thị ${pageMetadata.totalElements} tác phẩm phù hợp` : 'Đang tải danh mục...'}
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Sắp xếp:</span>
          <Select
            value={filters.sortBy || 'newest'}
            onChange={(e) => updateFilters({ sortBy: e.target.value as BookFilterParams['sortBy'] })}
            className="w-44 h-9 text-xs"
            options={[
              { label: 'Mới nhất', value: 'newest' },
              { label: 'Bán chạy nhất', value: 'best-seller' },
              { label: 'Giá tăng dần', value: 'price-asc' },
              { label: 'Giá giảm dần', value: 'price-desc' },
              { label: 'Đánh giá cao nhất', value: 'rating' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Filter className="w-4 h-4 text-blue-600" /> Bộ lọc tìm kiếm
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-rose-600 p-0 h-auto font-normal flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Xóa bộ lọc
              </Button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Danh mục sách</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => updateFilters({ categoryId: undefined })}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !filters.categoryId ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả danh mục
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateFilters({ categoryId: cat.id })}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filters.categoryId === cat.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Khoảng giá (₫)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  defaultValue={filters.minPrice || ''}
                  onBlur={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Đến"
                  defaultValue={filters.maxPrice || ''}
                  onBlur={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Cover format */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Hình thức bìa</label>
              <Select
                value={filters.coverFormat || ''}
                onChange={(e) =>
                  updateFilters({ coverFormat: (e.target.value as 'PAPERBACK' | 'HARDCOVER') || undefined })
                }
                className="h-8 text-xs"
                options={[
                  { label: 'Tất cả loại bìa', value: '' },
                  { label: 'Bìa mềm', value: 'PAPERBACK' },
                  { label: 'Bìa cứng', value: 'HARDCOVER' },
                ]}
              />
            </div>

            {/* In stock toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Chỉ hiển thị còn hàng</span>
              <input
                type="checkbox"
                checked={Boolean(filters.inStock)}
                onChange={(e) => updateFilters({ inStock: e.target.checked ? true : undefined })}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Book Grid Content */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Không tìm thấy cuốn sách nào phù hợp"
              description="Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các tiêu chí bộ lọc."
              actionLabel="Xóa tất cả bộ lọc"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {pageMetadata && pageMetadata.totalPages > 1 && (
                <Pagination
                  page={pageMetadata}
                  onPageChange={(newPage) => updateFilters({ page: newPage })}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

