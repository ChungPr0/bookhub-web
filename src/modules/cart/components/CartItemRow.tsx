import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItemDto } from '../types/cart.types';
import { formatVND } from '@/core/utils/currency';
import { Badge } from '@/components/ui/Badge';

export interface CartItemRowProps {
  item: CartItemDto;
  onUpdateQuantity: (itemId: number, bookId: number, qty: number) => void;
  onRemove: (itemId: number, bookId: number) => void;
  onToggleSelect?: (bookId: number) => void;
  isUpdating?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onToggleSelect,
  isUpdating,
}) => {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0">
      {/* Checkbox */}
      {onToggleSelect && (
        <input
          type="checkbox"
          checked={item.selected}
          disabled={!item.inStock || isUpdating}
          onChange={() => onToggleSelect(item.bookId)}
          className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40"
          aria-label={`Chọn sách ${item.title}`}
        />
      )}

      {/* Book Thumbnail */}
      <Link to={`/books/${item.bookId}`} className="shrink-0">
        <img
          src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
          alt={item.title}
          className="w-14 h-20 object-cover rounded-lg border border-slate-200 bg-slate-50"
        />
      </Link>

      {/* Info & Quantity */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/books/${item.bookId}`}
            className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors"
          >
            {item.title}
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item.itemId, item.bookId)}
            disabled={isUpdating}
            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
            aria-label="Xóa sách khỏi giỏ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-2xs text-slate-400 truncate">{item.authorName}</p>

        {!item.inStock && (
          <Badge variant="destructive" size="sm">
            Hết hàng
          </Badge>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs sm:text-sm font-extrabold text-blue-600">
            {formatVND(item.salePrice)}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-white">
            <button
              type="button"
              disabled={item.quantity <= 1 || isUpdating}
              onClick={() => onUpdateQuantity(item.itemId, item.bookId, item.quantity - 1)}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
              aria-label="Giảm 1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-800 select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={item.quantity >= (item.stockQuantity || 99) || isUpdating}
              onClick={() => onUpdateQuantity(item.itemId, item.bookId, item.quantity + 1)}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
              aria-label="Tăng 1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

