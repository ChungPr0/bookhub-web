import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { ReportPeriod } from '../types/report.types';

export const useKpiMetricsQuery = (period: ReportPeriod) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'kpi', period],
    queryFn: () => reportApi.getKpiMetrics(period),
    staleTime: 60 * 1000,
  });
};

export const useRevenueTrendQuery = (period: ReportPeriod) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'revenue-trend', period],
    queryFn: () => reportApi.getRevenueTrend(period),
    staleTime: 60 * 1000,
  });
};

export const useTopSellingBooksQuery = (period: ReportPeriod) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'top-books', period],
    queryFn: () => reportApi.getTopSellingBooks(period),
    staleTime: 60 * 1000,
  });
};

