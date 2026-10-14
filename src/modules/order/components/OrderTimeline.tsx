import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { OrderTimelineStep } from '../types/order.types';
import { formatVNDateTime } from '@/core/utils/dateTime';

export interface OrderTimelineProps {
  steps: OrderTimelineStep[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                step.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : step.current
                  ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                  : 'bg-white border-slate-300 text-slate-300'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-3 h-3 fill-current" />
              )}
            </div>
            <span
              className={`text-2xs font-bold mt-2 whitespace-nowrap ${
                step.completed || step.current ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
            {step.timestamp && (
              <span className="text-3xs text-slate-400 whitespace-nowrap">
                {formatVNDateTime(step.timestamp)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

