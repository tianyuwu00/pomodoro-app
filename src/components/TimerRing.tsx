interface Props {
  progress: number; // 0–1
  mode: 'focus' | 'short-break' | 'long-break';
  children: React.ReactNode;
}

const RADIUS = 90;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const modeColor: Record<Props['mode'], string> = {
  'focus': '#ef4444',
  'short-break': '#22c55e',
  'long-break': '#3b82f6',
};

export default function TimerRing({ progress, mode, children }: Props) {
  const size = (RADIUS + STROKE) * 2;
  const color = modeColor[mode];
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="timer-ring-wrapper">
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={STROKE}
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="timer-ring-inner">{children}</div>
    </div>
  );
}
