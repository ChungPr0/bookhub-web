/**
 * BookHub API Standard Response Wrappers & Data Contracts
 * Single Source of Truth matching Backend `rules.md`
 */

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface FieldErrorItem {
  field: string;
  code: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  code: string;
  message: string;
  errors: FieldErrorItem[] | null;
  details: Record<string, unknown> | null;
  data: null;
  path: string;
  traceId: string;
  timestamp: string;
}

export interface PageMetadata {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageResponse<T> {
  items: T[];
  page: PageMetadata;
}

