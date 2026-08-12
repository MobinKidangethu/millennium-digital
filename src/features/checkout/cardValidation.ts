/**
 * Client-side validation/formatting for the card & UPI payment flows.
 * PROTOTYPE scope: this validates *shape* (Luhn checksum, expiry range,
 * UPI ID pattern) the same way a real checkout would before ever hitting a
 * payment gateway — but there is no real gateway behind it. No raw card
 * number or CVV is ever persisted; only brand + last 4 + expiry are saved
 * (see savedCardsStore).
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'rupay' | 'unknown';

export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
  rupay: 'RuPay',
  unknown: 'Card',
};

// ---- Cardholder name ------------------------------------------------------

/** Strips digits/symbols as the user types — a name field should never accept numbers. */
export function sanitizeCardholderName(text: string): string {
  return text.replace(/[^A-Za-z\s'.-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 60);
}

export function isValidCardholderName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[A-Za-z][A-Za-z\s'.-]*$/.test(trimmed);
}

// ---- Card number -----------------------------------------------------------

/** Strips everything but digits as the user types — a number field should never accept letters. */
export function sanitizeCardNumberDigits(text: string): string {
  return text.replace(/\D/g, '').slice(0, 19);
}

export function formatCardNumber(digits: string): string {
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(011|5)/.test(digits)) return 'discover';
  if (/^(60|65|81|82|508)/.test(digits)) return 'rupay';
  return 'unknown';
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidCardNumber(digits: string): boolean {
  return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
}

// ---- Expiry (MM/YY) --------------------------------------------------------

/** Auto-inserts "/" after MM and hard-caps at 4 digits (MMYY) — nothing more can be entered. */
export function formatExpiryInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidExpiry(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

// ---- CVV --------------------------------------------------------------------

/** Digits only, hard-capped at 3. */
export function sanitizeCvv(text: string): string {
  return text.replace(/\D/g, '').slice(0, 3);
}

export function isValidCvv(cvv: string): boolean {
  return /^\d{3}$/.test(cvv);
}

// ---- UPI ID -------------------------------------------------------------------

export function sanitizeUpiId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9.\-_@]/g, '').slice(0, 100);
}

export function isValidUpiId(value: string): boolean {
  return /^[a-z0-9.\-_]{2,256}@[a-z]{2,64}$/.test(value);
}

// ---- Other free-text fields (net banking / PO) --------------------------------

/** Bank names are a name-like field — no digits. */
export function sanitizeBankName(text: string): string {
  return text.replace(/[^A-Za-z\s&'.-]/g, '').slice(0, 60);
}
