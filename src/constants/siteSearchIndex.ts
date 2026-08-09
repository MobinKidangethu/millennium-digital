import type { Ionicons } from '@expo/vector-icons';

export interface SiteSearchEntry {
  label: string;
  description: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  keywords: string[];
}

/**
 * Static index of app sections/workflows (not products) so the header
 * search can resolve queries like "bom", "rfq", "suppliers", or "wishlist"
 * straight to the right screen — not just catalog parts. Matched by
 * substring against label + keywords in GlobalSearchBar. Kept separate
 * from product search (useProducts' matchesSearch) and category/manufacturer
 * matching, which pull from real catalog data.
 */
export const SITE_SEARCH_INDEX: SiteSearchEntry[] = [
  {
    label: 'Engineering Workspace',
    description: 'AI search, BOM matching, and design requests',
    href: '/(buyer)/engineering',
    icon: 'sparkles-outline',
    keywords: ['engineering', 'workspace', 'tools'],
  },
  {
    label: 'AI Engineering Search',
    description: 'Describe a requirement in plain language',
    href: '/(buyer)/ai-search',
    icon: 'sparkles-outline',
    keywords: ['ai', 'natural language', 'requirement', 'search assistant'],
  },
  {
    label: 'BOM & Component Matching',
    description: 'Upload a BOM and match it against the catalog',
    href: '/(buyer)/bom',
    icon: 'document-attach-outline',
    keywords: ['bom', 'bill of materials', 'upload', 'component matching', 'import'],
  },
  {
    label: 'Design Request',
    description: 'Send our engineering team a structured brief',
    href: '/(buyer)/design-request',
    icon: 'construct-outline',
    keywords: ['design request', 'engineering brief', 'project'],
  },
  {
    label: 'Parametric Category Browser',
    description: 'Discover parts by technical parameters',
    href: '/(buyer)/category',
    icon: 'options-outline',
    keywords: ['category', 'categories', 'parametric', 'filter', 'browse'],
  },
  {
    label: 'Products',
    description: 'Browse the full catalog by category',
    href: '/(buyer)/products',
    icon: 'cube-outline',
    keywords: ['products', 'catalog', 'parts', 'components', 'all products'],
  },
  {
    label: 'Manufacturer Directory',
    description: 'Verified manufacturers on the platform',
    href: '/(buyer)/manufacturers',
    icon: 'business-outline',
    keywords: ['manufacturers', 'brands', 'suppliers directory'],
  },
  {
    label: 'Supplier Network',
    description: 'Join the marketplace as a verified supplier',
    href: '/(buyer)/suppliers',
    icon: 'people-outline',
    keywords: ['suppliers', 'sell', 'seller', 'marketplace', 'vendor'],
  },
  {
    label: 'My RFQs',
    description: 'Track quote requests and governed pricing',
    href: '/(buyer)/account/rfqs',
    icon: 'document-text-outline',
    keywords: ['rfq', 'quote', 'quotes', 'pricing'],
  },
  {
    label: 'Order History',
    description: 'Track orders and shipments',
    href: '/(buyer)/account/orders',
    icon: 'receipt-outline',
    keywords: ['orders', 'order history', 'tracking', 'shipment'],
  },
  {
    label: 'My Design Requests',
    description: 'Status of submitted design briefs',
    href: '/(buyer)/account/design-requests',
    icon: 'construct-outline',
    keywords: ['design requests', 'engineering review'],
  },
  {
    label: 'Wishlist',
    description: 'Components saved for later',
    href: '/(buyer)/account/wishlist',
    icon: 'heart-outline',
    keywords: ['wishlist', 'saved', 'favorites'],
  },
  {
    label: 'Compare Products',
    description: 'Compare specifications side by side',
    href: '/(buyer)/account/compare',
    icon: 'git-compare-outline',
    keywords: ['compare', 'comparison', 'specs'],
  },
  {
    label: 'Cart',
    description: 'Items ready for checkout',
    href: '/(buyer)/cart',
    icon: 'cart-outline',
    keywords: ['cart', 'checkout', 'basket'],
  },
  {
    label: 'My Account',
    description: 'Profile, addresses, and account settings',
    href: '/(buyer)/account',
    icon: 'person-outline',
    keywords: ['account', 'profile', 'settings', 'addresses'],
  },
  {
    label: 'Sell on Millennium Digital',
    description: 'Apply to list your catalogue as a supplier',
    href: '/(auth)/seller-register',
    icon: 'storefront-outline',
    keywords: ['sell', 'seller', 'supplier application', 'become a supplier'],
  },
];
