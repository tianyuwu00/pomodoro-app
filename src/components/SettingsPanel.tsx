import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

interface FieldConfig {
  label: string;
  key: keyof Settings;
  min: number;
  max: number;
}

const FIELDS: FieldConfig[] = [
  { label: 'Focus', key: 'focusDuration', min: 1, max: 90 },
  { label: 'Short Break', key: 'shortBreakDuration', min: 1, max: 30 },
  { label: 'Long Break', key: 'longBreakDuration', min: 1, max: 60 },
];

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="settings-panel">
      <p className="settings-title">Durations (minutes)</p>
      <div className="settings-fields">
        {FIELDS.map(({ label, key, min, max }) => (
          <div key={key} className="settings-field">
            <span className="settings-label">{label}</span>
            <div className="settings-stepper">
              <button
                className="stepper-btn"
                onClick={() => onChange({ [key]: Math.max(min, (settings[key] as number) - 1) })}
                disabled={(settings[key] as number) <= min}
              >−</button>
              <input
                className="stepper-input"
                type="number"
                min={min}
                max={max}
                value={settings[key] as number}
                onChange={e => {
                  const v = Math.min(max, Math.max(min, parseInt(e.target.value) || min));
                  onChange({ [key]: v });
                }}
              />
              <button
                className="stepper-btn"
                onClick={() => onChange({ [key]: Math.min(max, (settings[key] as number) + 1) })}
                disabled={(settings[key] as number) >= max}
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
