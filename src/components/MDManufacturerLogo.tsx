import { View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius } from '@/design-system';
import { MDText } from '@/design-system';
import { manufacturerInitials, resolveManufacturerLogo } from '@/utils';

interface MDManufacturerLogoProps {
  manufacturer: string;
  width?: number;
  height?: number;
}

export function MDManufacturerLogo({ manufacturer, width = 96, height = 28 }: MDManufacturerLogoProps) {
  const logo = resolveManufacturerLogo(manufacturer);

  if (!logo) {
    const size = height;
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: colors.brand.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityLabel={manufacturer}
      >
        <MDText variant="caption" weight="700" style={{ color: colors.brand.primary }}>
          {manufacturerInitials(manufacturer)}
        </MDText>
      </View>
    );
  }

  if (logo.kind === 'raster') {
    return (
      <Image
        source={logo.source}
        style={{ width, height }}
        contentFit="contain"
        accessibilityLabel={manufacturer}
      />
    );
  }

  const SvgLogo = logo.Component;
  return <SvgLogo width={width} height={height} accessibilityLabel={manufacturer} />;
}
