import { useState } from 'react';
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

function InitialsBadge({ manufacturer, height }: { manufacturer: string; height: number }) {
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

export function MDManufacturerLogo({ manufacturer, width = 96, height = 28 }: MDManufacturerLogoProps) {
  const logo = resolveManufacturerLogo(manufacturer);
  // Remote (hotlinked) logos can fail to load — fall back to the initials
  // badge rather than showing a broken image, same pattern used across
  // the app's other image components (MDProductImage, LineCardTile).
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return <InitialsBadge manufacturer={manufacturer} height={height} />;
  }

  if (logo.kind === 'raster') {
    return (
      <Image
        source={logo.source}
        style={{ width, height }}
        contentFit="contain"
        accessibilityLabel={manufacturer}
        onError={() => setFailed(true)}
      />
    );
  }

  const SvgLogo = logo.Component;
  return <SvgLogo width={width} height={height} accessibilityLabel={manufacturer} />;
}
