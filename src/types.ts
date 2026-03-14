export type Mode = 'focus' | 'short-break' | 'long-break';

export interface Session {
  id: string;
  mode: Mode;
  duration: number; // seconds
  completedAt: string; // ISO timestamp
}

export interface Settings {
  focusDuration: number;     // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}
