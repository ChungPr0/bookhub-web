export type ReportPeriod = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH';

export interface KpiMetricsDto {
  revenue: number;
  revenueGrowthRate: number;
  totalOrders: number;
  cancelledOrdersRate: number;
  newCustomers: number;
  averageOrderValue: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  profit: number;
}

export interface TopBookItem {
  id: number;
  title: string;
  authorName: string;
  unitsSold: number;
  revenue: number;
}

