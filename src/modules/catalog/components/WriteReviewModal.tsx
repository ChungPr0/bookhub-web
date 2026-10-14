import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Upload, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { reviewSchema, ReviewFormData } from '../schemas/catalogSchemas';
import { useCreateReviewMutation } from '../hooks/useCatalogQueries';
import { catalogApi } from '../api/catalogApi';
import { toast } from 'sonner';

export interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle: string;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { mutate, isPending } = useCreateReviewMutation(bookId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
      imageUrls: [],
    },
  });

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating, { shouldValidate: true });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 5) {
      toast.warning('Tối đa 5 hình ảnh cho mỗi đánh giá');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await catalogApi.uploadMedia(files[i]);
        uploadedUrls.push(res.url);
      }
      const newUrls = [...imageUrls, ...uploadedUrls];
      setImageUrls(newUrls);
      setValue('imageUrls', newUrls);
      toast.success('Tải ảnh lên thành công');
    } catch {
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('imageUrls', newUrls);
  };

  const onSubmit = (data: ReviewFormData) => {
    mutate(
      {
        bookId,
        rating: data.rating,
        comment: data.comment,
        imageUrls: data.imageUrls,
      },
      {
        onSuccess: () => {
          reset();
          setImageUrls([]);
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Viết đánh giá độc giả"
      description={`Chia sẻ cảm nhận của bạn về cuốn sách "${bookTitle}"`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Rating Stars Selection */}
        <div className="space-y-1.5 text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">Đánh giá chung của bạn</label>
          <div className="flex justify-center items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRatingChange(star)}
                className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`${star} sao`}
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-2xs font-semibold text-amber-600">
            {rating === 5 && 'Tuyệt vời, rất đáng đọc'}
            {rating === 4 && 'Hài lòng, nội dung hay'}
            {rating === 3 && 'Bình thường, tạm ổn'}
            {rating === 2 && 'Chưa hài lòng'}
            {rating === 1 && 'Rất tệ'}
          </p>
          {errors.rating && <p className="text-xs text-rose-600">{errors.rating.message}</p>}
        </div>

        <Textarea
          label="Nội dung nhận xét"
          rows={4}
          placeholder="Hãy chia sẻ lý do bạn thích hoặc không thích cuốn sách này..."
          error={errors.comment?.message}
          {...register('comment')}
        />

        {/* Upload photos */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Hình ảnh thực tế (Tối đa 5 ảnh)</label>
          <div className="flex flex-wrap gap-2 items-center">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                <img src={url} alt="Review thumb" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-slate-900/70 text-white rounded-full hover:bg-rose-600"
                  aria-label="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {imageUrls.length < 5 && (
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mb-0.5" />
                <span className="text-3xs font-medium">Thêm ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" size="sm" isLoading={isPending} disabled={isUploading}>
            Gửi đánh giá
          </Button>
        </div>
      </form>
    </Modal>
  );
};

