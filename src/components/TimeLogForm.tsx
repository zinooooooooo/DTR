import { useMemo, useState } from "react";
import type { AppSettings, DtrEntry } from "../types";
import { todayISO } from "../lib/time";
import { Card, Input, Button } from "./ui";

type Draft = {
  date: string;
  timeIn: string;
  timeOut: string;
  note: string;
};

export default function TimeLogForm({
  settings,
  onAdd,
  existingDates,
}: {
  settings: AppSettings;
  onAdd: (entry: Omit<DtrEntry, "id" | "createdAt" | "updatedAt">) => void;
  existingDates: Set<string>;
}) {
  const [draft, setDraft] = useState<Draft>({
    date: todayISO(),
    timeIn: settings.schedule.startTime,
    timeOut: settings.schedule.endTime,
    note: "",
  });

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!draft.date) errors.push("Pick a date.");
    if (!draft.timeIn) errors.push("Enter time in.");
    if (!draft.timeOut) errors.push("Enter time out.");
    if (draft.timeIn && draft.timeOut && draft.timeOut <= draft.timeIn) {
      errors.push("Time out must be after time in.");
    }
    if (existingDates.has(draft.date)) {
      errors.push("An entry for this date already exists (edit it instead).");
    }
    return { ok: errors.length === 0, errors };
  }, [draft, existingDates]);

  return (
    <Card
      title="Time In / Time Out"
      right={
        <Button
          onClick={() => {
            if (!validation.ok) return;
            onAdd({
              date: draft.date,
              timeIn: draft.timeIn,
              timeOut: draft.timeOut,
              note: draft.note.trim() ? draft.note.trim() : undefined,
            });
          }}
          disabled={!validation.ok}
        >
          Add record
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Input
          label="Date"
          type="date"
          value={draft.date}
          onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
        />
        <Input
          label="Time In"
          type="time"
          value={draft.timeIn}
          onChange={(e) => setDraft((d) => ({ ...d, timeIn: e.target.value }))}
        />
        <Input
          label="Time Out"
          type="time"
          value={draft.timeOut}
          onChange={(e) => setDraft((d) => ({ ...d, timeOut: e.target.value }))}
        />
        <Input
          label="Note (optional)"
          placeholder="e.g., Client meeting"
          value={draft.note}
          onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
        />
      </div>

      {!validation.ok ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <ul className="list-disc pl-4">
            {validation.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Official schedule:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {settings.schedule.startTime} – {settings.schedule.endTime}
          </span>
        </p>
      )}
    </Card>
  );
}

