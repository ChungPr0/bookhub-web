import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Zap,
  CheckCircle,
  Truck,
  RotateCcw,
  BookOpen,
  MessageSquarePlus,
  Minus,
  Plus,
} from 'lucide-react';
import { useBookDetailQuery, useBookReviewsQuery } from '../hooks/useCatalogQueries';
import { useAddToCartMutation } from '@/modules/cart/hooks/useCartQueries';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useAuthModalStore } from '@/modules/auth/store/useAuthModalStore';
import { ReviewItem } from '../components/ReviewItem';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { formatVND } from '@/core/utils/currency';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookId = Number(id);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: book, isLoading, isError } = useBookDetailQuery(bookId);
  const { data: reviewData } = useBookReviewsQuery(bookId);
  const addToCartMutation = useAddToCartMutation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useAuthModalStore((state) => state.openLoginModal);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-3/4 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <EmptyState
        title="Không tìm thấy cuốn sách này"
        description="Sách có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác."
        actionLabel="Quay lại danh mục sách"
        onAction={() => window.history.back()}
      />
    );
  }

  const currentImage =
    selectedImage ||
    book.primaryImageUrl ||
    (book.imageUrls && book.imageUrls[0]) ||
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';

  const allImages = book.imageUrls && book.imageUrls.length > 0 ? book.imageUrls : [currentImage];

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      bookId: book.id,
      quantity,
      title: book.title,
      authorName: book.authorName,
      salePrice: book.salePrice,
      listPrice: book.listPrice,
      primaryImageUrl: book.primaryImageUrl,
      stockQuantity: book.stockQuantity,
      inStock: book.inStock,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!isAuthenticated) {
      openLoginModal({
        redirectUrl: '/checkout',
        title: 'Đăng nhập để thanh toán',
        subtitle: 'Vui lòng đăng nhập để hoàn tất đơn mua sách của bạn',
        onSuccess: () => navigate('/checkout'),
      });
      return;
    }
    navigate('/checkout');
  };

  const reviews = reviewData?.reviews?.items || [];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-blue-600">Sách</Link>
        <span>/</span>
        <Link to={`/books?categoryId=${book.categoryId}`} className="hover:text-blue-600">
          {book.categoryName}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-5 space-y-4">
          <div className="aspect-3/4 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
            <img
              src={currentImage}
              alt={book.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {book.discountRate > 0 && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" size="md">
                  Giảm {book.discountRate}%
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    currentImage === img ? 'border-blue-600 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Book Details & Sticky Buy Box */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="info">{book.categoryName}</Badge>
              <span className="text-xs text-slate-500">ISBN: {book.isbn}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-slate-600">
              Tác giả: <span className="text-blue-600 font-bold">{book.authorName}</span> | Nhà xuất bản: {book.publisherName}
            </p>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-slate-800">{book.ratingAverage.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-600 font-medium">
                {book.reviewCount} lượt đánh giá từ độc giả
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">
              {formatVND(book.salePrice)}
            </span>
            {book.listPrice > book.salePrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatVND(book.listPrice)}
              </span>
            )}
            <Badge variant="success" size="sm">
              Tiết kiệm {formatVND(book.listPrice - book.salePrice)}
            </Badge>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Số lượng mua:</span>
              <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || !book.inStock}
                  className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(book.stockQuantity || 99, prev + 1))}
                  disabled={quantity >= (book.stockQuantity || 99) || !book.inStock}
                  className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-500">
                {book.inStock ? `Còn ${book.stockQuantity} cuốn trong kho` : 'Tạm hết hàng'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                disabled={!book.inStock}
                onClick={handleAddToCart}
                leftIcon={<ShoppingCart className="w-5 h-5" />}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md font-bold"
                disabled={!book.inStock}
                onClick={handleBuyNow}
                leftIcon={<Zap className="w-5 h-5" />}
              >
                Mua ngay
              </Button>
            </div>
          </div>

          {/* Delivery & Assurance checklist */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sách có sẵn giao ngay</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Miễn phí ship đơn từ 300k</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Đổi trả 7 ngày nếu lỗi</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Được kiểm tra hàng trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Thông tin chi tiết xuất bản
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500">Mã ISBN</span>
            <span className="font-semibold text-slate-800">{book.isbn}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500">Năm xuất bản</span>
            <span className="font-semibold text-slate-800">{book.publicationYear}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500">Số trang</span>
            <span className="font-semibold text-slate-800">{book.pageCount} trang</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500">Hình thức bìa</span>
            <span className="font-semibold text-slate-800">
              {book.coverFormat === 'HARDCOVER' ? 'Bìa cứng' : 'Bìa mềm'}
            </span>
          </div>
          {book.dimensions && (
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Kích thước</span>
              <span className="font-semibold text-slate-800">{book.dimensions}</span>
            </div>
          )}
          {book.weightGrams && (
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Trọng lượng</span>
              <span className="font-semibold text-slate-800">{book.weightGrams} gram</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Mô tả tác phẩm</h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {book.description}
          </p>
        </div>
      </div>

      {/* Reader Reviews Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Đánh giá từ độc giả</h3>
            <p className="text-xs text-slate-500">
              {book.reviewCount} nhận xét từ khách hàng đã mua sản phẩm
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReviewModalOpen(true)}
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          >
            Viết nhận xét
          </Button>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            title="Chưa có đánh giá nào cho cuốn sách này"
            description="Hãy là người đầu tiên chia sẻ cảm nhận của bạn về cuốn sách!"
            actionLabel="Viết đánh giá ngay"
            onAction={() => setIsReviewModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <ReviewItem key={rev.id} review={rev} />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookId={book.id}
        bookTitle={book.title}
      />
    </div>
  );
};

