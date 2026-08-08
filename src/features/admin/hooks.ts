import { useQuery } from '@tanstack/react-query';
import * as service from './service';

export function useDashboardStats() {
  return useQuery({ queryKey: ['admin', 'dashboard-stats'], queryFn: service.getDashboardStats });
}

export function useAnalytics() {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: service.getAnalytics });
}
