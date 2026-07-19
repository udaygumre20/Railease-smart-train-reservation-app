import { dayjs } from '@/lib/dayjs';
import { DATE_FORMATS } from '@/constants/app.constants';

// ============================================================
// Formatting Utilities
// ============================================================

/** Format a currency amount in INR. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a date string using app default format. */
export function formatDate(date: string | Date, format: string = DATE_FORMATS.DATE): string {
  return dayjs(date).format(format);
}

/** Format time in 12-hour format. */
export function formatTime(date: string | Date): string {
  return dayjs(date).format(DATE_FORMATS.TIME_12H);
}

/** Format duration in hours and minutes (e.g., "5h 30m"). */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Relative time from now (e.g., "2 hours ago"). */
export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow();
}

/** Format a phone number with country code. */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/** Format PNR number with spaces for readability. */
export function formatPNR(pnr: string): string {
  return pnr.replace(/(.{3})(.{3})(.{4})/, '$1-$2-$3');
}

/** Truncate text with ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
