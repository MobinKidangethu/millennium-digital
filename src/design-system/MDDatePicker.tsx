import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';
import { MDModal } from './MDModal';
import { useHoverPress } from './useHoverPress';
import { webTransition } from './webStyles';

/**
 * A real, cross-platform (web/iOS/Android) calendar date picker built from
 * plain RN primitives + the existing MDModal dropdown pattern — no extra
 * native dependency required. Value/onChange use plain ISO 'YYYY-MM-DD'
 * strings so it's a drop-in replacement for a free-text date MDInput.
 */

interface MDDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** ISO 'YYYY-MM-DD' — days before this are shown disabled. */
  minDate?: string;
  style?: object;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISODate(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseISODate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value: string): string {
  const date = parseISODate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MDDatePicker({ label, value, onChange, placeholder = 'Select a date', minDate, style }: MDDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);
  const [viewYear, setViewYear] = useState(() => (selected ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selected ?? new Date()).getMonth());
  const { hovered, hoverHandlers } = useHoverPress();

  const min = minDate ? parseISODate(minDate) : null;

  const openPicker = () => {
    const base = selected ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  };

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array.from<number | null>({ length: startWeekday }).fill(null).concat(
      Array.from({ length: daysInMonth }, (_, i) => i + 1),
    );
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDisabled = (day: number) => {
    if (!min) return false;
    return new Date(viewYear, viewMonth, day) < new Date(min.getFullYear(), min.getMonth(), min.getDate());
  };
  const isSelected = (day: number) =>
    !!selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  const isToday = (day: number) => {
    const t = new Date();
    return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === day;
  };

  return (
    <View style={style}>
      {label ? (
        <MDText variant="bodySm" weight="600" style={{ marginBottom: spacing.xs }}>
          {label}
        </MDText>
      ) : null}
      <Pressable
        onPress={openPicker}
        accessibilityLabel={label ?? placeholder}
        {...hoverHandlers}
        style={[
          webTransition,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: hovered || open ? colors.brand.primary : colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceRaised,
            paddingHorizontal: spacing.md,
            minHeight: 46,
          },
        ]}
      >
        <MDText variant="bodySm" style={{ color: value ? colors.text.primary : colors.text.tertiary }}>
          {value ? formatDisplay(value) : placeholder}
        </MDText>
        <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
      </Pressable>

      <MDModal visible={open} onClose={() => setOpen(false)} title="Select Date" maxWidth={340}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Pressable onPress={goPrevMonth} accessibilityLabel="Previous month" style={{ padding: spacing.xs }}>
            <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
          </Pressable>
          <MDText variant="bodyMedium" weight="700">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </MDText>
          <Pressable onPress={goNextMonth} accessibilityLabel="Next month" style={{ padding: spacing.xs }}>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS.map((w, i) => (
            <View key={`wd-${i}`} style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.xs }}>
              <MDText variant="caption" tone="tertiary" weight="700">
                {w}
              </MDText>
            </View>
          ))}
        </View>

        {weeks.map((row, ri) => (
          <View key={`row-${ri}`} style={{ flexDirection: 'row' }}>
            {row.map((day, di) => {
              if (day == null) return <View key={`cell-${ri}-${di}`} style={{ flex: 1, aspectRatio: 1 }} />;
              const disabled = isDisabled(day);
              const selectedDay = isSelected(day);
              const today = isToday(day);
              return (
                <Pressable
                  key={`cell-${ri}-${di}`}
                  disabled={disabled}
                  accessibilityLabel={`${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`}
                  onPress={() => {
                    onChange(toISODate(viewYear, viewMonth, day));
                    setOpen(false);
                  }}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 1,
                    borderRadius: radius.pill,
                    backgroundColor: selectedDay ? colors.brand.primary : 'transparent',
                    opacity: disabled ? 0.3 : 1,
                  }}
                >
                  <MDText
                    variant="bodySm"
                    weight={today && !selectedDay ? '700' : '400'}
                    style={{ color: selectedDay ? colors.gray[0] : today ? colors.brand.primary : colors.text.primary }}
                  >
                    {day}
                  </MDText>
                </Pressable>
              );
            })}
          </View>
        ))}

        {value ? (
          <Pressable
            onPress={() => {
              onChange('');
              setOpen(false);
            }}
            style={{ marginTop: spacing.md, alignSelf: 'center' }}
          >
            <MDText variant="bodySm" style={{ color: colors.text.secondary }}>
              Clear date
            </MDText>
          </Pressable>
        ) : null}
      </MDModal>
    </View>
  );
}
