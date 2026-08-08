import { getAllCustomers } from '@/features/auth/service';
import { getAllOrders } from '@/features/orders/service';
import type { User } from '@/types';

export interface CustomerWithStats extends User {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export async function getCustomersWithStats(): Promise<CustomerWithStats[]> {
  const [customers, orders] = await Promise.all([getAllCustomers(), getAllOrders()]);

  return customers.map((customer) => {
    const customerOrders = orders.filter((o) => o.userId === customer.id && o.status !== 'cancelled');
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrderAt = customerOrders[0]?.placedAt ?? null;
    return {
      ...customer,
      orderCount: customerOrders.length,
      totalSpent,
      lastOrderAt,
    };
  });
}
