import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, MDText, MDInput, MDButton } from '@/design-system';
import { useGoogleSignIn, DEMO_GOOGLE_ACCOUNT } from '@/features/auth';
import { GoogleIcon } from './GoogleIcon';

type Step = 'chooser' | 'manual' | 'loading';

interface GoogleSignInSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called once a mock Google identity has been resolved into a session. */
  onSuccess: () => void;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  const words = local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1));
  return words.join(' ') || 'Google User';
}

/** A single row in the Google account chooser — mirrors Google's own row hover/press feedback. */
function ChooserRow({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: pressed ? '#E8EAED' : hovered ? '#F1F3F4' : 'transparent',
      }}
    >
      {children}
    </Pressable>
  );
}

/**
 * PROTOTYPE: a fully mocked "Sign in with Google" flow. Visually and
 * behaviorally mirrors the real Google account chooser — pick the cached
 * account (or enter another) and land back in the app signed in — but
 * everything resolves against the app's own local demo user store
 * (see `authService.loginWithGoogle`), never a real Google endpoint.
 */
export function GoogleSignInSheet({ visible, onClose, onSuccess }: GoogleSignInSheetProps) {
  const [step, setStep] = useState<Step>('chooser');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const googleSignIn = useGoogleSignIn();

  useEffect(() => {
    if (visible) {
      setStep('chooser');
      setManualEmail('');
      setManualPassword('');
    }
  }, [visible]);

  const completeSignIn = (fullName: string, email: string) => {
    setStep('loading');
    googleSignIn.mutate(
      { fullName, email },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
        },
        onError: () => setStep('chooser'),
      },
    );
  };

  const canSubmitManual = manualEmail.trim().length > 0 && manualPassword.trim().length > 0;
  const handleManualNext = () => {
    if (!canSubmitManual) return;
    completeSignIn(nameFromEmail(manualEmail.trim()), manualEmail.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={step === 'loading' ? undefined : onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
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
              maxWidth: 400,
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              paddingVertical: spacing['2xl'],
              paddingHorizontal: spacing.xl,
              alignItems: 'center',
            },
            shadow.lg,
          ]}
        >
          {step !== 'loading' ? (
            <Pressable
              accessibilityLabel="Close"
              onPress={onClose}
              style={{ position: 'absolute', top: spacing.md, right: spacing.md, padding: spacing.xs }}
            >
              <Ionicons name="close" size={18} color="#5F6368" />
            </Pressable>
          ) : null}

          <GoogleIcon size={40} />

          {step === 'chooser' ? (
            <>
              <MDText variant="h3" align="center" style={{ marginTop: spacing.lg, color: '#202124' }}>
                Choose an account
              </MDText>
              <MDText variant="bodySm" align="center" style={{ marginTop: spacing.xs, color: '#5F6368' }}>
                to continue to Millennium Digital
              </MDText>

              <View
                style={{
                  width: '100%',
                  marginTop: spacing.xl,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderColor: '#E8EAED',
                }}
              >
                <ChooserRow
                  onPress={() => completeSignIn(DEMO_GOOGLE_ACCOUNT.fullName, DEMO_GOOGLE_ACCOUNT.email)}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.brand.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MDText style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                      {initials(DEMO_GOOGLE_ACCOUNT.fullName)}
                    </MDText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <MDText variant="bodySm" weight="600" style={{ color: '#202124' }}>
                      {DEMO_GOOGLE_ACCOUNT.fullName}
                    </MDText>
                    <MDText variant="caption" style={{ color: '#5F6368' }}>
                      {DEMO_GOOGLE_ACCOUNT.email}
                    </MDText>
                  </View>
                </ChooserRow>

                <ChooserRow onPress={() => setStep('manual')}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#F1F3F4',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="person-outline" size={17} color="#5F6368" />
                  </View>
                  <MDText variant="bodySm" weight="600" style={{ color: '#202124' }}>
                    Use another account
                  </MDText>
                </ChooserRow>
              </View>

              <MDText
                variant="caption"
                align="center"
                style={{ marginTop: spacing.xl, color: '#5F6368', lineHeight: 16 }}
              >
                To continue, Google will share your name, email address, and profile picture with Millennium
                Digital.
              </MDText>
            </>
          ) : null}

          {step === 'manual' ? (
            <>
              <MDText variant="h3" align="center" style={{ marginTop: spacing.lg, color: '#202124' }}>
                Sign in
              </MDText>
              <MDText variant="bodySm" align="center" style={{ marginTop: spacing.xs, color: '#5F6368' }}>
                to continue to Millennium Digital
              </MDText>

              <View style={{ width: '100%', marginTop: spacing.xl, gap: spacing.lg }}>
                <MDInput
                  label="Email or phone"
                  value={manualEmail}
                  onChangeText={setManualEmail}
                  placeholder="you@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <MDInput
                  label="Password"
                  value={manualPassword}
                  onChangeText={setManualPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleManualNext}
                />
              </View>

              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: spacing.xl,
                }}
              >
                <Pressable
                  accessibilityLabel="Back"
                  onPress={() => setStep('chooser')}
                  style={{ padding: spacing.sm }}
                >
                  <Ionicons name="arrow-back" size={20} color="#5F6368" />
                </Pressable>
                <MDButton
                  label="Next"
                  onPress={handleManualNext}
                  disabled={!canSubmitManual}
                  style={{ backgroundColor: '#1A73E8', borderRadius: radius.pill, paddingHorizontal: spacing.xl }}
                />
              </View>
            </>
          ) : null}

          {step === 'loading' ? (
            <View style={{ paddingVertical: spacing['3xl'], alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#4285F4" style={{ marginTop: spacing.xl }} />
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
