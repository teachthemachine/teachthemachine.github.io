import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PipelineLayout.css';

interface PipelineLayoutProps {
  currentStep: number;
  steps: string[];
  onStepChange: (step: number) => void;
  canProceed: boolean; /* True if they can go to next step */
  onNextMission?: () => void;
  children: ReactNode;
}

export function PipelineLayout({
  currentStep,
  steps,
  onStepChange,
  canProceed,
  onNextMission,
  children
}: PipelineLayoutProps) {

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="pipeline-workspace">
      {/* Stepper Header */}
      <div className="pipeline-stepper">
        {steps.map((label, i) => (
          <div key={label} className={`pipeline-step ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`} onClick={() => i < currentStep && onStepChange(i)}>
            <div className="step-number">{i + 1}</div>
            <div className="step-label">{label}</div>
            {i < steps.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="pipeline-content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="pipeline-content-viewport"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer — floating pill tray */}
      <div className="pipeline-footer">
        <button
          className="btn"
          onClick={handleBack}
          disabled={currentStep === 0}
          style={{
            visibility: currentStep === 0 ? 'hidden' : 'visible',
            borderRadius: 'var(--radius-full)',
            padding: 'var(--space-2) var(--space-5)',
          }}
        >
          <span className="material-symbols-rounded">arrow_back</span> Back
        </button>

        {/* Center: step progress dots */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: i < currentStep
                  ? 'var(--color-safe)'
                  : i === currentStep
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canProceed}
            style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-5)' }}
          >
            Next Step <span className="material-symbols-rounded">arrow_forward</span>
          </button>
        ) : onNextMission ? (
          <button
            className="btn btn-accent"
            onClick={onNextMission}
            style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-5)' }}
          >
            Complete Mission <span className="material-symbols-rounded">rocket_launch</span>
          </button>
        ) : <div style={{ width: '100px' }} />}
      </div>
    </div>
  );
}
