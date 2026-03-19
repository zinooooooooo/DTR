import { useMemo, useState } from "react";
import type { AppSettings, DtrEntry } from "../types";
import { computeEntry } from "../lib/dtr";
import { formatHours, formatHMFromMinutes } from "../lib/time";
import { Badge, Button, Card, Input } from "./ui";

function toneForStatus(status: "On Time" | "Late" | "Overtime") {
  if (status === "On Time") return "green" as const;
  if (status === "Late") return "yellow" as const;
  return "red" as const;
}

type EditDraft = Pick<DtrEntry, "id" | "date" | "timeIn" | "timeOut"> & {
  note: string;
};

export default function DTRTable({
  entries,
  settings,
  onDelete,
  onUpdate,
  onExportCsv,
}: {
  entries: DtrEntry[];
  settings: AppSettings;
  onDelete: (id: string) => void;
  onUpdate: (next: DtrEntry) => void;
  onExportCsv: () => void;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditDraft | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      const blob = `${e.date} ${e.timeIn} ${e.timeOut} ${e.note ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [entries, query]);

  const totals = useMemo(() => {
    let minutes = 0;
    let overtime = 0;
    for (const e of filtered) {
      const c = computeEntry(e, settings);
      minutes += c.totalMinutes;
      overtime += c.overtimeMinutes;
    }
    return { minutes, overtime };
  }, [filtered, settings]);

  return (
    <Card
      title="Daily Records"
      right={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onExportCsv} disabled={entries.length === 0}>
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Search"
          placeholder="Filter by date, times, or note…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <div className="font-semibold text-slate-800 dark:text-slate-100">Filtered totals</div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Total:{" "}
              <span className="font-semibold">{formatHMFromMinutes(totals.minutes)}</span>
            </span>
            <span>
              Overtime:{" "}
              <span className="font-semibold">{formatHMFromMinutes(totals.overtime)}</span>
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="font-semibold text-slate-800 dark:text-slate-100">Legend</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="green">On Time</Badge>
            <Badge tone="yellow">Late</Badge>
            <Badge tone="red">Overtime</Badge>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-[880px] w-full border-collapse bg-white text-sm dark:bg-slate-900">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Time In</th>
              <th className="px-3 py-3 text-left">Time Out</th>
              <th className="px-3 py-3 text-left">Total Hours</th>
              <th className="px-3 py-3 text-left">Overtime</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Note</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={8}>
                  No records yet.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const c = computeEntry(e, settings);
                return (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td className="px-3 py-3 font-medium">{e.date}</td>
                    <td className="px-3 py-3">{e.timeIn}</td>
                    <td className="px-3 py-3">{e.timeOut}</td>
                    <td className="px-3 py-3">{formatHours(c.totalMinutes / 60)}</td>
                    <td className="px-3 py-3">{formatHours(c.overtimeMinutes / 60)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={toneForStatus(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      {e.note ?? ""}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setEditing({
                              id: e.id,
                              date: e.date,
                              timeIn: e.timeIn,
                              timeOut: e.timeOut,
                              note: e.note ?? "",
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            if (confirm(`Delete DTR for ${e.date}?`)) onDelete(e.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Edit record</div>
                <div className="text-xs text-slate-500">Update date/time and note.</div>
              </div>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Close
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Input
                label="Date"
                type="date"
                value={editing.date}
                onChange={(e) => setEditing((d) => (d ? { ...d, date: e.target.value } : d))}
              />
              <Input
                label="Time In"
                type="time"
                value={editing.timeIn}
                onChange={(e) => setEditing((d) => (d ? { ...d, timeIn: e.target.value } : d))}
              />
              <Input
                label="Time Out"
                type="time"
                value={editing.timeOut}
                onChange={(e) => setEditing((d) => (d ? { ...d, timeOut: e.target.value } : d))}
              />
              <Input
                label="Note"
                value={editing.note}
                onChange={(e) => setEditing((d) => (d ? { ...d, note: e.target.value } : d))}
              />
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!editing.date || !editing.timeIn || !editing.timeOut) return;
                  if (editing.timeOut <= editing.timeIn) {
                    alert("Time out must be after time in.");
                    return;
                  }
                  const existingOtherDate = entries.some(
                    (e) => e.id !== editing.id && e.date === editing.date,
                  );
                  if (existingOtherDate) {
                    alert("Another entry already exists for that date.");
                    return;
                  }
                  const current = entries.find((e) => e.id === editing.id);
                  if (!current) return;
                  onUpdate({
                    ...current,
                    date: editing.date,
                    timeIn: editing.timeIn,
                    timeOut: editing.timeOut,
                    note: editing.note.trim() ? editing.note.trim() : undefined,
                    updatedAt: Date.now(),
                  });
                  setEditing(null);
                }}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

