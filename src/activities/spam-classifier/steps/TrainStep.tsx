import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordCloud } from '../../../components/WordCloud';
import { NaiveBayesAdapter } from '../../../ml/NaiveBayesAdapter';
import type { ModelStats } from '../../../types/activity';
import type { SortedMessage } from './CollectStep';
import './TrainStep.css';

interface TrainStepProps {
  sortedMessages: SortedMessage[];
  model: NaiveBayesAdapter;
  onTrained: () => void;
}

export function TrainStep({ sortedMessages, model, onTrained }: TrainStepProps) {
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trained, setTrained] = useState(model.isTrained());
  const [stats, setStats] = useState<ModelStats | null>(
    model.isTrained() ? model.getStats() : null
  );

  const handleTrain = useCallback(async () => {
    setTraining(true);
    setProgress(0);

    // Simulate training progress for dramatic effect
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 100));
      setProgress((i / steps) * 100);
    }

    // Actually train the model
    const trainingData = sortedMessages.map(m => ({
      input: m.text,
      label: m.category === 'safe' ? 'safe' : 'suspicious',
    }));

    await model.train(trainingData);
    const newStats = model.getStats();

    setStats(newStats);
    setTraining(false);
    setTrained(true);
    onTrained();
  }, [sortedMessages, model, onTrained]);

  const safeCount = sortedMessages.filter(m => m.category === 'safe').length;
  const suspiciousCount = sortedMessages.filter(m => m.category === 'suspicious').length;
  const canTrain = safeCount >= 2 && suspiciousCount >= 2;

  return (
    <div className="train-step">
      <div className="train-header">
        <h2>🧠 Train Your Model</h2>
        <p>
          Your model will learn word patterns from the messages you sorted.
          It doesn't understand meaning — it just counts words!
        </p>
      </div>

      <div className="train-action">
        {!trained && !training && (
          <motion.div
            className="train-btn-wrapper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="train-btn-glow" />
            <button
              className="train-btn"
              onClick={handleTrain}
              disabled={!canTrain}
            >
              {canTrain
                ? `⚡ Train on ${sortedMessages.length} Messages`
                : `Need at least 2 of each type`}
            </button>
          </motion.div>
        )}

        {training && (
          <motion.div
            className="train-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="train-progress-bar">
              <div
                className="train-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="train-progress-text">
              {progress < 30
                ? '📖 Reading messages...'
                : progress < 60
                ? '🔍 Counting word patterns...'
                : progress < 90
                ? '📊 Calculating probabilities...'
                : '✨ Almost done...'}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {trained && stats && (
            <motion.div
              className="train-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Stats cards */}
              <div className="train-stats-grid">
                <motion.div
                  className="train-stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="train-stat-number gradient-text">
                    {stats.totalSamples}
                  </div>
                  <div className="train-stat-label">Examples Learned</div>
                </motion.div>
                <motion.div
                  className="train-stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="train-stat-number gradient-text">
                    {stats.featureCount}
                  </div>
                  <div className="train-stat-label">Unique Words</div>
                </motion.div>
                <motion.div
                  className="train-stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="train-stat-number gradient-text">
                    {Object.keys(stats.classCounts).length}
                  </div>
                  <div className="train-stat-label">Categories</div>
                </motion.div>
              </div>

              {/* Word clouds */}
              <div className="train-word-clouds">
                <div className="train-cloud-panel">
                  <h4 style={{ color: 'var(--color-primary)' }}>
                    ✅ Top "Real" Words
                  </h4>
                  <WordCloud
                    words={stats.topFeatures['safe'] || []}
                    variant="safe"
                  />
                </div>
                <div className="train-cloud-panel">
                  <h4 style={{ color: 'var(--color-danger)' }}>
                    🚫 Top "Suspicious" Words
                  </h4>
                  <WordCloud
                    words={stats.topFeatures['suspicious'] || []}
                    variant="suspicious"
                  />
                </div>
              </div>

              {/* Educational insight */}
              <div className="train-insight">
                <div className="train-insight-icon">💡</div>
                <p>
                  <strong>Notice the patterns!</strong> The model learned that words like
                  "FREE" and "CLICK" often appear in suspicious messages, while casual words
                  like "lunch" and "homework" appear in real ones. It's just counting — not understanding!
                </p>
              </div>

              {/* Retrain button */}
              <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                <button
                  className="train-btn"
                  onClick={handleTrain}
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-3) var(--space-6)' }}
                >
                  🔄 Retrain
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
