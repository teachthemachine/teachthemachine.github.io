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

  const shapeUp = examplesByClass.find((s) => s.direction === 'up')!;
  const shapeLeft = examplesByClass.find((s) => s.direction === 'left')!;
  const shapeRight = examplesByClass.find((s) => s.direction === 'right')!;
  const shapeDown = examplesByClass.find((s) => s.direction === 'down')!;

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
          <div className="doodle-arena-cross-surface">
            <div className="doodle-arena-cross">
              <button
                type="button"
                className="doodle-cross-pad doodle-cross-pad-up"
                style={{ '--doodle-color': shapeUp.color } as CSSProperties}
                onClick={() => handleSort(shapeUp.label)}
                disabled={!hasDrawn}
                title={`${shapeUp.label} — arrow up`}
              >
                <span className="material-symbols-rounded doodle-cross-pad-arrow">{shapeUp.arrowIcon}</span>
                <span className="material-symbols-rounded doodle-cross-pad-icon">{shapeUp.icon}</span>
                <span className="doodle-cross-pad-count">{shapeUp.examples.length}</span>
              </button>

              <button
                type="button"
                className="doodle-cross-pad doodle-cross-pad-left"
                style={{ '--doodle-color': shapeLeft.color } as CSSProperties}
                onClick={() => handleSort(shapeLeft.label)}
                disabled={!hasDrawn}
                title={`${shapeLeft.label} — arrow left`}
              >
                <span className="material-symbols-rounded doodle-cross-pad-icon">{shapeLeft.icon}</span>
                <span className="doodle-cross-pad-count">{shapeLeft.examples.length}</span>
              </button>

              <div className="doodle-cross-canvas-cell">
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
              </div>

              <button
                type="button"
                className="doodle-cross-pad doodle-cross-pad-right"
                style={{ '--doodle-color': shapeRight.color } as CSSProperties}
                onClick={() => handleSort(shapeRight.label)}
                disabled={!hasDrawn}
                title={`${shapeRight.label} — arrow right`}
              >
                <span className="material-symbols-rounded doodle-cross-pad-icon">{shapeRight.icon}</span>
                <span className="doodle-cross-pad-count">{shapeRight.examples.length}</span>
              </button>

              <button
                type="button"
                className="doodle-cross-pad doodle-cross-pad-down"
                style={{ '--doodle-color': shapeDown.color } as CSSProperties}
                onClick={() => handleSort(shapeDown.label)}
                disabled={!hasDrawn}
                title={`${shapeDown.label} — arrow down`}
              >
                <span className="material-symbols-rounded doodle-cross-pad-arrow">{shapeDown.arrowIcon}</span>
                <span className="material-symbols-rounded doodle-cross-pad-icon">{shapeDown.icon}</span>
                <span className="doodle-cross-pad-count">{shapeDown.examples.length}</span>
              </button>
            </div>
          </div>

          <p className="doodle-stage-tip">
            Want to fool the AI later? Vary size, wobble, and stroke thickness so each class has personality.
          </p>

          <div className="doodle-stage-toolbar">
            <button type="button" className="btn btn-sm" onClick={clearCanvas} disabled={!hasDrawn}>
              Clear canvas
            </button>
            <span className="doodle-stage-toolbar-note">
              Use arrow keys to sort. Train unlocks after {MIN_DOODLES_PER_CLASS} examples in every direction.
            </span>
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
