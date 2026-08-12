export type UserRole = 'buyer' | 'admin' | 'seller';

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
  /**
   * Seller accounts only — real manufacturer/brand names (matching
   * Product.manufacturer values) this seller account is authorized to
   * manage. A seller's product/order/RFQ views are scoped to this list.
   */
  sellerManufacturers?: string[];
}

export interface Session {
  user: User;
  token: string;
}
