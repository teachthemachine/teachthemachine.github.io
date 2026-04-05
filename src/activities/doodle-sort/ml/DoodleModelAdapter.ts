import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export class DoodleModelAdapter {
  private featureExtractor: mobilenet.MobileNet | null = null;
  private classifier: knnClassifier.KNNClassifier;
  public isReady: boolean = false;
  private exampleCount: number = 0;

  constructor() {
    this.classifier = knnClassifier.create();
  }

  async load() {
    if (this.isReady) return;
    await tf.ready();
    this.featureExtractor = await mobilenet.load({ version: 1, alpha: 0.25 });
    this.isReady = true;
  }

  /**
   * Adds an example to the KNN model
   */
  addExample(canvas: HTMLCanvasElement, label: string) {
    if (!this.featureExtractor) throw new Error("Model not loaded");
    
    // tf.browser.fromPixels expects an image, canvas, or video element
    const img = tf.browser.fromPixels(canvas);
    
    // Extract features from mobilenet (returns a 1D tensor)
    const features = this.featureExtractor.infer(img, true);
    
    this.classifier.addExample(features, label);
    this.exampleCount++;
    
    // Cleanup tensors
    img.dispose();
  }

  /**
   * Predicts the label for a given canvas image
   */
  async predict(canvas: HTMLCanvasElement): Promise<{ label: string; confidences: Record<string, number> }> {
    if (!this.featureExtractor || this.exampleCount === 0) {
      return { label: 'Unknown', confidences: {} };
    }
    
    const img = tf.browser.fromPixels(canvas);
    const features = this.featureExtractor.infer(img, true);
    
    const result = await this.classifier.predictClass(features);
    
    img.dispose();
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
