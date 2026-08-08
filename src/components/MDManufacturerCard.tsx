import { useRouter } from 'expo-router';
import { spacing, MDCard, MDText } from '@/design-system';
import type { Manufacturer } from '@/types';
import { MDManufacturerLogo } from './MDManufacturerLogo';

interface MDManufacturerCardProps {
  manufacturer: Manufacturer;
}

export function MDManufacturerCard({ manufacturer }: MDManufacturerCardProps) {
  const router = useRouter();

  return (
    <MDCard
      onPress={() =>
        router.push({ pathname: '/(buyer)/manufacturers/[slug]', params: { slug: manufacturer.slug } })
      }
      style={{ flex: 1, alignItems: 'center', gap: spacing.md, minHeight: 128, justifyContent: 'center' }}
      elevation="sm"
    >
      <MDManufacturerLogo manufacturer={manufacturer.name} width={120} height={36} />
      <MDText variant="caption" tone="tertiary">
        {manufacturer.productCount} product{manufacturer.productCount === 1 ? '' : 's'}
      </MDText>
    </MDCard>
  );
}
