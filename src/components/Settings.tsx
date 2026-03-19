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
  const [startTime, setStartTime] = useState(settings.schedule.startTime);
  const [endTime, setEndTime] = useState(settings.schedule.endTime);
  const [requiredHours, setRequiredHours] = useState(String(settings.requiredOjtHours));

  const canSave = useMemo(() => {
    const req = Number(requiredHours);
    return (
      startTime.length === 5 &&
      endTime.length === 5 &&
      Number.isFinite(req) &&
      req > 0
    );
  }, [startTime, endTime, requiredHours]);

  return (
    <Card
      title="Settings"
      right={
        <Button
          onClick={() => {
            if (!canSave) return;
            onSave({
              ...settings,
              schedule: { startTime, endTime },
              requiredOjtHours: Number(requiredHours),
            });
          }}
          disabled={!canSave}
        >
          Save
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Official start time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="Official end time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
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

