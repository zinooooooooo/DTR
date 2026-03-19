const pad2 = (n: number) => String(n).padStart(2, "0");

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function clampNonNegative(n: number): number {
  return n < 0 ? 0 : n;
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return "0.00";
  return hours.toFixed(2);
}

export function formatHMFromMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${pad2(rem)}m`;
}

export function diffMinutes(timeIn: string, timeOut: string): number {
  return minutesFromHHMM(timeOut) - minutesFromHHMM(timeIn);
}

