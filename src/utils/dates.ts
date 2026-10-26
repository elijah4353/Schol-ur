import type { Scholarship } from '@/lib/supabase';

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function deadlineStatus(dateStr: string): 'open' | 'soon' | 'urgent' | 'closed' {
  const d = daysUntil(dateStr);
  if (d < 0) return 'closed';
  if (d <= 7) return 'urgent';
  if (d <= 21) return 'soon';
  return 'open';
}

export function deadlineLabel(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d < 0) return 'Closed';
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d <= 30) return `${d} days left`;
  return `${Math.round(d / 30)} mo left`;
}

export function isAvailable(s: Scholarship): boolean {
  return s.slots_available > 0 && deadlineStatus(s.deadline) !== 'closed';
}

export function fillRate(s: Scholarship): number {
  if (s.slots_total === 0) return 0;
  return Math.round((s.slots_available / s.slots_total) * 100);
}
