import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AudioSample } from '../../../ml/AudioFeatureExtractor';
import { AudioKNNClassifier } from '../../../ml/AudioKNNClassifier';
import './SoundTrainStep.css';

interface Props {
  samples: AudioSample[];
  model: AudioKNNClassifier;
  onTrained: () => void;
  isTrained: boolean;
}

export function SoundTrainStep({ samples, model, onTrained, isTrained }: Props) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStage, setTrainingStage] = useState(0);
  const [featImportance, setFeatImportance] = useState<{feature: string, variance: number}[]>([]);

  const canTrain = samples.length >= 6; // Assume overall at least 6 total, ideally 2 per class

  const handleTrain = useCallback(async () => {
    if (!canTrain) return;
    setIsTraining(true);

    setTrainingStage(1);
    await new Promise(r => setTimeout(r, 1200));
    setTrainingStage(2);
    await new Promise(r => setTimeout(r, 1500));
    setTrainingStage(3);
    await new Promise(r => setTimeout(r, 1200));

    model.train(samples);
    setFeatImportance(model.getFeatureImportance());

    setIsTraining(false);
    setTrainingStage(4);
    onTrained();
  }, [canTrain, samples, model, onTrained]);

  const stages = [
    { id: 1, text: `Analyzing ${samples.length} audio clips...`, icon: 'graphic_eq' },
    { id: 2, text: 'Extracting features: Volume, Pitch, Brightness...', icon: 'memory' },
    { id: 3, text: 'Plotting sounds in 4D mathematical space...', icon: 'scatter_plot' },
  ];

  return (
    <div className="sound-train-panel">
      {!isTraining && trainingStage === 0 && (
        <div className="train-intro">
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-primary)' }}>hearing</span>
          <h3>Train the Machine</h3>
          <p>The computer can't "hear" the way we do. It extracts numbers (like volume and pitch) from your audio and uses them to plot the sounds in space.</p>
          <button className="btn btn-primary train-start-btn" onClick={handleTrain} disabled={!canTrain}>
            Start Training
          </button>
          {!canTrain && <p className="train-warning">Record more examples to continue.</p>}
        </div>
      )}

      {isTraining && (
        <div className="train-animation-container">
          <div className="train-spinner">
            <span className="material-symbols-rounded spinning">graphic_eq</span>
          </div>
          <div className="stage-list">
            <AnimatePresence>
              {stages.map(stage => {
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
          className="train-complete"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="tc-header">
            <span className="material-symbols-rounded" style={{ fontSize: '36px', color: 'var(--color-safe)' }}>verified</span>
            <div>
              <h3 className="tc-title">Model Trained!</h3>
              <p className="tc-subtitle">
                The machine learned to separate your sounds using 4 mathematical features. 
                Here's what it found most useful for telling them apart:
              </p>
            </div>
          </div>

          <div className="tc-feature-importance">
            {featImportance.map((f, i) => {
              const maxVar = featImportance[0].variance;
              const pct = maxVar > 0 ? (f.variance / maxVar) * 100 : 0;
              return (
                <div key={i} className="importance-row">
                  <div className="importance-label">{f.feature}</div>
                  <div className="importance-bar-bg">
                    <motion.div 
                      className="importance-bar-fill" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${pct}%` }} 
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="tc-note">
            The longer the blue bar, the more that feature varied between your sounds, making it a stronger clue.
          </p>

          <button className="btn" onClick={handleTrain} style={{ alignSelf: 'center', borderRadius: 'var(--radius-full)' }}>
            <span className="material-symbols-rounded">refresh</span> Retrain Model
          </button>
        </motion.div>
      )}
    </div>
  );
}
