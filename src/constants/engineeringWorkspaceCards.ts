import type { Ionicons } from '@expo/vector-icons';
import { colors } from '@/design-system';

export interface WorkspaceCard {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  tone: 'brand' | 'neutral';
  /** Real photo (Unsplash, free license) representing the tool concept — same sourcing pattern as SegmentCarousel/CategoryImages. */
  imageUrl: string;
  accent: string;
}

/**
 * The full Engineering Workspace tool set — shared between the dedicated
 * /(buyer)/engineering page and the homepage "Engineering Workspace" teaser
 * so both surfaces show the same real tools/images instead of the homepage
 * maintaining its own trimmed, icon-only duplicate.
 */
export const ENGINEERING_WORKSPACE_CARDS: WorkspaceCard[] = [
  {
    icon: 'sparkles-outline',
    title: 'AI Engineering Search',
    description: 'Describe a requirement in plain language and get structured, explainable component matches.',
    actionLabel: 'Search with AI',
    href: '/(buyer)/ai-search',
    tone: 'brand',
    imageUrl: 'https://images.unsplash.com/photo-1743796055664-3473eedab36e?auto=format&fit=crop&w=800&q=80',
    accent: colors.brand.primary,
  },
  {
    icon: 'document-attach-outline',
    title: 'BOM & Component Matching',
    description: 'Upload a bill of materials, get exact + alternative matches, and move straight into an RFQ.',
    actionLabel: 'Start BOM Matching',
    href: '/(buyer)/bom',
    tone: 'brand',
    imageUrl: 'https://images.unsplash.com/photo-1739025530417-3d57a2e685f2?auto=format&fit=crop&w=800&q=80',
    accent: colors.teal[500],
  },
  {
    icon: 'construct-outline',
    title: 'Design Request',
    description: 'Send our engineering team a structured brief — application, requirement, quantity, target cost.',
    actionLabel: 'Submit a Design Request',
    href: '/(buyer)/design-request',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    accent: colors.plum[400],
  },
  {
    icon: 'options-outline',
    title: 'Parametric Category Discovery',
    description: 'Browse by manufacturer, technology, mounting style, package, RoHS and availability.',
    actionLabel: 'Browse Categories',
    href: '/(buyer)/category',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1586256053828-a36b572ab01d?auto=format&fit=crop&w=800&q=80',
    accent: colors.status.success,
  },
  {
    icon: 'business-outline',
    title: 'Supplier Network',
    description: 'Explore manufacturer portfolios — product breadth, RoHS coverage, and documentation.',
    actionLabel: 'View Manufacturers',
    href: '/(buyer)/manufacturers',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1685483749753-0dab7e144794?auto=format&fit=crop&w=800&q=80',
    accent: colors.amber[600],
  },
  {
    icon: 'cube-outline',
    title: 'Innovation Lab — AR / 3D Visualization',
    description: 'Camera-based component identification and 3D part visualization, planned as a roadmap add-on.',
    actionLabel: 'Preview Concept',
    href: '/(buyer)/engineering/innovation-lab',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1758523670487-fe71f10c1080?auto=format&fit=crop&w=800&q=80',
    accent: colors.teal[700],
  },
];
