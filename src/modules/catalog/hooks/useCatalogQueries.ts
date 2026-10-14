import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '../api/catalogApi';
import {
  BookFilterParams,
  CreateAdminBookRequest,
  CreateReviewRequest,
} from '../types/catalog.types';

export const useCategoryTreeQuery = () => {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => catalogApi.getCategoryTree(),
    staleTime: 15 * 60 * 1000,
  });
};

export const useBooksQuery = (params: BookFilterParams) => {
  return useQuery({
    queryKey: ['books', 'list', params],
    queryFn: () => catalogApi.getBooks(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useBookDetailQuery = (id: number) => {
  return useQuery({
    queryKey: ['books', 'detail', id],
    queryFn: () => catalogApi.getBookDetail(id),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(id),
  });
};

export const useBestSellersQuery = () => {
  return useQuery({
    queryKey: ['books', 'best-sellers'],
    queryFn: () => catalogApi.getBestSellers(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useNewArrivalsQuery = () => {
  return useQuery({
    queryKey: ['books', 'new-arrivals'],
    queryFn: () => catalogApi.getNewArrivals(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookReviewsQuery = (bookId: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['books', 'reviews', bookId, page, size],
    queryFn: () => catalogApi.getBookReviews(bookId, page, size),
    staleTime: 60 * 1000,
    enabled: Boolean(bookId),
  });
};

export const useCreateReviewMutation = (bookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => catalogApi.createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', 'reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['books', 'detail', bookId] });
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn.');
    },
    onError: () => {
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
    },
  });
};

export const useAdminBooksQuery = (params: { page?: number; size?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['admin', 'books', params],
    queryFn: () => catalogApi.getAdminBooks(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useCreateAdminBookMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminBookRequest) => catalogApi.createAdminBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Thêm sách mới thành công!');
    },
  });
};

export const useUpdateAdminBookMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateAdminBookRequest>) => catalogApi.updateAdminBook(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['books', 'detail', id] });
      toast.success('Cập nhật thông tin sách thành công!');
    },
  });
};

export const useToggleBookStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => catalogApi.toggleBookStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      toast.success('Cập nhật trạng thái sách thành công!');
    },
  });
};

