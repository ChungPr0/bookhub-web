import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useKpiMetricsQuery,
  useRevenueTrendQuery,
  useTopSellingBooksQuery,
} from '../../hooks/useReportQueries';
import { reportApi } from '../../api/reportApi';
import { ReportPeriod } from '../../types/report.types';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatVND } from '@/core/utils/currency';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('LAST_7_DAYS');
  const [isExporting, setIsExporting] = useState(false);

  const { data: kpi, isLoading: isLoadingKpi } = useKpiMetricsQuery(period);
  const { data: trendData = [], isLoading: isLoadingTrend } = useRevenueTrendQuery(period);
  const { data: topBooks = [], isLoading: isLoadingTopBooks } = useTopSellingBooksQuery(period);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await reportApi.exportReport(period);
      toast.success('Báo cáo phân tích doanh thu Excel (RPT-06) đã được xuất thành công!');
    } catch {
      toast.error('Không thể xuất báo cáo. Vui lòng thử lại sau');
    } finally {
      setIsExporting(false);
    }
  };

  const periodButtons: Array<{ label: string; value: ReportPeriod }> = [
    { label: 'Hôm nay', value: 'TODAY' },
    { label: '7 ngày qua', value: 'LAST_7_DAYS' },
    { label: '30 ngày qua', value: 'LAST_30_DAYS' },
    { label: 'Tháng này', value: 'THIS_MONTH' },
  ];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Bảng Điều Khiển Tổng Quan (Dashboard)"
        description="Theo dõi các chỉ số kinh doanh then chốt, doanh thu bán sách và phân tích tăng trưởng"
        actions={
          <Button
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Xuất báo cáo Excel
          </Button>
        }
      />

      {/* Period Filter Selector */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {periodButtons.map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => setPeriod(btn.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === btn.value
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Doanh thu thuần</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {isLoadingKpi ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {formatVND(kpi?.revenue || 0)}
              </h3>
              <div className="flex items-center gap-1 text-2xs font-bold mt-1 text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{kpi?.revenueGrowthRate || 0}% so với kỳ trước</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tổng đơn hàng</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          {isLoadingKpi ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {kpi?.totalOrders || 0}
              </h3>
              <div className="flex items-center gap-1 text-2xs font-medium mt-1 text-slate-500">
                <span>Tỷ lệ hủy: {kpi?.cancelledOrdersRate || 0}%</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 3: New Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Khách hàng mới</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {isLoadingKpi ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {kpi?.newCustomers || 0}
              </h3>
              <div className="flex items-center gap-1 text-2xs font-bold mt-1 text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Tăng trưởng tài khoản mới</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 4: AOV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Giá trị đơn TB (AOV)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {isLoadingKpi ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {formatVND(kpi?.averageOrderValue || 0)}
              </h3>
              <div className="flex items-center gap-1 text-2xs font-medium mt-1 text-slate-500">
                <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Trung bình trên mỗi hóa đơn</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Xu Hướng Doanh Thu &amp; Lợi Nhuận</h4>
            <span className="text-xs text-slate-400">Đơn vị: VNĐ</span>
          </div>

          {isLoadingTrend ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val) => [formatVND(Number(val)), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Lợi nhuận"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Selling Books Bar Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Top Sách Bán Chạy Nhất</h4>
            <span className="text-xs text-slate-400">Số lượng bán (cuốn)</span>
          </div>

          {isLoadingTopBooks ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBooks} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={110}
                    tick={{ fontSize: 10, fill: '#334155' }}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} cuốn`, 'Đã bán']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="unitsSold" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

