import { useState, useRef, useEffect } from 'react';
import type { DoodleModelAdapter } from '../ml/DoodleModelAdapter';
import '../../text-classifier/steps/TestStep.css';
import './DoodleTestStep.css';
import { DOODLE_CLASSES, DOODLE_CLASS_MAP } from '../config';
import { createVisionSnapshotFromCanvas, type DoodleVisionSnapshot } from '../utils/doodleVision';

interface DoodleTestProps {
  model: DoodleModelAdapter;
  isTrained: boolean;
}

export function DoodleTestStep({ model, isTrained }: DoodleTestProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<{ label: string; confidences: Record<string, number> } | null>(null);
  const [visionSnapshot, setVisionSnapshot] = useState<DoodleVisionSnapshot | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const predictCurrentCanvas = async () => {
    if (!isTrained || !canvasRef.current) return;
    setVisionSnapshot(createVisionSnapshotFromCanvas(canvasRef.current));
    const res = await model.predict(canvasRef.current);
    setResult(res);
  };

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
    setResult(null);

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
    predictCurrentCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setResult(null);
    setVisionSnapshot(null);
  };

  if (!isTrained) {
    return (
      <div className="preview-panel">
        <div className="preview-disabled">
          <div className="preview-disabled-icon">🔒</div>
          <div className="preview-disabled-text">
            You must train a model on the left before you can test it here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-tabs">
        <button className="preview-tab active">Test Doodle</button>
      </div>

      <div className="preview-body doodle-preview-body">
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
          Draw a shape and compare your sketch with the simplified pixel map the AI can use.
        </p>

        <div className="doodle-test-stage">
          <div className={`doodle-test-canvas-wrapper ${isDrawing ? 'is-drawing' : ''}`}>
            <canvas
              ref={canvasRef}
              width={224}
              height={224}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />
          </div>

          <div className="doodle-test-machine-view">
            <div className="doodle-test-machine-view-header">
              <span className="material-symbols-rounded">grid_view</span>
              <div>
                <h4>Machine View</h4>
                <p>This coarse pixel grid highlights where your dark strokes appear.</p>
              </div>
            </div>

            {visionSnapshot ? (
              <>
                <img src={visionSnapshot.pixelatedDataUrl} alt="Pixelated doodle preview" />
                <p className="doodle-test-machine-metric">
                  Ink coverage: <strong>{Math.round(visionSnapshot.inkCoverage * 100)}%</strong>
                </p>
              </>
            ) : (
              <div className="doodle-test-machine-placeholder">
                Draw something to see the simplified pixel map.
              </div>
            )}
          </div>
        </div>
        
        <button className="btn btn-sm" onClick={clearCanvas} style={{ marginTop: 'var(--space-2)' }}>
          Clear
        </button>

        {result && (
          <div className="test-result" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
            <div
              className="test-result-label"
              style={{
                justifyContent: 'center',
                color: result.label in DOODLE_CLASS_MAP
                  ? DOODLE_CLASS_MAP[result.label as keyof typeof DOODLE_CLASS_MAP].color
                  : 'var(--color-text)',
              }}
            >
              Looks like {result.label}
            </div>
            {DOODLE_CLASSES.map((shape) => (
              <div key={shape.label} className="confidence-row">
                <span className="confidence-category">{shape.label}</span>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ 
                      width: `${Math.round((result.confidences[shape.label] ?? 0) * 100)}%`, 
                      backgroundColor: shape.color,
                    }}
                  />
                </div>
                <span className="confidence-pct">{Math.round((result.confidences[shape.label] ?? 0) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
