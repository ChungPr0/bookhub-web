import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 space-y-3">
      <div className="space-y-3">
        <Skeleton className="aspect-3/4 w-full rounded-lg" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
};

