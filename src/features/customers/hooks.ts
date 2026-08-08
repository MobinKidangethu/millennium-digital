import { useQuery } from '@tanstack/react-query';
import * as service from './service';

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: service.getCustomersWithStats });
}
