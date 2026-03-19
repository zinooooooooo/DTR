import type { AppSettings, DtrEntry } from "../types";
import { Card, Badge } from "./ui";
import ProgressBar from "./ProgressBar";
import { totalMinutesAll, computeEntry } from "../lib/dtr";
import { formatHMFromMinutes } from "../lib/time";

export default function Dashboard({
  entries,
  settings,
}: {
  entries: DtrEntry[];
  settings: AppSettings;
}) {
  const { totalMinutes, overtimeMinutes } = totalMinutesAll(entries, settings);
  const completedHours = totalMinutes / 60;
  const remainingHours = Math.max(0, settings.requiredOjtHours - completedHours);

  const totalDays = entries.length;
  const onTimeDays = entries.filter((e) => computeEntry(e, settings).status === "On Time").length;
  const lateDays = entries.filter((e) => computeEntry(e, settings).status === "Late").length;
  const overtimeDays = entries.filter((e) => computeEntry(e, settings).status === "Overtime").length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title="OJT Progress">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs text-slate-500">Completed</div>
            <div className="mt-1 text-lg font-bold">{completedHours.toFixed(2)} hrs</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs text-slate-500">Remaining</div>
            <div className="mt-1 text-lg font-bold">{remainingHours.toFixed(2)} hrs</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs text-slate-500">Required</div>
            <div className="mt-1 text-lg font-bold">{settings.requiredOjtHours.toFixed(0)} hrs</div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={completedHours} max={settings.requiredOjtHours} />
        </div>
      </Card>

      <Card title="Dashboard Summary">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs text-slate-500">Total days worked</div>
            <div className="mt-1 text-lg font-bold">{totalDays}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs text-slate-500">Total hours</div>
            <div className="mt-1 text-lg font-bold">{formatHMFromMinutes(totalMinutes)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs text-slate-500">Total overtime</div>
            <div className="mt-1 text-lg font-bold">{formatHMFromMinutes(overtimeMinutes)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs text-slate-500">Official schedule</div>
            <div className="mt-1 text-lg font-bold">
              {settings.schedule.startTime} – {settings.schedule.endTime}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Status Breakdown">
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">On Time: {onTimeDays}</Badge>
          <Badge tone="yellow">Late: {lateDays}</Badge>
          <Badge tone="red">Overtime: {overtimeDays}</Badge>
          <Badge tone="slate">Total: {totalDays}</Badge>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Status rules: <span className="font-semibold">Overtime</span> if Time Out is beyond official end,
          otherwise <span className="font-semibold">Late</span> if Time In is after official start,
          else <span className="font-semibold">On Time</span>.
        </p>
      </Card>
    </div>
  );
}

