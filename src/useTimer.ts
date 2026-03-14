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
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(() => durationForMode('focus', DEFAULT_SETTINGS));
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [focusCount, setFocusCount] = useState(0);
  // Tracks focus seconds elapsed during the current in-progress focus session (resets on complete/reset/switchMode)
  const [pausedFocusSeconds, setPausedFocusSeconds] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialDurationRef = useRef<number>(durationForMode('focus', DEFAULT_SETTINGS));
  // Ref mirror of timeLeft so callbacks can read current value without stale closure
  const timeLeftRef = useRef<number>(timeLeft);

  const updateTimeLeft = useCallback((val: number | ((prev: number) => number)) => {
    setTimeLeft(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      timeLeftRef.current = next;
      return next;
    });
  }, []);

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
      setPausedFocusSeconds(0);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      updateTimeLeft(prev => {
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
  }, [isRunning, mode, clearTimer, completeSession, updateTimeLeft]);

  const switchMode = useCallback((newMode: Mode, currentSettings = settings) => {
    clearTimer();
    setIsRunning(false);
    setMode(newMode);
    setPausedFocusSeconds(0);
    const duration = durationForMode(newMode, currentSettings);
    initialDurationRef.current = duration;
    updateTimeLeft(duration);
  }, [clearTimer, settings, updateTimeLeft]);

  const start = useCallback(() => {
    if (timeLeftRef.current === 0) return;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setMode(currentMode => {
      if (currentMode === 'focus') {
        const elapsed = initialDurationRef.current - timeLeftRef.current;
        if (elapsed > 0) {
          setPausedFocusSeconds(prev => prev + elapsed);
          // Shift the initial duration forward so re-pausing doesn't double-count
          initialDurationRef.current = timeLeftRef.current;
        }
      }
      return currentMode;
    });
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setPausedFocusSeconds(0);
    const duration = durationForMode(mode, settings);
    initialDurationRef.current = duration;
    updateTimeLeft(duration);
  }, [clearTimer, mode, settings, updateTimeLeft]);

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

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      // If the changed duration affects the current mode and timer isn't running, reset to new duration
      setIsRunning(currentRunning => {
        if (!currentRunning) {
          setMode(currentMode => {
            const relevantKey: Record<Mode, keyof Settings> = {
              'focus': 'focusDuration',
              'short-break': 'shortBreakDuration',
              'long-break': 'longBreakDuration',
            };
            if (patch[relevantKey[currentMode]] !== undefined) {
              const duration = durationForMode(currentMode, next);
              initialDurationRef.current = duration;
              updateTimeLeft(duration);
              setPausedFocusSeconds(0);
            }
            return currentMode;
          });
        }
        return currentRunning;
      });
      return next;
    });
  }, [updateTimeLeft]);

  const clearSessions = useCallback(() => {
    setSessions([]);
    setFocusCount(0);
    setPausedFocusSeconds(0);
  }, []);

  const progress = 1 - timeLeft / initialDurationRef.current;

  return {
    mode,
    timeLeft,
    isRunning,
    sessions,
    focusCount,
    pausedFocusSeconds,
    settings,
    progress,
    switchMode,
    start,
    pause,
    reset,
    nextMode,
    updateSettings,
    clearSessions,
  };
}
