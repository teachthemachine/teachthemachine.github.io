import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DoodleModelAdapter } from './ml/DoodleModelAdapter';
import { DoodleCollectStep } from './steps/DoodleCollectStep';
import { DoodleTrainStep } from './steps/DoodleTrainStep';
import { DoodleTestStep } from './steps/DoodleTestStep';
import { PipelineLayout } from '../../components/PipelineLayout/PipelineLayout';
import { MissionIntro } from '../../components/MissionIntro/MissionIntro';
import type { DoodleExample } from './steps/DoodleCollectStep';

const STEPS = ['Gather Data', 'Train Model', 'Test & Trick'];

const DOODLE_MISSION_DATA = {
  missionNumber: 3,
  title: 'Doodle Sort',
  tagline: 'Can you teach a computer to see the difference between shapes?',
  goalStatement: 'You will draw circles and triangles by hand, then train the machine to tell them apart by looking at pixel patterns — just like computer vision.',
  whyItMatters: 'Computer vision powers self-driving cars, medical imaging, face recognition, and more. Every visual AI starts with the same question: what patterns separate one thing from another?',
  modelName: 'K-Nearest Neighbors (KNN) + MobileNet',
  modelAnalogy: 'MobileNet acts like a pair of X-ray glasses — it turns your doodle into a long list of invisible numbers. Then KNN asks: "which of my saved examples does this number-list look most similar to?"',
  modelIcon: 'visibility',
  steps: STEPS,
};

interface Props {
  onNextMission?: () => void;
}

export function DoodleSortActivity({ onNextMission }: Props) {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [examples, setExamples] = useState<DoodleExample[]>([]);
  const [isTrained, setIsTrained] = useState(false);
  const modelRef = useRef(new DoodleModelAdapter());

  const handleAddExample = useCallback((example: DoodleExample) => {
    setExamples(prev => [...prev, example]);
    if (isTrained) setIsTrained(false);
  }, [isTrained]);

  const handleClearExamples = useCallback((label: string) => {
    setExamples(prev => prev.filter(e => e.label !== label));
    if (isTrained) setIsTrained(false);
  }, [isTrained]);

  const handleTrained = useCallback(() => setIsTrained(true), []);

  const countA = examples.filter(e => e.label === 'Circle').length;
  const countB = examples.filter(e => e.label === 'Triangle').length;
  const canProceed = currentStep === 0
    ? countA >= 2 && countB >= 2
    : currentStep === 1 ? isTrained : true;

  if (!started) {
    return (
      <AnimatePresence>
        <motion.div style={{ height: '100%', overflow: 'auto' }}>
          <MissionIntro data={DOODLE_MISSION_DATA} onStart={() => setStarted(true)} />
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
          <DoodleCollectStep
            examples={examples}
            onAddExample={handleAddExample}
            onClearExamples={handleClearExamples}
          />
        </div>
      )}
      {currentStep === 1 && (
        <div className="activity-panel" style={{ height: '100%', justifyContent: 'center' }}>
          <div className="panel" style={{ flex: 'none', padding: 'var(--space-6)' }}>
            <DoodleTrainStep
              examples={examples}
              model={modelRef.current}
              onTrained={handleTrained}
              isTrained={isTrained}
            />
          </div>
        </div>
      )}
      {currentStep === 2 && (
        <div className="activity-panel" style={{ height: '100%' }}>
          <DoodleTestStep model={modelRef.current} isTrained={isTrained} />
        </div>
      )}
    </PipelineLayout>
  );
}
