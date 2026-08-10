import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, useResponsive, useHoverPress, webTransition, MDBadge, MDText } from '@/design-system';
import { resolveProductImage } from '@/utils';
import { MDImagePlaceholder } from './MDImagePlaceholder';

interface MDProductImageGalleryProps {
  imagePath: string;
  alt: string;
  badge?: string;
  /**
   * How many thumbnail slots to render below the main image. Every
   * thumbnail reuses the same real product photo — we only have one
   * angle per part in products.json today, so this builds the gallery
   * interaction without inventing photography that doesn't exist.
   */
  thumbnailCount?: number;
}

const ZOOM = 2.2;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Hover-to-magnify + click-nowhere-needed image used inside the lightbox
 * modal. The magnifier lens + side pane only activate on web (real mouse
 * hover doesn't exist on touch), guarded via Platform.OS.
 */
function ZoomableImage({
  source,
  alt,
  size,
  paneSize,
  magnifierEnabled,
}: {
  source: number;
  alt: string;
  size: number;
  paneSize?: number;
  magnifierEnabled: boolean;
}) {
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  const mouseHandlers = magnifierEnabled
    ? {
        onMouseEnter: () => setHovering(true),
        onMouseLeave: () => setHovering(false),
        onMouseMove: (e: any) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            x: clamp01((e.clientX - rect.left) / rect.width),
            y: clamp01((e.clientY - rect.top) / rect.height),
          });
        },
      }
    : {};

  const lensSize = size * 0.36;

  return (
    <View style={{ flexDirection: paneSize ? 'row' : 'column', gap: spacing.lg, alignItems: 'flex-start' }}>
      <View
        {...mouseHandlers}
        style={{
          width: size,
          height: size,
          position: 'relative',
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: colors.gray[0],
        }}
      >
        <Image source={source} contentFit="contain" style={{ width: '100%', height: '100%' }} accessibilityLabel={alt} />
        {hovering ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: lensSize,
              height: lensSize,
              left: pos.x * size - lensSize / 2,
              top: pos.y * size - lensSize / 2,
              borderWidth: 1.5,
              borderColor: colors.brand.primary,
              backgroundColor: 'rgba(139, 21, 74, 0.12)',
            }}
          />
        ) : null}
      </View>

      {paneSize && hovering ? (
        <View
          style={[
            {
              width: paneSize,
              height: paneSize,
              borderRadius: radius.lg,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.gray[0],
            },
            shadow.lg,
          ]}
        >
          <Image
            source={source}
            contentFit="contain"
            style={{
              width: size * ZOOM,
              height: size * ZOOM,
              position: 'absolute',
              left: -(pos.x * size * ZOOM - paneSize / 2),
              top: -(pos.y * size * ZOOM - paneSize / 2),
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function Thumbnail({
  source,
  active,
  alt,
  index,
  onPress,
}: {
  source: number;
  active: boolean;
  alt: string;
  index: number;
  onPress: () => void;
}) {
  const { hovered, pressed, hoverHandlers, pressHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`View image ${index + 1} of ${alt}`}
      {...hoverHandlers}
      {...pressHandlers}
      style={[
        webTransition,
        {
          width: 56,
          height: 56,
          borderRadius: radius.sm,
          borderWidth: 1.5,
          borderColor: active ? colors.brand.primary : hovered ? colors.brand.primarySoftBorder : colors.border,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.94 : hovered ? 1.05 : 1 }],
        },
      ]}
    >
      <Image source={source} contentFit="contain" style={{ width: '100%', height: '100%' }} />
    </Pressable>
  );
}

function ModalCloseButton({ onPress }: { onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Close"
      {...hoverHandlers}
      style={[
        webTransition,
        {
          position: 'absolute',
          top: spacing.xl,
          right: spacing.xl,
          width: 40,
          height: 40,
          borderRadius: radius.pill,
          backgroundColor: hovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: hovered ? 1.08 : 1 }],
        },
      ]}
    >
      <Ionicons name="close" size={22} color={colors.gray[0]} />
    </Pressable>
  );
}

export function MDProductImageGallery({ imagePath, alt, badge, thumbnailCount = 3 }: MDProductImageGalleryProps) {
  const { isDesktopUp } = useResponsive();
  const source = resolveProductImage(imagePath);
  const [failed, setFailed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const { hovered: mainHovered, hoverHandlers: mainHoverHandlers } = useHoverPress();

  if (!source || failed) {
    return (
      <View style={{ width: '100%', aspectRatio: 1 }}>
        <MDImagePlaceholder />
      </View>
    );
  }

  const magnifierEnabled = Platform.OS === 'web';
  // On desktop, thumbnails run as a vertical rail beside the main image
  // (classic premium-PDP pattern); on mobile there's no room for a side
  // rail, so they stay as a row below the main image.
  const verticalRail = isDesktopUp && thumbnailCount > 1;

  const mainImage = (
    <Pressable
      onPress={() => setModalOpen(true)}
      accessibilityLabel={`View larger image of ${alt}`}
      {...mainHoverHandlers}
      style={[webTransition, verticalRail ? { flex: 1, minWidth: 0 } : undefined]}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 1,
          position: 'relative',
          borderRadius: radius.md,
          overflow: 'hidden',
          borderWidth: 1.5,
          borderColor: mainHovered ? colors.brand.primarySoftBorder : 'transparent',
        }}
      >
        <Image
          source={source}
          contentFit="contain"
          style={{
            width: '100%',
            height: '100%',
            transform: [{ scale: mainHovered ? 1.03 : 1 }],
          }}
          accessibilityLabel={alt}
          onError={() => setFailed(true)}
        />
        {badge ? (
          <View style={{ position: 'absolute', top: spacing.md, left: spacing.md }}>
            <MDBadge label={badge} tone="brand" size="md" />
          </View>
        ) : null}
        <View
          style={{
            position: 'absolute',
            bottom: spacing.sm,
            right: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(24,23,26,0.65)',
            borderRadius: radius.pill,
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
          }}
        >
          <Ionicons name="expand-outline" size={12} color={colors.gray[0]} />
          <MDText variant="caption" style={{ color: colors.gray[0] }}>
            Click to zoom
          </MDText>
        </View>
      </View>
    </Pressable>
  );

  const thumbnails =
    thumbnailCount > 1 ? (
      <View
        style={{
          flexDirection: verticalRail ? 'column' : 'row',
          gap: spacing.sm,
          marginTop: verticalRail ? 0 : spacing.sm,
        }}
      >
        {Array.from({ length: thumbnailCount }).map((_, i) => (
          <Thumbnail
            key={i}
            source={source}
            active={i === activeThumb}
            alt={alt}
            index={i}
            onPress={() => {
              setActiveThumb(i);
              setModalOpen(true);
            }}
          />
        ))}
      </View>
    ) : null;

  return (
    <View>
      {verticalRail ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {thumbnails}
          {mainImage}
        </View>
      ) : (
        <>
          {mainImage}
          {thumbnails}
        </>
      )}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable
          onPress={() => setModalOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,14,16,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={{ alignItems: 'center' }}>
            <ZoomableImage
              source={source}
              alt={alt}
              size={isDesktopUp ? 480 : 300}
              paneSize={isDesktopUp ? 420 : undefined}
              magnifierEnabled={magnifierEnabled}
            />
            {magnifierEnabled ? (
              <MDText variant="caption" style={{ color: colors.gray[300], marginTop: spacing.md }}>
                Hover to magnify
              </MDText>
            ) : null}
          </Pressable>
          <ModalCloseButton onPress={() => setModalOpen(false)} />
        </Pressable>
      </Modal>
    </View>
  );
}
