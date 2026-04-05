import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NaiveBayesAdapter } from '../../ml/NaiveBayesAdapter';
import { CollectPanel } from './steps/CollectStep';
import { TrainPanel } from './steps/TrainStep';
import { PreviewPanel } from './steps/TestStep';
import { PipelineLayout } from '../../components/PipelineLayout/PipelineLayout';
import { MissionIntro } from '../../components/MissionIntro/MissionIntro';
import type { SortedMessage } from './steps/CollectStep';
import type { TextActivityConfig } from './config';
import './TextClassifierActivity.css';

interface Props {
  config: TextActivityConfig;
  onNextMission?: () => void;
}

const STEPS = ['Gather Data', 'Train Model', 'Test & Trick'];

export function TextClassifierActivity({ config, onNextMission }: Props) {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sortedMessages, setSortedMessages] = useState<SortedMessage[]>([]);
  const [isTrained, setIsTrained] = useState(false);
  const modelRef = useRef(new NaiveBayesAdapter());

  useEffect(() => {
    setStarted(false);
    setCurrentStep(0);
    setSortedMessages([]);
    setIsTrained(false);
    modelRef.current = new NaiveBayesAdapter();
  }, [config.id]);

  const handleTrained = useCallback(() => setIsTrained(true), []);
  const handleDataChange = useCallback((msgs: SortedMessage[]) => {
    setSortedMessages(msgs);
    if (isTrained) setIsTrained(false);
  }, [isTrained]);

  const canProceed = currentStep === 0
    ? sortedMessages.length >= 4
    : currentStep === 1
      ? isTrained
      : true;

  if (!started) {
    return (
      <AnimatePresence>
        <motion.div style={{ height: '100%', overflow: 'auto' }}>
          <MissionIntro
            data={{
              missionNumber: config.missionNumber,
              title: config.title,
              tagline: config.tagline,
              goalStatement: config.goalStatement,
              whyItMatters: config.whyItMatters,
              modelName: config.modelName,
              modelAnalogy: config.modelAnalogy,
              modelIcon: config.modelIcon,
              steps: STEPS,
            }}
            onStart={() => setStarted(true)}
          />
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
          <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <CollectPanel
              config={config}
              sortedMessages={sortedMessages}
              onSortedChange={handleDataChange}
            />
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="activity-panel" style={{ height: '100%', justifyContent: 'center' }}>
          <div className="panel" style={{ flex: 'none', padding: 'var(--space-6)' }}>
            <TrainPanel
              config={config}
              sortedMessages={sortedMessages}
              model={modelRef.current}
              onTrained={handleTrained}
              isTrained={isTrained}
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="activity-panel" style={{ height: '100%' }}>
          <PreviewPanel
            config={config}
            model={modelRef.current}
            isTrained={isTrained}
          />
        </div>
      )}
    </PipelineLayout>
  );
}
