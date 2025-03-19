import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Μορφοποιεί μια τιμή σε ευρώ σύμφωνα με τα ευρωπαϊκά πρότυπα
 * @param amount - Το ποσό προς μορφοποίηση
 * @param options - Επιλογές μορφοποίησης
 * @returns Μορφοποιημένη τιμή σε ευρώ (π.χ. "123,45 €")
 */
export function formatPrice(amount: number, options: {
  locale?: string,
  showSymbol?: boolean,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number
} = {}) {
  const {
    locale = 'el-GR',
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'EUR',
    minimumFractionDigits,
    maximumFractionDigits
  });

  return formatter.format(amount);
}

/**
 * Μορφοποιεί μια ημερομηνία σύμφωνα με τα ευρωπαϊκά πρότυπα
 * @param date - Η ημερομηνία προς μορφοποίηση
 * @param options - Επιλογές μορφοποίησης
 * @returns Μορφοποιημένη ημερομηνία
 */
export function formatDate(date: Date | string, options: {
  locale?: string,
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
} = {}) {
  const {
    locale = 'el-GR',
    dateStyle = 'medium'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    dateStyle
  }).format(dateObj);
}

/**
 * Ελέγχει αν ένας ΑΦΜ (ελληνικός) είναι έγκυρος
 * @param vat - Ο ΑΦΜ προς έλεγχο
 * @returns true αν ο ΑΦΜ είναι έγκυρος, false διαφορετικά
 */
export function isValidGreekVAT(vat: string): boolean {
  // Αφαίρεση μη αριθμητικών χαρακτήρων
  const vatNumber = vat.replace(/\D/g, '');
  
  // Έλεγχος αν είναι 9 ψηφία
  if (vatNumber.length !== 9) {
    return false;
  }
  
  // Αλγόριθμος επαλήθευσης ελληνικού ΑΦΜ
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(vatNumber[i]) * Math.pow(2, 8 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 0 : remainder;
  
  return checkDigit === parseInt(vatNumber[8]);
}
