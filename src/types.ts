export type WorkSchedule = {
  morningStart: string; // "HH:MM"
  morningEnd: string; // "HH:MM"
  afternoonStart: string; // "HH:MM"
  afternoonEnd: string; // "HH:MM"
};

export type AppSettings = {
  schedule: WorkSchedule;
  requiredOjtHours: number;
  darkMode: boolean;
};

export type DtrEntry = {
  id: string;
  date: string; // "YYYY-MM-DD"
  morningIn: string; // "HH:MM"
  morningOut: string; // "HH:MM"
  afternoonIn: string; // "HH:MM"
  afternoonOut: string; // "HH:MM"
  note?: string;
  createdAt: number;
  updatedAt: number;
};

