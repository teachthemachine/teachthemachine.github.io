import { motion } from 'framer-motion';
import './MessageCard.css';

interface MessageCardProps {
  text: string;
  category?: 'safe' | 'suspicious' | null;
  onRemove?: () => void;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  showBadge?: boolean;
  layoutId?: string;
}

export function MessageCard({
  text,
  category,
  onRemove,
  onClick,
  draggable = false,
  onDragStart,
  showBadge = false,
  layoutId,
}: MessageCardProps) {
  const classes = [
    'message-card',
    category && 'sorted',
    category === 'safe' && 'sorted-safe',
    category === 'suspicious' && 'sorted-suspicious',
  ].filter(Boolean).join(' ');

  // Use a wrapper div for native HTML drag-and-drop (separate from Framer Motion's drag)
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <motion.div
        className={classes}
        onClick={onClick}
        layoutId={layoutId}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        whileHover={!category ? { scale: 1.02 } : undefined}
        whileTap={!category ? { scale: 0.98 } : undefined}
      >
        <span className="message-card-text">{text}</span>
        {onRemove && (
          <button
            className="message-card-remove"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label="Remove message"
          >
            ✕
          </button>
        )}
        {showBadge && category && (
          <div className={`message-card-badge ${category}`}>
            {category === 'safe' ? '✅ Real' : '🚫 Suspicious'}
          </div>
        )}
      </motion.div>
    </div>
  );
}
