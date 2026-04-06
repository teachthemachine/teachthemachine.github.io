import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { KMeansClassifier } from '../../../ml/KMeansClassifier';
import type { Point2D, KMeansIteration, Centroid } from '../../../ml/KMeansClassifier';
import './ClusterTrainStep.css';

const CLUSTER_COLORS = [
  'var(--color-primary)',
  'var(--color-danger)',
  'var(--color-safe)',
  'var(--color-accent)',
];
const CLUSTER_NAMES = ['Group A', 'Group B', 'Group C', 'Group D'];

interface Props {
  points: Point2D[];
  k: number;
  onTrained: (assignments: number[], centroids: Centroid[]) => void;
  isTrained: boolean;
}

export function ClusterTrainStep({ points, k, onTrained, isTrained }: Props) {
  const [isTraining, setIsTraining] = useState(false);
  const [currentIter, setCurrentIter] = useState<KMeansIteration | null>(null);
  const [iterIndex, setIterIndex] = useState(0);
  const [totalIters, setTotalIters] = useState(0);
  const [finalCentroids, setFinalCentroids] = useState<Centroid[]>([]);
  const [finalAssignments, setFinalAssignments] = useState<number[]>([]);

  const handleTrain = useCallback(async () => {
    setIsTraining(true);

    const model = new KMeansClassifier(k, 25);
    const iterations = model.fitAnimated(points);

    setTotalIters(iterations.length);

    for (let i = 0; i < iterations.length; i++) {
      setCurrentIter(iterations[i]);
      setIterIndex(i + 1);
      await new Promise(r => setTimeout(r, 380));
    }

    const last = iterations[iterations.length - 1] ?? { assignments: [], centroids: [] };
    setFinalCentroids(last.centroids);
    setFinalAssignments(last.assignments);
    setIsTraining(false);
    onTrained(last.assignments, last.centroids);
  }, [points, k, onTrained]);

  // Current display state
  const displayIter = currentIter;
  const assignments = displayIter?.assignments ?? finalAssignments;
  const centroids = displayIter?.centroids ?? finalCentroids;

  const clusterCounts = Array.from({ length: k }, (_, i) =>
    assignments.filter(a => a === i).length
  );

  return (
    <div className="cluster-train">
      <div className="cluster-train-canvas-outer">
        {/* Animated scatter plot */}
        <div className="cluster-train-canvas">
          <svg width="100%" height="100%" className="cluster-svg">
            {/* Voronoi-style background regions — approximate with radial gradients */}
            {isTrained && centroids.map((c, ci) => (
              <circle
                key={`bg-${ci}`}
                cx={`${c.x * 100}%`}
                cy={`${c.y * 100}%`}
                r="80%"
                fill={CLUSTER_COLORS[ci].replace('var(', '').replace(')', '')}
                fillOpacity={0.04}
              />
            ))}

            {/* Centroid cross-hairs */}
            {centroids.map((c, ci) => (
              <g key={`centroid-${ci}`}>
                <line
                  x1={`${c.x * 100}%`} y1={`${(c.y - 0.04) * 100}%`}
                  x2={`${c.x * 100}%`} y2={`${(c.y + 0.04) * 100}%`}
                  stroke={CLUSTER_COLORS[ci]}
                  strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'all 0.35s ease' }}
                />
                <line
                  x1={`${(c.x - 0.04) * 100}%`} y1={`${c.y * 100}%`}
                  x2={`${(c.x + 0.04) * 100}%`} y2={`${c.y * 100}%`}
                  stroke={CLUSTER_COLORS[ci]}
                  strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'all 0.35s ease' }}
                />
                <circle
                  cx={`${c.x * 100}%`}
                  cy={`${c.y * 100}%`}
                  r={isTrained ? 10 : 8}
                  fill="var(--color-surface)"
                  stroke={CLUSTER_COLORS[ci]}
                  strokeWidth={isTrained ? 3 : 2}
                  style={{ transition: 'all 0.35s ease' }}
                />
              </g>
            ))}

            {/* Data points colored by current cluster */}
            {points.map((p, pi) => {
              const clusterIdx = assignments[pi] ?? -1;
              const color = clusterIdx >= 0 ? CLUSTER_COLORS[clusterIdx] : 'var(--color-text-muted)';
              return (
                <circle
                  key={`pt-${pi}`}
                  cx={`${p.x * 100}%`}
                  cy={`${p.y * 100}%`}
                  r={5}
                  fill={color}
                  stroke="var(--color-surface)"
                  strokeWidth={1.5}
                  style={{ transition: 'fill 0.3s ease' }}
                />
              );
            })}
          </svg>

          {!isTraining && !isTrained && (
            <div className="train-canvas-overlay">
              <button className="btn btn-primary" onClick={handleTrain} style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-3) var(--space-8)' }}>
                <span className="material-symbols-rounded">play_arrow</span>
                Run K-Means
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {(isTraining || isTrained) && (
          <div className="iter-progress">
            <div className="iter-bar" style={{ width: `${(iterIndex / Math.max(totalIters, 1)) * 100}%` }} />
          </div>
        )}
        <p className="train-canvas-caption">
          {isTraining
            ? `Iteration ${iterIndex} of ${totalIters} — centroids are moving…`
            : isTrained
              ? `Converged in ${totalIters} iteration${totalIters !== 1 ? 's' : ''}! The machine found ${k} natural groups.`
              : `Press Run K-Means. Watch the ${k} centroids (⊕) drift until they stop moving.`
          }
        </p>
      </div>

      {/* Right panel: legend + explanation */}
      <div className="cluster-train-info">
        {/* Cluster legend */}
        <div className="cluster-legend">
          {Array.from({ length: k }, (_, i) => (
            <div key={i} className="legend-row">
              <div className="legend-dot" style={{ background: CLUSTER_COLORS[i] }} />
              <span className="legend-name">{CLUSTER_NAMES[i]}</span>
              <span className="legend-count">{clusterCounts[i] ?? 0} points</span>
            </div>
          ))}
        </div>

        {/* Explanation of what K-Means is doing */}
        <div className="kmeans-explainer">
          <h4><span className="material-symbols-rounded">school</span> What's happening?</h4>
          <ol className="explainer-steps">
            <li className={iterIndex >= 1 ? 'step-done' : ''}>
              <strong>Place centroids</strong> — K starting points are placed using K-Means++ (smart random placement)
            </li>
            <li className={iterIndex >= 2 ? 'step-done' : ''}>
              <strong>Assign points</strong> — every dot is colored by its nearest centroid
            </li>
            <li className={iterIndex >= 3 ? 'step-done' : ''}>
              <strong>Move centroids</strong> — each centroid moves to the average (center of mass) of its points
            </li>
            <li className={isTrained ? 'step-done' : ''}>
              <strong>Repeat until stable</strong> — stop when centroids don't move anymore
            </li>
          </ol>
          {isTrained && (
            <motion.div
              className="converged-note"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="material-symbols-rounded">check_circle</span>
              <span>Converged! No labels were given — the machine found these groups entirely on its own.</span>
            </motion.div>
          )}
        </div>

        {isTrained && (
          <button className="btn" onClick={handleTrain} style={{ borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)' }}>
            <span className="material-symbols-rounded">refresh</span> Re-run (randomized start)
          </button>
        )}
      </div>
    </div>
  );
}
