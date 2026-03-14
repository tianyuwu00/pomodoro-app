import { useState } from 'react';
import { useTimer } from './useTimer';
import TimerRing from './components/TimerRing';
import SessionHistory from './components/SessionHistory';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

const modeLabel = {
  'focus': 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const {
    mode, timeLeft, isRunning, sessions, focusCount, pausedFocusSeconds,
    settings, progress, switchMode, start, pause, reset, nextMode,
    updateSettings, clearSessions,
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pomodoro</h1>
      </header>

      <main className="app-main">
        <div className="timer-section">
          {/* Mode tabs */}
          <div className="mode-tabs">
            {(['focus', 'short-break', 'long-break'] as const).map(m => (
              <button
                key={m}
                className={`mode-tab ${mode === m ? 'active' : ''} mode-${m}`}
                onClick={() => switchMode(m)}
              >
                {modeLabel[m]}
              </button>
            ))}
          </div>

          {/* Timer ring */}
          <TimerRing progress={progress} mode={mode}>
            <div className="timer-display">
              <span className="timer-time">{formatTime(timeLeft)}</span>
              <span className="timer-mode-label">{modeLabel[mode]}</span>
            </div>
          </TimerRing>

          {/* Controls */}
          <div className="controls">
            {!isRunning ? (
              <button
                className="btn-primary"
                onClick={start}
                disabled={timeLeft === 0}
              >
                {timeLeft === 0 ? 'Done' : 'Start'}
              </button>
            ) : (
              <button className="btn-primary" onClick={pause}>Pause</button>
            )}
            <button className="btn-secondary" onClick={reset}>Reset</button>
            <button className="btn-secondary" onClick={nextMode} title="Skip to next mode">
              Skip →
            </button>
          </div>

          {/* Focus streak */}
          <div className="streak">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`streak-dot ${i < (focusCount % 4) ? 'filled' : ''}`}
              />
            ))}
            <span className="streak-label">
              {focusCount % 4}/4 until long break
            </span>
          </div>

          {/* Settings toggle */}
          <button
            className={`settings-toggle ${showSettings ? 'open' : ''}`}
            onClick={() => setShowSettings(s => !s)}
            title="Timer settings"
          >
            ⚙ Settings
          </button>

          {showSettings && (
            <SettingsPanel settings={settings} onChange={updateSettings} />
          )}
        </div>

        <SessionHistory
          sessions={sessions}
          focusCount={focusCount}
          pausedFocusSeconds={pausedFocusSeconds}
          onClear={clearSessions}
        />
      </main>
    </div>
  );
}
