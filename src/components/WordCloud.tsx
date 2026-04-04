import { motion } from 'framer-motion';
import './WordCloud.css';

interface WordCloudProps {
  words: { word: string; score: number }[];
  variant: 'safe' | 'suspicious';
  label?: string;
}

function getSize(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio > 0.8) return 'size-5';
  if (ratio > 0.6) return 'size-4';
  if (ratio > 0.4) return 'size-3';
  if (ratio > 0.2) return 'size-2';
  return 'size-1';
}

export function WordCloud({ words, variant, label }: WordCloudProps) {
  if (words.length === 0) return null;
  const maxScore = Math.max(...words.map(w => w.score));

  return (
    <div className="word-cloud">
      {label && <div className="word-cloud-header">{label}</div>}
      {words.map((w, i) => (
        <motion.span
          key={w.word}
          className={`word-cloud-item ${variant} ${getSize(w.score, maxScore)}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          title={`Score: ${w.score.toFixed(2)}`}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
}
