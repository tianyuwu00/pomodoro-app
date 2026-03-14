import type { Session } from '../types';

interface Props {
  sessions: Session[];
  focusCount: number;
  onClear: () => void;
}

const modeLabel: Record<Session['mode'], string> = {
  'focus': 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const modeDot: Record<Session['mode'], string> = {
  'focus': '#ef4444',
  'short-break': '#22c55e',
  'long-break': '#3b82f6',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s > 0 ? ` ${s}s` : ''}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SessionHistory({ sessions, focusCount, onClear }: Props) {
  const totalFocusSeconds = sessions
    .filter(s => s.mode === 'focus')
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="session-history">
      <div className="session-header">
        <h2>Session Log</h2>
        {sessions.length > 0 && (
          <button className="clear-btn" onClick={onClear}>Clear</button>
        )}
      </div>

      <div className="session-stats">
        <div className="stat">
          <span className="stat-value">{focusCount}</span>
          <span className="stat-label">Pomodoros</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(totalFocusSeconds / 60)}</span>
          <span className="stat-label">Focus mins</span>
        </div>
        <div className="stat">
          <span className="stat-value">{sessions.length}</span>
          <span className="stat-label">Total sessions</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="empty-log">No sessions yet. Start the timer!</p>
      ) : (
        <ul className="session-list">
          {sessions.map(session => (
            <li key={session.id} className="session-item">
              <span
                className="session-dot"
                style={{ background: modeDot[session.mode] }}
              />
              <span className="session-mode">{modeLabel[session.mode]}</span>
              <span className="session-duration">{formatDuration(session.duration)}</span>
              <span className="session-time">{formatTime(session.completedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
