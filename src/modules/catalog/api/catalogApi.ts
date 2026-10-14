import { axiosClient } from '@/core/http/axiosClient';
import { PageResponse } from '@/core/types/api.types';
import {
  AdminBookDto,
  BookDetailDto,
  BookFilterParams,
  BookSuggestionDto,
  BookSummaryDto,
  CategoryNode,
  CreateAdminBookRequest,
  CreateReviewRequest,
  ReviewDto,
  ReviewSummaryDto,
} from '../types/catalog.types';

export const catalogApi = {
  getCategoryTree: async (): Promise<CategoryNode[]> => {
    const res = await axiosClient.get<CategoryNode[]>('/categories/tree');
    return res.data;
  },

  getBooks: async (params: BookFilterParams = {}): Promise<PageResponse<BookSummaryDto>> => {
    const res = await axiosClient.get<PageResponse<BookSummaryDto>>('/books', {
      params,
    });
    return res.data;
  },

  getBookDetail: async (id: number): Promise<BookDetailDto> => {
    const res = await axiosClient.get<BookDetailDto>(`/books/${id}`);
    return res.data;
  },

  getBookSuggestions: async (query: string): Promise<BookSuggestionDto[]> => {
    if (!query.trim()) return [];
    const res = await axiosClient.get<BookSuggestionDto[]>('/books/suggest', {
      params: { q: query },
    });
    return res.data;
  },

  getBestSellers: async (): Promise<BookSummaryDto[]> => {
    const res = await axiosClient.get<BookSummaryDto[]>('/books/best-sellers');
    return res.data;
  },

  getNewArrivals: async (): Promise<BookSummaryDto[]> => {
    const res = await axiosClient.get<BookSummaryDto[]>('/books/new-arrivals');
    return res.data;
  },

  getBookReviews: async (bookId: number, page = 0, size = 10): Promise<ReviewSummaryDto> => {
    const res = await axiosClient.get<ReviewSummaryDto>(`/books/${bookId}/reviews`, {
      params: { page, size },
    });
    return res.data;
  },

  createReview: async (payload: CreateReviewRequest): Promise<ReviewDto> => {
    const res = await axiosClient.post<ReviewDto>('/me/reviews', payload);
    return res.data;
  },

  getAdminBooks: async (params: { page?: number; size?: number; search?: string } = {}): Promise<PageResponse<AdminBookDto>> => {
    const res = await axiosClient.get<PageResponse<AdminBookDto>>('/admin/books', {
      params,
    });
    return res.data;
  },

  createAdminBook: async (payload: CreateAdminBookRequest): Promise<AdminBookDto> => {
    const res = await axiosClient.post<AdminBookDto>('/admin/books', payload);
    return res.data;
  },

  updateAdminBook: async (id: number, payload: Partial<CreateAdminBookRequest>): Promise<AdminBookDto> => {
    const res = await axiosClient.put<AdminBookDto>(`/admin/books/${id}`, payload);
    return res.data;
  },

  toggleBookStatus: async (id: number): Promise<void> => {
    await axiosClient.patch<null>(`/admin/books/${id}/status`);
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post<{ url: string }>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

