import { motion } from 'framer-motion';
import './MissionIntro.css';

export interface MissionIntroData {
  missionNumber: number;
  title: string;
  tagline: string;
  goalStatement: string;
  whyItMatters: string;
  modelName: string;
  modelAnalogy: string;
  modelIcon: string;
  steps: string[]; // The pipeline step names, e.g. ["Gather Data", "Train Model", "Test & Trick"]
}

interface MissionIntroProps {
  data: MissionIntroData;
  onStart: () => void;
}

export function MissionIntro({ data, onStart }: MissionIntroProps) {
  return (
    <motion.div
      className="mission-intro"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
    >
      {/* Mission badge */}
      <div className="mission-badge">
        <span className="material-symbols-rounded">flag</span>
        Mission {data.missionNumber}
      </div>

      {/* Hero title */}
      <h1 className="mission-title">{data.title}</h1>
      <p className="mission-tagline">{data.tagline}</p>

      {/* Info cards row */}
      <div className="mission-cards">
        <div className="mission-card mission-card-goal">
          <div className="mission-card-icon">
            <span className="material-symbols-rounded">target</span>
          </div>
          <div className="mission-card-body">
            <h3>Your Goal</h3>
            <p>{data.goalStatement}</p>
          </div>
        </div>

        <div className="mission-card mission-card-why">
          <div className="mission-card-icon">
            <span className="material-symbols-rounded">public</span>
          </div>
          <div className="mission-card-body">
            <h3>Why It Matters</h3>
            <p>{data.whyItMatters}</p>
          </div>
        </div>

        <div className="mission-card mission-card-model">
          <div className="mission-card-icon">
            <span className="material-symbols-rounded">{data.modelIcon}</span>
          </div>
          <div className="mission-card-body">
            <h3>The Model: <span className="model-name-highlight">{data.modelName}</span></h3>
            <p>{data.modelAnalogy}</p>
          </div>
        </div>
      </div>

      {/* Pipeline preview */}
      <div className="mission-pipeline-preview">
        <span className="pipeline-preview-label">Your journey today</span>
        <div className="pipeline-preview-steps">
          {data.steps.map((step, i) => (
            <div key={step} className="pipeline-preview-step">
              <div className="pipeline-preview-num">{i + 1}</div>
              <span>{step}</span>
              {i < data.steps.length - 1 && (
                <span className="material-symbols-rounded pipeline-preview-arrow">arrow_forward</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        className="btn btn-primary mission-start-btn"
        onClick={onStart}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="material-symbols-rounded">rocket_launch</span>
        Begin Mission {data.missionNumber}
      </motion.button>
    </motion.div>
  );
}
