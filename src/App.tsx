import { useEffect, useMemo, useState } from "react";
import type { AppSettings, DtrEntry } from "./types";
import Dashboard from "./components/Dashboard";
import TimeLogForm from "./components/TimeLogForm";
import DTRTable from "./components/DTRTable";
import Settings from "./components/Settings";
import { Button } from "./components/ui";
import {
  defaultSettings,
  loadEntries,
  loadSettings,
  saveEntries,
  saveSettings,
} from "./lib/storage";
import { entriesToCsv, downloadCsv } from "./lib/csv";
import { sortEntriesDesc } from "./lib/dtr";

function uid(): string {
  // Fast-enough local ID; keeps storage simple.
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [entries, setEntries] = useState<DtrEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "records" | "settings">("dashboard");

  useEffect(() => {
    const s = loadSettings();
    const e = loadEntries();
    setSettings(s);
    setEntries(sortEntriesDesc(e));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const existingDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);

  function addEntry(draft: Omit<DtrEntry, "id" | "createdAt" | "updatedAt">) {
    const now = Date.now();
    const next: DtrEntry = {
      id: uid(),
      ...draft,
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => sortEntriesDesc([next, ...prev]));
    setActiveTab("records");
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEntry(next: DtrEntry) {
    setEntries((prev) => sortEntriesDesc(prev.map((e) => (e.id === next.id ? next : e))));
  }

  function exportCsv() {
    const csv = entriesToCsv(entries, settings);
    const filename = `OJT_DTR_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(filename, csv);
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">OJT DTR Manager</div>
            <div className="text-xs text-slate-500">Daily Time Record dashboard for students</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
              aria-label="Toggle dark mode"
            >
              {settings.darkMode ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "dashboard" ? "primary" : "secondary"}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "records" ? "primary" : "secondary"}
              onClick={() => setActiveTab("records")}
            >
              Records
            </Button>
            <Button
              variant={activeTab === "settings" ? "primary" : "secondary"}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </Button>
          </nav>

          <div className="text-xs text-slate-500">
            Data is saved locally in your browser (LocalStorage).
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <TimeLogForm settings={settings} onAdd={addEntry} existingDates={existingDates} />

          {activeTab === "dashboard" ? (
            <Dashboard entries={entries} settings={settings} />
          ) : activeTab === "settings" ? (
            <Settings settings={settings} onSave={setSettings} />
          ) : (
            <DTRTable
              entries={entries}
              settings={settings}
              onDelete={deleteEntry}
              onUpdate={updateEntry}
              onExportCsv={exportCsv}
            />
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 text-xs text-slate-500">
        Tip: Use “Records” tab to edit/delete entries and export CSV.
      </footer>
    </div>
  );
}

