import { useMemo, useState } from "react";
import type { AppSettings, DtrEntry } from "../types";
import { todayISO } from "../lib/time";
import { Card, Input, Button } from "./ui";

type Draft = {
  date: string;
  morningIn: string;
  morningOut: string;
  afternoonIn: string;
  afternoonOut: string;
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
    morningIn: settings.schedule.morningStart,
    morningOut: settings.schedule.morningEnd,
    afternoonIn: settings.schedule.afternoonStart,
    afternoonOut: settings.schedule.afternoonEnd,
    note: "",
  });

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!draft.date) errors.push("Pick a date.");
    if (!draft.morningIn) errors.push("Enter morning time in.");
    if (!draft.morningOut) errors.push("Enter morning time out.");
    if (!draft.afternoonIn) errors.push("Enter afternoon time in.");
    if (!draft.afternoonOut) errors.push("Enter afternoon time out.");
    if (draft.morningIn && draft.morningOut && draft.morningOut <= draft.morningIn) {
      errors.push("Morning time out must be after morning time in.");
    }
    if (draft.afternoonIn && draft.afternoonOut && draft.afternoonOut <= draft.afternoonIn) {
      errors.push("Afternoon time out must be after afternoon time in.");
    }
    if (draft.morningOut && draft.afternoonIn && draft.afternoonIn < draft.morningOut) {
      errors.push("Afternoon time in must be after morning time out.");
    }
    if (existingDates.has(draft.date)) {
      errors.push("An entry for this date already exists (edit it instead).");
    }
    return { ok: errors.length === 0, errors };
  }, [draft, existingDates]);

  return (
    <Card
      title="Time Log (Morning / Afternoon)"
      right={
        <Button
          onClick={() => {
            if (!validation.ok) return;
            onAdd({
              date: draft.date,
              morningIn: draft.morningIn,
              morningOut: draft.morningOut,
              afternoonIn: draft.afternoonIn,
              afternoonOut: draft.afternoonOut,
              note: draft.note.trim() ? draft.note.trim() : undefined,
            });
          }}
          disabled={!validation.ok}
        >
          Add record
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        <Input
          label="Date"
          type="date"
          value={draft.date}
          onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
        />
        <Input
          label="Morning In"
          type="time"
          value={draft.morningIn}
          onChange={(e) => setDraft((d) => ({ ...d, morningIn: e.target.value }))}
        />
        <Input
          label="Morning Out"
          type="time"
          value={draft.morningOut}
          onChange={(e) => setDraft((d) => ({ ...d, morningOut: e.target.value }))}
        />
        <Input
          label="Afternoon In"
          type="time"
          value={draft.afternoonIn}
          onChange={(e) => setDraft((d) => ({ ...d, afternoonIn: e.target.value }))}
        />
        <Input
          label="Afternoon Out"
          type="time"
          value={draft.afternoonOut}
          onChange={(e) => setDraft((d) => ({ ...d, afternoonOut: e.target.value }))}
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
            {settings.schedule.morningStart} – {settings.schedule.morningEnd} /{" "}
            {settings.schedule.afternoonStart} – {settings.schedule.afternoonEnd}
          </span>
        </p>
      )}
    </Card>
  );
}

