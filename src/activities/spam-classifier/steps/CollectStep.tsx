import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageCard } from '../../../components/MessageCard';
import { DropZone } from '../../../components/DropZone';
import { Button } from '../../../components/Button';
import { sampleMessages, bonusMessages } from '../data/sampleMessages';
import type { SampleMessage } from '../data/sampleMessages';
import './CollectStep.css';

export interface SortedMessage {
  id: string;
  text: string;
  category: 'safe' | 'suspicious';
}

interface CollectStepProps {
  sortedMessages: SortedMessage[];
  onSortedChange: (messages: SortedMessage[]) => void;
}

export function CollectStep({ sortedMessages, onSortedChange }: CollectStepProps) {
  const [showBonus, setShowBonus] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customCategory, setCustomCategory] = useState<'safe' | 'suspicious'>('safe');

  const allMessages = useMemo(() => {
    const base = [...sampleMessages];
    if (showBonus) base.push(...bonusMessages);
    return base;
  }, [showBonus]);

  const unsorted = useMemo(() => {
    const sortedIds = new Set(sortedMessages.map(m => m.id));
    return allMessages.filter(m => !sortedIds.has(m.id));
  }, [allMessages, sortedMessages]);

  const safeMessages = sortedMessages.filter(m => m.category === 'safe');
  const suspiciousMessages = sortedMessages.filter(m => m.category === 'suspicious');

  // Shuffle unsorted messages for display
  const shuffled = useMemo(() => {
    const arr = [...unsorted];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsorted.length]);

  const sortMessage = (msg: SampleMessage, category: 'safe' | 'suspicious') => {
    onSortedChange([...sortedMessages, { id: msg.id, text: msg.text, category }]);
  };

  const unsortMessage = (id: string) => {
    onSortedChange(sortedMessages.filter(m => m.id !== id));
  };

  const handleDrop = (category: 'safe' | 'suspicious') => (data: string) => {
    const msg = unsorted.find(m => m.id === data);
    if (msg) sortMessage(msg, category);
  };

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleAddCustom = () => {
    if (!customText.trim()) return;
    const id = `custom-${Date.now()}`;
    onSortedChange([...sortedMessages, { id, text: customText.trim(), category: customCategory }]);
    setCustomText('');
  };

  return (
    <div className="collect-step">
      <div className="collect-header">
        <h2>📥 Sort the Messages</h2>
        <p>
          Read each message and decide: is it a <strong style={{ color: 'var(--color-primary)' }}>real message</strong> or a <strong style={{ color: 'var(--color-danger)' }}>suspicious</strong> one? Drag or tap to sort.
        </p>
      </div>

      {/* Unsorted message pool */}
      {unsorted.length > 0 && (
        <div className="collect-pool">
          <div className="collect-pool-header">
            <div className="collect-pool-title">
              <span>📨</span>
              <span>Unsorted Messages ({unsorted.length})</span>
            </div>
            {!showBonus && (
              <Button variant="ghost" size="sm" onClick={() => setShowBonus(true)}>
                + More messages
              </Button>
            )}
          </div>
          <div className="collect-pool-grid">
            <AnimatePresence mode="popLayout">
              {shuffled.filter(m => unsorted.some(u => u.id === m.id)).map(msg => (
                <div key={msg.id}>
                  <MessageCard
                    text={msg.text}
                    draggable
                    onDragStart={handleDragStart(msg.id)}
                    layoutId={msg.id}
                  />
                  <div className="collect-tap-actions">
                    <button
                      className="collect-tap-btn safe"
                      onClick={() => sortMessage(msg, 'safe')}
                    >
                      ✅ Real
                    </button>
                    <button
                      className="collect-tap-btn suspicious"
                      onClick={() => sortMessage(msg, 'suspicious')}
                    >
                      🚫 Suspicious
                    </button>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Drop zones */}
      <div className="collect-zones">
        <DropZone
          variant="safe"
          title="Real Messages"
          icon="✅"
          count={safeMessages.length}
          onDrop={handleDrop('safe')}
        >
          <AnimatePresence>
            {safeMessages.map(msg => (
              <MessageCard
                key={msg.id}
                text={msg.text}
                category="safe"
                onRemove={() => unsortMessage(msg.id)}
                layoutId={msg.id}
              />
            ))}
          </AnimatePresence>
        </DropZone>

        <DropZone
          variant="suspicious"
          title="Suspicious Messages"
          icon="🚫"
          count={suspiciousMessages.length}
          onDrop={handleDrop('suspicious')}
        >
          <AnimatePresence>
            {suspiciousMessages.map(msg => (
              <MessageCard
                key={msg.id}
                text={msg.text}
                category="suspicious"
                onRemove={() => unsortMessage(msg.id)}
                layoutId={msg.id}
              />
            ))}
          </AnimatePresence>
        </DropZone>
      </div>

      {/* Add custom messages */}
      <div className="collect-add-form">
        <input
          className="collect-add-input"
          type="text"
          placeholder="Write your own message..."
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
        />
        <select
          className="collect-add-input"
          style={{ flex: '0 0 auto', width: 'auto' }}
          value={customCategory}
          onChange={e => setCustomCategory(e.target.value as 'safe' | 'suspicious')}
        >
          <option value="safe">✅ Real</option>
          <option value="suspicious">🚫 Suspicious</option>
        </select>
        <Button variant="accent" size="sm" onClick={handleAddCustom} disabled={!customText.trim()}>
          Add
        </Button>
      </div>

      {/* Stats */}
      <div className="collect-stats">
        <div className="collect-stat">
          <span className="collect-stat-value safe">{safeMessages.length}</span>
          <span className="collect-stat-label">Real</span>
        </div>
        <div className="collect-stat">
          <span className="collect-stat-value suspicious">{suspiciousMessages.length}</span>
          <span className="collect-stat-label">Suspicious</span>
        </div>
        <div className="collect-stat">
          <span className="collect-stat-value" style={{ color: 'var(--color-text-secondary)' }}>
            {sortedMessages.length}
          </span>
          <span className="collect-stat-label">Total</span>
        </div>
      </div>
    </div>
  );
}
