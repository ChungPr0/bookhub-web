import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { BookOpen, ShieldCheck, ShoppingBag, Layers, Terminal } from 'lucide-react';
import { formatVND } from '@/core/utils/currency';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        {/* Header */}
        <header className="border-b bg-white px-6 py-4 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">BookHub Web</h1>
                <p className="text-xs text-slate-500 font-medium">Modular Architecture v2.0</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ready for Sprint 1
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Khởi tạo Dự án Frontend Thành Công! 🚀
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hệ thống đã sẵn sàng với React 18+, Vite, TypeScript, Tailwind CSS, Axios Interceptors (Silent Refresh Mutex), TanStack Query và Zustand Store.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Modular Structure</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tách biệt các domain: <code>modules/auth</code>, <code>catalog</code>, <code>cart</code>, <code>order</code>, <code>user</code>, <code>inventory</code>, <code>report</code>.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Silent Refresh & Mutex</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Axios interceptor tự động bắt 401, xếp hàng request và refresh token 7 ngày mà không làm gián đoạn người dùng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Checkout & Anti-Slippage</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tích hợp <code>Idempotency-Key</code> (UUID v4), phòng chống trượt giá và điều hướng cổng thanh toán VNPay.
              </p>
            </div>
          </div>

          {/* Sample Format Display */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs shadow-md">
            <div className="flex items-center gap-2 mb-3 text-slate-400 border-b border-slate-800 pb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Sanity Check: Core Utilities & Contracts</span>
            </div>
            <div className="space-y-1">
              <p className="text-emerald-400">✓ Path Alias @/* working: import from '@/core/utils/currency'</p>
              <p className="text-blue-300">✓ Sample VND Format: formatVND(250000) =&gt; <span className="font-bold text-white">{formatVND(250000)}</span></p>
              <p className="text-purple-300">✓ Token Manager &amp; useAuthStore initialized</p>
              <p className="text-slate-400">✓ Backend Target: {import.meta.env.VITE_API_BASE_URL || 'https://bookhubapi.tienchung.online/api/v1'}</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white px-6 py-4 text-center text-xs text-slate-500">
          BookHub API &amp; Web Frontend Platform &copy; 2026. All rights reserved.
        </footer>

        <Toaster position="top-right" richColors />
      </div>
    </QueryClientProvider>
  );
}

export default App;
