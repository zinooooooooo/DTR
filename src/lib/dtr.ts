import type { AppSettings, DtrEntry } from "../types";
import { clampNonNegative, diffMinutes, minutesFromHHMM } from "./time";

export type ComputedEntry = {
  totalMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  status: "On Time" | "Late" | "Overtime";
};

export function computeEntry(entry: DtrEntry, settings: AppSettings): ComputedEntry {
  const totalMinutes = clampNonNegative(diffMinutes(entry.timeIn, entry.timeOut));

  const officialStart = minutesFromHHMM(settings.schedule.startTime);
  const officialEnd = minutesFromHHMM(settings.schedule.endTime);
  const timeInM = minutesFromHHMM(entry.timeIn);
  const timeOutM = minutesFromHHMM(entry.timeOut);

  const lateMinutes = clampNonNegative(timeInM - officialStart);
  const overtimeMinutes = clampNonNegative(timeOutM - officialEnd);

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

