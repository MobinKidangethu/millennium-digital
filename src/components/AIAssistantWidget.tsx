import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, zIndex, useResponsive, MDText } from '@/design-system';
import { aiService } from '@/features/ai';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { Product } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  matches?: Product[];
  totalMatches?: number;
  isGreeting?: boolean;
}

const SUGGESTIONS = [
  '100V MOSFET SMD with availability above 500',
  'RoHS compliant capacitors',
  'SiC diodes for automotive use',
];

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  isGreeting: true,
  text:
    "I'm the Millennium Digital technical product assistant. Describe a requirement in plain language — I'll turn it into search criteria against the live catalog and show matches.",
};

/**
 * Global floating engineering-search assistant — available on every buyer
 * screen (mounted once in the buyer layout), not embedded in or dependent
 * on any single page. Runs the same rule-based mock NLU used on the AI
 * Engineering Search page (src/features/ai/service.ts) so answers are real
 * catalog matches, not scripted/decorative chat responses. Clearly labeled
 * PROTOTYPE — see ProtoBadge usage below.
 */
export function AIAssistantWidget() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const scrollRef = useRef<ScrollView>(null);

  // Mounted as a sibling of the routed Stack inside the buyer layout's
  // inner flex:1 container, which already excludes header + (on mobile)
  // MobileBottomNav from its box — so a flat bottom/right inset is enough,
  // no extra safe-area or nav-height math needed here.
  const bottomOffset = spacing.lg;

  const ask = async (raw: string) => {
    const query = raw.trim();
    if (!query || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: query }]);
    setLoading(true);
    try {
      const result = await aiService.runAiSearch(query);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: result.explanation,
          matches: result.matches.slice(0, 3),
          totalMatches: result.matches.length,
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  const goToProduct = (product: Product) => {
    setOpen(false);
    router.push({
      pathname: '/(buyer)/products/[manufacturer]/[part]',
      params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
    });
  };

  const goToFullSearch = (q: string) => {
    setOpen(false);
    router.push({ pathname: '/(buyer)/ai-search', params: { q } });
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: spacing.lg,
        bottom: bottomOffset,
        alignItems: 'flex-end',
        zIndex: zIndex.modal,
      }}
    >
      {open ? (
        <View
          style={[
            {
              width: isDesktopUp ? 380 : 320,
              maxHeight: 480,
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing.md,
              overflow: 'hidden',
            },
            shadow.lg,
          ]}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.gray[900],
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 }}>
              <Ionicons name="sparkles" size={16} color={colors.plum[300]} />
              <View style={{ flexShrink: 1 }}>
                <MDText variant="bodySm" weight="700" style={{ color: colors.gray[0] }} numberOfLines={1}>
                  Technical Product Assistant
                </MDText>
                <ProtoBadge label="Prototype AI simulation" />
              </View>
            </View>
            <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityLabel="Close assistant">
              <Ionicons name="close" size={20} color={colors.gray[0]} />
            </Pressable>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={{ maxHeight: 320 }}
            contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  gap: spacing.xs,
                }}
              >
                <View
                  style={{
                    backgroundColor: msg.role === 'user' ? colors.brand.primary : colors.surfaceRaised,
                    borderWidth: msg.role === 'user' ? 0 : 1,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  }}
                >
                  <MDText
                    variant="bodySm"
                    style={{ color: msg.role === 'user' ? colors.gray[0] : colors.text.primary }}
                  >
                    {msg.text}
                  </MDText>
                </View>

                {msg.matches && msg.matches.length > 0 ? (
                  <View style={{ gap: spacing.xs }}>
                    {msg.matches.map((product) => (
                      <Pressable
                        key={product.id}
                        onPress={() => goToProduct(product)}
                        style={{
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: radius.md,
                          padding: spacing.sm,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <MDText variant="caption" weight="700" numberOfLines={1}>
                          {product.manufacturerPartNumber}
                        </MDText>
                        <MDText variant="caption" tone="tertiary" numberOfLines={1}>
                          {product.manufacturer}
                        </MDText>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                          <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                            {product.currency} {product.price}
                          </MDText>
                          <MDText variant="caption" tone="tertiary">
                            {product.availability} in stock
                          </MDText>
                        </View>
                      </Pressable>
                    ))}
                    {msg.totalMatches && msg.totalMatches > msg.matches.length ? (
                      <Pressable
                        onPress={() => goToFullSearch(messages[messages.indexOf(msg) - 1]?.text ?? '')}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 2 }}
                      >
                        <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                          View all {msg.totalMatches} matches
                        </MDText>
                        <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ))}

            {messages.length === 1 ? (
              <View style={{ gap: spacing.xs }}>
                <MDText variant="caption" tone="tertiary">
                  Try asking:
                </MDText>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => ask(s)}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.brand.primarySoftBorder,
                      backgroundColor: colors.brand.primarySoft,
                      borderRadius: radius.pill,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 6,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                      {s}
                    </MDText>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {loading ? (
              <MDText variant="caption" tone="tertiary">
                Interpreting requirement…
              </MDText>
            ) : null}
          </ScrollView>

          {/* Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              padding: spacing.sm,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Describe a component requirement…"
              placeholderTextColor={colors.text.tertiary}
              onSubmitEditing={() => ask(input)}
              returnKeyType="send"
              style={{
                flex: 1,
                paddingHorizontal: spacing.sm,
                paddingVertical: 8,
                fontSize: 13,
                color: colors.text.primary,
                ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
              }}
            />
            <Pressable
              onPress={() => ask(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.pill,
                backgroundColor: input.trim() ? colors.brand.primary : colors.gray[200],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-up" size={16} color={colors.gray[0]} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityLabel={open ? 'Close technical assistant' : 'Open technical assistant'}
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: radius.pill,
            backgroundColor: colors.brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadow.lg,
        ]}
      >
        <Ionicons name={open ? 'close' : 'sparkles'} size={24} color={colors.gray[0]} />
      </Pressable>
    </View>
  );
}
