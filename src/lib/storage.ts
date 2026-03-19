import type { AppSettings, DtrEntry } from "../types";

const SETTINGS_KEY = "ojt_dtr_settings_v1";
const ENTRIES_KEY = "ojt_dtr_entries_v1";

export const defaultSettings: AppSettings = {
  schedule: {
    morningStart: "08:00",
    morningEnd: "12:00",
    afternoonStart: "12:55",
    afternoonEnd: "17:00",
  },
  requiredOjtHours: 300,
  darkMode: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const schedule = parsed.schedule ?? defaultSettings.schedule;

    const legacyStart = (schedule as any).startTime as string | undefined;
    const legacyEnd = (schedule as any).endTime as string | undefined;

    return {
      schedule: {
        morningStart: (schedule as any).morningStart ?? legacyStart ?? defaultSettings.schedule.morningStart,
        morningEnd: (schedule as any).morningEnd ?? defaultSettings.schedule.morningEnd,
        afternoonStart: (schedule as any).afternoonStart ?? defaultSettings.schedule.afternoonStart,
        afternoonEnd: (schedule as any).afternoonEnd ?? legacyEnd ?? defaultSettings.schedule.afternoonEnd,
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
      .map((e: any) => {
        const legacyTimeIn = typeof e.timeIn === "string" ? e.timeIn : "";
        const legacyTimeOut = typeof e.timeOut === "string" ? e.timeOut : "";

        return {
          id: String(e.id ?? ""),
          date: String(e.date ?? ""),
          morningIn: String(e.morningIn ?? legacyTimeIn ?? ""),
          morningOut: String(e.morningOut ?? legacyTimeOut ?? ""),
          afternoonIn: String(e.afternoonIn ?? ""),
          afternoonOut: String(e.afternoonOut ?? ""),
          note: typeof e.note === "string" ? e.note : undefined,
          createdAt: Number(e.createdAt ?? Date.now()),
          updatedAt: Number(e.updatedAt ?? Date.now()),
        } satisfies DtrEntry;
      })
      .filter((e) => e.id && e.date && e.morningIn && e.morningOut);
  } catch {
    return [];
  }
}

export function saveEntries(entries: DtrEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

