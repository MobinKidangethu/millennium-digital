import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, radius, spacing, MDText } from '@/design-system';
import { ProtoBadge } from '@/components/ProtoBadge';

const PREVIEW_SOURCE = require('../../assets/videos/rfq-product-preview.mp4');

/**
 * Shows the buyer a visual preview of the build before they approve an RFQ
 * — same spirit as the AR/VR "3D product visualization" value-add called
 * out for the platform, done here as a simple looping clip rather than a
 * full 3D viewer. PROTOTYPE: one illustrative demo clip shared across every
 * RFQ, not a real per-component render — a production ProductVisualization
 * service would generate/serve one per line item or manufacturer asset.
 */
export function ProductPreviewVideo() {
  const player = useVideoPlayer(PREVIEW_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
        <MDText variant="h4">Product Visualization</MDText>
        <ProtoBadge label="Illustrative preview clip — not the exact ordered component" />
      </View>
      <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.sm }}>
        A look at how this build comes together before you approve — take a look, then approve to move this RFQ
        into procurement and shipment.
      </MDText>
      <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.gray[900] }}>
        <VideoView
          style={{ width: '100%', aspectRatio: 672 / 448 }}
          player={player}
          nativeControls
          contentFit="cover"
        />
      </View>
    </View>
  );
}
