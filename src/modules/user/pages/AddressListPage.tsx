import React, { useState } from 'react';
import { Plus, MapPin, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import {
  useUserAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '../hooks/useUserQueries';
import { AddressModal } from '../components/AddressModal';
import { AddressDto } from '../types/user.types';
import { AddressFormData } from '../schemas/userSchemas';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { maskPhone } from '@/core/utils/masking';

export const AddressListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: addresses = [], isLoading } = useUserAddressesQuery();
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation(editingAddress?.id || 0);
  const deleteMutation = useDeleteAddressMutation();
  const setDefaultMutation = useSetDefaultAddressMutation();

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: AddressDto) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSubmitModal = (data: AddressFormData) => {
    if (editingAddress) {
      updateMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải sổ địa chỉ...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Sổ Địa Chỉ Nhận Hàng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tối đa 10 địa chỉ nhận hàng để thanh toán nhanh hơn
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenCreate}
          disabled={addresses.length >= 10}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-10 h-10 text-slate-400 stroke-[1.5]" />}
          title="Chưa có địa chỉ nhận hàng"
          description="Thêm địa chỉ của bạn để tiện lợi đặt hàng và nhận sách tại nhà."
          actionLabel="Thêm địa chỉ ngay"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                addr.isDefault
                  ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{addr.recipientName}</h4>
                    {addr.isDefault && <Badge variant="info">Mặc định</Badge>}
                  </div>
                  <span className="text-xs font-mono text-slate-500">{maskPhone(addr.phone)}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {!addr.isDefault ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefaultMutation.mutate(addr.id)}
                    isLoading={setDefaultMutation.isPending}
                    className="text-xs text-slate-500 hover:text-blue-600 p-0 h-auto"
                  >
                    Thiết lập mặc định
                  </Button>
                ) : (
                  <span className="text-2xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Địa chỉ mặc định
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                    onClick={() => handleOpenEdit(addr)}
                    aria-label="Sửa địa chỉ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                    disabled={addr.isDefault}
                    onClick={() => setDeletingId(addr.id)}
                    aria-label="Xóa địa chỉ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Create / Edit Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingAddress}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteMutation.mutate(deletingId);
            setDeletingId(null);
          }
        }}
        title="Xóa địa chỉ nhận hàng"
        description="Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ không?"
        variant="destructive"
        confirmLabel="Xóa địa chỉ"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

