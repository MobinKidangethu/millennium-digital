import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/state';
import * as service from './service';
import type { CreateOrderInput } from './service';

export const orderKeys = {
  all: ['orders'] as const,
  list: (userId: string) => ['orders', 'list', userId] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
};

export function useOrders(userId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.list(userId ?? ''),
    queryFn: () => service.getOrders(userId!),
    enabled: !!userId,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => service.getOrderById(id!),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);
  return useMutation({
    mutationFn: (input: CreateOrderInput) => service.createOrder(input),
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.cancelOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useReorder() {
  const addItem = useCartStore((s) => s.addItem);
  return (order: { items: { productId: number; quantity: number }[] }) => {
    for (const item of order.items) {
      addItem(item.productId, item.quantity);
    }
  };
}
