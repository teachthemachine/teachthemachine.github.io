import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PipelineLayout } from '../../components/PipelineLayout/PipelineLayout';
import { MissionIntro } from '../../components/MissionIntro/MissionIntro';
import { ClusterGatherStep } from './steps/ClusterGatherStep';
import { ClusterTrainStep } from './steps/ClusterTrainStep';
import { ClusterTestStep } from './steps/ClusterTestStep';
import type { Point2D, Centroid } from '../../ml/KMeansClassifier';
import './ClusterDetectiveActivity.css';

const STEPS = ['Gather Data', 'Train Model', 'Test & Trick'];

const CLUSTER_MISSION_DATA = {
  missionNumber: 5,
  title: 'Cluster Detective',
  tagline: 'Drop dots on a map and let the machine find hidden groups without any labels.',
  goalStatement: 'You will drop points on a map and let the machine find the natural groups automatically.',
  whyItMatters: 'Most data in the real world isn\'t labeled. Unsupervised learning is used to find hidden patterns—from grouping similar news articles to detecting credit card fraud.',
  modelName: 'K-Means Clustering',
  modelAnalogy: 'Imagine throwing a map on the floor and putting a few pennies on it. The pennies move closer to the cities with the most people, until they find the best "center" for each group.',
  modelIcon: 'scatter_plot',
  steps: STEPS,
};

interface Props {
  onNextMission?: () => void;
}

export function ClusterDetectiveActivity({ onNextMission }: Props) {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [points, setPoints] = useState<Point2D[]>([]);
  const [k, setK] = useState(2);
  const [isTrained, setIsTrained] = useState(false);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);

  const handleTrainComplete = (finalAssignments: number[], finalCentroids: Centroid[]) => {
    setAssignments(finalAssignments);
    setCentroids(finalCentroids);
    setIsTrained(true);
  };

  const handlePointsChange = (pts: Point2D[]) => {
    setPoints(pts);
    setIsTrained(false);
  };

  const handleKChange = (newK: number) => {
    setK(newK);
    setIsTrained(false);
  };

  const canProceed = currentStep === 0
    ? points.length >= 6
    : currentStep === 1 ? isTrained : true;

  if (!started) {
    return (
      <AnimatePresence>
        <motion.div style={{ height: '100%', overflow: 'auto' }}>
          <MissionIntro data={CLUSTER_MISSION_DATA} onStart={() => setStarted(true)} />
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
          <ClusterGatherStep
            points={points}
            onPointsChange={handlePointsChange}
            k={k}
            onKChange={handleKChange}
          />
        </div>
      )}
      {currentStep === 1 && (
        <div className="activity-panel" style={{ height: '100%', justifyContent: 'center' }}>
          <div className="panel" style={{ flex: 'none', padding: 'var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>
            <ClusterTrainStep
              points={points}
              k={k}
              onTrained={handleTrainComplete}
              isTrained={isTrained}
            />
          </div>
        </div>
      )}
      {currentStep === 2 && (
        <div className="activity-panel" style={{ height: '100%' }}>
          <ClusterTestStep
            points={points}
            assignments={assignments}
            centroids={centroids}
            k={k}
          />
        </div>
      )}
    </PipelineLayout>
  );
}
