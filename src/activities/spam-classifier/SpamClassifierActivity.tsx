import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StepProgress } from '../../components/StepProgress';
import { Button } from '../../components/Button';
import { NaiveBayesAdapter } from '../../ml/NaiveBayesAdapter';
import { CollectStep } from './steps/CollectStep';
import type { SortedMessage } from './steps/CollectStep';
import { TrainStep } from './steps/TrainStep';
import { TestStep } from './steps/TestStep';
import { TrickStep } from './steps/TrickStep';
import type { ActivityStep } from '../../types/activity';
import './SpamClassifierActivity.css';

const STEPS: ActivityStep[] = [
  { id: 'collect', title: 'Collect', icon: '📥', description: 'Sort messages into categories' },
  { id: 'train', title: 'Train', icon: '🧠', description: 'Teach the model' },
  { id: 'test', title: 'Test', icon: '🔮', description: 'Try your model' },
  { id: 'trick', title: 'Trick', icon: '🎯', description: 'Fool the AI' },
];

export function SpamClassifierActivity() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sortedMessages, setSortedMessages] = useState<SortedMessage[]>([]);
  const [isTrained, setIsTrained] = useState(false);
  const modelRef = useRef(new NaiveBayesAdapter());

  const handleTrained = useCallback(() => {
    setIsTrained(true);
  }, []);

  const canGoNext = () => {
    if (currentStep === 0) return sortedMessages.length >= 4;
    if (currentStep === 1) return isTrained;
    if (currentStep === 2) return isTrained;
    return false;
  };

  const canGoToStep = (step: number) => {
    if (step === 0) return true;
    if (step === 1) return sortedMessages.length >= 4;
    if (step === 2) return isTrained;
    if (step === 3) return isTrained;
    return false;
  };

  const handleStepClick = (step: number) => {
    if (canGoToStep(step)) {
      setCurrentStep(step);
    }
  };

  const nextHint = () => {
    if (currentStep === 0 && sortedMessages.length < 4) {
      return `Sort at least 4 messages to continue (${sortedMessages.length}/4)`;
    }
    if (currentStep === 1 && !isTrained) {
      return 'Train your model to continue';
    }
    return '';
  };

  return (
    <div className="spam-activity">
      <div className="spam-activity-container">
        {/* Progress */}
        <StepProgress
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 0 && (
              <CollectStep
                sortedMessages={sortedMessages}
                onSortedChange={setSortedMessages}
              />
            )}
            {currentStep === 1 && (
              <TrainStep
                sortedMessages={sortedMessages}
                model={modelRef.current}
                onTrained={handleTrained}
              />
            )}
            {currentStep === 2 && (
              <TestStep model={modelRef.current} />
            )}
            {currentStep === 3 && (
              <TrickStep model={modelRef.current} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="spam-nav">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 0}
          >
            ← Back
          </Button>

          <span className="spam-nav-hint">{nextHint()}</span>

          {currentStep < STEPS.length - 1 && (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canGoNext()}
            >
              Next →
            </Button>
          )}

          {currentStep === STEPS.length - 1 && (
            <Button
              variant="accent"
              onClick={() => {
                setCurrentStep(0);
                setSortedMessages([]);
                setIsTrained(false);
                modelRef.current.reset();
              }}
            >
              🔄 Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
