import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DoodleCollectStep.css';

export interface DoodleExample {
  id: string;
  dataUrl: string;
  label: string;
}

interface DoodleCollectProps {
  examples: DoodleExample[];
  onAddExample: (example: DoodleExample) => void;
  onClearExamples: (label: string) => void;
}

export function DoodleCollectStep({ examples, onAddExample, onClearExamples }: DoodleCollectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setHasDrawn(false);
    }
  };

  const handleSort = (label: string) => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      onAddExample({ id: Date.now().toString(), dataUrl: canvas.toDataURL('image/png'), label });
      clearCanvas();
    }
  };

  const circles = examples.filter(e => e.label === 'Circle');
  const triangles = examples.filter(e => e.label === 'Triangle');

  return (
    <div className="collect-workspace-horizontal">
      
      {/* LEFT BUCKET */}
      <div className="bucket-column">
        <div className="bucket-header" style={{ borderBottomColor: 'var(--color-primary)' }}>
          <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)' }}>panorama_fish_eye</span>
          <h3>Circle</h3>
          <span className="bucket-count">{circles.length}</span>
        </div>
        <div className="bucket-body">
          <div className="doodle-gallery">
            <AnimatePresence>
              {circles.map(ex => (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <img src={ex.dataUrl} className="doodle-thumb" alt="Circle" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {circles.length === 0 && <div className="empty-bucket">Drop circle doodles here</div>}
        </div>
        {circles.length > 0 && (
          <button className="btn btn-sm" onClick={() => onClearExamples('Circle')} style={{ margin: 'var(--space-2)' }}>Clear</button>
        )}
      </div>

      {/* CENTER POOL (Canvas) */}
      <div className="pool-column">
        <div className="pool-header">
          <span className="material-symbols-rounded">gesture</span>
          <h3>Draw a Shape</h3>
        </div>
        
        <div className="pool-body center-canvas">
          <div className="doodle-canvas-wrapper"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          >
            {!hasDrawn && <div className="doodle-canvas-hint">Draw here...</div>}
            <canvas ref={canvasRef} width={224} height={224} />
          </div>

          <div className="doodle-sort-actions">
            <button 
              className="sort-btn left" 
              style={{ color: 'var(--color-primary)' }}
              onClick={() => handleSort('Circle')}
              disabled={!hasDrawn}
            >
              <span className="material-symbols-rounded">keyboard_arrow_left</span>
            </button>
            <button className="btn btn-sm" onClick={clearCanvas} disabled={!hasDrawn}>Clear</button>
            <button 
              className="sort-btn right" 
              style={{ color: 'var(--color-warning)' }}
              onClick={() => handleSort('Triangle')}
              disabled={!hasDrawn}
            >
              <span className="material-symbols-rounded">keyboard_arrow_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT BUCKET */}
      <div className="bucket-column">
        <div className="bucket-header" style={{ borderBottomColor: 'var(--color-warning)' }}>
          <h3>Triangle</h3>
          <span className="material-symbols-rounded" style={{ color: 'var(--color-warning)' }}>change_history</span>
          <span className="bucket-count">{triangles.length}</span>
        </div>
        <div className="bucket-body">
          <div className="doodle-gallery">
            <AnimatePresence>
              {triangles.map(ex => (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <img src={ex.dataUrl} className="doodle-thumb" alt="Triangle" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {triangles.length === 0 && <div className="empty-bucket">Drop triangle doodles here</div>}
        </div>
        {triangles.length > 0 && (
          <button className="btn btn-sm" onClick={() => onClearExamples('Triangle')} style={{ margin: 'var(--space-2)' }}>Clear</button>
        )}
      </div>

    </div>
  );
}
