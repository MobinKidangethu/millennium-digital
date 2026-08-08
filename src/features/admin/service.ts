import * as productRepository from '@/features/products/repository';
import { getCategories } from '@/features/products/service';
import { getAllOrders } from '@/features/orders/service';
import { getAllCustomers } from '@/features/auth/service';
import { LOW_STOCK_THRESHOLD } from './constants';
import type { ChartDatum } from '@/design-system';

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
  totalCustomers: number;
  totalManufacturers: number;
  salesTrend: ChartDatum[];
  topCategories: ChartDatum[];
  orderStatusBreakdown: ChartDatum[];
  currency: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [products, orders, customers, categories] = await Promise.all([
    productRepository.getAllProducts(),
    getAllOrders(),
    getAllCustomers(),
    getCategories(),
  ]);

  const activeProducts = products.filter((p) => p.isPublished);
  const lowStock = activeProducts.filter((p) => p.availability < LOW_STOCK_THRESHOLD && p.availability > 0).length;
  const outOfStock = activeProducts.filter((p) => p.availability === 0 || p.stockStatus.toLowerCase().includes('out')).length;

  const nonCancelled = orders.filter((o) => o.status !== 'cancelled');
  const revenue = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'processing').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  const manufacturerSet = new Set(activeProducts.map((p) => p.manufacturer));

  const salesTrend: ChartDatum[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - i));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const dayOrders = nonCancelled.filter((o) => {
      const placed = new Date(o.placedAt);
      return placed >= date && placed < nextDate;
    });
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      value: dayOrders.reduce((sum, o) => sum + o.total, 0),
    };
  });

  const topCategories: ChartDatum[] = categories.slice(0, 5).map((c) => ({ label: c.name, value: c.productCount }));

  const statusCounts = new Map<string, number>();
  for (const order of orders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
  }
  const orderStatusBreakdown: ChartDatum[] = Array.from(statusCounts.entries()).map(([label, value]) => ({ label, value }));

  return {
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    lowStock,
    outOfStock,
    totalOrders: orders.length,
    pendingOrders,
    completedOrders,
    revenue,
    totalCustomers: customers.length,
    totalManufacturers: manufacturerSet.size,
    salesTrend,
    topCategories,
    orderStatusBreakdown,
    currency: 'INR',
  };
}

export interface AnalyticsData {
  topProducts: ChartDatum[];
  inventoryStatus: ChartDatum[];
  ordersByStatus: ChartDatum[];
  salesTrend: ChartDatum[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const [products, orders] = await Promise.all([productRepository.getAllProducts(), getAllOrders()]);
  const activeProducts = products.filter((p) => p.isPublished);
  const nonCancelled = orders.filter((o) => o.status !== 'cancelled');

  const quantityByPart = new Map<string, number>();
  for (const order of nonCancelled) {
    for (const item of order.items) {
      quantityByPart.set(item.manufacturerPartNumber, (quantityByPart.get(item.manufacturerPartNumber) ?? 0) + item.quantity);
    }
  }
  const topProducts: ChartDatum[] = Array.from(quantityByPart.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const healthy = activeProducts.filter((p) => p.availability >= LOW_STOCK_THRESHOLD).length;
  const low = activeProducts.filter((p) => p.availability > 0 && p.availability < LOW_STOCK_THRESHOLD).length;
  const out = activeProducts.filter((p) => p.availability === 0).length;
  const inventoryStatus: ChartDatum[] = [
    { label: 'Healthy', value: healthy },
    { label: 'Low', value: low },
    { label: 'Out', value: out },
  ];

  const statusCounts = new Map<string, number>();
  for (const order of orders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
  }
  const ordersByStatus: ChartDatum[] = Array.from(statusCounts.entries()).map(([label, value]) => ({ label, value }));

  const salesTrend: ChartDatum[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - i));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const dayOrders = nonCancelled.filter((o) => {
      const placed = new Date(o.placedAt);
      return placed >= date && placed < nextDate;
    });
    return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), value: dayOrders.length };
  });

  return { topProducts, inventoryStatus, ordersByStatus, salesTrend };
}
