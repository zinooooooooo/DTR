export type WorkSchedule = {
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
};

export type AppSettings = {
  schedule: WorkSchedule;
  requiredOjtHours: number;
  darkMode: boolean;
};

export type DtrEntry = {
  id: string;
  date: string; // "YYYY-MM-DD"
  timeIn: string; // "HH:MM"
  timeOut: string; // "HH:MM"
  note?: string;
  createdAt: number;
  updatedAt: number;
};

