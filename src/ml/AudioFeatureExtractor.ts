/**
 * AudioFeatureExtractor — Web Audio API based feature extraction.
 *
 * Uses getUserMedia → AnalyserNode (FFT) to extract 4 discriminative features
 * from short audio clips that a KNN classifier can separate:
 *
 *  1. RMS Energy       — loudness / amplitude
 *  2. Zero Crossing Rate — pitchiness / tonality (high for high-freq sounds)
 *  3. Spectral Centroid  — "brightness" (where energy is concentrated in freq space)
 *  4. Spectral Rolloff   — freq below which 85% of energy exists (bass vs treble)
 *
 * These 4 features cleanly separate clap vs snap vs whistle vs voice.
 */

export interface AudioFeatures {
  rms: number;
  zcr: number;
  spectralCentroid: number;
  spectralRolloff: number;
}

export interface AudioSample {
  label: string;
  features: AudioFeatures;
  /** raw time-domain data for waveform visualization */
  waveform: Float32Array;
}

function computeRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] ** 2;
  return Math.sqrt(sum / buffer.length);
}

function computeZCR(buffer: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i] >= 0) !== (buffer[i - 1] >= 0)) crossings++;
  }
  return crossings / buffer.length;
}

function computeSpectralCentroid(magnitudes: Float32Array, sampleRate: number): number {
  const nyquist = sampleRate / 2;
  let weightedSum = 0;
  let totalPower = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    const power = Math.abs(magnitudes[i]);
    const freq = (i / magnitudes.length) * nyquist;
    weightedSum += freq * power;
    totalPower += power;
  }
  return totalPower > 0 ? weightedSum / totalPower : 0;
}

function computeSpectralRolloff(magnitudes: Float32Array, sampleRate: number, threshold = 0.85): number {
  const nyquist = sampleRate / 2;
  const totalPower = magnitudes.reduce((s, m) => s + Math.abs(m), 0);
  const target = totalPower * threshold;
  let cumulative = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    cumulative += Math.abs(magnitudes[i]);
    if (cumulative >= target) {
      return (i / magnitudes.length) * nyquist;
    }
  }
  return nyquist;
}

export class AudioFeatureExtractor {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      return true;
    } catch {
      return false;
    }
  }

  /** Record for `durationMs` ms, then extract features */
  async recordSample(durationMs = 1500): Promise<AudioFeatures & { waveform: Float32Array } | null> {
    if (!this.analyser || !this.audioContext) return null;

    const bufferLength = this.analyser.fftSize;
    const timeData = new Float32Array(bufferLength);
    const freqData = new Float32Array(this.analyser.frequencyBinCount);

    // Collect multiple snapshots over the duration and average
    const snapshots: Float32Array[] = [];
    const freqSnapshots: Float32Array[] = [];
    const interval = 100; // ms between snapshots
    const count = Math.floor(durationMs / interval);

    for (let i = 0; i < count; i++) {
      await new Promise(r => setTimeout(r, interval));
      this.analyser!.getFloatTimeDomainData(timeData);
      this.analyser!.getFloatFrequencyData(freqData);
      snapshots.push(new Float32Array(timeData));
      freqSnapshots.push(new Float32Array(freqData));
    }

    // Average time domain for waveform display
    const avgTime = new Float32Array(bufferLength);
    for (const snap of snapshots) {
      for (let i = 0; i < bufferLength; i++) avgTime[i] += snap[i] / snapshots.length;
    }

    // Average frequency domain for spectral features
    const avgFreq = new Float32Array(freqData.length);
    for (const snap of freqSnapshots) {
      for (let i = 0; i < freqData.length; i++) {
        // Convert dB to linear magnitude
        avgFreq[i] += (10 ** (snap[i] / 20)) / freqSnapshots.length;
      }
    }

    const sampleRate = this.audioContext.sampleRate;

    return {
      rms: computeRMS(avgTime),
      zcr: computeZCR(avgTime),
      spectralCentroid: computeSpectralCentroid(avgFreq, sampleRate) / (sampleRate / 2), // normalize 0-1
      spectralRolloff: computeSpectralRolloff(avgFreq, sampleRate) / (sampleRate / 2),    // normalize 0-1
      waveform: avgTime,
    };
  }

  /** Get current live RMS for the mic level indicator */
  getLiveRMS(): number {
    if (!this.analyser) return 0;
    const buf = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buf);
    return computeRMS(buf);
  }

  dispose(): void {
    this.source?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
    this.source = null;
    this.stream = null;
    this.analyser = null;
    this.audioContext = null;
  }

  isReady(): boolean {
    return this.analyser !== null;
  }
}
