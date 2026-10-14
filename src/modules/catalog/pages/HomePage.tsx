import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, ShieldCheck, Truck, RefreshCcw, ArrowRight } from 'lucide-react';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton } from '../components/BookCardSkeleton';
import { useBestSellersQuery, useNewArrivalsQuery } from '../hooks/useCatalogQueries';
import { Button } from '@/components/ui/Button';

export const HomePage: React.FC = () => {
  const { data: bestSellers = [], isLoading: isLoadingBestSellers } = useBestSellersQuery();
  const { data: newArrivals = [], isLoading: isLoadingNewArrivals } = useNewArrivalsQuery();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-blue-100 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Tri thức kiến tạo tương lai
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Khám Phá Hàng Ngàn Cuốn Sách Hay Nhất Tại BookHub
            </h1>
            <p className="text-sm md:text-base text-blue-100/90 leading-relaxed">
              Trải nghiệm mua sách bản quyền trực tuyến tiện lợi, đóng gói cẩn thận, giao hàng siêu tốc với chính sách bảo đảm 100%.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/books">
                <Button variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md">
                  Khám phá danh mục sách
                </Button>
              </Link>
              <Link to="/books?sortBy=best-seller">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-bold">
                  Sách bán chạy nhất
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative w-64 h-80 shrink-0 hidden md:flex items-center justify-center">
            <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-xl" />
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"
              alt="Book showcase"
              className="relative w-52 h-72 object-cover rounded-xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">100% Sách Thật &amp; Bản Quyền</h4>
            <p className="text-xs text-slate-500">Phát hành trực tiếp từ nhà xuất bản</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Giao Hàng Siêu Tốc</h4>
            <p className="text-xs text-slate-500">Đóng gói chống sốc 2 lớp bảo vệ bìa</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Đổi Trả Trong 7 Ngày</h4>
            <p className="text-xs text-slate-500">Hỗ trợ 1-đổi-1 nếu lỗi in ấn</p>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Sách Bán Chạy Nhất</h2>
              <p className="text-xs text-slate-500">Những tác phẩm được độc giả đón đọc nhiều nhất</p>
            </div>
          </div>
          <Link
            to="/books?sortBy=best-seller"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoadingBestSellers
            ? Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)
            : bestSellers.slice(0, 5).map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Sách Mới Phát Hành</h2>
              <p className="text-xs text-slate-500">Cập nhật những tựa sách mới lên kệ hàng tuần</p>
            </div>
          </div>
          <Link
            to="/books?sortBy=newest"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoadingNewArrivals
            ? Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)
            : newArrivals.slice(0, 5).map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>
    </div>
  );
};

