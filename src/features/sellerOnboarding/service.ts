import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { authService } from '@/features/auth';
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

export interface ApproveSellerApplicationResult {
  application: SellerApplication;
  temporaryPassword: string;
}

/**
 * Admin-only action: grants console access by provisioning a real seller
 * account (see authService.createSellerAccount) and advancing the
 * application straight to 'console_access'. A seller can never self-grant
 * this — it only runs from the admin Seller Applications review queue.
 */
export async function approveSellerApplication(application: SellerApplication): Promise<ApproveSellerApplicationResult> {
  const list = await load();
  const idx = list.findIndex((a) => a.id === application.id);
  if (idx < 0) throw new Error('Application not found.');

  const { temporaryPassword } = await authService.createSellerAccount({
    companyName: application.companyName,
    contactName: application.contactName,
    email: application.email,
    phone: application.phone,
    manufacturerName: application.companyName,
  });

  const updated: SellerApplication = { ...list[idx], status: 'console_access' };
  const next = [...list];
  next[idx] = updated;
  await save(next);

  return { application: updated, temporaryPassword };
}
