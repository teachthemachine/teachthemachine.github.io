/**
 * NaiveBayesClassifier — A simple multinomial Naive Bayes text classifier.
 *
 * This is the educational ML engine for TeachTheMachine.
 * It's intentionally transparent so students can see exactly what the model learns.
 *
 * How it works:
 * 1. Tokenize text into words
 * 2. Count word frequencies per class (spam vs ham)
 * 3. Use Bayes' theorem with Laplace smoothing to predict
 */

// Common English stopwords to ignore
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'to', 'in', 'of', 'and', 'or', 'for',
  'on', 'at', 'by', 'this', 'that', 'with', 'from', 'as', 'be', 'was',
  'are', 'been', 'has', 'had', 'do', 'does', 'did', 'but', 'not', 'so',
  'if', 'its', 'my', 'i', 'me', 'we', 'he', 'she', 'they', 'you',
]);

export interface ClassData {
  wordCounts: Map<string, number>;
  totalWords: number;
  documentCount: number;
}

export class NaiveBayesClassifier {
  private classes: Map<string, ClassData> = new Map();
  private vocabulary: Set<string> = new Set();
  private totalDocuments: number = 0;

  /** Tokenize a string into clean word tokens */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s!?$%]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !STOPWORDS.has(word));
  }

  /** Train the model on a set of labeled examples */
  train(data: { text: string; label: string }[]): void {
    this.classes.clear();
    this.vocabulary.clear();
    this.totalDocuments = 0;

    for (const { text, label } of data) {
      if (!this.classes.has(label)) {
        this.classes.set(label, {
          wordCounts: new Map(),
          totalWords: 0,
          documentCount: 0,
        });
      }

      const classData = this.classes.get(label)!;
      classData.documentCount++;
      this.totalDocuments++;

      const tokens = this.tokenize(text);
      for (const token of tokens) {
        this.vocabulary.add(token);
        classData.wordCounts.set(
          token,
          (classData.wordCounts.get(token) || 0) + 1
        );
        classData.totalWords++;
      }
    }
  }

  /** Predict the class of a text, returning confidence scores */
  predict(text: string): { label: string; confidence: number }[] {
    const tokens = this.tokenize(text);

    if (this.totalDocuments === 0 || tokens.length === 0) {
      return Array.from(this.classes.keys()).map(label => ({
        label,
        confidence: 1 / this.classes.size,
      }));
    }

    const vocabSize = this.vocabulary.size;
    const logScores: { label: string; logProb: number }[] = [];

    for (const [label, classData] of this.classes) {
      // Prior probability: P(class)
      let logProb = Math.log(classData.documentCount / this.totalDocuments);

      // Likelihood: P(word | class) with Laplace smoothing
      for (const token of tokens) {
        const wordCount = classData.wordCounts.get(token) || 0;
        const smoothedProb = (wordCount + 1) / (classData.totalWords + vocabSize);
        logProb += Math.log(smoothedProb);
      }

      logScores.push({ label, logProb });
    }

    // Convert log-probabilities to normalized probabilities
    const maxLog = Math.max(...logScores.map(s => s.logProb));
    const expScores = logScores.map(s => ({
      label: s.label,
      exp: Math.exp(s.logProb - maxLog),
    }));
    const sumExp = expScores.reduce((sum, s) => sum + s.exp, 0);

    return expScores
      .map(s => ({
        label: s.label,
        confidence: s.exp / sumExp,
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /** Detailed breakdown for teaching element */
  inspect(text: string) {
    const tokens = this.tokenize(text);
    const vocabSize = this.vocabulary.size;
    
    const classBreakdowns: Record<string, any> = {};
    
    for (const [label, classData] of this.classes) {
      const priorProb = classData.documentCount / this.totalDocuments;
      const priorLogProb = Math.log(priorProb);
      
      const tokenScores = [];
      let totalLogProb = priorLogProb;
      
      for (const token of tokens) {
        const wordCount = classData.wordCounts.get(token) || 0;
        const smoothedProb = (wordCount + 1) / (classData.totalWords + vocabSize);
        const logProb = Math.log(smoothedProb);
        
        totalLogProb += logProb;
        tokenScores.push({
          token,
          count: wordCount,
          prob: smoothedProb,
          logProb
        });
      }
      
      classBreakdowns[label] = {
        priorProb,
        priorLogProb,
        tokenScores,
        totalLogProb
      };
    }
    
    // Normalize logic exactly as predict
    const maxLog = Math.max(...Object.values(classBreakdowns).map((b: any) => b.totalLogProb));
    let sumExp = 0;
    for (const label in classBreakdowns) {
      const b = classBreakdowns[label];
      b.exp = Math.exp(b.totalLogProb - maxLog);
      sumExp += b.exp;
    }
    
    for (const label in classBreakdowns) {
      classBreakdowns[label].finalConfidence = classBreakdowns[label].exp / sumExp;
    }

    return {
      tokens,
      classBreakdowns
    };
  }

  /** Get the top N most distinctive words per class */
  getTopFeatures(n: number = 8): Record<string, { word: string; score: number }[]> {
    const result: Record<string, { word: string; score: number }[]> = {};
    const vocabSize = this.vocabulary.size;

    for (const [label, classData] of this.classes) {
      const wordScores: { word: string; score: number }[] = [];

      for (const word of this.vocabulary) {
        const count = classData.wordCounts.get(word) || 0;
        // TF-IDF-like score: frequency in this class vs total
        const tf = (count + 1) / (classData.totalWords + vocabSize);

        // How much more common is this word in this class vs others?
        let otherTotal = 0;
        let otherCount = 0;
        for (const [otherLabel, otherData] of this.classes) {
          if (otherLabel !== label) {
            otherCount += otherData.wordCounts.get(word) || 0;
            otherTotal += otherData.totalWords;
          }
        }
        const otherTf = (otherCount + 1) / (otherTotal + vocabSize);
        const score = tf / otherTf;

        if (count > 0) {
          wordScores.push({ word, score });
        }
      }

      wordScores.sort((a, b) => b.score - a.score);
      result[label] = wordScores.slice(0, n);
    }

    return result;
  }

  /** Reset all learned data */
  reset(): void {
    this.classes.clear();
    this.vocabulary.clear();
    this.totalDocuments = 0;
  }

  /** Check if the model has been trained */
  isTrained(): boolean {
    return this.totalDocuments > 0;
  }

  /** Get model statistics */
  getStats() {
    const classCounts: Record<string, number> = {};
    for (const [label, data] of this.classes) {
      classCounts[label] = data.documentCount;
    }

    return {
      totalSamples: this.totalDocuments,
      classCounts,
      featureCount: this.vocabulary.size,
      topFeatures: this.getTopFeatures(8),
    };
  }
}
