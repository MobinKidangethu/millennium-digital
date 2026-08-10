import { Fragment } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, useHoverPress, webTransition, MDText } from '@/design-system';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MDBreadcrumbProps {
  items: BreadcrumbItem[];
}

function BreadcrumbLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable onPress={onPress} {...hoverHandlers} style={webTransition}>
      <MDText variant="caption" style={{ color: hovered ? colors.brand.primary : colors.text.secondary, textDecorationLine: hovered ? 'underline' : 'none' }}>
        {label}
      </MDText>
    </Pressable>
  );
}

export function MDBreadcrumb({ items }: MDBreadcrumbProps) {
  const router = useRouter();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <Ionicons name="chevron-forward" size={12} color={colors.text.tertiary} style={{ marginHorizontal: 2 }} />
            ) : null}
            {item.href && !isLast ? (
              <BreadcrumbLink label={item.label} onPress={() => router.push(item.href as never)} />
            ) : (
              <MDText variant="caption" tone={isLast ? 'primary' : 'secondary'} weight={isLast ? '600' : '400'}>
                {item.label}
              </MDText>
            )}
          </Fragment>
        );
      })}
    </View>
  );
}
