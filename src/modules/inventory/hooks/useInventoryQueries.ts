import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '../api/inventoryApi';
import { StockAdjustmentRequest } from '../types/inventory.types';

export const useStockCardQuery = (bookId: number, fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'inventory', 'stock-card', bookId, fromDate, toDate],
    queryFn: () => inventoryApi.getStockCards(bookId, fromDate, toDate),
    enabled: Boolean(bookId),
    staleTime: 60 * 1000,
  });
};

export const useLowStockQuery = () => {
  return useQuery({
    queryKey: ['admin', 'inventory', 'low-stock'],
    queryFn: () => inventoryApi.getLowStockBooks(),
    staleTime: 60 * 1000,
  });
};

export const useStockAdjustmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockAdjustmentRequest) => inventoryApi.adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      toast.success('Lập phiếu điều chỉnh kiểm kê kho thành công!');
    },
    onError: () => {
      toast.error('Không thể thực hiện điều chỉnh kho. Vui lòng kiểm tra lại');
    },
  });
};

