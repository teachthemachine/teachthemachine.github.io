import type { ModelAdapter, TrainingSample, PredictionResult, ModelStats } from '../types/activity';
import { NaiveBayesClassifier } from './NaiveBayesClassifier';

/**
 * Adapter wrapping NaiveBayesClassifier to conform to ModelAdapter interface.
 * This allows the activity to use the classifier through a standard API,
 * and future activities can swap in different model types.
 */
export class NaiveBayesAdapter implements ModelAdapter<string, PredictionResult[]> {
  private classifier: NaiveBayesClassifier;

  constructor() {
    this.classifier = new NaiveBayesClassifier();
  }

  async train(data: TrainingSample<string>[]): Promise<void> {
    const formatted = data.map(d => ({
      text: d.input,
      label: d.label,
    }));
    this.classifier.train(formatted);
  }

  async predict(input: string): Promise<PredictionResult[]> {
    return this.classifier.predict(input);
  }

  reset(): void {
    this.classifier.reset();
  }

  isTrained(): boolean {
    return this.classifier.isTrained();
  }

  getStats(): ModelStats {
    return this.classifier.getStats();
  }

  /** Expose tokenizer for educational displays */
  tokenize(text: string): string[] {
    return this.classifier.tokenize(text);
  }
}
