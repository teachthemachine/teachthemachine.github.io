import { useState, useRef, useEffect } from 'react';
import type { DoodleModelAdapter } from '../ml/DoodleModelAdapter';
import './DoodleTestStep.css';

interface DoodleTestProps {
  model: DoodleModelAdapter;
  isTrained: boolean;
}

export function DoodleTestStep({ model, isTrained }: DoodleTestProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<{ label: string; confidences: Record<string, number> } | null>(null);

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
    const res = await model.predict(canvasRef.current);
    setResult(res);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
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

      <div className="preview-body" style={{ alignItems: 'center' }}>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
          Draw a shape and see what the AI thinks!
        </p>
        
        <div className="doodle-test-canvas-wrapper"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        >
          <canvas ref={canvasRef} width={224} height={224} />
        </div>
        
        <button className="btn btn-sm" onClick={clearCanvas} style={{ marginTop: 'var(--space-2)' }}>
          Clear
        </button>

        {result && (
          <div className="test-result" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
            <div className={`test-result-label ${result.label === 'Circle' ? 'real' : 'suspicious'}`} style={{ justifyContent: 'center' }}>
              Looks like {result.label}
            </div>
            {Object.entries(result.confidences).map(([label, conf]) => (
              <div key={label} className="confidence-row">
                <span className="confidence-category">{label}</span>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ 
                      width: `${Math.round(conf * 100)}%`, 
                      backgroundColor: label === 'Circle' ? 'var(--color-primary)' : 'var(--color-warning)' 
                    }}
                  />
                </div>
                <span className="confidence-pct">{Math.round(conf * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
