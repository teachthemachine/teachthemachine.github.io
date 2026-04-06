import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioKNNClassifier } from '../../../ml/AudioKNNClassifier';
import { AudioFeatureExtractor } from '../../../ml/AudioFeatureExtractor';
import './SoundTestStep.css';

interface Props {
  model: AudioKNNClassifier;
  isTrained: boolean;
  extractor: AudioFeatureExtractor;
}

const CATEGORIES = [
  { id: 'clap', label: 'Clap', icon: 'waving_hand', color: 'var(--color-primary)' },
  { id: 'whistle', label: 'Whistle', icon: 'music_note', color: 'var(--color-accent)' },
  { id: 'voice', label: 'Voice', icon: 'record_voice_over', color: 'var(--color-safe)' }
];

export function SoundTestStep({ model, isTrained, extractor }: Props) {
  const [prediction, setPrediction] = useState<{ label: string; confidence: number; distances: any[] } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let active = true;
    const checkMic = async () => {
      if (!extractor.isReady()) {
        const ok = await extractor.requestPermission();
        if (active && ok) setIsListening(true);
      } else {
        setIsListening(true);
      }
    };
    checkMic();
    return () => { active = false; };
  }, [extractor]);

  const handleTest = async () => {
    if (!isListening || !isTrained) return;
    setIsRecording(true);
    setPrediction(null);
    try {
      const features = await extractor.recordSample(1200);
      if (features) {
        const result = model.predict(features);
        setPrediction(result);
      }
    } finally {
      setIsRecording(false);
    }
  };

  const getCategory = (label: string) => CATEGORIES.find(c => c.label === label);
  const cat = prediction ? getCategory(prediction.label) : null;

  return (
    <div className="sound-test-step">
      {!isTrained && (
        <div className="untested-overlay">
          <p>Please train the model first before testing.</p>
        </div>
      )}

      <div className="test-interface">
        <h3>Test the Model</h3>
        <p className="test-desc">
          Click "Listen", then make a loud sound. The model will extract its numerical features 
          and find the closest matches in its memory using KNN.
        </p>

        <button 
          className={`btn btn-primary listen-btn ${isRecording ? 'pulse-listen' : ''}`}
          onClick={handleTest}
          disabled={!isListening || isRecording || !isTrained}
        >
          {isRecording ? (
            <><span className="material-symbols-rounded">graphic_eq</span> Listening...</>
          ) : (
             <><span className="material-symbols-rounded">hearing</span> Listen for Sound</>
          )}
        </button>

        <div className="prediction-area">
          <AnimatePresence mode="wait">
            {!prediction && !isRecording && (
              <motion.div 
                key="empty"
                className="prediction-empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Waiting for sound...
              </motion.div>
            )}
            
            {prediction && cat && (
              <motion.div 
                key="result"
                className="prediction-result"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ '--result-color': cat.color } as any}
              >
                <div className="result-main">
                  <span className="material-symbols-rounded result-icon">{cat.icon}</span>
                  <div className="result-text">
                    <div className="result-label">It sounds like: <strong>{cat.label}</strong></div>
                    <div className="result-conf">Confidence: {(prediction.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
                
                <div className="knn-explain">
                  <h4>Nearest Neighbors Found:</h4>
                  <ul>
                    {prediction.distances.slice(0, 3).map((d: any, i: number) => {
                      const dcat = getCategory(d.label);
                      return (
                        <li key={i}>
                          <span className="material-symbols-rounded" style={{color: dcat?.color, fontSize: '16px', marginRight: '4px', verticalAlign: 'middle'}}>{dcat?.icon}</span>
                          {d.label} <span className="dist-val">(distance: {d.distance.toFixed(2)})</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="knn-note">The model chose {cat.label} because the majority of its nearest neighbors belong to that group.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
