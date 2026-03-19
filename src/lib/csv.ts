import type { AppSettings, DtrEntry } from "../types";
import { computeEntry } from "./dtr";
import { formatHours } from "./time";

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function entriesToCsv(entries: DtrEntry[], settings: AppSettings): string {
  const header = [
    "Date",
    "Time In",
    "Time Out",
    "Total Hours",
    "Overtime Hours",
    "Status",
    "Note",
  ].join(",");

  const rows = entries.map((e) => {
    const c = computeEntry(e, settings);
    const totalH = c.totalMinutes / 60;
    const otH = c.overtimeMinutes / 60;
    return [
      csvEscape(e.date),
      csvEscape(e.timeIn),
      csvEscape(e.timeOut),
      csvEscape(formatHours(totalH)),
      csvEscape(formatHours(otH)),
      csvEscape(c.status),
      csvEscape(e.note ?? ""),
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

