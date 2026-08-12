import type { Ionicons } from '@expo/vector-icons';

export interface AccountNavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  match: (pathname: string) => boolean;
}

export interface AccountNavGroup {
  key: string;
  label: string;
  items: AccountNavItem[];
}

/**
 * Single source of truth for the account section's navigation IA — grouped
 * the way an enterprise B2B account center should read (personal details,
 * commercial history, engineering workflows, shopping tools, preferences)
 * rather than one flat list. Shared by the desktop accordion sidebar
 * (app/(buyer)/account/_layout.tsx) and the mobile grouped list
 * (app/(buyer)/account/index.tsx) so both stay in sync.
 */
export const ACCOUNT_NAV_GROUPS: AccountNavGroup[] = [
  {
    key: 'personal',
    label: 'Personal Information',
    items: [
      { label: 'My Account', href: '/(buyer)/account', icon: 'person-outline', match: (p) => p === '/account' || p === '/' },
      { label: 'Addresses', href: '/(buyer)/account/addresses', icon: 'location-outline', match: (p) => p.includes('/addresses') },
      { label: 'Security', href: '/(buyer)/account/security', icon: 'shield-checkmark-outline', match: (p) => p.includes('/security') },
    ],
  },
  {
    key: 'orders',
    label: 'Orders & Quotes',
    items: [
      { label: 'Order History', href: '/(buyer)/account/orders', icon: 'receipt-outline', match: (p) => p.includes('/account/orders') },
      { label: 'My RFQs', href: '/(buyer)/account/rfqs', icon: 'document-text-outline', match: (p) => p.includes('/account/rfqs') },
    ],
  },
  {
    key: 'engineering',
    label: 'BOM & Design Requests',
    items: [
      { label: 'Import a New BOM', href: '/(buyer)/account/bom', icon: 'document-attach-outline', match: (p) => p.includes('/account/bom') },
      { label: 'My Design Requests', href: '/(buyer)/account/design-requests', icon: 'construct-outline', match: (p) => p.includes('/account/design-requests') },
    ],
  },
  {
    key: 'shopping',
    label: 'Shopping Tools',
    items: [
      { label: 'Wishlist', href: '/(buyer)/account/wishlist', icon: 'heart-outline', match: (p) => p.includes('/account/wishlist') },
      { label: 'Compare', href: '/(buyer)/account/compare', icon: 'git-compare-outline', match: (p) => p.includes('/account/compare') },
      { label: 'Recently Viewed', href: '/(buyer)/account/recently-viewed', icon: 'time-outline', match: (p) => p.includes('/recently-viewed') },
      { label: 'Promotions', href: '/(buyer)/account/promotions', icon: 'pricetags-outline', match: (p) => p.includes('/account/promotions') },
    ],
  },
  {
    key: 'preferences',
    label: 'Preferences',
    items: [
      { label: 'Notifications', href: '/(buyer)/account/notifications', icon: 'notifications-outline', match: (p) => p.includes('/notifications') },
    ],
  },
];
