import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DoodleModelAdapter } from '../ml/DoodleModelAdapter';
import type { DoodleExample } from './DoodleCollectStep';
import '../../text-classifier/steps/TrainStep.css'; // Re-use animated styles
import './DoodleTrainStep.css';
import { DOODLE_CLASSES, DOODLE_CLASS_MAP, MIN_DOODLES_PER_CLASS } from '../config';
import { createVisionSnapshotFromDataUrl, type DoodleVisionSnapshot } from '../utils/doodleVision';

interface DoodleTrainProps {
  model: DoodleModelAdapter;
  examples: DoodleExample[];
  isTrained: boolean;
  onTrained: () => void;
}

export function DoodleTrainStep({ model, examples, isTrained, onTrained }: DoodleTrainProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStage, setTrainingStage] = useState(0);
  const [isLoaderReady, setIsLoaderReady] = useState(model.isReady);
  const [visionSnapshots, setVisionSnapshots] = useState<Record<string, DoodleVisionSnapshot>>({});
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);

  const classCounts = useMemo(
    () =>
      DOODLE_CLASSES.map((shape) => ({
        ...shape,
        count: examples.filter((example) => example.label === shape.label).length,
      })),
    [examples]
  );

  const canTrain = classCounts.every(({ count }) => count >= MIN_DOODLES_PER_CLASS);

  useEffect(() => {
    if (model.isReady) {
      setIsLoaderReady(true);
      return;
    }
    model.load().then(() => {
      setIsLoaderReady(true);
    }).catch(console.error);
  }, [model]);

  useEffect(() => {
    if (!isTrained || examples.length === 0 || Object.keys(visionSnapshots).length === examples.length) {
      return;
    }

    let cancelled = false;

    const buildSnapshots = async () => {
      const entries = await Promise.all(
        examples.map(async (example) => [example.id, await createVisionSnapshotFromDataUrl(example.dataUrl)] as const)
      );

      if (!cancelled) {
        setVisionSnapshots(Object.fromEntries(entries));
      }
    };

    buildSnapshots().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [examples, isTrained, visionSnapshots]);

  const handleTrain = useCallback(async () => {
    if (!canTrain || !isLoaderReady) return;
    setIsTraining(true);
    setVisionSnapshots({});
    setActiveExampleId(null);
    
    // Stage 1: Loading
    setTrainingStage(1);
    await new Promise(r => setTimeout(r, 1200));

    // Stage 2: Feature Extraction (where MobileNet acts)
    setTrainingStage(2);
    
    model.reset();
    const canvas = document.createElement('canvas'); // Hidden canvas for data loading
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');

    // Actually extract features
    const nextSnapshots: Record<string, DoodleVisionSnapshot> = {};
    for (let i = 0; i < examples.length; i++) {
      const ex = examples[i];
      const img = new Image();
      img.src = ex.dataUrl;
      await new Promise(r => { img.onload = r; });
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 224, 224);
        ctx.drawImage(img, 0, 0, 224, 224);
      }
      nextSnapshots[ex.id] = await createVisionSnapshotFromDataUrl(ex.dataUrl);
      setVisionSnapshots({ ...nextSnapshots });
      setActiveExampleId(ex.id);
      model.addExample(canvas, ex.label);
      await new Promise(r => setTimeout(r, 120)); // Yield to renderer
    }

    // Stage 3: Plotting features
    setTrainingStage(3);
    await new Promise(r => setTimeout(r, 1800));

    // Stage 4: Distance calculation
    setTrainingStage(4);
    await new Promise(r => setTimeout(r, 1500));

    setIsTraining(false);
    setActiveExampleId(null);
    setTrainingStage(5);
    onTrained();
  }, [canTrain, examples, model, onTrained, isLoaderReady]);

  const stages = [
    { id: 1, text: `Loading ${examples.length} doodles into the vision pipeline...`, icon: 'image_search' },
    { id: 2, text: 'Compressing each drawing into a simpler pixel story with edges and filled regions...', icon: 'grid_view' },
    { id: 3, text: 'Plotting each doodle as a point in feature space...', icon: 'scatter_plot' },
    { id: 4, text: 'Comparing neighborhoods so similar doodles cluster together...', icon: 'hub' }
  ];

  const activeExample = activeExampleId
    ? examples.find((example) => example.id === activeExampleId) ?? null
    : null;
  const activeSnapshot = activeExampleId ? visionSnapshots[activeExampleId] : null;

  return (
    <div className="train-panel-animated">
      
      {!isTraining && trainingStage === 0 && (
        <div className="train-intro">
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-primary)' }}>model_training</span>
          <h3>Ready to Learn</h3>
          <p>The computer cannot truly "see". It shrinks each doodle into a centered pixel grid, then compares that pattern to the examples you saved.</p>
          <div className="doodle-train-class-grid">
            {classCounts.map((shape) => (
              <div key={shape.label} className="doodle-train-class-chip" style={{ '--doodle-color': shape.color } as React.CSSProperties}>
                <span className="material-symbols-rounded">{shape.icon}</span>
                <span>{shape.label}</span>
                <strong>{shape.count}</strong>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary train-start-btn"
            onClick={handleTrain}
            disabled={!canTrain || !isLoaderReady}
          >
            {!isLoaderReady ? 'Loading Core AI...' : 'Train the Machine'}
          </button>
          {!canTrain && <p className="train-warning">Draw at least {MIN_DOODLES_PER_CLASS} doodles for every shape family first. Four or more per class will usually feel more reliable.</p>}
        </div>
      )}

      {isTraining && (
        <div className="doodle-train-live">
          <div className="train-animation-container">
            <div className="train-spinner">
              <span className="material-symbols-rounded spinning">sync</span>
            </div>
            
            <div className="stage-list">
              <AnimatePresence>
                {stages.map((stage) => {
                  if (stage.id > trainingStage) return null;
                  const isActive = stage.id === trainingStage;
                  return (
                    <motion.div 
                      key={stage.id}
                      className={`stage-item ${isActive ? 'active' : 'completed'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="material-symbols-rounded stage-icon">
                        {isActive ? stage.icon : 'check_circle'}
                      </span>
                      <span className="stage-text">{stage.text}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="doodle-vision-panel">
            <div className="doodle-vision-header">
              <span className="material-symbols-rounded">visibility</span>
              <div>
                <h4>Machine View</h4>
                <p>A simplified pixel grid that reveals where the dark strokes live before deeper feature extraction.</p>
              </div>
            </div>

            {activeExample && activeSnapshot ? (
              <div className="doodle-vision-active">
                <div className="doodle-vision-preview-card">
                  <span className="doodle-vision-caption">Current doodle</span>
                  <img src={activeExample.dataUrl} alt={activeExample.label} />
                </div>
                <div className="doodle-vision-preview-card">
                  <span className="doodle-vision-caption">Pixel view</span>
                  <img src={activeSnapshot.pixelatedDataUrl} alt={`${activeExample.label} pixel view`} />
                </div>
                <div className="doodle-vision-metrics">
                  <div>
                    <span className="doodle-vision-metric-label">Detected class</span>
                    <strong style={{ color: DOODLE_CLASS_MAP[activeExample.label].color }}>{activeExample.label}</strong>
                  </div>
                  <div>
                    <span className="doodle-vision-metric-label">Ink coverage</span>
                    <strong>{Math.round(activeSnapshot.inkCoverage * 100)}%</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="doodle-vision-empty">
                The next example will appear here as the model converts it into a coarser pixel map.
              </div>
            )}
          </div>
        </div>
      )}

      {isTrained && !isTraining && (
        <motion.div 
          className="train-intro"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-safe)' }}>verified</span>
          <h3>Training Complete!</h3>
          <p>The computer mapped your drawing styles into a space where nearby doodles share similar edges, corners, and stroke placement.</p>
          
          <div className="train-stats-cards">
            <div className="train-stat-card">
              <span className="stat-num">{examples.length}</span>
              <span className="stat-lbl">Images Mapped</span>
            </div>
            <div className="train-stat-card">
              <span className="stat-num">{DOODLE_CLASSES.length}</span>
              <span className="stat-lbl">Shape Classes</span>
            </div>
          </div>

          <div className="doodle-train-class-grid">
            {classCounts.map((shape) => (
              <div key={shape.label} className="doodle-train-class-chip" style={{ '--doodle-color': shape.color } as React.CSSProperties}>
                <span className="material-symbols-rounded">{shape.icon}</span>
                <span>{shape.label}</span>
                <strong>{shape.count}</strong>
              </div>
            ))}
          </div>
          
          <div className="doodle-vision-panel doodle-vision-panel-complete">
            <div className="doodle-vision-header">
              <span className="material-symbols-rounded">grid_view</span>
              <div>
                <h4>What the model looked at</h4>
                <p>These pixelated views show the coarse stroke patterns that help the vision system tell one family apart from another.</p>
              </div>
            </div>

            <div className="doodle-vision-gallery">
              {examples.map((example) => {
                const snapshot = visionSnapshots[example.id];
                const shape = DOODLE_CLASS_MAP[example.label];

                return (
                  <div key={example.id} className="doodle-vision-gallery-card" style={{ '--doodle-color': shape.color } as React.CSSProperties}>
                    <div className="doodle-vision-gallery-header">
                      <span className="material-symbols-rounded">{shape.icon}</span>
                      <span>{example.label}</span>
                    </div>
                    <div className="doodle-vision-gallery-pair">
                      <img src={example.dataUrl} alt={example.label} />
                      {snapshot && <img src={snapshot.pixelatedDataUrl} alt={`${example.label} pixelated`} />}
                    </div>
                    {snapshot && (
                      <p className="doodle-vision-gallery-note">
                        Ink coverage: {Math.round(snapshot.inkCoverage * 100)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <button className="btn" onClick={handleTrain} style={{ marginTop: 'var(--space-4)' }}>
            <span className="material-symbols-rounded">refresh</span> Retrain Map
          </button>
        </motion.div>
      )}

    </div>
  );
}
