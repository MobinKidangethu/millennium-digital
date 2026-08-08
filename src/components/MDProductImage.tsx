import { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { radius } from '@/design-system';
import { resolveProductImage } from '@/utils';
import { MDImagePlaceholder } from './MDImagePlaceholder';

interface MDProductImageProps {
  imagePath: string;
  alt: string;
  style?: StyleProp<ViewStyle>;
}

export function MDProductImage({ imagePath, alt, style }: MDProductImageProps) {
  const [failed, setFailed] = useState(false);
  const source = resolveProductImage(imagePath);

  return (
    <View style={[{ borderRadius: radius.md, overflow: 'hidden' }, style]}>
      {source && !failed ? (
        <Image
          source={source}
          contentFit="contain"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <MDImagePlaceholder />
      )}
    </View>
  );
}
