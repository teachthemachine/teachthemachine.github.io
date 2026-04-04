import type { ActivityStep } from '../types/activity';
import './StepProgress.css';

interface StepProgressProps {
  steps: ActivityStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function StepProgress({ steps, currentStep, onStepClick }: StepProgressProps) {
  return (
    <div className="step-progress" role="navigation" aria-label="Activity progress">
      {steps.map((step, index) => (
        <div key={step.id} className="step-item">
          <button
            className={`step-circle ${
              index === currentStep ? 'active' :
              index < currentStep ? 'completed' : ''
            }`}
            onClick={() => onStepClick?.(index)}
            aria-label={`Step ${index + 1}: ${step.title}`}
            aria-current={index === currentStep ? 'step' : undefined}
          >
            {index < currentStep ? '✓' : step.icon}
          </button>
          <span className={`step-label ${
            index === currentStep ? 'active' :
            index < currentStep ? 'completed' : ''
          }`}>
            {step.title}
          </span>
          {index < steps.length - 1 && (
            <div className={`step-line ${index < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
