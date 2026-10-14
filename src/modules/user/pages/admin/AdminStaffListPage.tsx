import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, UserCheck } from 'lucide-react';
import {
  useAdminStaffQuery,
  useCreateAdminStaffMutation,
  useUpdateStaffRoleMutation,
} from '../../hooks/useUserQueries';
import { createStaffSchema, CreateStaffFormData } from '../../schemas/userSchemas';
import { UserRole } from '@/modules/auth/store/useAuthStore';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatVNDate } from '@/core/utils/dateTime';

export const AdminStaffListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: staffList = [], isLoading } = useAdminStaffQuery();
  const createMutation = useCreateAdminStaffMutation();
  const updateRoleMutation = useUpdateStaffRoleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      password: '',
      role: 'STAFF',
    },
  });

  const onSubmit = (data: CreateStaffFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setIsModalOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Nhân Sự &amp; Phân Quyền"
        description="Quản lý tài khoản nhân viên vận hành, quản lý chi nhánh và phân quyền hệ thống"
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Thêm nhân sự mới
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách nhân sự...</div>
        ) : staffList.length === 0 ? (
          <EmptyState
            title="Chưa có nhân viên nào"
            description="Bấm 'Thêm nhân sự mới' để cấp tài khoản cho nhân viên."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Vai trò hiện tại</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thay đổi vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                          {s.fullName ? s.fullName.charAt(0) : 'S'}
                        </div>
                        <span className="font-bold text-slate-900">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{s.phone}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          s.role === 'ADMIN'
                            ? 'destructive'
                            : s.role === 'MANAGER'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {s.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={s.isActive ? 'success' : 'default'} size="sm">
                        {s.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatVNDate(s.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Select
                        value={s.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            id: s.id,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="h-8 text-2xs w-32 inline-block"
                        options={[
                          { label: 'STAFF (Nhân viên)', value: 'STAFF' },
                          { label: 'MANAGER (Quản lý)', value: 'MANAGER' },
                          { label: 'ADMIN (Quản trị)', value: 'ADMIN' },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Nhân Sự Mới"
        description="Cấp tài khoản nhân viên nội bộ và phân quyền truy cập hệ thống"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <Input
            label="Họ và tên nhân viên"
            placeholder="Nguyễn Văn A"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Số điện thoại"
            placeholder="0988888888"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Mật khẩu khởi tạo"
            type="password"
            placeholder="••••••••"
            required
            helperText="8-64 ký tự, có chữ hoa, chữ thường và số"
            error={errors.password?.message}
            {...register('password')}
          />
          <Select
            label="Vai trò &amp; Quyền hạn"
            required
            options={[
              { label: 'Nhân viên vận hành (STAFF)', value: 'STAFF' },
              { label: 'Quản lý nghiệp vụ (MANAGER)', value: 'MANAGER' },
              { label: 'Quản trị viên cấp cao (ADMIN)', value: 'ADMIN' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={createMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Tạo nhân viên
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

