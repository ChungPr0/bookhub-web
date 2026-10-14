import { axiosClient } from '@/core/http/axiosClient';
import { PageResponse } from '@/core/types/api.types';
import {
  LowStockBookDto,
  StockAdjustmentRequest,
  StockCardResponse,
} from '../types/inventory.types';

export const inventoryApi = {
  getStockCards: async (bookId: number, fromDate?: string, toDate?: string): Promise<StockCardResponse> => {
    const res = await axiosClient.get<StockCardResponse>('/admin/inventory/stock-cards', {
      params: { bookId, fromDate, toDate },
    });
    return res.data;
  },

  getLowStockBooks: async (): Promise<PageResponse<LowStockBookDto>> => {
    const res = await axiosClient.get<PageResponse<LowStockBookDto>>(
      '/admin/inventory/low-stock'
    );
    return res.data;
  },

  adjustStock: async (payload: StockAdjustmentRequest): Promise<void> => {
    // Inject Idempotency-Key header (UUID v4) as mandated by Rule 5.3
    await axiosClient.post<null>('/admin/inventory/adjustments', payload, {
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    });
  },
};

