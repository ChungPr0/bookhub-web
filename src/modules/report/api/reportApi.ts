import { axiosClient } from '@/core/http/axiosClient';
import {
  KpiMetricsDto,
  ReportPeriod,
  RevenueTrendPoint,
  TopBookItem,
} from '../types/report.types';

export const reportApi = {
  getKpiMetrics: async (period: ReportPeriod): Promise<KpiMetricsDto> => {
    const res = await axiosClient.get<KpiMetricsDto>('/admin/reports/kpi', {
      params: { period },
    });
    return res.data;
  },

  getRevenueTrend: async (period: ReportPeriod): Promise<RevenueTrendPoint[]> => {
    const res = await axiosClient.get<RevenueTrendPoint[]>('/admin/reports/revenue-trend', {
      params: { period },
    });
    return res.data;
  },

  getTopSellingBooks: async (period: ReportPeriod): Promise<TopBookItem[]> => {
    const res = await axiosClient.get<TopBookItem[]>('/admin/reports/top-books', {
      params: { period },
    });
    return res.data;
  },

  exportReport: async (period: ReportPeriod): Promise<void> => {
    // RPT-06 Export Excel / CSV
    await axiosClient.get('/admin/reports/export', {
      params: { period },
      responseType: 'blob',
    });
  },
};

