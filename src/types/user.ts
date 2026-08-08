export type UserRole = 'buyer' | 'admin';

export interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
}
