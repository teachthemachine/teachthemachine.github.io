import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TextActivityConfig } from '../config';
import './CollectStep.css';

export interface SortedMessage {
  id: string;
  text: string;
  label: string; 
}

interface CollectPanelProps {
  config: TextActivityConfig;
  sortedMessages: SortedMessage[];
  onSortedChange: (msgs: SortedMessage[]) => void;
}

export function CollectPanel({ config, sortedMessages, onSortedChange }: CollectPanelProps) {
  const [customText, setCustomText] = useState('');
  const [customPool, setCustomPool] = useState<string[]>([]);
  const [flashLeft, setFlashLeft] = useState(false);
  const [flashRight, setFlashRight] = useState(false);

  // All possible preset texts from config, shuffled once
  const allPresets = useMemo(() => {
    const list = Array.from(new Set([...config.classA.presetMessages, ...config.classB.presetMessages]));
    return list.sort(() => Math.random() - 0.5);
  }, [config]);

  const usedTexts = new Set(sortedMessages.map(m => m.text));
  const poolMessages = [...allPresets, ...customPool].filter(text => !usedTexts.has(text));
  const topCard = poolMessages[0]; // the "active" card in focus for hotkeys

  const msgsA = sortedMessages.filter(m => m.label === config.classA.id);
  const msgsB = sortedMessages.filter(m => m.label === config.classB.id);

  const handleSort = useCallback((text: string, label: string) => {
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    onSortedChange([...sortedMessages, { id, text, label }]);
  }, [sortedMessages, onSortedChange]);

  const handleRemove = useCallback((id: string) => {
    onSortedChange(sortedMessages.filter(m => m.id !== id));
  }, [sortedMessages, onSortedChange]);

  const handleCustomSubmit = () => {
    const trimmed = customText.trim();
    if (trimmed && !poolMessages.includes(trimmed) && !usedTexts.has(trimmed)) {
      setCustomPool([...customPool, trimmed]);
      setCustomText('');
    }
  };

  // Hotkeys: ← / A → classA,  → / D → classB,  Backspace → undo last sort
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && topCard) {
        e.preventDefault();
        setFlashLeft(true);
        setTimeout(() => setFlashLeft(false), 400);
        handleSort(topCard, config.classA.id);
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && topCard) {
        e.preventDefault();
        setFlashRight(true);
        setTimeout(() => setFlashRight(false), 400);
        handleSort(topCard, config.classB.id);
      } else if (e.key === 'Backspace' && sortedMessages.length > 0) {
        e.preventDefault();
        const last = sortedMessages[sortedMessages.length - 1];
        handleRemove(last.id);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [topCard, handleSort, handleRemove, sortedMessages, config]);

  return (
    <div className="collect-workspace-horizontal">
      {/* LEFT BUCKET */}
      <div className={`bucket-column ${flashLeft ? 'bucket-flash' : ''}`}>
        <div className="bucket-header" style={{ borderBottomColor: config.classA.colorVar }}>
          <span className="material-symbols-rounded" style={{ color: config.classA.colorVar }}>{config.classA.icon}</span>
          <h3>{config.classA.label}</h3>
          <div className="bucket-header-right">
            <kbd className="hotkey-badge">← A</kbd>
            <span className="bucket-count">{msgsA.length}</span>
          </div>
        </div>
        <div className="bucket-body">
          <AnimatePresence>
            {msgsA.map(msg => (
              <motion.div 
                key={msg.id} 
                className="sorted-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <div className="sorted-card-text">{msg.text}</div>
                <button className="remove-btn" onClick={() => handleRemove(msg.id)} title="Remove (Backspace)">
                  <span className="material-symbols-rounded">close</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {msgsA.length === 0 && <div className="empty-bucket">Drop {config.classA.label.toLowerCase()} examples here</div>}
        </div>
      </div>

      {/* CENTER POOL */}
      <div className="pool-column">
        <div className="pool-header">
          <span className="material-symbols-rounded">inbox</span>
          <h3>Unsorted Data</h3>
          <span className="bucket-count">{poolMessages.length}</span>
        </div>

        {/* Hotkey hint bar */}
        {poolMessages.length > 0 && (
          <div className="hotkey-hint-bar">
            <span><kbd>←</kbd><kbd>A</kbd> {config.classA.label}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Hotkeys enabled · <kbd>Backspace</kbd> undo</span>
            <span>{config.classB.label} <kbd>D</kbd><kbd>→</kbd></span>
          </div>
        )}

        <div className="pool-body">
          <AnimatePresence>
            {poolMessages.length > 0 ? poolMessages.map((text, idx) => (
              <motion.div 
                key={text} 
                className={`pool-card ${idx === 0 ? 'pool-card-top' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: flashLeft ? -120 : flashRight ? 120 : 0, scale: 0.8 }}
                layout
              >
                <button 
                  className="sort-btn left" 
                  style={{ color: config.classA.colorVar }}
                  onClick={() => handleSort(text, config.classA.id)}
                  title={`Sort as ${config.classA.label} (← or A)`}
                >
                  <span className="material-symbols-rounded">keyboard_arrow_left</span>
                </button>
                <div className="pool-card-text">
                  {idx === 0 && <div className="card-active-dot" />}
                  {text}
                </div>
                <button 
                  className="sort-btn right" 
                  style={{ color: config.classB.colorVar }}
                  onClick={() => handleSort(text, config.classB.id)}
                  title={`Sort as ${config.classB.label} (→ or D)`}
                >
                  <span className="material-symbols-rounded">keyboard_arrow_right</span>
                </button>
              </motion.div>
            )) : (
              <div className="empty-pool">
                <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-border)' }}>check_circle</span>
                <p>All data sorted!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Custom Input */}
        <div className="custom-input-row">
          <input
            className="custom-input"
            type="text"
            placeholder="Type your own example to add to the pool..."
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
          />
          <button
            className="btn btn-sm"
            onClick={handleCustomSubmit}
            disabled={!customText.trim()}
          >
            Add to Pool
          </button>
        </div>
      </div>

      {/* RIGHT BUCKET */}
      <div className={`bucket-column ${flashRight ? 'bucket-flash-right' : ''}`}>
        <div className="bucket-header" style={{ borderBottomColor: config.classB.colorVar }}>
          <div className="bucket-header-right">
            <kbd className="hotkey-badge">D →</kbd>
            <span className="bucket-count">{msgsB.length}</span>
          </div>
          <h3>{config.classB.label}</h3>
          <span className="material-symbols-rounded" style={{ color: config.classB.colorVar }}>{config.classB.icon}</span>
        </div>
        <div className="bucket-body">
          <AnimatePresence>
            {msgsB.map(msg => (
              <motion.div 
                key={msg.id} 
                className="sorted-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <button className="remove-btn" onClick={() => handleRemove(msg.id)} title="Remove (Backspace)">
                  <span className="material-symbols-rounded">close</span>
                </button>
                <div className="sorted-card-text">{msg.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {msgsB.length === 0 && <div className="empty-bucket">Drop {config.classB.label.toLowerCase()} examples here</div>}
        </div>
      </div>
    </div>
  );
}
