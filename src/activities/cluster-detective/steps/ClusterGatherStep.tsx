import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Point2D } from '../../../ml/KMeansClassifier';
import './ClusterGatherStep.css';

interface Props {
  points: Point2D[];
  k: number;
  onPointsChange: (pts: Point2D[]) => void;
  onKChange: (k: number) => void;
}



export function ClusterGatherStep({ points, k, onPointsChange, onKChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onPointsChange([...points, { x, y }]);
  }, [points, onPointsChange]);

  const handleUndo = () => onPointsChange(points.slice(0, -1));
  const handleClear = () => onPointsChange([]);

  // Preset "interesting" distributions to seed imagination
  const loadPreset = (name: string) => {
    const r = (base: number, spread: number) => base + (Math.random() - 0.5) * spread;
    let pts: Point2D[] = [];
    if (name === 'blobs') {
      const centers = [[0.2, 0.3], [0.7, 0.25], [0.45, 0.75]];
      for (const [cx, cy] of centers)
        for (let i = 0; i < 10; i++) pts.push({ x: r(cx, 0.18), y: r(cy, 0.18) });
    } else if (name === 'spread') {
      for (let i = 0; i < 30; i++) pts.push({ x: Math.random(), y: Math.random() });
    } else if (name === 'two-lines') {
      for (let i = 0; i < 15; i++) pts.push({ x: r(0.25, 0.12), y: 0.15 + i * 0.047 });
      for (let i = 0; i < 15; i++) pts.push({ x: r(0.72, 0.12), y: 0.15 + i * 0.047 });
    }
    onPointsChange(pts.map(p => ({ x: Math.max(0.02, Math.min(0.98, p.x)), y: Math.max(0.02, Math.min(0.98, p.y)) })));
  };

  return (
    <div className="cluster-gather">
      {/* Left: controls */}
      <div className="cluster-sidebar">
        <div className="cluster-sidebar-section">
          <h3>How many groups?</h3>
          <p className="cluster-sidebar-hint">
            Choose K — the number of clusters the machine will try to find.
          </p>
          <div className="k-selector">
            {[2, 3, 4].map(ki => (
              <button
                key={ki}
                className={`k-btn ${k === ki ? 'k-btn-active' : ''}`}
                onClick={() => onKChange(ki)}
              >
                K = {ki}
              </button>
            ))}
          </div>
        </div>

        <div className="cluster-sidebar-section">
          <h3>Quick start</h3>
          <p className="cluster-sidebar-hint">Load a preset or click anywhere on the canvas:</p>
          <div className="preset-buttons">
            <button className="btn btn-sm" onClick={() => loadPreset('blobs')}>
              <span className="material-symbols-rounded">bubble_chart</span> 3 Blobs
            </button>
            <button className="btn btn-sm" onClick={() => loadPreset('spread')}>
              <span className="material-symbols-rounded">scatter_plot</span> Random
            </button>
            <button className="btn btn-sm" onClick={() => loadPreset('two-lines')}>
              <span className="material-symbols-rounded">view_column</span> 2 Columns
            </button>
          </div>
        </div>

        <div className="cluster-sidebar-section">
          <div className="cluster-edit-row">
            <button className="btn btn-sm" onClick={handleUndo} disabled={points.length === 0}>
              <span className="material-symbols-rounded">undo</span> Undo
            </button>
            <button className="btn btn-sm" onClick={handleClear} disabled={points.length === 0}>
              <span className="material-symbols-rounded">delete_sweep</span> Clear
            </button>
          </div>
        </div>

        <div className="cluster-counter">
          <span className="counter-num">{points.length}</span>
          <span className="counter-lbl">data points</span>
        </div>

        {points.length < 6 && (
          <p className="cluster-hint-warning">
            <span className="material-symbols-rounded">info</span>
            Add at least 6 points to continue.
          </p>
        )}
      </div>

      {/* Right: canvas */}
      <div className="cluster-canvas-outer">
        <div
          ref={canvasRef}
          className="cluster-canvas"
          onClick={handleCanvasClick}
        >
          {/* Grid lines */}
          <svg className="cluster-canvas-grid" width="100%" height="100%">
            {[0.25, 0.5, 0.75].map(v => (
              <g key={v}>
                <line x1={`${v * 100}%`} y1="0" x2={`${v * 100}%`} y2="100%" className="grid-line" />
                <line x1="0" y1={`${v * 100}%`} x2="100%" y2={`${v * 100}%`} className="grid-line" />
              </g>
            ))}
          </svg>

          {/* Points */}
          <AnimatePresence>
            {points.map((p, i) => (
              <motion.div
                key={i}
                className="data-point"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              />
            ))}
          </AnimatePresence>

          {points.length === 0 && (
            <div className="canvas-empty-hint">
              <span className="material-symptoms-rounded" />
              Click anywhere to place data points
            </div>
          )}
        </div>
        <p className="canvas-caption">
          Each dot is a data point. The machine will try to find {k} natural groups — with <strong>no labels from you</strong>.
        </p>
      </div>
    </div>
  );
}
