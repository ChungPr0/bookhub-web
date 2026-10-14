import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { adminBookSchema, AdminBookFormData } from '../../schemas/catalogSchemas';
import {
  useCreateAdminBookMutation,
  useUpdateAdminBookMutation,
  useCategoryTreeQuery,
  useBookDetailQuery,
} from '../../hooks/useCatalogQueries';
import { catalogApi } from '../../api/catalogApi';
import { toast } from 'sonner';

const CURRENT_YEAR = new Date().getFullYear();

export const AdminBookFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const bookId = Number(id);
  const navigate = useNavigate();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories = [] } = useCategoryTreeQuery();
  const { data: existingBook } = useBookDetailQuery(bookId);

  const createMutation = useCreateAdminBookMutation();
  const updateMutation = useUpdateAdminBookMutation(bookId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminBookFormData>({
    resolver: zodResolver(adminBookSchema),
    defaultValues: {
      title: existingBook?.title || '',
      isbn: existingBook?.isbn || '',
      authorName: existingBook?.authorName || '',
      publisherName: existingBook?.publisherName || '',
      categoryId: existingBook?.categoryId || 1,
      listPrice: existingBook?.listPrice || 100000,
      salePrice: existingBook?.salePrice || 85000,
      stockQuantity: existingBook?.stockQuantity || 10,
      description: existingBook?.description || '',
      pageCount: existingBook?.pageCount || 200,
      coverFormat: existingBook?.coverFormat || 'PAPERBACK',
      publicationYear: existingBook?.publicationYear || CURRENT_YEAR,
      imageUrls: existingBook?.imageUrls || ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await catalogApi.uploadMedia(files[i]);
        uploaded.push(res.url);
      }
      const newUrls = [...imageUrls, ...uploaded];
      setImageUrls(newUrls);
      setValue('imageUrls', newUrls, { shouldValidate: true });
      toast.success('Tải ảnh thành công');
    } catch {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('imageUrls', newUrls, { shouldValidate: true });
  };

  const onSubmit = (data: AdminBookFormData) => {
    if (isEdit) {
      updateMutation.mutate(data, {
        onSuccess: () => navigate('/admin/books'),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/admin/books'),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <PageHeader
        title={isEdit ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Sách Mới Vào Danh Mục'}
        description="Điền đầy đủ thông tin sách, xuất bản và hình ảnh hiển thị trên BookHub"
        breadcrumb={
          <Link to="/admin/books" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách sách
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên tác phẩm"
              placeholder="VD: Đắc Nhân Tâm"
              required
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="Mã ISBN"
              placeholder="9786045678901"
              required
              error={errors.isbn?.message}
              {...register('isbn')}
            />
            <Input
              label="Tác giả"
              placeholder="Dale Carnegie"
              required
              error={errors.authorName?.message}
              {...register('authorName')}
            />
            <Input
              label="Nhà xuất bản"
              placeholder="NXB Trẻ"
              required
              error={errors.publisherName?.message}
              {...register('publisherName')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Danh mục sách"
              required
              error={errors.categoryId?.message}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              {...register('categoryId', { valueAsNumber: true })}
            />
            <Select
              label="Hình thức bìa"
              options={[
                { label: 'Bìa mềm (Paperback)', value: 'PAPERBACK' },
                { label: 'Bìa cứng (Hardcover)', value: 'HARDCOVER' },
              ]}
              {...register('coverFormat')}
            />
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Giá bán &amp; Tồn kho
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Giá niêm yết (₫)"
              type="number"
              required
              error={errors.listPrice?.message}
              {...register('listPrice', { valueAsNumber: true })}
            />
            <Input
              label="Giá bán khuyến mãi (₫)"
              type="number"
              required
              error={errors.salePrice?.message}
              {...register('salePrice', { valueAsNumber: true })}
            />
            <Input
              label="Số lượng tồn kho ban đầu"
              type="number"
              required
              error={errors.stockQuantity?.message}
              {...register('stockQuantity', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Specs & Description */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Quy cách &amp; Nội dung
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số trang"
              type="number"
              error={errors.pageCount?.message}
              {...register('pageCount', { valueAsNumber: true })}
            />
            <Input
              label="Năm xuất bản"
              type="number"
              error={errors.publicationYear?.message}
              {...register('publicationYear', { valueAsNumber: true })}
            />
          </div>

          <Textarea
            label="Mô tả tác phẩm"
            rows={5}
            placeholder="Tóm tắt nội dung cuốn sách..."
            required
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        {/* Media Upload Dropzone */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Hình ảnh sản phẩm (Tối thiểu 1 ảnh bìa)
          </h3>

          <div className="flex flex-wrap gap-3 items-center">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative w-24 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                <img src={url} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/70 text-white rounded-full hover:bg-rose-600"
                  aria-label="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-2xs font-bold">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
          {errors.imageUrls && <p className="text-xs text-rose-600">{errors.imageUrls.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/books')}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" size="lg" isLoading={isPending} disabled={isUploading}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo sách mới'}
          </Button>
        </div>
      </form>
    </div>
  );
};
