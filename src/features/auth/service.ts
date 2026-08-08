import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { delay } from '@/utils';
import type { Session, User, UserRole } from '@/types';

interface RegisteredUser extends User {
  password: string;
}

/**
 * Clearly-fake demo accounts for this prototype — not real credentials.
 * Shown as hints on the login screens so reviewers can sign in instantly.
 */
const DEMO_USERS: RegisteredUser[] = [
  {
    id: 'demo-buyer-1',
    role: 'buyer',
    fullName: 'Asha Rao',
    email: 'buyer@millenniumdigital.demo',
    password: 'buyer123',
    company: 'Rao Electronics Pvt. Ltd.',
    phone: '+91 98765 43210',
    createdAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'demo-admin-1',
    role: 'admin',
    fullName: 'Millennium Admin',
    email: 'admin@millenniumdigital.demo',
    password: 'admin123',
    createdAt: new Date('2025-01-01').toISOString(),
  },
];

let usersCache: RegisteredUser[] | null = null;

async function loadUsers(): Promise<RegisteredUser[]> {
  if (usersCache) return usersCache;
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.registeredUsers);
  if (raw) {
    usersCache = JSON.parse(raw);
  } else {
    usersCache = DEMO_USERS;
    await AsyncStorage.setItem(STORAGE_KEYS.registeredUsers, JSON.stringify(usersCache));
  }
  return usersCache!;
}

async function saveUsers(users: RegisteredUser[]): Promise<void> {
  usersCache = users;
  await AsyncStorage.setItem(STORAGE_KEYS.registeredUsers, JSON.stringify(users));
}

function toSession(user: RegisteredUser): Session {
  const { password: _password, ...publicUser } = user;
  return { user: publicUser, token: `mock-token-${user.id}-${Date.now()}` };
}

export async function login(
  email: string,
  password: string,
  requiredRole?: UserRole,
): Promise<Session> {
  await delay(500);
  const users = await loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new Error('Incorrect email or password.');
  }
  if (requiredRole && user.role !== requiredRole) {
    throw new Error(
      requiredRole === 'admin'
        ? 'This account does not have seller/admin access.'
        : 'Please use the seller/admin login for this account.',
    );
  }
  return toSession(user);
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

export async function register(input: RegisterInput): Promise<Session> {
  await delay(500);
  const users = await loadUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const user: RegisteredUser = {
    id: `buyer-${Date.now()}`,
    role: 'buyer',
    fullName: input.fullName,
    email: input.email.trim(),
    password: input.password,
    company: input.company,
    phone: input.phone,
    createdAt: new Date().toISOString(),
  };
  await saveUsers([...users, user]);
  return toSession(user);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay(500);
  const users = await loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!exists) {
    throw new Error('No account found with that email address.');
  }
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  await delay(500);
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (idx < 0) {
    throw new Error('No account found with that email address.');
  }
  const updated = [...users];
  updated[idx] = { ...updated[idx], password: newPassword };
  await saveUsers(updated);
}

export async function changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
  await delay(500);
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (idx < 0 || users[idx].password !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }
  const updated = [...users];
  updated[idx] = { ...updated[idx], password: newPassword };
  await saveUsers(updated);
}

export async function getAllCustomers(): Promise<User[]> {
  await delay(300);
  const users = await loadUsers();
  return users
    .filter((u) => u.role === 'buyer')
    .map(({ password: _password, ...user }) => user);
}

export const DEMO_BUYER_CREDENTIALS = { email: DEMO_USERS[0].email, password: DEMO_USERS[0].password };
export const DEMO_ADMIN_CREDENTIALS = { email: DEMO_USERS[1].email, password: DEMO_USERS[1].password };
