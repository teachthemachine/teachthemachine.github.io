import { useState } from 'react';
import type { ReactNode } from 'react';
import './DropZone.css';

interface DropZoneProps {
  variant: 'safe' | 'suspicious';
  title: string;
  icon: string;
  count: number;
  onDrop?: (data: string) => void;
  children: ReactNode;
}

export function DropZone({ variant, title, icon, count, onDrop, children }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const data = e.dataTransfer.getData('text/plain');
    if (data && onDrop) {
      onDrop(data);
    }
  };

  return (
    <div
      className={`drop-zone ${variant} ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="drop-zone-header">
        <div className="drop-zone-title">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span className="drop-zone-count">{count}</span>
      </div>
      <div className="drop-zone-cards">
        {count === 0 ? (
          <div className="drop-zone-empty">
            Drop messages here or tap to sort
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
