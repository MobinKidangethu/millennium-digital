import { useQuery } from '@tanstack/react-query';
import * as service from './service';

export function useRfqs() {
  return useQuery({ queryKey: ['rfqs'], queryFn: service.getRfqs });
}
