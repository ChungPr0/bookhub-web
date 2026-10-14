import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/modules/auth/store/useAuthStore';
import { EmptyState } from '@/components/common/EmptyState';
import { ShieldAlert } from 'lucide-react';

export interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If user role is not authorized for this route (HTTP 403 Access Denied)
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <EmptyState
            icon={<ShieldAlert className="w-10 h-10 text-rose-500 stroke-[1.5]" />}
            title="Truy cập bị từ chối (403 Forbidden)"
            description="Tài khoản của bạn không có đủ đặc quyền để truy cập vào khu vực quản trị này."
            actionLabel="Về trang chủ BookHub"
            onAction={() => (window.location.href = '/')}
          />
        </div>
      </div>
    );
  }

  return children;
};

