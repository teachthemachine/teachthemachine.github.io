import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PipelineLayout } from '../../components/PipelineLayout/PipelineLayout';
import { MissionIntro } from '../../components/MissionIntro/MissionIntro';
import { SoundGatherStep } from './steps/SoundGatherStep';
import { SoundTrainStep } from './steps/SoundTrainStep';
import { SoundTestStep } from './steps/SoundTestStep';
import { AudioFeatureExtractor, type AudioSample } from '../../ml/AudioFeatureExtractor';
import { AudioKNNClassifier } from '../../ml/AudioKNNClassifier';
import './SoundSorterActivity.css';

const STEPS = ['Gather Sounds', 'Train AI Hearing', 'Test & Trick'];

const SOUND_MISSION_DATA = {
  missionNumber: 6,
  title: 'Sound Sorter',
  tagline: 'Teach the machine to tell the difference between a clap, a whistle, and your voice.',
  goalStatement: 'You will record sounds, and the computer will learn to separate them mathematically using volume, pitch, and tone.',
  whyItMatters: 'Audio classification is everywhere — from Siri recognizing your voice, to apps like Shazam identifying songs, to algorithms that listen for manufacturing defects in factories.',
  modelName: 'K-Nearest Neighbors (KNN)',
  modelAnalogy: 'The computer turns a sound wave into a list of 4 numbers. When it hears a new sound, it compares its numbers to all the ones you recorded, and votes based on its closest matches.',
  modelIcon: 'equalizer',
  steps: STEPS,
};

interface Props {
  onNextMission?: () => void;
}

export function SoundSorterActivity({ onNextMission }: Props) {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [samples, setSamples] = useState<AudioSample[]>([]);
  const [isTrained, setIsTrained] = useState(false);
  
  // Singleton refs for the duration of the activity
  const extractorRef = useRef<AudioFeatureExtractor>(new AudioFeatureExtractor());
  const modelRef = useRef<AudioKNNClassifier>(new AudioKNNClassifier(3));

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      // Need a stable ref variable for cleanup
      const ex = extractorRef.current;
      ex.dispose();
    };
  }, []);

  const handleAddSample = (sample: AudioSample) => {
    setSamples(prev => [...prev, sample]);
    setIsTrained(false);
  };

  const handleClearSamples = (label: string) => {
    setSamples(prev => prev.filter(s => s.label !== label));
    setIsTrained(false);
  };

  const handleTrained = () => setIsTrained(true);

  // Allow proceed if at least 2 categories have at least 2 samples each
  const counts = { clap: 0, whistle: 0, voice: 0 };
  samples.forEach(s => {
    if (s.label === 'Clap') counts.clap++;
    if (s.label === 'Whistle') counts.whistle++;
    if (s.label === 'Voice') counts.voice++;
  });
  const validCatCount = Object.values(counts).filter(c => c >= 2).length;
  
  const canProceed = currentStep === 0
    ? validCatCount >= 2
    : currentStep === 1 
      ? isTrained 
      : true;

  if (!started) {
    return (
      <AnimatePresence>
        <motion.div style={{ height: '100%', overflow: 'auto' }}>
          <MissionIntro data={SOUND_MISSION_DATA} onStart={() => setStarted(true)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <PipelineLayout
      currentStep={currentStep}
      steps={STEPS}
      onStepChange={setCurrentStep}
      canProceed={canProceed}
      onNextMission={onNextMission}
    >
      {currentStep === 0 && (
        <div className="activity-panel" style={{ height: '100%' }}>
          <SoundGatherStep
            samples={samples}
            onAddSample={handleAddSample}
            onClearSamples={handleClearSamples}
            extractor={extractorRef.current}
          />
        </div>
      )}
      {currentStep === 1 && (
        <div className="activity-panel" style={{ height: '100%', justifyContent: 'center' }}>
          <div className="panel" style={{ flex: 'none', padding: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
            <SoundTrainStep
              samples={samples}
              model={modelRef.current}
              onTrained={handleTrained}
              isTrained={isTrained}
            />
          </div>
        </div>
      )}
      {currentStep === 2 && (
        <div className="activity-panel" style={{ height: '100%' }}>
          <SoundTestStep
            model={modelRef.current}
            isTrained={isTrained}
            extractor={extractorRef.current}
          />
        </div>
      )}
    </PipelineLayout>
  );
}
