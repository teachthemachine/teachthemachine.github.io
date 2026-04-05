import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NaiveBayesAdapter } from '../../../ml/NaiveBayesAdapter';
import type { SortedMessage } from './CollectStep';
import type { TextActivityConfig } from '../config';
import './TrainStep.css';

interface TrainPanelProps {
  config: TextActivityConfig;
  sortedMessages: SortedMessage[];
  model: NaiveBayesAdapter;
  onTrained: () => void;
  isTrained: boolean;
}

/** Resolve which class label a word most strongly belongs to */
function getWordBias(word: string, topFeatures: Record<string, { word: string; score: number }[]>): string | null {
  let bestClass = null;
  let bestScore = 1.0; // only consider scores meaningfully above 1 (= neutral)
  for (const [cls, feats] of Object.entries(topFeatures)) {
    const feat = feats.find(f => f.word === word);
    if (feat && feat.score > bestScore) {
      bestScore = feat.score;
      bestClass = cls;
    }
  }
  return bestClass;
}

export function TrainPanel({ config, sortedMessages, model, onTrained, isTrained }: TrainPanelProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStage, setTrainingStage] = useState(0);
  const [richStats, setRichStats] = useState<{
    examples: number;
    words: number;
    topFeatures: Record<string, { word: string; score: number }[]>;
    samplePreviews: { text: string; label: string; tokens: string[] }[];
  } | null>(null);

  const countA = sortedMessages.filter(m => m.label === config.classA.id).length;
  const countB = sortedMessages.filter(m => m.label === config.classB.id).length;
  const canTrain = countA >= 2 && countB >= 2;

  const handleTrain = useCallback(async () => {
    if (!canTrain) return;
    setIsTraining(true);

    setTrainingStage(1);
    await new Promise(r => setTimeout(r, 1400));
    setTrainingStage(2);
    await new Promise(r => setTimeout(r, 1600));
    setTrainingStage(3);
    await new Promise(r => setTimeout(r, 1600));
    setTrainingStage(4);
    await new Promise(r => setTimeout(r, 1400));

    const samples = sortedMessages.map(m => ({
      text: m.text,
      label: m.label === config.classA.id ? config.classA.label : config.classB.label,
    }));
    model.train(samples);

    const modelStats = model.getStats();

    // Pick 1 example per class for the word-level preview
    const samplePreviews = [
      sortedMessages.find(m => m.label === config.classA.id),
      sortedMessages.find(m => m.label === config.classB.id),
    ]
      .filter(Boolean)
      .map(m => ({
        text: m!.text,
        label: m!.label === config.classA.id ? config.classA.label : config.classB.label,
        tokens: model.tokenize(m!.text),
      }));

    setRichStats({
      examples: modelStats.totalSamples,
      words: modelStats.featureCount,
      topFeatures: modelStats.topFeatures as Record<string, { word: string; score: number }[]>,
      samplePreviews,
    });

    setIsTraining(false);
    setTrainingStage(5);
    onTrained();
  }, [canTrain, sortedMessages, model, onTrained, config]);

  const stages = [
    { id: 1, text: `Reading your ${sortedMessages.length} labelled examples...`, icon: 'menu_book' },
    { id: 2, text: 'Chopping messages into individual words (tokens)...', icon: 'content_cut' },
    { id: 3, text: `Counting how often each word appears in "${config.classA.label}" vs "${config.classB.label}"...`, icon: 'calculate' },
    { id: 4, text: 'Calculating final probability weights with Bayes\' theorem...', icon: 'functions' },
  ];

  // Map class label → config class object for colours
  const classMap: Record<string, { colorVar: string; label: string; icon: string }> = {
    [config.classA.label]: config.classA,
    [config.classB.label]: config.classB,
  };

  return (
    <div className="train-panel-animated">

      {/* ── PRE-TRAINING ── */}
      {!isTraining && trainingStage === 0 && (
        <div className="train-intro">
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-primary)' }}>model_training</span>
          <h3>Ready to Learn</h3>
          <p>The computer cannot read English. It will use math to find patterns in your examples.</p>
          <button className="btn btn-primary train-start-btn" onClick={handleTrain} disabled={!canTrain}>
            Train the Machine
          </button>
          {!canTrain && <p className="train-warning">Gather at least 2 examples for each category first.</p>}
        </div>
      )}

      {/* ── TRAINING ANIMATION ── */}
      {isTraining && (
        <div className="train-animation-container">
          <div className="train-spinner">
            <span className="material-symbols-rounded spinning">sync</span>
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

      {/* ── TRAINING COMPLETE (rich view) ── */}
      {isTrained && !isTraining && richStats && (
        <motion.div
          className="train-complete"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
        >
          {/* Header */}
          <div className="tc-header">
            <span className="material-symbols-rounded" style={{ fontSize: '36px', color: 'var(--color-safe)' }}>verified</span>
            <div>
              <h3 className="tc-title">Training Complete</h3>
              <p className="tc-subtitle">
                The model read <strong>{richStats.examples}</strong> messages and learned <strong>{richStats.words}</strong> unique words.
                Here's what it now knows.
              </p>
            </div>
          </div>

          {/* Section 1: Signature words per class */}
          <div className="tc-section">
            <h4 className="tc-section-heading">
              <span className="material-symbols-rounded">key</span>
              Signature Words — what the model considers most revealing
            </h4>
            <div className="tc-classes-row">
              {[config.classA, config.classB].map(cls => {
                const topWords = richStats.topFeatures[cls.label] ?? [];
                return (
                  <div className="tc-class-block" key={cls.id}>
                    <div className="tc-class-label" style={{ color: cls.colorVar }}>
                      <span className="material-symbols-rounded">{cls.icon}</span>
                      {cls.label}
                    </div>
                    <div className="tc-word-chips">
                      {topWords.slice(0, 7).map((f, idx) => (
                        <motion.span
                          key={f.word}
                          className="tc-word-chip"
                          style={{ '--chip-color': cls.colorVar } as React.CSSProperties}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.06 }}
                        >
                          {f.word}
                          <span className="chip-score">{f.score.toFixed(1)}×</span>
                        </motion.span>
                      ))}
                      {topWords.length === 0 && (
                        <span className="tc-empty">Not enough data yet.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="tc-note">
              The number after each word (e.g. <em>2.4×</em>) means the model found that word is 2.4× more common in that category than the other — so it's a strong clue.
            </p>
          </div>

          {/* Section 2: Word-level sentence preview */}
          <div className="tc-section">
            <h4 className="tc-section-heading">
              <span className="material-symbols-rounded">find_in_page</span>
              How the model reads your examples — word by word
            </h4>
            <div className="tc-previews">
              {richStats.samplePreviews.map((preview, pi) => {
                const cls = classMap[preview.label];
                // Split original text preserving spacing so we can highlight tokens
                const words = preview.text.split(/\s+/);
                return (
                  <div className="tc-preview-card" key={pi} style={{ borderLeftColor: cls?.colorVar }}>
                    <div className="tc-preview-badge" style={{ background: cls?.colorVar }}>
                      <span className="material-symbols-rounded">{cls?.icon}</span>
                      {preview.label}
                    </div>
                    <div className="tc-preview-sentence">
                      {words.map((word, wi) => {
                        const clean = word.toLowerCase().replace(/[^a-z0-9!?$%]/g, '');
                        const bias = getWordBias(clean, richStats.topFeatures);
                        const biasCls = bias ? classMap[bias] : null;
                        const isHighlighted = bias !== null;
                        return (
                          <span
                            key={wi}
                            className={`tc-word ${isHighlighted ? 'tc-word-highlighted' : 'tc-word-neutral'}`}
                            style={isHighlighted ? {
                              background: `color-mix(in srgb, ${biasCls?.colorVar} 18%, transparent)`,
                              borderColor: biasCls?.colorVar,
                              color: biasCls?.colorVar,
                            } : {}}
                            title={isHighlighted ? `Strong clue for "${bias}"` : 'Common / neutral word'}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                    <p className="tc-preview-caption">
                      Highlighted words are <strong>strong clues</strong>. Grey words are neutral or ignored.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Retrain */}
          <button className="btn" onClick={handleTrain} style={{ alignSelf: 'center', borderRadius: 'var(--radius-full)' }}>
            <span className="material-symbols-rounded">refresh</span> Retrain with new data
          </button>
        </motion.div>
      )}

    </div>
  );
}
