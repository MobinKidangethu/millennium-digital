import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from './service';

const sellerApplicationsKey = ['seller-applications'] as const;

export function useSellerApplications() {
  return useQuery({ queryKey: sellerApplicationsKey, queryFn: service.getSellerApplications });
}

export function useApproveSellerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.approveSellerApplication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sellerApplicationsKey }),
  });
}
