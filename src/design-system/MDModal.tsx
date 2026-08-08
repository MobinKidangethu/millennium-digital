import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from './tokens';
import { MDText } from './MDText';
import { MDIconButton } from './MDIconButton';

interface MDModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
}

export function MDModal({ visible, onClose, title, children, maxWidth = 480 }: MDModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(35,34,38,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              width: '100%',
              maxWidth,
              backgroundColor: colors.surfaceRaised,
              borderRadius: radius.xl,
              padding: spacing.xl,
            },
            shadow.lg,
          ]}
        >
          {title ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.lg,
              }}
            >
              <MDText variant="h3">{title}</MDText>
              <MDIconButton accessibilityLabel="Close" onPress={onClose}>
                <Ionicons name="close" size={18} color={colors.text.secondary} />
              </MDIconButton>
            </View>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
