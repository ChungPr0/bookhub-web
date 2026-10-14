import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addressSchema, AddressFormData } from '../schemas/userSchemas';
import { AddressDto } from '../types/user.types';

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => void;
  initialData?: AddressDto | null;
  isLoading?: boolean;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: '',
      phone: '',
      province: 'Hà Nội',
      district: '',
      ward: '',
      detailAddress: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        recipientName: initialData.recipientName,
        phone: initialData.phone,
        province: initialData.province,
        district: initialData.district,
        ward: initialData.ward,
        detailAddress: initialData.detailAddress,
        isDefault: initialData.isDefault,
      });
    } else {
      reset({
        recipientName: '',
        phone: '',
        province: 'Hà Nội',
        district: '',
        ward: '',
        detailAddress: '',
        isDefault: false,
      });
    }
  }, [initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
      description="Điền thông tin người nhận và địa chỉ giao sách chính xác"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Tên người nhận"
            placeholder="Nguyễn Văn A"
            required
            error={errors.recipientName?.message}
            {...register('recipientName')}
          />
          <Input
            label="Số điện thoại"
            placeholder="0988888888"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Tỉnh / Thành phố"
            placeholder="Hà Nội"
            required
            error={errors.province?.message}
            {...register('province')}
          />
          <Input
            label="Quận / Huyện"
            placeholder="Cầu Giấy"
            required
            error={errors.district?.message}
            {...register('district')}
          />
          <Input
            label="Phường / Xã"
            placeholder="Dịch Vọng Hậu"
            required
            error={errors.ward?.message}
            {...register('ward')}
          />
        </div>

        <Input
          label="Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà)"
          placeholder="Số 12 ngõ 34 phố Xuân Thủy"
          required
          error={errors.detailAddress?.message}
          {...register('detailAddress')}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isDefault"
            className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            {...register('isDefault')}
          />
          <label htmlFor="isDefault" className="text-xs text-slate-700 font-medium cursor-pointer">
            Đặt làm địa chỉ nhận hàng mặc định
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

