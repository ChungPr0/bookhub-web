import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const CartSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-4 border-b border-slate-100">
          <Skeleton className="w-14 h-20 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

