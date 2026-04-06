import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KMeansClassifier } from '../../../ml/KMeansClassifier';
import type { Point2D, Centroid } from '../../../ml/KMeansClassifier';
import './ClusterTestStep.css';

const CLUSTER_COLORS = [
  'var(--color-primary)',
  'var(--color-danger)',
  'var(--color-safe)',
  'var(--color-accent)',
];

interface Props {
  points: Point2D[];
  centroids: Centroid[];
  k: number;
  assignments: number[];
}

export function ClusterTestStep({ points, centroids, k, assignments }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [testPoint, setTestPoint] = useState<{ p: Point2D; clusterId: number; dist: number } | null>(null);

  // Re-instantiate the model to use the predict method using final centroids
  const model = new KMeansClassifier(k);
  // Hack to inject the trained centroids
  (model as any).centroids = centroids;

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const p: Point2D = { x, y };
    const clusterId = model.predict(p);
    
    // calculate distance to that centroid
    const c = centroids.find(c => c.id === clusterId);
    let dist = 0;
    if (c) {
      dist = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2) * 100;
    }

    setTestPoint({ p, clusterId, dist });
  }, [model, centroids]);

  return (
    <div className="cluster-test">
      {/* Left Canvas */}
      <div className="cluster-test-canvas-outer">
        <div ref={canvasRef} className="cluster-test-canvas" onClick={handleCanvasClick}>
          <svg width="100%" height="100%" className="cluster-svg">
            {/* Voronoi BG */}
            {centroids.map((c, ci) => (
              <circle
                key={`bg-${ci}`}
                cx={`${c.x * 100}%`}
                cy={`${c.y * 100}%`}
                r="80%"
                fill={CLUSTER_COLORS[c.id].replace('var(', '').replace(')', '')}
                fillOpacity={0.04}
              />
            ))}

            {/* Original Points (faded) */}
            {points.map((p, pi) => {
              const clusterIdx = assignments[pi];
              return (
                <circle
                  key={`pt-${pi}`}
                  cx={`${p.x * 100}%`}
                  cy={`${p.y * 100}%`}
                  r={4}
                  fill={CLUSTER_COLORS[clusterIdx]}
                  opacity={0.3}
                />
              );
            })}

            {/* Centroids */}
            {centroids.map((c, ci) => (
              <g key={`centroid-${ci}`}>
                <circle
                  cx={`${c.x * 100}%`}
                  cy={`${c.y * 100}%`}
                  r={8}
                  fill="none"
                  stroke={CLUSTER_COLORS[c.id]}
                  strokeWidth={2}
                  strokeDasharray="2 2"
                />
              </g>
            ))}

            {/* Test Point and Line */}
            <AnimatePresence>
              {testPoint && (() => {
                const c = centroids.find(cen => cen.id === testPoint.clusterId);
                return (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {c && (
                      <line
                        x1={`${testPoint.p.x * 100}%`}
                        y1={`${testPoint.p.y * 100}%`}
                        x2={`${c.x * 100}%`}
                        y2={`${c.y * 100}%`}
                        stroke={CLUSTER_COLORS[testPoint.clusterId]}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}
                    <circle
                      cx={`${testPoint.p.x * 100}%`}
                      cy={`${testPoint.p.y * 100}%`}
                      r={8}
                      fill={CLUSTER_COLORS[testPoint.clusterId]}
                      stroke="var(--color-surface)"
                      strokeWidth={2}
                    />
                    <circle
                      cx={`${testPoint.p.x * 100}%`}
                      cy={`${testPoint.p.y * 100}%`}
                      r={18}
                      fill="none"
                      stroke={CLUSTER_COLORS[testPoint.clusterId]}
                      strokeWidth={2}
                      opacity={0.5}
                    />
                  </motion.g>
                );
              })()}
            </AnimatePresence>
          </svg>
        </div>
        <p className="train-canvas-caption">
          Click anywhere to place a new test point.
        </p>
      </div>

      {/* Right Info Panel */}
      <div className="cluster-test-info">
        <h3><span className="material-symbols-rounded">my_location</span> Test the Model</h3>
        <p className="cluster-test-desc">
          Now that the clusters are defined, where does a new point belong? 
          The model simply finds the <strong>nearest centroid</strong> to make its decision.
        </p>

        {testPoint ? (
          <motion.div 
            className="test-result-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={`${testPoint.p.x}-${testPoint.p.y}`}
            style={{ borderTopColor: CLUSTER_COLORS[testPoint.clusterId] }}
          >
            <div className="test-result-header">
              <span className="material-symbols-rounded" style={{ color: CLUSTER_COLORS[testPoint.clusterId] }}>
                hub
              </span>
              <span>Assigned to Group {['A', 'B', 'C', 'D'][testPoint.clusterId]}</span>
            </div>
            <div className="test-dist">
              Distance to center: <strong>{testPoint.dist.toFixed(1)} units</strong>
            </div>
            <p className="test-trick-hint">
              <strong>Trick it:</strong> Try placing a point right on the boundary between two clusters!
            </p>
          </motion.div>
        ) : (
          <div className="test-empty-state">
            <span className="material-symbols-rounded">touch_app</span>
            <p>Click the canvas to drop a test point</p>
          </div>
        )}
      </div>
    </div>
  );
}
