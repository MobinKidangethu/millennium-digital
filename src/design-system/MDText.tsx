import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from './tokens';

type Variant = keyof typeof typography extends infer K
  ? K extends 'fontFamily'
    ? never
    : K
  : never;

type Tone = keyof typeof colors.text;

interface MDTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
}

export function MDText({
  variant = 'body',
  tone = 'primary',
  weight,
  align,
  uppercase,
  style,
  ...rest
}: MDTextProps) {
  const scale = typography[variant] as TextStyle;

  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: typography.fontFamily.base,
          color: colors.text[tone],
          textAlign: align,
          textTransform: uppercase ? 'uppercase' : undefined,
        },
        scale,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
}
