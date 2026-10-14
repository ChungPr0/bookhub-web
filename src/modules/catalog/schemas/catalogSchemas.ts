import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao đánh giá (1 - 5 sao)').max(5),
  comment: z
    .string()
    .min(10, 'Nội dung nhận xét tối thiểu 10 ký tự')
    .max(1000, 'Nội dung nhận xét tối đa 1000 ký tự'),
  imageUrls: z.array(z.string()).max(5, 'Tối đa 5 hình ảnh'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const adminBookSchema = z.object({
  title: z.string().min(2, 'Tên sách tối thiểu 2 ký tự').max(255),
  isbn: z.string().min(10, 'ISBN tối thiểu 10 ký tự').max(13, 'ISBN tối đa 13 ký tự'),
  authorName: z.string().min(2, 'Tên tác giả tối thiểu 2 ký tự'),
  publisherName: z.string().min(2, 'Tên nhà xuất bản tối thiểu 2 ký tự'),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
  listPrice: z.number().min(1000, 'Giá bìa tối thiểu 1.000 ₫'),
  salePrice: z.number().min(1000, 'Giá bán tối thiểu 1.000 ₫'),
  stockQuantity: z.number().min(0, 'Số lượng tồn không được âm'),
  description: z.string().min(10, 'Mô tả sách tối thiểu 10 ký tự'),
  pageCount: z.number().min(1, 'Số trang tối thiểu 1'),
  coverFormat: z.enum(['PAPERBACK', 'HARDCOVER']),
  publicationYear: z.number().min(1900).max(new Date().getFullYear()),
  imageUrls: z.array(z.string()).min(1, 'Vui lòng cung cấp ít nhất 1 ảnh bìa'),
});

export type AdminBookFormData = z.infer<typeof adminBookSchema>;
