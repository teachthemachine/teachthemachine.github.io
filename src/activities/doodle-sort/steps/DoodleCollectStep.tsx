import { useRef, useState, useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DoodleCollectStep.css';
import { DOODLE_CLASSES, MIN_DOODLES_PER_CLASS, type DoodleLabel } from '../config';

export interface DoodleExample {
  id: string;
  dataUrl: string;
  label: DoodleLabel;
}

interface DoodleCollectProps {
  examples: DoodleExample[];
  onAddExample: (example: DoodleExample) => void;
  onClearExamples: (label: DoodleLabel) => void;
}

export function DoodleCollectStep({ examples, onAddExample, onClearExamples }: DoodleCollectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
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

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const point = getCanvasPoint(event);
    const ctx = canvasRef.current.getContext('2d');
    if (!point || !ctx) return;

    event.preventDefault();
    canvasRef.current.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    setIsDrawing(true);
    setHasDrawn(true);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x, point.y);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const point = getCanvasPoint(event);
    const ctx = canvasRef.current.getContext('2d');
    if (!point || !ctx) return;

    event.preventDefault();
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    if (event && canvasRef.current?.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
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

  const handleSort = (label: DoodleLabel) => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      onAddExample({ id: Date.now().toString(), dataUrl: canvas.toDataURL('image/png'), label });
      clearCanvas();
    }
  };

  const examplesByClass = DOODLE_CLASSES.map((shape) => ({
    ...shape,
    examples: examples.filter((example) => example.label === shape.label),
  }));

  const readyClasses = examplesByClass.filter(
    (shape) => shape.examples.length >= MIN_DOODLES_PER_CLASS
  ).length;

  useEffect(() => {
    const keyToLabel: Record<string, DoodleLabel> = {
      ArrowUp: 'Square',
      ArrowLeft: 'Circle',
      ArrowRight: 'Triangle',
      ArrowDown: 'Star',
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (event.key in keyToLabel && hasDrawn) {
        event.preventDefault();
        handleSort(keyToLabel[event.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasDrawn]);

  return (
    <div className="doodle-collect-layout">
      <div className="doodle-collect-stage panel">
        <div className="doodle-stage-header">
          <div>
            <p className="doodle-stage-kicker">Four-way sorting</p>
            <h3>Draw in the center, then launch your doodle in a direction.</h3>
          </div>
          <div className="doodle-stage-progress">
            <span className="material-symbols-rounded">category</span>
            {readyClasses}/{DOODLE_CLASSES.length} shape families ready
          </div>
        </div>

        <div className="doodle-stage-arena">
          {examplesByClass.map((shape) => (
            <button
              key={shape.label}
              className={`doodle-sort-target doodle-sort-target-${shape.direction}`}
              style={{ '--doodle-color': shape.color } as CSSProperties}
              onClick={() => handleSort(shape.label)}
              disabled={!hasDrawn}
              title={`${shape.label} (${shape.arrowIcon.replace('keyboard_', '').replace('_', ' ')})`}
            >
              <span className="material-symbols-rounded doodle-sort-target-arrow">{shape.arrowIcon}</span>
              <div className="doodle-sort-target-main">
                <span className="material-symbols-rounded doodle-sort-target-icon">{shape.icon}</span>
                <span>{shape.label}</span>
              </div>
              <kbd className="doodle-sort-hotkey">
                {shape.direction === 'up' ? 'Up' : shape.direction === 'down' ? 'Down' : shape.direction === 'left' ? 'Left' : 'Right'}
              </kbd>
              <span className="doodle-sort-target-count">{shape.examples.length}</span>
            </button>
          ))}

          <div className="doodle-canvas-stage">
            <div className={`doodle-canvas-wrapper ${isDrawing ? 'is-drawing' : ''}`}>
              {!hasDrawn && (
                <div className="doodle-canvas-hint">
                  Sketch your shape here.
                  <span>Use the launch pads around the canvas to file it.</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="doodle-canvas"
                width={224}
                height={224}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
              />
            </div>

            <p className="doodle-stage-tip">
              Want to fool the AI later? Vary size, wobble, and stroke thickness so each class has personality.
            </p>

            <div className="doodle-stage-toolbar">
              <button className="btn btn-sm" onClick={clearCanvas} disabled={!hasDrawn}>
                Clear canvas
              </button>
              <span className="doodle-stage-toolbar-note">
                Use arrow keys to sort. Train unlocks after {MIN_DOODLES_PER_CLASS} examples in every direction.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="doodle-class-grid">
        {examplesByClass.map((shape) => (
          <section
            key={shape.label}
            className="doodle-class-card"
            style={{ '--doodle-color': shape.color } as CSSProperties}
          >
            <header className="doodle-class-card-header">
              <div className="doodle-class-card-title">
                <span className="material-symbols-rounded">{shape.icon}</span>
                <div>
                  <h4>{shape.label}</h4>
                  <p>{shape.prompt}</p>
                </div>
              </div>
              <span className="bucket-count">{shape.examples.length}</span>
            </header>

            <div className="doodle-gallery">
              <AnimatePresence>
                {shape.examples.map((example) => (
                  <motion.div
                    key={example.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <img src={example.dataUrl} className="doodle-thumb" alt={shape.label} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {shape.examples.length === 0 && <div className="empty-bucket">{shape.emptyHint}</div>}

            {shape.examples.length > 0 && (
              <button className="btn btn-sm" onClick={() => onClearExamples(shape.label)}>
                Clear {shape.label.toLowerCase()}s
              </button>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
