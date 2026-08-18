import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from './service';
import type { RfqSource, RfqStatus } from '@/types';
import type { PlaceRfqOrderInput, RfqLineInput } from './service';

export const rfqKeys = {
  all: ['rfqs'] as const,
  detail: (id: string) => ['rfqs', 'detail', id] as const,
};

export function useRfqs() {
  return useQuery({ queryKey: rfqKeys.all, queryFn: service.getRfqs });
}

export function useRfq(id: string | undefined) {
  return useQuery({
    queryKey: rfqKeys.detail(id ?? ''),
    queryFn: () => service.getRfqById(id!),
    enabled: !!id,
  });
}

/**
 * The account's queries default to a 60s staleTime (see app/_layout.tsx), so
 * without explicit invalidation a freshly-submitted RFQ wouldn't show up on
 * RFQ Order Status / the Admin RFQ console for up to a minute. Route RFQ
 * creation through this mutation (instead of calling service.createRfq
 * directly) wherever the buyer submits one, so those lists refresh right away.
 */
export function useCreateRfq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lines, source }: { lines: RfqLineInput[]; source: RfqSource }) => service.createRfq(lines, source),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rfqKeys.all }),
  });
}

export function useAdvanceRfqStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RfqStatus }) => service.advanceRfqStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
      queryClient.invalidateQueries({ queryKey: rfqKeys.detail(variables.id) });
    },
  });
}

export function usePlaceRfqOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlaceRfqOrderInput }) => service.placeRfqOrder(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
      queryClient.invalidateQueries({ queryKey: rfqKeys.detail(updated.id) });
    },
  });
}
