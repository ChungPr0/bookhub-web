import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageMetadata } from '@/core/types/api.types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/core/utils/cn';

export interface PaginationProps {
  page: PageMetadata;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ page, onPageChange, className }) => {
  const { number: currentPage, totalPages, totalElements, size } = page;

  if (totalPages <= 1) return null;

  const startRecord = currentPage * size + 1;
  const endRecord = Math.min((currentPage + 1) * size, totalElements);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 py-3', className)}>
      <p className="text-xs text-slate-500">
        Hiển thị <span className="font-semibold text-slate-700">{startRecord}</span> -{' '}
        <span className="font-semibold text-slate-700">{endRecord}</span> trên tổng số{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span> kết quả
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page.first || currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((item, index) => {
          if (item === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-xs text-slate-400 select-none">
                ...
              </span>
            );
          }

          const pageIndex = item as number;
          const isActive = pageIndex === currentPage;

          return (
            <Button
              key={`page-${pageIndex}`}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageIndex)}
              className={cn('h-8 w-8 p-0 text-xs', isActive ? 'font-bold' : 'font-normal')}
            >
              {pageIndex + 1}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={page.last || currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
