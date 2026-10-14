import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Layers,
  AlertTriangle,
  Users,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Badge } from '@/components/ui/Badge';

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Bảng điều khiển', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { label: 'Quản lý Sách', path: '/admin/books', icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { label: 'Quản lý Đơn hàng', path: '/admin/orders', icon: <ClipboardList className="w-5 h-5 shrink-0" /> },
    { label: 'Thẻ kho (STK-06)', path: '/admin/inventory/stock-cards', icon: <Layers className="w-5 h-5 shrink-0" /> },
    { label: 'Cảnh báo Tồn kho', path: '/admin/inventory/low-stock', icon: <AlertTriangle className="w-5 h-5 shrink-0" /> },
    { label: 'Khách hàng', path: '/admin/customers', icon: <Users className="w-5 h-5 shrink-0" /> },
    { label: 'Nhân sự & Phân quyền', path: '/admin/staff', icon: <UserCheck className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900">
      {/* Collapsible Sidebar */}
      <aside
        className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col justify-between shrink-0 relative ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-base text-white tracking-tight block">
                    BookHub
                  </span>
                  <span className="text-3xs uppercase tracking-widest text-slate-400 block -mt-1">
                    Admin Portal
                  </span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            title="Về Cửa hàng khách hàng"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Xem Cửa hàng</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Hệ thống Quản trị BookHub</span>
            <span>/</span>
            <span className="font-bold text-slate-800 capitalize">
              {location.pathname.replace('/admin/', '').replace(/-/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || 'Quản trị viên'}</p>
              <Badge variant="destructive" size="sm" className="font-mono">
                {user?.role || 'ADMIN'}
              </Badge>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              {user?.fullName ? user.fullName.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

