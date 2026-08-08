import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from './tokens';
import { MDText } from './MDText';
import { MDIconButton } from './MDIconButton';

interface MDBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeightRatio?: number;
}

export function MDBottomSheet({ visible, onClose, title, children, maxHeightRatio = 0.85 }: MDBottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(35,34,38,0.5)', justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              backgroundColor: colors.surfaceRaised,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight: `${maxHeightRatio * 100}%`,
              paddingBottom: insets.bottom + spacing.lg,
            },
            shadow.lg,
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
            <View style={{ width: 36, height: 4, borderRadius: radius.pill, backgroundColor: colors.gray[300] }} />
          </View>

          {title ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
              }}
            >
              <MDText variant="h4">{title}</MDText>
              <MDIconButton accessibilityLabel="Close" onPress={onClose}>
                <Ionicons name="close" size={18} color={colors.text.secondary} />
              </MDIconButton>
            </View>
          ) : null}

          <ScrollView style={{ paddingHorizontal: spacing.lg }}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
