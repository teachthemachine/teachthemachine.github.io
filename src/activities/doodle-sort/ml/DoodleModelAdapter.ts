import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export class DoodleModelAdapter {
  private classifier: knnClassifier.KNNClassifier;
  public isReady: boolean = false;
  private exampleCount: number = 0;
  private readonly inputSize = 28;

  constructor() {
    this.classifier = knnClassifier.create();
  }

  async load() {
    if (this.isReady) return;
    await tf.ready();
    this.isReady = true;
  }

  /**
   * Converts a doodle into a centered, normalized pixel grid.
   */
  private createFeatureTensor(canvas: HTMLCanvasElement) {
    const normalized = document.createElement('canvas');
    normalized.width = this.inputSize;
    normalized.height = this.inputSize;

    const targetCtx = normalized.getContext('2d', { willReadFrequently: true });

    if (!targetCtx) {
      throw new Error('Canvas context unavailable');
    }

    targetCtx.fillStyle = 'white';
    targetCtx.fillRect(0, 0, this.inputSize, this.inputSize);
    targetCtx.drawImage(canvas, 0, 0, this.inputSize, this.inputSize);

    const initial = targetCtx.getImageData(0, 0, this.inputSize, this.inputSize);
    const { data } = initial;

    let minX = this.inputSize;
    let minY = this.inputSize;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < this.inputSize; y++) {
      for (let x = 0; x < this.inputSize; x++) {
        const index = (y * this.inputSize + x) * 4;
        const darkness = 255 - Math.round((data[index] + data[index + 1] + data[index + 2]) / 3);
        if (darkness > 24) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX === -1 || maxY === -1) {
      return tf.zeros([this.inputSize * this.inputSize]);
    }

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const scale = Math.min((this.inputSize * 0.72) / boxWidth, (this.inputSize * 0.72) / boxHeight);
    const scaledWidth = boxWidth * scale;
    const scaledHeight = boxHeight * scale;
    const dx = (this.inputSize - scaledWidth) / 2;
    const dy = (this.inputSize - scaledHeight) / 2;
    const sourceScaleX = canvas.width / this.inputSize;
    const sourceScaleY = canvas.height / this.inputSize;

    targetCtx.fillStyle = 'white';
    targetCtx.fillRect(0, 0, this.inputSize, this.inputSize);
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.drawImage(
      canvas,
      minX * sourceScaleX,
      minY * sourceScaleY,
      boxWidth * sourceScaleX,
      boxHeight * sourceScaleY,
      dx,
      dy,
      scaledWidth,
      scaledHeight
    );

    const normalizedData = targetCtx.getImageData(0, 0, this.inputSize, this.inputSize).data;
    const featureValues = new Float32Array(this.inputSize * this.inputSize);

    for (let i = 0; i < featureValues.length; i++) {
      const index = i * 4;
      const grayscale = Math.round(
        (normalizedData[index] + normalizedData[index + 1] + normalizedData[index + 2]) / 3
      );
      const binarized = grayscale > 220 ? 255 : grayscale < 80 ? 0 : grayscale;
      featureValues[i] = (255 - binarized) / 255;
    }

    return tf.tensor1d(featureValues);
  }

  /**
   * Adds an example to the KNN model
   */
  addExample(canvas: HTMLCanvasElement, label: string) {
    const features = this.createFeatureTensor(canvas);

    this.classifier.addExample(features, label);
    this.exampleCount++;

    features.dispose();
  }

  /**
   * Predicts the label for a given canvas image
   */
  async predict(canvas: HTMLCanvasElement): Promise<{ label: string; confidences: Record<string, number> }> {
    if (this.exampleCount === 0) {
      return { label: 'Unknown', confidences: {} };
    }

    const features = this.createFeatureTensor(canvas);
    const result = await this.classifier.predictClass(features);
    features.dispose();

    return {
      label: result.label,
      confidences: result.confidences || {}
    };
  }

  isTrained(): boolean {
    return this.exampleCount > 0;
  }

  getExampleCount(): number {
    return this.exampleCount;
  }

  reset() {
    this.classifier.clearAllClasses();
    this.exampleCount = 0;
  }
}
