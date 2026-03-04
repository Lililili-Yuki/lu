export interface DeerRecord {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration: number; // in seconds
  note?: string;
}

export interface DayData {
  date: string;
  records: DeerRecord[];
  totalDuration: number;
}

export interface MonthlyStats {
  month: string;
  totalCount: number;
  totalDuration: number;
  averageDuration: number;
  dailyAverage: number;
}
