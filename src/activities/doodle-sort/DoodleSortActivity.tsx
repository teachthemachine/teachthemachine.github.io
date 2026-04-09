import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DoodleModelAdapter } from './ml/DoodleModelAdapter';
import { DoodleCollectStep } from './steps/DoodleCollectStep';
import { DoodleTrainStep } from './steps/DoodleTrainStep';
import { DoodleTestStep } from './steps/DoodleTestStep';
import { PipelineLayout } from '../../components/PipelineLayout/PipelineLayout';
import { MissionIntro } from '../../components/MissionIntro/MissionIntro';
import type { DoodleExample } from './steps/DoodleCollectStep';
import { DOODLE_CLASSES, MIN_DOODLES_PER_CLASS, type DoodleLabel } from './config';

const STEPS = ['Gather Data', 'Train Model', 'Test & Trick'];

const DOODLE_MISSION_DATA = {
  missionNumber: 3,
  title: 'Doodle Sort',
  tagline: 'Can you teach a computer to sort four doodle families by sight?',
  goalStatement: 'You will sketch circles, squares, triangles, and stars, then teach the machine to separate them by their pixel patterns and visual features.',
  whyItMatters: 'Computer vision powers self-driving cars, medical imaging, face recognition, and more. Every visual AI starts by learning which visual patterns make one object belong to a different class than another.',
  modelName: 'K-Nearest Neighbors (KNN) on a Pixel Grid',
  modelAnalogy: 'The computer shrinks each doodle into a simple centered grid of dark and light pixels. Then KNN asks: "which saved examples have the most similar pixel pattern to this new doodle?"',
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

  const handleClearExamples = useCallback((label: DoodleLabel) => {
    setExamples(prev => prev.filter(e => e.label !== label));
    if (isTrained) setIsTrained(false);
  }, [isTrained]);

  const handleTrained = useCallback(() => setIsTrained(true), []);

  const canGatherProceed = DOODLE_CLASSES.every(
    ({ label }) => examples.filter((example) => example.label === label).length >= MIN_DOODLES_PER_CLASS
  );
  const canProceed = currentStep === 0
    ? canGatherProceed
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
        <div className="activity-panel" style={{ height: '100%', justifyContent: 'flex-start', alignItems: 'stretch' }}>
          <div className="panel" style={{ flex: 'none', padding: 'var(--space-4)', width: '100%', maxWidth: '1200px', minHeight: 0 }}>
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
