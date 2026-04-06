/**
 * KMeansClassifier — Educational K-Means clustering from scratch.
 *
 * Used by the Cluster Detective mission to teach unsupervised learning.
 * The key insight: the machine finds groups WITHOUT being told the answer.
 */

export interface Point2D {
  x: number;
  y: number;
  clusterId?: number;
}

export interface Centroid {
  x: number;
  y: number;
  id: number;
}

export interface KMeansIteration {
  centroids: Centroid[];
  assignments: number[]; // index → cluster id
  changed: boolean;
}

function euclidean(a: Point2D, b: Centroid): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function assignPoints(points: Point2D[], centroids: Centroid[]): number[] {
  return points.map(p => {
    let minDist = Infinity;
    let closest = 0;
    for (const c of centroids) {
      const d = euclidean(p, c);
      if (d < minDist) { minDist = d; closest = c.id; }
    }
    return closest;
  });
}

function moveCentroids(points: Point2D[], assignments: number[], k: number): Centroid[] {
  return Array.from({ length: k }, (_, i) => {
    const members = points.filter((_, pi) => assignments[pi] === i);
    if (members.length === 0) {
      // Reinitialize orphaned centroid randomly
      return { id: i, x: Math.random(), y: Math.random() };
    }
    return {
      id: i,
      x: members.reduce((s, p) => s + p.x, 0) / members.length,
      y: members.reduce((s, p) => s + p.y, 0) / members.length,
    };
  });
}

export class KMeansClassifier {
  private k: number;
  private centroids: Centroid[] = [];
  private maxIter: number;

  constructor(k = 2, maxIter = 20) {
    this.k = k;
    this.maxIter = maxIter;
  }

  /**
   * Run K-Means and return every iteration for animation.
   * Points should be normalized to [0, 1].
   */
  fitAnimated(points: Point2D[]): KMeansIteration[] {
    if (points.length < this.k) return [];

    // K-Means++ initialization for better convergence
    const centroids: Centroid[] = [];
    const used = new Set<number>();

    // Pick first centroid randomly
    let idx = Math.floor(Math.random() * points.length);
    used.add(idx);
    centroids.push({ id: 0, x: points[idx].x, y: points[idx].y });

    // Pick remaining centroids weighted by distance²
    for (let ci = 1; ci < this.k; ci++) {
      const dists = points.map((p, pi) => {
        if (used.has(pi)) return 0;
        const minD = Math.min(...centroids.map(c => euclidean(p, c)));
        return minD ** 2;
      });
      const total = dists.reduce((s, d) => s + d, 0);
      let rand = Math.random() * total;
      let chosen = 0;
      for (let pi = 0; pi < dists.length; pi++) {
        rand -= dists[pi];
        if (rand <= 0) { chosen = pi; break; }
      }
      used.add(chosen);
      centroids.push({ id: ci, x: points[chosen].x, y: points[chosen].y });
    }

    const iterations: KMeansIteration[] = [];
    let currentCentroids = [...centroids];

    for (let iter = 0; iter < this.maxIter; iter++) {
      const assignments = assignPoints(points, currentCentroids);
      const newCentroids = moveCentroids(points, assignments, this.k);

      const changed = newCentroids.some(
        (nc, i) => Math.abs(nc.x - currentCentroids[i].x) > 0.001 || Math.abs(nc.y - currentCentroids[i].y) > 0.001
      );

      iterations.push({ centroids: newCentroids.map(c => ({ ...c })), assignments: [...assignments], changed });
      currentCentroids = newCentroids;
      if (!changed) break;
    }

    this.centroids = currentCentroids;
    return iterations;
  }

  /** Assign a new point to the nearest centroid */
  predict(point: Point2D): number {
    if (this.centroids.length === 0) return 0;
    return assignPoints([point], this.centroids)[0];
  }

  getCentroids(): Centroid[] {
    return this.centroids;
  }

  setK(k: number): void {
    this.k = k;
  }

  reset(): void {
    this.centroids = [];
  }
}
