import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfidenceBar } from '../../../components/ConfidenceBar';
import { NaiveBayesAdapter } from '../../../ml/NaiveBayesAdapter';
import { testSuggestions } from '../data/sampleMessages';
import type { PredictionResult } from '../../../types/activity';
import './TestStep.css';

interface TestStepProps {
  model: NaiveBayesAdapter;
}

interface HistoryEntry {
  id: number;
  text: string;
  prediction: PredictionResult[];
}

export function TestStep({ model }: TestStepProps) {
  const [inputText, setInputText] = useState('');
  const [currentResult, setCurrentResult] = useState<{
    text: string;
    prediction: PredictionResult[];
  } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [nextId, setNextId] = useState(1);

  const handlePredict = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    const prediction = await model.predict(messageText.trim());
    const result = { text: messageText.trim(), prediction };
    setCurrentResult(result);
    setHistory(prev => [{ id: nextId, ...result }, ...prev]);
    setNextId(n => n + 1);
    setInputText('');
  };

  const topPrediction = currentResult?.prediction[0];
  const isSafe = topPrediction?.label === 'safe';

  return (
    <div className="test-step">
      <div className="test-header">
        <h2>🔮 Test Your Model</h2>
        <p>
          Type any message and see what your model thinks.
          Does it get it right? Try different types of messages!
        </p>
      </div>

      {/* Input */}
      <div className="test-input-area">
        <div className="test-input-wrapper">
          <input
            className="test-input"
            type="text"
            placeholder="Type a message to test..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePredict()}
            autoFocus
          />
          <button
            className="test-input-submit"
            onClick={() => handlePredict()}
            disabled={!inputText.trim()}
          >
            Test →
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="test-suggestions">
          <div className="test-suggestion-label">💡 Try these:</div>
          {testSuggestions.map((suggestion, i) => (
            <button
              key={i}
              className="test-suggestion"
              onClick={() => {
                setInputText(suggestion);
                handlePredict(suggestion);
              }}
            >
              {suggestion.length > 40 ? suggestion.slice(0, 37) + '...' : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Current result */}
      <AnimatePresence mode="wait">
        {currentResult && topPrediction && (
          <motion.div
            key={currentResult.text}
            className="test-result"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="test-result-verdict">
              <div className="test-result-icon">
                {isSafe ? '✅' : '🚫'}
              </div>
              <div
                className="test-result-label"
                style={{ color: isSafe ? 'var(--color-primary)' : 'var(--color-danger)' }}
              >
                {isSafe ? 'Looks Real!' : 'Suspicious!'}
              </div>
            </div>

            <div className="test-result-message">
              "{currentResult.text}"
            </div>

            <div className="test-bars">
              {currentResult.prediction.map(p => (
                <ConfidenceBar
                  key={p.label}
                  label={p.label === 'safe' ? '✅ Real' : '🚫 Suspicious'}
                  confidence={p.confidence}
                  variant={p.label === 'safe' ? 'safe' : 'suspicious'}
                  large
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 1 && (
        <div className="test-history">
          <div className="test-history-title">
            <span>📋</span>
            <span>Previous Tests ({history.length - 1})</span>
          </div>
          <div className="test-history-list">
            {history.slice(1, 8).map(entry => {
              const top = entry.prediction[0];
              return (
                <motion.div
                  key={entry.id}
                  className="test-history-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="test-history-item-text">{entry.text}</span>
                  <span className={`test-history-item-badge ${top.label}`}>
                    {top.label === 'safe' ? 'Real' : 'Sus'}
                  </span>
                  <span className="test-history-item-confidence">
                    {Math.round(top.confidence * 100)}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
