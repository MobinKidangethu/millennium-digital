import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, MDButton } from '@/design-system';

interface MDDatasheetButtonProps {
  url: string;
  label?: string;
  variant?: 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function MDDatasheetButton({
  url,
  label = 'View Datasheet',
  variant = 'outline',
  fullWidth,
}: MDDatasheetButtonProps) {
  return (
    <MDButton
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      iconLeft={<Ionicons name="document-text-outline" size={16} color={colors.brand.primary} />}
      onPress={() => Linking.openURL(url)}
    />
  );
}
