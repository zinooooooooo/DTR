import { useMemo, useState } from "react";
import type { AppSettings } from "../types";
import { Card, Input, Button } from "./ui";

export default function Settings({
  settings,
  onSave,
}: {
  settings: AppSettings;
  onSave: (next: AppSettings) => void;
}) {
  const [morningStart, setMorningStart] = useState(settings.schedule.morningStart);
  const [morningEnd, setMorningEnd] = useState(settings.schedule.morningEnd);
  const [afternoonStart, setAfternoonStart] = useState(settings.schedule.afternoonStart);
  const [afternoonEnd, setAfternoonEnd] = useState(settings.schedule.afternoonEnd);
  const [requiredHours, setRequiredHours] = useState(String(settings.requiredOjtHours));

  const canSave = useMemo(() => {
    const req = Number(requiredHours);
    return (
      morningStart.length === 5 &&
      morningEnd.length === 5 &&
      afternoonStart.length === 5 &&
      afternoonEnd.length === 5 &&
      Number.isFinite(req) &&
      req > 0
    );
  }, [morningStart, morningEnd, afternoonStart, afternoonEnd, requiredHours]);

  return (
    <Card
      title="Settings"
      right={
        <Button
          onClick={() => {
            if (!canSave) return;
            onSave({
              ...settings,
              schedule: { morningStart, morningEnd, afternoonStart, afternoonEnd },
              requiredOjtHours: Number(requiredHours),
            });
          }}
          disabled={!canSave}
        >
          Save
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        <Input
          label="Morning start"
          type="time"
          value={morningStart}
          onChange={(e) => setMorningStart(e.target.value)}
        />
        <Input
          label="Morning end"
          type="time"
          value={morningEnd}
          onChange={(e) => setMorningEnd(e.target.value)}
        />
        <Input
          label="Afternoon start"
          type="time"
          value={afternoonStart}
          onChange={(e) => setAfternoonStart(e.target.value)}
        />
        <Input
          label="Afternoon end"
          type="time"
          value={afternoonEnd}
          onChange={(e) => setAfternoonEnd(e.target.value)}
        />
        <Input
          label="Required OJT hours"
          type="number"
          min={1}
          step={1}
          value={requiredHours}
          onChange={(e) => setRequiredHours(e.target.value)}
          hint="e.g., 300"
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Official schedule is used for overtime/late detection. Required hours powers the progress tracker.
      </p>
    </Card>
  );
}

