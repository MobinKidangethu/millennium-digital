import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { DesignRequest, DesignRequestInput } from '@/types';

/**
 * PROTOTYPE / DEMO design-request intake. Persists locally so the
 * confirmation/reference number survives navigation. A production
 * DesignRequestService would route this into the engineering/BD queue
 * (e.g. alongside RFQService) behind the same submit() shape.
 */

let cache: DesignRequest[] | null = null;
let counter = 0;

async function load(): Promise<DesignRequest[]> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.designRequests);
  cache = raw ? JSON.parse(raw) : [];
  return cache!;
}

async function save(list: DesignRequest[]): Promise<void> {
  cache = list;
  await AsyncStorage.setItem(STORAGE_KEYS.designRequests, JSON.stringify(list));
}

function generateReference(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `DR-${stamp}-${String(++counter).padStart(3, '0')}`;
}

export async function submitDesignRequest(input: DesignRequestInput): Promise<DesignRequest> {
  await delay(700);
  const request: DesignRequest = {
    ...input,
    id: `design-request-${Date.now()}`,
    referenceNumber: generateReference(),
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };
  const list = await load();
  await save([request, ...list]);
  return request;
}

export async function getDesignRequests(): Promise<DesignRequest[]> {
  await delay(300);
  return load();
}

export async function getDesignRequestById(id: string): Promise<DesignRequest | undefined> {
  await delay(200);
  const list = await load();
  return list.find((r) => r.id === id);
}
