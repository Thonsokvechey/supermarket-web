import axios from 'axios';

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatKhr(amount: number): string {
  const rounded = Math.round((amount || 0) / 100) * 100;
  return `${new Intl.NumberFormat('en-US').format(rounded)} ៛`;
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
          details?: Record<string, string>;
        }
      | undefined;

    if (data?.details && typeof data.details === 'object') {
      const detailMessages = Object.entries(data.details)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      if (detailMessages) return detailMessages;
    }

    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function isUserActive(entity: { active?: boolean; isActive?: boolean }): boolean {
  if (typeof entity.isActive === 'boolean') return entity.isActive;
  if (typeof entity.active === 'boolean') return entity.active;
  return true;
}

