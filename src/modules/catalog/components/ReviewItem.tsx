import React from 'react';
import { Star } from 'lucide-react';
import { ReviewDto } from '../types/catalog.types';
import { maskFullName } from '@/core/utils/masking';
import { formatVNDate } from '@/core/utils/dateTime';

export interface ReviewItemProps {
  review: ReviewDto;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  return (
    <div className="py-4 border-b border-slate-100 last:border-0 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {review.customerName ? review.customerName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">
              {maskFullName(review.customerName)}
            </h5>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= review.rating ? 'fill-current text-amber-500' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-2xs text-slate-400">{formatVNDate(review.createdAt)}</span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>

      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="flex gap-2 pt-1">
          {review.imageUrls.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Ảnh đánh giá"
              className="w-14 h-14 object-cover rounded-lg border border-slate-200"
            />
          ))}
        </div>
      )}
    </div>
  );
};

