import './ActivityCard.css';

interface ActivityCardProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  isNew?: boolean;
  onClick: () => void;
}

export function ActivityCard({
  title,
  subtitle,
  description,
  icon,
  color,
  isNew,
  onClick
}: ActivityCardProps) {
  return (
    <button className="activity-card" onClick={onClick} style={{ '--card-color': color } as React.CSSProperties}>
      <div className="activity-icon-wrapper">
        <div className="activity-icon"><span className="material-symbols-rounded">{icon}</span></div>
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-subtitle">{subtitle}</span>
          {isNew && <span className="activity-badge">NEW</span>}
        </div>
        <h2 className="activity-title">{title}</h2>
        <p className="activity-desc">{description}</p>
      </div>
    </button>
  );
}
