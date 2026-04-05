import type { ModelStats } from '../types/activity';
import { NaiveBayesClassifier } from './NaiveBayesClassifier';

/**
 * Adapter wrapping NaiveBayesClassifier.
 * Provides a simple synchronous API used directly by activity panels.
 */
export class NaiveBayesAdapter {
  private classifier: NaiveBayesClassifier;

  constructor() {
    this.classifier = new NaiveBayesClassifier();
  }

  train(data: { text: string; label: string }[]): void {
    this.classifier.train(data);
  }

  predict(input: string): {
    label: string;
    confidence: number;
    probabilities: { label: string; probability: number }[];
  } {
    const results = this.classifier.predict(input);
    const top = results[0];
    return {
      label: top?.label ?? 'Unknown',
      confidence: top?.confidence ?? 0,
      probabilities: results.map(r => ({ label: r.label, probability: r.confidence })),
    };
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

  inspect(text: string) {
    return this.classifier.inspect(text);
  }

  tokenize(text: string): string[] {
    return this.classifier.tokenize(text);
  }
}
