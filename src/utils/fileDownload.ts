import { Platform } from 'react-native';

export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

/**
 * Triggers a real browser file download (CSV/text). Web-only — this is the
 * primary buyer-facing target for the platform today. A native build would
 * swap this for a share-sheet (e.g. expo-sharing + expo-file-system)
 * without changing any caller.
 */
export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8;'): boolean {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}
