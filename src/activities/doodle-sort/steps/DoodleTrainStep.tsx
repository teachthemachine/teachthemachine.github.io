import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DoodleModelAdapter } from '../ml/DoodleModelAdapter';
import type { DoodleExample } from './DoodleCollectStep';
import '../../text-classifier/steps/TrainStep.css'; // Re-use animated styles

interface DoodleTrainProps {
  model: DoodleModelAdapter;
  examples: DoodleExample[];
  isTrained: boolean;
  onTrained: () => void;
}

export function DoodleTrainStep({ model, examples, isTrained, onTrained }: DoodleTrainProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStage, setTrainingStage] = useState(0);

  const countA = examples.filter(e => e.label === 'Circle').length;
  const countB = examples.filter(e => e.label === 'Triangle').length;
  const canTrain = countA >= 2 && countB >= 2;

  const [isLoaderReady, setIsLoaderReady] = useState(model.isReady);

  useEffect(() => {
    if (model.isReady) {
      setIsLoaderReady(true);
      return;
    }
    model.load().then(() => {
      setIsLoaderReady(true);
    }).catch(console.error);
  }, [model]);

  const handleTrain = useCallback(async () => {
    if (!canTrain || !isLoaderReady) return;
    setIsTraining(true);
    
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
      model.addExample(canvas, ex.label);
      await new Promise(r => setTimeout(r, 50)); // Yield to renderer
    }

    // Stage 3: Plotting features
    setTrainingStage(3);
    await new Promise(r => setTimeout(r, 1800));

    // Stage 4: Distance calculation
    setTrainingStage(4);
    await new Promise(r => setTimeout(r, 1500));

    setIsTraining(false);
    setTrainingStage(5);
    onTrained();
  }, [canTrain, examples, model, onTrained, isLoaderReady]);

  const stages = [
    { id: 1, text: `Feeding ${examples.length} doodles into computer vision filters...`, icon: 'image_search' },
    { id: 2, text: "Extracting basic edges, corners, and contours...", icon: 'polyline' },
    { id: 3, text: "Plotting invisible feature dots on a multi-dimensional map...", icon: 'scatter_plot' },
    { id: 4, text: "Calculating geometric boundaries between shapes...", icon: 'architecture' }
  ];

  return (
    <div className="train-panel-animated">
      
      {!isTraining && trainingStage === 0 && (
        <div className="train-intro">
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-primary)' }}>model_training</span>
          <h3>Ready to Learn</h3>
          <p>The computer cannot truly "see". It uses filters to convert your pictures into numbers.</p>
          <button
            className="btn btn-primary train-start-btn"
            onClick={handleTrain}
            disabled={!canTrain || !isLoaderReady}
          >
            {!isLoaderReady ? 'Loading Core AI...' : 'Train the Machine'}
          </button>
          {!canTrain && <p className="train-warning">Draw at least 2 shapes for each category first.</p>}
        </div>
      )}

      {isTraining && (
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
      )}

      {isTrained && !isTraining && (
        <motion.div 
          className="train-intro"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-safe)' }}>verified</span>
          <h3>Training Complete!</h3>
          <p>The computer mapped your unique drawing patterns onto its geometric grid.</p>
          
          <div className="train-stats-cards">
            <div className="train-stat-card">
              <span className="stat-num">{examples.length}</span>
              <span className="stat-lbl">Images Mapped</span>
            </div>
            <div className="train-stat-card">
              <span className="stat-num">K-NN</span>
              <span className="stat-lbl">Math Boundary</span>
            </div>
          </div>
          
          <div className="tc-mapped-gallery" style={{ marginTop: 'var(--space-4)', width: '100%' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              What the model saw:
            </h4>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {examples.map(ex => (
                <div key={ex.id} style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: `2px solid ${ex.label === 'Circle' ? 'var(--color-primary)' : 'var(--color-warning)'}`,
                  background: 'white',
                  overflow: 'hidden'
                 }}>
                  <img src={ex.dataUrl} alt={ex.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
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
