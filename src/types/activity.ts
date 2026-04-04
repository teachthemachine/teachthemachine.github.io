import type { ComponentType } from 'react';

/** Stats about a trained model */
export interface ModelStats {
  totalSamples: number;
  classCounts: Record<string, number>;
  featureCount: number;
  topFeatures: Record<string, { word: string; score: number }[]>;
}

/** Generic model adapter interface — implement for each model type */
export interface ModelAdapter<TInput = string, TOutput = PredictionResult[]> {
  train(data: TrainingSample<TInput>[]): Promise<void>;
  predict(input: TInput): Promise<TOutput>;
  reset(): void;
  isTrained(): boolean;
  getStats(): ModelStats;
}

export interface TrainingSample<TInput = string> {
  input: TInput;
  label: string;
}

export interface PredictionResult {
  label: string;
  confidence: number;
}

/** Activity definition for the registry */
export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  tags: string[];
  component: ComponentType;
}

/** Step definition within an activity */
export interface ActivityStep {
  id: string;
  title: string;
  icon: string;
  description: string;
}
