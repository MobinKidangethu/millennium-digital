import { colors } from '@/design-system';
import { resolveCategoryIcon } from '@/utils';

interface MDCategoryIconProps {
  category: string;
  size?: number;
  color?: string;
}

export function MDCategoryIcon({ category, size = 24, color = colors.brand.primary }: MDCategoryIconProps) {
  const Icon = resolveCategoryIcon(category);
  if (!Icon) return null;
  return <Icon width={size} height={size} color={color} />;
}
