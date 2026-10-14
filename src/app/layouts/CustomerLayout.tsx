import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  MapPin,
  ClipboardList,
  ShieldCheck,
  Home,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useCartStore } from '@/modules/cart/store/useCartStore';
import { useCartQuery } from '@/modules/cart/hooks/useCartQueries';
import { useWishlistQuery } from '@/modules/cart/hooks/useCartQueries';
import { CategoryMegaMenu } from '@/modules/catalog/components/CategoryMegaMenu';
import { SearchAutocomplete } from '@/modules/catalog/components/SearchAutocomplete';
import { CartDrawer } from '@/modules/cart/components/CartDrawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { maskPhone } from '@/core/utils/masking';

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const openCartDrawer = useCartStore((state) => state.openDrawer);
  const { data: cart } = useCartQuery();
  const { data: wishlistData } = useWishlistQuery();

  const totalCartItems = cart?.totalItems || 0;
  const totalWishlistItems = wishlistData?.items?.length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs group-hover:bg-blue-700 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                BookHub
              </span>
              <span className="text-3xs block font-bold uppercase tracking-widest text-blue-600 -mt-1">
                Nhà sách trực tuyến
              </span>
            </div>
          </Link>

          {/* Mega Menu & Search */}
          <div className="flex-1 max-w-2xl flex items-center gap-3">
            <CategoryMegaMenu />
            <div className="flex-1">
              <SearchAutocomplete />
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Wishlist Link */}
            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-600 hover:text-rose-600 h-10 w-10"
                aria-label="Sách yêu thích"
              >
                <Heart className="w-5 h-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-3xs font-bold flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart Drawer Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openCartDrawer}
              className="relative text-slate-600 hover:text-blue-600 h-10 w-10"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-3xs font-bold flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Button>

            {/* Profile Dropdown / Login */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Menu tài khoản"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.fullName}</p>
                    <p className="text-3xs text-slate-400">{maskPhone(user.phone)}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                    <Badge variant="info" size="sm" className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-700">
                    <Link
                      to="/me/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                      to="/me/orders"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                    <Link
                      to="/me/addresses"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Sổ địa chỉ</span>
                    </Link>
                    {user.role !== 'CUSTOMER' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Trang Quản Trị</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button variant="primary" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <Outlet />
      </main>

      {/* Cart Drawer Widget */}
      <CartDrawer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-blue-600">
          <Home className="w-5 h-5" />
          <span className="text-3xs font-medium">Trang chủ</span>
        </Link>
        <Link to="/books" className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-blue-600">
          <Compass className="w-5 h-5" />
          <span className="text-3xs font-medium">Khám phá</span>
        </Link>
        <button
          type="button"
          onClick={openCartDrawer}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-blue-600 relative cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-3xs font-medium">Giỏ hàng</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-3xs font-bold flex items-center justify-center">
              {totalCartItems}
            </span>
          )}
        </button>
        <Link to="/wishlist" className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-blue-600">
          <Heart className="w-5 h-5" />
          <span className="text-3xs font-medium">Yêu thích</span>
        </Link>
        <Link
          to={isAuthenticated ? '/me/profile' : '/login'}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-blue-600"
        >
          <User className="w-5 h-5" />
          <span className="text-3xs font-medium">Tài khoản</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 pb-16 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-500">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>BookHub Platform</span>
            </div>
            <p className="leading-relaxed">
              Hệ thống thương mại điện tử chuyên cung cấp sách bản quyền, giáo trình, văn học và tri thức từ các nhà xuất bản hàng đầu Việt Nam.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 text-sm">Về BookHub</h5>
            <ul className="space-y-1.5">
              <li><Link to="/books" className="hover:text-blue-600">Giới thiệu BookHub</Link></li>
              <li><Link to="/books" className="hover:text-blue-600">Tuyển dụng</Link></li>
              <li><Link to="/books" className="hover:text-blue-600">Chính sách bảo mật</Link></li>
              <li><Link to="/books" className="hover:text-blue-600">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 text-sm">Hỗ Trợ Khách Hàng</h5>
            <ul className="space-y-1.5">
              <li>Hotline: 1900 6868 (8:00 - 21:00)</li>
              <li>Email: hotro@bookhub.online</li>
              <li>Chính sách đổi trả trong 7 ngày</li>
              <li>Phương thức vận chuyển</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 text-sm">Phương Thức Thanh Toán</h5>
            <p className="leading-relaxed">
              Hỗ trợ thanh toán linh hoạt qua VNPay QR, Thẻ ATM nội địa, Visa, Mastercard và COD toàn quốc.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-center text-3xs text-slate-400">
          BookHub Web E-Commerce Platform &copy; 2026. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

