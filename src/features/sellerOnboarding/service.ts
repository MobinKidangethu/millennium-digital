import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { SellerApplication, SellerApplicationInput } from '@/types';

/**
 * PROTOTYPE / DEMO seller onboarding intake. Persists locally so the
 * reference number and status survive navigation. This does not create a
 * real multi-tenant supplier account — actual console access in this
 * prototype still runs through the shared Seller/Admin console login.
 * A production SupplierService would create a verified tenant here and
 * route through real KYB/GST verification before granting console access,
 * behind the same submit() shape (see Supplier Lifecycle on /suppliers).
 */

let cache: SellerApplication[] | null = null;
let counter = 0;

async function load(): Promise<SellerApplication[]> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.sellerApplications);
  cache = raw ? JSON.parse(raw) : [];
  return cache!;
}

async function save(list: SellerApplication[]): Promise<void> {
  cache = list;
  await AsyncStorage.setItem(STORAGE_KEYS.sellerApplications, JSON.stringify(list));
}

function generateReference(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `SUP-${stamp}-${String(++counter).padStart(3, '0')}`;
}

export async function submitSellerApplication(input: SellerApplicationInput): Promise<SellerApplication> {
  await delay(800);
  const application: SellerApplication = {
    ...input,
    id: `seller-application-${Date.now()}`,
    referenceNumber: generateReference(),
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };
  const list = await load();
  await save([application, ...list]);
  return application;
}

export async function getSellerApplications(): Promise<SellerApplication[]> {
  await delay(300);
  return load();
}
