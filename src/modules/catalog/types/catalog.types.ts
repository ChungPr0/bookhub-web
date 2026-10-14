import { PageResponse } from '@/core/types/api.types';

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  level: number;
  children?: CategoryNode[];
}

export interface BookSummaryDto {
  id: number;
  title: string;
  slug: string;
  authorName: string;
  listPrice: number;
  salePrice: number;
  discountRate: number;
  ratingAverage: number;
  reviewCount: number;
  primaryImageUrl: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface BookDetailDto extends BookSummaryDto {
  isbn: string;
  publisherName: string;
  publicationYear: number;
  pageCount: number;
  coverFormat: 'PAPERBACK' | 'HARDCOVER';
  dimensions?: string;
  weightGrams?: number;
  description: string;
  imageUrls: string[];
  categoryId: number;
  categoryName: string;
}

export interface BookFilterParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  coverFormat?: 'PAPERBACK' | 'HARDCOVER';
  inStock?: boolean;
  sortBy?: 'newest' | 'best-seller' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  size?: number;
}

export interface BookSuggestionDto {
  id: number;
  title: string;
  authorName: string;
  salePrice: number;
  primaryImageUrl: string;
}

export interface ReviewDto {
  id: number;
  bookId: number;
  customerName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
}

export interface ReviewSummaryDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  reviews: PageResponse<ReviewDto>;
}

export interface CreateReviewRequest {
  bookId: number;
  rating: number;
  comment: string;
  imageUrls?: string[];
}

export interface AdminBookDto {
  id: number;
  title: string;
  isbn: string;
  authorName: string;
  publisherName: string;
  categoryName: string;
  listPrice: number;
  salePrice: number;
  stockQuantity: number;
  status: 'ACTIVE' | 'INACTIVE';
  primaryImageUrl: string;
  createdAt: string;
}

export interface CreateAdminBookRequest {
  title: string;
  isbn: string;
  authorName: string;
  publisherName: string;
  categoryId: number;
  listPrice: number;
  salePrice: number;
  stockQuantity: number;
  description: string;
  pageCount: number;
  coverFormat: 'PAPERBACK' | 'HARDCOVER';
  publicationYear: number;
  imageUrls: string[];
}

