import { useMemo, useState } from "react";
import type { AppSettings, DtrEntry } from "../types";
import { computeEntry } from "../lib/dtr";
import { formatHours, formatHMFromMinutes } from "../lib/time";
import { Badge, Button, Card, Input, Select } from "./ui";

function toneForStatus(status: "On Time" | "Late" | "Overtime") {
  if (status === "On Time") return "green" as const;
  if (status === "Late") return "yellow" as const;
  return "red" as const;
}

type EditDraft = Pick<
  DtrEntry,
  "id" | "date" | "morningIn" | "morningOut" | "afternoonIn" | "afternoonOut"
> & {
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
  onExportCsv: (entries: DtrEntry[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<string>("all");
  const [editing, setEditing] = useState<EditDraft | null>(null);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (typeof e.date === "string" && e.date.length >= 7) set.add(e.date.slice(0, 7)); // YYYY-MM
    }
    return [...set].sort((a, b) => (a < b ? 1 : -1));
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (month !== "all" && !e.date.startsWith(month)) return false;
      if (!q) return true;
      const blob =
        `${e.date} ${e.morningIn} ${e.morningOut} ${e.afternoonIn ?? ""} ${e.afternoonOut ?? ""} ${e.note ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [entries, query, month]);

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
          <Button
            variant="secondary"
            onClick={() => onExportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">All months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
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
        <table className="min-w-[1080px] w-full border-collapse bg-white text-sm dark:bg-slate-900">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Morning In</th>
              <th className="px-3 py-3 text-left">Morning Out</th>
              <th className="px-3 py-3 text-left">Afternoon In</th>
              <th className="px-3 py-3 text-left">Afternoon Out</th>
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
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={10}>
                  No records yet.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const c = computeEntry(e, settings);
                return (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td className="px-3 py-3 font-medium">{e.date}</td>
                    <td className="px-3 py-3">{e.morningIn}</td>
                    <td className="px-3 py-3">{e.morningOut}</td>
                    <td className="px-3 py-3">{e.afternoonIn}</td>
                    <td className="px-3 py-3">{e.afternoonOut}</td>
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
                              morningIn: e.morningIn,
                              morningOut: e.morningOut,
                              afternoonIn: e.afternoonIn,
                              afternoonOut: e.afternoonOut,
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
                label="Morning In"
                type="time"
                value={editing.morningIn}
                onChange={(e) =>
                  setEditing((d) => (d ? { ...d, morningIn: e.target.value } : d))
                }
              />
              <Input
                label="Morning Out"
                type="time"
                value={editing.morningOut}
                onChange={(e) =>
                  setEditing((d) => (d ? { ...d, morningOut: e.target.value } : d))
                }
              />
              <Input
                label="Note"
                value={editing.note}
                onChange={(e) => setEditing((d) => (d ? { ...d, note: e.target.value } : d))}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="hidden sm:block" />
              <Input
                label="Afternoon In"
                type="time"
                value={editing.afternoonIn}
                onChange={(e) =>
                  setEditing((d) => (d ? { ...d, afternoonIn: e.target.value } : d))
                }
              />
              <Input
                label="Afternoon Out"
                type="time"
                value={editing.afternoonOut}
                onChange={(e) =>
                  setEditing((d) => (d ? { ...d, afternoonOut: e.target.value } : d))
                }
              />
              <div className="hidden sm:block" />
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (
                    !editing.date ||
                    !editing.morningIn ||
                    !editing.morningOut ||
                    !editing.afternoonIn ||
                    !editing.afternoonOut
                  )
                    return;
                  if (editing.morningOut <= editing.morningIn) {
                    alert("Morning time out must be after morning time in.");
                    return;
                  }
                  if (editing.afternoonOut <= editing.afternoonIn) {
                    alert("Afternoon time out must be after afternoon time in.");
                    return;
                  }
                  if (editing.afternoonIn < editing.morningOut) {
                    alert("Afternoon time in must be after morning time out.");
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
                    morningIn: editing.morningIn,
                    morningOut: editing.morningOut,
                    afternoonIn: editing.afternoonIn,
                    afternoonOut: editing.afternoonOut,
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

