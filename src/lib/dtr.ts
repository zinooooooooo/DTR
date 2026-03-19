import type { AppSettings, DtrEntry } from "../types";
import { clampNonNegative, diffMinutes, minutesFromHHMM } from "./time";

export type ComputedEntry = {
  totalMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  status: "On Time" | "Late" | "Overtime";
};

export function computeEntry(entry: DtrEntry, settings: AppSettings): ComputedEntry {
  const mMinutes = clampNonNegative(diffMinutes(entry.morningIn, entry.morningOut));
  const aMinutes =
    entry.afternoonIn && entry.afternoonOut
      ? clampNonNegative(diffMinutes(entry.afternoonIn, entry.afternoonOut))
      : 0;
  const totalMinutes = mMinutes + aMinutes;

  const mStart = minutesFromHHMM(settings.schedule.morningStart);
  const mEnd = minutesFromHHMM(settings.schedule.morningEnd);
  const aStart = minutesFromHHMM(settings.schedule.afternoonStart);
  const aEnd = minutesFromHHMM(settings.schedule.afternoonEnd);

  const mIn = minutesFromHHMM(entry.morningIn);
  const mOut = minutesFromHHMM(entry.morningOut);
  const aIn = entry.afternoonIn ? minutesFromHHMM(entry.afternoonIn) : null;
  const aOut = entry.afternoonOut ? minutesFromHHMM(entry.afternoonOut) : null;

  const lateMinutes =
    clampNonNegative(mIn - mStart) + (aIn != null ? clampNonNegative(aIn - aStart) : 0);

  // Overtime is measured against the session end that exists.
  const overtimeMinutes =
    aOut != null
      ? clampNonNegative(aOut - aEnd)
      : clampNonNegative(mOut - mEnd);

  const status: ComputedEntry["status"] =
    overtimeMinutes > 0 ? "Overtime" : lateMinutes > 0 ? "Late" : "On Time";

  return { totalMinutes, overtimeMinutes, lateMinutes, status };
}

export function sortEntriesDesc(entries: DtrEntry[]): DtrEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
  });
}

export function totalMinutesAll(entries: DtrEntry[], settings: AppSettings) {
  let total = 0;
  let overtime = 0;
  for (const e of entries) {
    const c = computeEntry(e, settings);
    total += c.totalMinutes;
    overtime += c.overtimeMinutes;
  }
  return { totalMinutes: total, overtimeMinutes: overtime };
}

