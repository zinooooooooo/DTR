import type { AppSettings, DtrEntry } from "../types";

const SETTINGS_KEY = "ojt_dtr_settings_v1";
const ENTRIES_KEY = "ojt_dtr_entries_v1";

export const defaultSettings: AppSettings = {
  schedule: { startTime: "08:00", endTime: "17:00" },
  requiredOjtHours: 300,
  darkMode: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const schedule = parsed.schedule ?? defaultSettings.schedule;
    return {
      schedule: {
        startTime: schedule.startTime ?? defaultSettings.schedule.startTime,
        endTime: schedule.endTime ?? defaultSettings.schedule.endTime,
      },
      requiredOjtHours:
        typeof parsed.requiredOjtHours === "number" && parsed.requiredOjtHours > 0
          ? parsed.requiredOjtHours
          : defaultSettings.requiredOjtHours,
      darkMode: Boolean(parsed.darkMode),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadEntries(): DtrEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e === "object")
      .map((e: any) => ({
        id: String(e.id ?? ""),
        date: String(e.date ?? ""),
        timeIn: String(e.timeIn ?? ""),
        timeOut: String(e.timeOut ?? ""),
        note: typeof e.note === "string" ? e.note : undefined,
        createdAt: Number(e.createdAt ?? Date.now()),
        updatedAt: Number(e.updatedAt ?? Date.now()),
      }))
      .filter((e) => e.id && e.date && e.timeIn && e.timeOut);
  } catch {
    return [];
  }
}

export function saveEntries(entries: DtrEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

