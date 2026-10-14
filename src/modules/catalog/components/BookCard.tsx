import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { BookSummaryDto } from '../types/catalog.types';
import { formatVND } from '@/core/utils/currency';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface BookCardProps {
  book: BookSummaryDto;
  onAddToCart?: (book: BookSummaryDto) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAddToCart }) => {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition-all hover:border-blue-400 hover:shadow-md">
      <div>
        {/* Image & Discount Badge */}
        <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-slate-100 mb-3">
          <Link to={`/books/${book.id}`}>
            <img
              src={book.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
              alt={book.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {book.discountRate > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" size="sm">
                -{book.discountRate}%
              </Badge>
            </div>
          )}
          {!book.inStock && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Badge variant="outline" className="bg-white/90 text-slate-900 font-bold">
                Tạm hết hàng
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <p className="text-2xs font-medium text-slate-400 truncate">{book.authorName}</p>
          <Link to={`/books/${book.id}`} className="block">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-blue-600 transition-colors">
              {book.title}
            </h4>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 pt-0.5">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-slate-700">
              {book.ratingAverage.toFixed(1)}
            </span>
            <span className="text-2xs text-slate-400">({book.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
        <div>
          <div className="text-sm sm:text-base font-extrabold text-blue-600">
            {formatVND(book.salePrice)}
          </div>
          {book.listPrice > book.salePrice && (
            <div className="text-2xs text-slate-400 line-through">
              {formatVND(book.listPrice)}
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50"
          disabled={!book.inStock}
          onClick={() => onAddToCart && onAddToCart(book)}
          aria-label={`Thêm ${book.title} vào giỏ hàng`}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

