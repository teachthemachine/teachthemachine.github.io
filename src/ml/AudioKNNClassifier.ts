/**
 * AudioKNNClassifier — K-Nearest Neighbors on 4 audio features.
 * Euclidean distance in normalized feature space.
 */

import type { AudioFeatures } from './AudioFeatureExtractor';

export interface AudioTrainingSample {
  label: string;
  features: AudioFeatures;
}

function normalize(samples: AudioTrainingSample[]): { mins: AudioFeatures; maxs: AudioFeatures } {
  const keys: (keyof AudioFeatures)[] = ['rms', 'zcr', 'spectralCentroid', 'spectralRolloff'];
  const mins = {} as AudioFeatures;
  const maxs = {} as AudioFeatures;
  for (const k of keys) {
    mins[k] = Math.min(...samples.map(s => s.features[k]));
    maxs[k] = Math.max(...samples.map(s => s.features[k]));
  }
  return { mins, maxs };
}

function normalizeFeature(f: AudioFeatures, mins: AudioFeatures, maxs: AudioFeatures): AudioFeatures {
  const keys: (keyof AudioFeatures)[] = ['rms', 'zcr', 'spectralCentroid', 'spectralRolloff'];
  const out = { ...f };
  for (const k of keys) {
    const range = maxs[k] - mins[k];
    out[k] = range > 0 ? (f[k] - mins[k]) / range : 0;
  }
  return out;
}

function euclidean(a: AudioFeatures, b: AudioFeatures): number {
  return Math.sqrt(
    (a.rms - b.rms) ** 2 +
    (a.zcr - b.zcr) ** 2 +
    (a.spectralCentroid - b.spectralCentroid) ** 2 +
    (a.spectralRolloff - b.spectralRolloff) ** 2
  );
}

export class AudioKNNClassifier {
  private k: number;
  private samples: AudioTrainingSample[] = [];
  private mins: AudioFeatures = { rms: 0, zcr: 0, spectralCentroid: 0, spectralRolloff: 0 };
  private maxs: AudioFeatures = { rms: 1, zcr: 1, spectralCentroid: 1, spectralRolloff: 1 };

  constructor(k = 3) {
    this.k = k;
  }

  train(samples: AudioTrainingSample[]): void {
    this.samples = samples;
    const { mins, maxs } = normalize(samples);
    this.mins = mins;
    this.maxs = maxs;
  }

  predict(features: AudioFeatures): { label: string; confidence: number; distances: { label: string; distance: number }[] } {
    if (this.samples.length === 0) return { label: 'Unknown', confidence: 0, distances: [] };

    const normInput = normalizeFeature(features, this.mins, this.maxs);
    const distances = this.samples
      .map(s => ({
        label: s.label,
        distance: euclidean(normInput, normalizeFeature(s.features, this.mins, this.maxs)),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, this.k);

    // Vote among k nearest
    const votes: Record<string, number> = {};
    for (const d of distances) {
      votes[d.label] = (votes[d.label] || 0) + 1;
    }

    const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];
    return {
      label: winner[0],
      confidence: winner[1] / this.k,
      distances,
    };
  }

  getFeatureImportance(): { feature: string; variance: number }[] {
    if (this.samples.length < 2) return [];
    const keys: (keyof AudioFeatures)[] = ['rms', 'zcr', 'spectralCentroid', 'spectralRolloff'];
    const names = ['Loudness (RMS)', 'Pitchiness (ZCR)', 'Brightness', 'Bass vs Treble'];
    return keys.map((k, i) => {
      const vals = this.samples.map(s => s.features[k]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
      return { feature: names[i], variance };
    }).sort((a, b) => b.variance - a.variance);
  }

  isTrained(): boolean {
    return this.samples.length > 0;
  }

  reset(): void {
    this.samples = [];
  }

  getSamples(): AudioTrainingSample[] {
    return this.samples;
  }
}
