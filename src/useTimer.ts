import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mode, Session, Settings } from './types';

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

function durationForMode(mode: Mode, settings: Settings): number {
  if (mode === 'focus') return settings.focusDuration * 60;
  if (mode === 'short-break') return settings.shortBreakDuration * 60;
  return settings.longBreakDuration * 60;
}

export function useTimer() {
  const [settings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(() => durationForMode('focus', DEFAULT_SETTINGS));
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [focusCount, setFocusCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const initialDurationRef = useRef<number>(durationForMode('focus', DEFAULT_SETTINGS));

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const completeSession = useCallback((completedMode: Mode, duration: number) => {
    const session: Session = {
      id: crypto.randomUUID(),
      mode: completedMode,
      duration,
      completedAt: new Date().toISOString(),
    };
    setSessions(prev => [session, ...prev]);

    if (completedMode === 'focus') {
      setFocusCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          completeSession(mode, initialDurationRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, mode, clearTimer, completeSession]);

  const switchMode = useCallback((newMode: Mode) => {
    clearTimer();
    setIsRunning(false);
    setMode(newMode);
    const duration = durationForMode(newMode, settings);
    initialDurationRef.current = duration;
    setTimeLeft(duration);
  }, [clearTimer, settings]);

  const start = useCallback(() => {
    if (timeLeft === 0) return;
    startedAtRef.current = Date.now();
    setIsRunning(true);
  }, [timeLeft]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    const duration = durationForMode(mode, settings);
    initialDurationRef.current = duration;
    setTimeLeft(duration);
  }, [clearTimer, mode, settings]);

  const nextMode = useCallback(() => {
    const newFocusCount = mode === 'focus' ? focusCount + 1 : focusCount;
    if (mode === 'focus') {
      if (newFocusCount % settings.sessionsBeforeLongBreak === 0) {
        switchMode('long-break');
      } else {
        switchMode('short-break');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, focusCount, settings.sessionsBeforeLongBreak, switchMode]);

  const clearSessions = useCallback(() => {
    setSessions([]);
    setFocusCount(0);
  }, []);

  const progress = 1 - timeLeft / initialDurationRef.current;

  return {
    mode,
    timeLeft,
    isRunning,
    sessions,
    focusCount,
    settings,
    progress,
    switchMode,
    start,
    pause,
    reset,
    nextMode,
    clearSessions,
  };
}
