import type { ClickRecord } from '@/types';

/** Aggregate click events by calendar day (YYYY-MM-DD). */
export function buildClicksByDay(clicks: { createdAt: Date }[]): Record<string, number> {
  const byDay: Record<string, number> = {};
  for (const c of clicks) {
    const day = new Date(c.createdAt).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }
  return byDay;
}

/** Return top N entries for a given field across click records. */
export function topN(
  clicks: Array<Record<string, unknown>>,
  field: string,
  n = 5
): Array<{ name: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const c of clicks) {
    const val = c[field] as string | undefined;
    if (val) counts[val] = (counts[val] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}
