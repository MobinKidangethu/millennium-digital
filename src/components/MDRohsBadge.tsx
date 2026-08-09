import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MDText } from '@/design-system';

const ROHS_GREEN = '#34A934';

/**
 * Two-leaf glyph matching the standard RoHS compliance mark (industry-
 * standard iconography, not a Millennium Digital invention) — a smaller
 * leaf tucked behind a larger leaf, each with a vein line, redrawn as an
 * inline SVG from the reference mark since we can't load a third-party
 * icon font (e.g. Font Awesome's fa-m-rohs glyph) without adding a new
 * dependency.
 */
export function MDRohsIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Small leaf, behind, pointing left */}
      <Path d="M1,13 Q0.5,18 9.5,20.8 Q5.5,14.5 1,13 Z" fill={ROHS_GREEN} />
      <Path
        d="M2,13.3 Q5,16.5 9,20"
        stroke="#FFFFFF"
        strokeWidth={0.9}
        strokeLinecap="round"
        fill="none"
      />
      {/* Large leaf, front, pointing up-right */}
      <Path d="M22,2 Q7,5 9,21 Q20,16 22,2 Z" fill={ROHS_GREEN} />
      <Path
        d="M9.8,20 Q14.5,11.5 21,4"
        stroke="#FFFFFF"
        strokeWidth={1.1}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function MDRohsBadge({ size = 13 }: { size?: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
      }}
    >
      <MDRohsIcon size={size + 5} />
      <MDText variant="caption" weight="700" style={{ color: ROHS_GREEN }}>
        RoHS
      </MDText>
    </View>
  );
}
