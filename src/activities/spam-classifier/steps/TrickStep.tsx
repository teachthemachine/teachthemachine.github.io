import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfidenceBar } from '../../../components/ConfidenceBar';
import { Button } from '../../../components/Button';
import { NaiveBayesAdapter } from '../../../ml/NaiveBayesAdapter';
import type { PredictionResult } from '../../../types/activity';
import './TrickStep.css';

interface TrickStepProps {
  model: NaiveBayesAdapter;
}

interface Attempt {
  id: number;
  text: string;
  intendedCategory: 'safe' | 'suspicious';
  prediction: PredictionResult[];
  tricked: boolean;
}

export function TrickStep({ model }: TrickStepProps) {
  const [inputText, setInputText] = useState('');
  const [intendedCategory, setIntendedCategory] = useState<'safe' | 'suspicious'>('suspicious');
  const [lastResult, setLastResult] = useState<Attempt | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [nextId, setNextId] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  const trickedCount = attempts.filter(a => a.tricked).length;
  const totalCount = attempts.length;

  const handleTrick = async () => {
    if (!inputText.trim()) return;

    const prediction = await model.predict(inputText.trim());
    const topLabel = prediction[0]?.label;

    // The student "tricked" the model if the model's prediction doesn't match the student's intent
    const tricked = topLabel !== intendedCategory;

    const attempt: Attempt = {
      id: nextId,
      text: inputText.trim(),
      intendedCategory,
      prediction,
      tricked,
    };

    if (tricked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setLastResult(attempt);
    setAttempts(prev => [attempt, ...prev]);
    setNextId(n => n + 1);
    setInputText('');
  };

  return (
    <div className="trick-step">
      <div className="trick-header">
        <h2>🎯 Trick the Model!</h2>
        <p>
          Write a message that you think will fool the AI.
          Can you make it predict the wrong category?
        </p>
      </div>

      {/* Score */}
      <div className="trick-score">
        <div className="trick-score-item">
          <div className="trick-score-value" style={{ color: 'var(--color-primary)' }}>
            {trickedCount}
          </div>
          <div className="trick-score-label">Tricked 🎉</div>
        </div>
        <div className="trick-score-divider" />
        <div className="trick-score-item">
          <div className="trick-score-value" style={{ color: 'var(--color-text-secondary)' }}>
            {totalCount}
          </div>
          <div className="trick-score-label">Attempts</div>
        </div>
        <div className="trick-score-divider" />
        <div className="trick-score-item">
          <div className="trick-score-value" style={{ color: 'var(--color-danger)' }}>
            {totalCount - trickedCount}
          </div>
          <div className="trick-score-label">Caught 🔒</div>
        </div>
      </div>

      {/* Challenge prompt */}
      <div className="trick-input-area">
        <div className="trick-challenge">
          <div className="trick-challenge-text">
            🎮 Challenge: Write a {intendedCategory === 'suspicious' ? 'suspicious' : 'real'} message that the model will misclassify!
          </div>
        </div>

        <div className="trick-input-row">
          <input
            className="trick-input"
            type="text"
            placeholder={
              intendedCategory === 'suspicious'
                ? 'Write a sneaky spam message...'
                : 'Write a safe message that looks suspicious...'
            }
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrick()}
            autoFocus
          />
          <select
            className="trick-intent-select"
            value={intendedCategory}
            onChange={e => setIntendedCategory(e.target.value as 'safe' | 'suspicious')}
          >
            <option value="suspicious">This IS suspicious</option>
            <option value="safe">This IS real</option>
          </select>
        </div>

        <button
          className="trick-submit-btn"
          onClick={handleTrick}
          disabled={!inputText.trim()}
        >
          ⚡ Try to Trick the AI!
        </button>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="trick-confetti">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: '4rem' }}
          >
            🎉🎊✨
          </motion.div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence mode="wait">
        {lastResult && (
          <motion.div
            key={lastResult.id}
            className={`trick-result ${lastResult.tricked ? 'tricked' : 'caught'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="trick-result-icon">
              {lastResult.tricked ? '🎉' : '🔒'}
            </div>
            <div className="trick-result-title" style={{
              color: lastResult.tricked ? 'var(--color-primary)' : 'var(--color-danger)'
            }}>
              {lastResult.tricked ? 'You Tricked the AI!' : 'The Model Caught You!'}
            </div>
            <div className="trick-result-description">
              {lastResult.tricked
                ? "Nice one! The model couldn't figure this out. It probably doesn't have the right word patterns to catch this."
                : "The model recognized the patterns in your message. Try using different words or avoiding obvious spam signals!"
              }
            </div>

            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              {lastResult.prediction.map(p => (
                <div key={p.label} style={{ marginBottom: 'var(--space-3)' }}>
                  <ConfidenceBar
                    label={p.label === 'safe' ? '✅ Real' : '🚫 Suspicious'}
                    confidence={p.confidence}
                    variant={p.label === 'safe' ? 'safe' : 'suspicious'}
                  />
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={() => setLastResult(null)}
              style={{ marginTop: 'var(--space-3)' }}
            >
              Try Again →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempt history */}
      {attempts.length > 1 && (
        <div className="trick-attempts">
          <div className="trick-attempts-title">Past Attempts</div>
          {attempts.slice(1, 10).map(attempt => (
            <motion.div
              key={attempt.id}
              className="trick-attempt"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span style={{ fontSize: 'var(--text-base)' }}>
                {attempt.tricked ? '🎉' : '🔒'}
              </span>
              <span className="trick-attempt-text">{attempt.text}</span>
              <span className={`trick-attempt-result ${attempt.tricked ? 'tricked' : 'caught'}`}>
                {attempt.tricked ? 'TRICKED' : 'CAUGHT'}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Educational lesson */}
      {attempts.length >= 3 && (
        <motion.div
          className="trick-lesson"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4>🧠 What Did You Learn?</h4>
          <ul>
            <li>ML models don't "understand" language — they recognize <strong>word patterns</strong></li>
            <li>Words like FREE, CLICK, WIN, and !!! are strong "suspicious" signals</li>
            <li>The model is only as smart as the <strong>data you gave it</strong></li>
            <li>If you write something it's never seen before, it might get confused</li>
            <li>This is why ML needs <strong>lots of diverse examples</strong> to work well</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
