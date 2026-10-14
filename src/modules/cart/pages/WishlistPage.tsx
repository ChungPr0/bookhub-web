import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import {
  useWishlistQuery,
  useRemoveFromWishlistMutation,
  useAddToCartMutation,
} from '../hooks/useCartQueries';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatVND } from '@/core/utils/currency';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useWishlistQuery();
  const removeMutation = useRemoveFromWishlistMutation();
  const addToCartMutation = useAddToCartMutation();

  const items = data?.items || [];

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách yêu thích...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<Heart className="w-10 h-10 text-rose-400 stroke-[1.5]" />}
          title="Danh sách yêu thích đang trống"
          description="Bạn chưa lưu cuốn sách nào vào mục yêu thích. Nhấn vào biểu tượng trái tim ở từng cuốn sách để lưu lại."
          actionLabel="Khám phá sách hay"
          onAction={() => navigate('/books')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Danh Sách Sách Yêu Thích ({items.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lưu trữ tối đa 200 tác phẩm bạn quan tâm để mua sắm sau này
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs group hover:border-rose-300 transition-colors"
          >
            <div>
              <div className="aspect-3/4 rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                <Link to={`/books/${item.bookId}`}>
                  <img
                    src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(item.bookId)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-xs cursor-pointer"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-2xs text-slate-400 truncate">{item.authorName}</p>
              <Link to={`/books/${item.bookId}`}>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-blue-600">
                  {item.title}
                </h4>
              </Link>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-blue-600">
                  {formatVND(item.salePrice)}
                </div>
                {!item.inStock && (
                  <Badge variant="destructive" size="sm">
                    Hết hàng
                  </Badge>
                )}
              </div>

              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                disabled={!item.inStock}
                onClick={() =>
                  addToCartMutation.mutate({
                    bookId: item.bookId,
                    quantity: 1,
                    title: item.title,
                    authorName: item.authorName,
                    salePrice: item.salePrice,
                    listPrice: item.listPrice,
                    primaryImageUrl: item.primaryImageUrl,
                    inStock: item.inStock,
                  })
                }
                aria-label={`Thêm ${item.title} vào giỏ hàng`}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

