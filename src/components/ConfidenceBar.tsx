import './ConfidenceBar.css';

interface ConfidenceBarProps {
  label: string;
  confidence: number; // 0–1
  variant: 'safe' | 'suspicious';
  large?: boolean;
}

export function ConfidenceBar({ label, confidence, variant, large }: ConfidenceBarProps) {
  const percent = Math.round(confidence * 100);

  return (
    <div className={`confidence-bar-wrapper ${large ? 'confidence-bar-large' : ''}`}>
      <div className="confidence-bar-label">
        <span className="confidence-bar-label-text">{label}</span>
        <span className="confidence-bar-percent" style={{ color: variant === 'safe' ? 'var(--color-primary)' : 'var(--color-danger)' }}>
          {percent}%
        </span>
      </div>
      <div className="confidence-bar-track">
        <div
          className={`confidence-bar-fill ${variant}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${percent}%`}
        />
      </div>
    </div>
  );
}
