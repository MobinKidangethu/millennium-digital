import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, zIndex } from './tokens';
import { MDText } from './MDText';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'error';

interface ToastEntry {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_COLOR: Record<ToastTone, string> = {
  neutral: colors.gray[800],
  success: colors.status.successStrong,
  warning: colors.status.warningStrong,
  error: colors.status.errorStrong,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, tone: ToastTone = 'neutral') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="none"
        style={[
          styles.container,
          { bottom: (Platform.OS === 'web' ? spacing.xl : insets.bottom + spacing.xl) },
        ]}
      >
        {toasts.map((t) => (
          <View
            key={t.id}
            style={[styles.toast, shadow.md, { borderLeftColor: TONE_COLOR[t.tone] }]}
          >
            <MDText variant="bodySm" weight="600" style={{ color: colors.gray[0] }}>
              {t.message}
            </MDText>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: zIndex.toast,
    paddingHorizontal: spacing.lg,
  },
  toast: {
    backgroundColor: colors.gray[900],
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: 420,
    width: '100%',
  },
});
