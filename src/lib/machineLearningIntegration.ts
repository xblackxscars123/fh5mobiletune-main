/**
 * Machine Learning Integration for Forza Horizon 5 Tuning
 * Learns from community data to provide intelligent recommendations
 * and continuously improves tune predictions
 */

import { CarSpecs, TuneSettings } from './tuningCalculator';
import { AdvancedPerformancePredictor, PerformanceMetrics } from './advancedPerformancePredictor';

export interface TuneDataPoint {
  id: string;
  car: CarSpecs;
  carName: string; // Make and model (e.g., "Honda Civic Type R")
  tune: TuneSettings;
  performance: PerformanceMetrics;
  trackId?: string;
  userRating?: number; // 1-5 stars
  lapTime?: number; // actual lap time in seconds
  tags?: string[]; // 'drag', 'circuit', 'drift', etc.
  submittedBy: string;
  timestamp: number;
  validated: boolean; // confirmed working in-game
}

export interface MLRecommendation {
  confidence: number; // 0-1
  reasoning: string[];
  similarTunes: TuneDataPoint[];
  predictedImprovement: number; // percentage
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PatternAnalysis {
  parameterCorrelations: Record<string, number>;
  optimalRanges: Record<string, { min: number; max: number; optimal: number }>;
  successFactors: string[];
  commonPitfalls: string[];
}

export class MachineLearningIntegration {
  private communityData: TuneDataPoint[] = [];
  private patternCache: Map<string, PatternAnalysis> = new Map();
  private predictor: AdvancedPerformancePredictor;

  constructor(predictor: AdvancedPerformancePredictor) {
    this.predictor = predictor;
  }

  /**
   * Add community tune data to the learning system
   */
  public addTuneData(tuneData: TuneDataPoint): void {
    this.communityData.push(tuneData);
    // Invalidate relevant caches
    this.invalidatePatternCache(tuneData.car, tuneData.tags);
  }

  /**
   * Get intelligent recommendations based on machine learning
   */
  public getSmartRecommendations(
    currentCar: CarSpecs,
    currentTune: TuneSettings,
    targetObjective: 'performance' | 'handling' | 'balance' = 'performance'
  ): MLRecommendation {
    const similarTunes = this.findSimilarTunes(currentCar, currentTune);
    const patternAnalysis = this.analyzePatterns(currentCar, similarTunes);

    if (similarTunes.length === 0) {
      return {
        confidence: 0.3,
        reasoning: ['Limited community data available for this car/setup combination'],
        similarTunes: [],
        predictedImprovement: 0,
        riskLevel: 'high'
      };
    }

    const confidence = this.calculateConfidence(similarTunes, currentCar);
    const reasoning = this.generateReasoning(similarTunes, patternAnalysis, targetObjective);
    const predictedImprovement = this.predictImprovement(currentTune, similarTunes, targetObjective);

    return {
      confidence,
      reasoning,
      similarTunes: similarTunes.slice(0, 5), // Top 5 similar tunes
      predictedImprovement,
      riskLevel: this.assessRiskLevel(confidence, similarTunes.length)
    };
  }

  /**
   * Find tunes similar to the current setup
   */
  private findSimilarTunes(car: CarSpecs, tune: TuneSettings, limit: number = 20): TuneDataPoint[] {
    const similarities = this.communityData.map(tuneData => ({
      tune: tuneData,
      similarity: this.calculateSimilarity(car, tune, tuneData)
    }));

    // Sort by similarity and return top results
    return similarities
      .filter(s => s.similarity > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(s => s.tune);
  }

  /**
   * Calculate similarity between two car/tune combinations
   */
  private calculateSimilarity(car1: CarSpecs, tune1: TuneSettings, tuneData2: TuneDataPoint): number {
    const car2 = tuneData2.car;
    const tune2 = tuneData2.tune;

    let similarity = 0;
    let totalWeight = 0;

    // Car specifications similarity (high weight)
    const carSimilarity = this.calculateCarSimilarity(car1, car2);
    similarity += carSimilarity * 0.4;
    totalWeight += 0.4;

    // Tune settings similarity (medium weight)
    const tuneSimilarity = this.calculateTuneSimilarity(tune1, tune2);
    similarity += tuneSimilarity * 0.4;
    totalWeight += 0.4;

    // Performance class similarity (low weight)
    const classSimilarity = car1.piClass === car2.piClass ? 1 : 0.5;
    similarity += classSimilarity * 0.2;
    totalWeight += 0.2;

    return similarity / totalWeight;
  }

  /**
   * Calculate similarity between two car specifications
   */
  private calculateCarSimilarity(car1: CarSpecs, car2: CarSpecs): number {
    let similarity = 0;
    let factors = 0;

    // Weight similarity (±10% = 1.0, ±25% = 0.5, ±50% = 0.0)
    const weightDiff = Math.abs(car1.weight - car2.weight) / Math.max(car1.weight, car2.weight);
    similarity += Math.max(0, 1 - weightDiff * 2.5);
    factors++;

    // Weight distribution similarity (±5% = 1.0, ±15% = 0.5, ±30% = 0.0)
    const distDiff = Math.abs(car1.weightDistribution - car2.weightDistribution);
    similarity += Math.max(0, 1 - distDiff / 15);
    factors++;

    // Drive type match
    if (car1.driveType === car2.driveType) {
      similarity += 1;
    } else if ((car1.driveType === 'AWD' && car2.driveType !== 'FWD') ||
               (car2.driveType === 'AWD' && car1.driveType !== 'FWD')) {
      similarity += 0.5; // Partial match for AWD
    }
    factors++;

    // Power similarity (±20% = 1.0, ±50% = 0.5, ±100% = 0.0)
    if (car1.horsepower && car2.horsepower) {
      const powerDiff = Math.abs(car1.horsepower - car2.horsepower) / Math.max(car1.horsepower, car2.horsepower);
      similarity += Math.max(0, 1 - powerDiff * 1.25);
      factors++;
    }

    // PI class similarity
    if (car1.piClass === car2.piClass) {
      similarity += 1;
    } else {
      // Adjacent classes are somewhat similar
      const classes = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X'];
      const idx1 = classes.indexOf(car1.piClass);
      const idx2 = classes.indexOf(car2.piClass);
      if (idx1 >= 0 && idx2 >= 0) {
        const diff = Math.abs(idx1 - idx2);
        similarity += Math.max(0, 1 - diff * 0.2);
      }
    }
    factors++;

    return similarity / factors;
  }

  /**
   * Calculate similarity between two tune settings
   */
  private calculateTuneSimilarity(tune1: TuneSettings, tune2: TuneSettings): number {
    const parameters: (keyof TuneSettings)[] = [
      'springsFront', 'springsRear', 'arbFront', 'arbRear',
      'camberFront', 'camberRear', 'aeroFront', 'aeroRear',
      'tirePressureFront', 'tirePressureRear'
    ];

    let totalSimilarity = 0;
    let paramCount = 0;

    for (const param of parameters) {
      const val1 = tune1[param] as number;
      const val2 = tune2[param] as number;

      if (val1 !== undefined && val2 !== undefined && val1 !== 0) {
        const diff = Math.abs(val1 - val2) / Math.max(Math.abs(val1), Math.abs(val2));
        totalSimilarity += Math.max(0, 1 - diff * 2); // ±50% difference = 0 similarity
        paramCount++;
      }
    }

    return paramCount > 0 ? totalSimilarity / paramCount : 0;
  }

  /**
   * Analyze patterns in community data
   */
  private analyzePatterns(car: CarSpecs, similarTunes: TuneDataPoint[]): PatternAnalysis {
    // Use first tune's carName as cache key since all similar tunes should be for similar cars
    const cacheKey = similarTunes.length > 0 ? `${similarTunes[0].carName}-${car.piClass}` : `unknown-${car.piClass}`;
    if (this.patternCache.has(cacheKey)) {
      return this.patternCache.get(cacheKey)!;
    }

    const analysis: PatternAnalysis = {
      parameterCorrelations: {},
      optimalRanges: {},
      successFactors: [],
      commonPitfalls: []
    };

    if (similarTunes.length < 3) {
      this.patternCache.set(cacheKey, analysis);
      return analysis;
    }

    // Analyze successful tunes (top 25% by performance)
    const sortedTunes = similarTunes.sort((a, b) => this.scoreTunePerformance(b) - this.scoreTunePerformance(a));
    const topTunes = sortedTunes.slice(0, Math.ceil(sortedTunes.length * 0.25));

    // Calculate optimal ranges for key parameters
    const keyParameters: (keyof TuneSettings)[] = [
      'springsFront', 'springsRear', 'arbFront', 'arbRear',
      'camberFront', 'camberRear', 'aeroFront', 'aeroRear'
    ];

    for (const param of keyParameters) {
      const values = topTunes.map(t => t.tune[param] as number).filter(v => v !== undefined);
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const median = sorted[Math.floor(sorted.length * 0.5)];

        analysis.optimalRanges[param] = {
          min: q1,
          max: q3,
          optimal: median
        };
      }
    }

    // Identify success factors
    const commonSettings = this.findCommonSettings(topTunes);
    analysis.successFactors = commonSettings.map(setting =>
      `${setting.parameter} around ${setting.value.toFixed(1)} (${setting.frequency * 100}% of top tunes)`
    );

    // Identify common pitfalls (settings that appear in failed tunes but not successful ones)
    const failedTunes = sortedTunes.slice(-Math.ceil(sortedTunes.length * 0.25));
    const pitfallSettings = this.findCommonSettings(failedTunes).filter(failed =>
      !commonSettings.some(success => success.parameter === failed.parameter)
    );

    analysis.commonPitfalls = pitfallSettings.map(setting =>
      `Avoid ${setting.parameter} values around ${setting.value.toFixed(1)}`
    );

    this.patternCache.set(cacheKey, analysis);
    return analysis;
  }

  /**
   * Score overall tune performance for ranking
   */
  private scoreTunePerformance(tuneData: TuneDataPoint): number {
    const perf = tuneData.performance;
    const rating = tuneData.userRating || 3;

    // Weighted score combining multiple metrics
    let score = (
      (perf.handlingScore / 10) * 0.3 +      // 30% handling
      (perf.stabilityScore / 10) * 0.25 +    // 25% stability
      (perf.brakingPower / 10) * 0.2 +       // 20% braking
      ((11 - perf.zeroToSixty) / 11) * 0.15 + // 15% acceleration (inverted)
      (rating / 5) * 0.1                     // 10% user rating
    );

    // Bonus for validated tunes
    if (tuneData.validated) score *= 1.1;

    return score;
  }

  /**
   * Find settings that commonly appear in a set of tunes
   */
  private findCommonSettings(tunes: TuneDataPoint[]): Array<{parameter: string, value: number, frequency: number}> {
    const settings: Record<string, number[]> = {};

    // Collect all parameter values
    tunes.forEach(tuneData => {
      const tune = tuneData.tune;
      ['springsFront', 'springsRear', 'arbFront', 'arbRear', 'camberFront', 'camberRear'].forEach(param => {
        const value = tune[param as keyof TuneSettings] as number;
        if (value !== undefined) {
          if (!settings[param]) settings[param] = [];
          settings[param].push(value);
        }
      });
    });

    // Find common value ranges for each parameter
    const commonSettings: Array<{parameter: string, value: number, frequency: number}> = [];

    Object.entries(settings).forEach(([param, values]) => {
      if (values.length < 3) return;

      // Group values into clusters
      const clusters = this.clusterValues(values, 3); // 3 clusters

      clusters.forEach(cluster => {
        if (cluster.count >= Math.ceil(values.length * 0.4)) { // At least 40% of tunes
          commonSettings.push({
            parameter: param,
            value: cluster.center,
            frequency: cluster.count / values.length
          });
        }
      });
    });

    return commonSettings.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Cluster numeric values into groups
   */
  private clusterValues(values: number[], numClusters: number): Array<{center: number, count: number}> {
    if (values.length <= numClusters) {
      return values.map(v => ({ center: v, count: 1 }));
    }

    // Simple k-means clustering
    const sorted = [...values].sort((a, b) => a - b);
    const clusters: Array<{center: number, count: number, values: number[]}> = [];

    // Initialize clusters evenly across the range
    for (let i = 0; i < numClusters; i++) {
      const index = Math.floor((i * sorted.length) / numClusters);
      clusters.push({ center: sorted[index], count: 0, values: [] });
    }

    // Assign values to nearest cluster
    sorted.forEach(value => {
      let nearestCluster = clusters[0];
      let minDistance = Math.abs(value - clusters[0].center);

      for (let i = 1; i < clusters.length; i++) {
        const distance = Math.abs(value - clusters[i].center);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCluster = clusters[i];
        }
      }

      nearestCluster.values.push(value);
      nearestCluster.count++;
    });

    // Recalculate centers
    clusters.forEach(cluster => {
      if (cluster.values.length > 0) {
        cluster.center = cluster.values.reduce((sum, v) => sum + v, 0) / cluster.values.length;
      }
    });

    return clusters.map(c => ({ center: c.center, count: c.count }));
  }

  /**
   * Calculate confidence in recommendations
   */
  private calculateConfidence(similarTunes: TuneDataPoint[], car: CarSpecs): number {
    if (similarTunes.length === 0) return 0;

    let confidence = 0;

    // Base confidence on sample size
    if (similarTunes.length >= 10) confidence += 0.4;
    else if (similarTunes.length >= 5) confidence += 0.3;
    else if (similarTunes.length >= 3) confidence += 0.2;
    else confidence += 0.1;

    // Increase confidence for validated tunes
    const validatedRatio = similarTunes.filter(t => t.validated).length / similarTunes.length;
    confidence += validatedRatio * 0.3;

    // Increase confidence for highly rated tunes
    const highRatedRatio = similarTunes.filter(t => (t.userRating || 0) >= 4).length / similarTunes.length;
    confidence += highRatedRatio * 0.2;

    // Increase confidence for exact car matches
    // Simplified - will be improved when car identification is available
    const exactMatches = similarTunes.filter(t => t.validated).length;
    if (exactMatches > 0) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  /**
   * Generate reasoning for recommendations
   */
  private generateReasoning(
    similarTunes: TuneDataPoint[],
    patternAnalysis: PatternAnalysis,
    targetObjective: string
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Found ${similarTunes.length} similar tunes in community data`);

    if (patternAnalysis.successFactors.length > 0) {
      reasoning.push(`Community data shows: ${patternAnalysis.successFactors[0]}`);
    }

    if (patternAnalysis.commonPitfalls.length > 0) {
      reasoning.push(`Avoid: ${patternAnalysis.commonPitfalls[0]}`);
    }

    const validatedCount = similarTunes.filter(t => t.validated).length;
    if (validatedCount > 0) {
      reasoning.push(`${validatedCount} similar tunes have been validated in-game`);
    }

    const avgRating = similarTunes.reduce((sum, t) => sum + (t.userRating || 3), 0) / similarTunes.length;
    if (avgRating >= 4) {
      reasoning.push(`Similar tunes have high community ratings (${avgRating.toFixed(1)}/5 stars)`);
    }

    return reasoning;
  }

  /**
   * Predict improvement potential
   */
  private predictImprovement(
    currentTune: TuneSettings,
    similarTunes: TuneDataPoint[],
    targetObjective: string
  ): number {
    if (similarTunes.length === 0) return 0;

    // Calculate average performance improvement from similar tunes
    const improvements = similarTunes.map(tuneData => {
      const currentPerf = this.predictor.predictPerformance().baseline;
      // Simplified improvement calculation - in real implementation,
      // this would compare actual vs predicted performance
      return (tuneData.performance.handlingScore - currentPerf.handlingScore) / currentPerf.handlingScore * 100;
    });

    const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;

    return Math.max(-10, Math.min(25, avgImprovement)); // Cap at reasonable range
  }

  /**
   * Assess risk level of recommendations
   */
  private assessRiskLevel(confidence: number, sampleSize: number): 'low' | 'medium' | 'high' {
    if (confidence >= 0.7 && sampleSize >= 5) return 'low';
    if (confidence >= 0.5 && sampleSize >= 3) return 'medium';
    return 'high';
  }

  /**
   * Invalidate pattern cache when new data is added
   */
  private invalidatePatternCache(car: CarSpecs, tags?: string[]): void {
    // Simplified cache invalidation - just clear all for now
    this.patternCache.clear();
  }

  /**
   * Get basic community statistics
   */
  public getCommunityStats(): {
    totalTunes: number;
    validatedTunes: number;
    averageRating: number;
    topTags: Array<{tag: string, count: number}>;
  } {
    if (this.communityData.length === 0) {
      return {
        totalTunes: 0,
        validatedTunes: 0,
        averageRating: 0,
        topTags: []
      };
    }

    const validatedTunes = this.communityData.filter(t => t.validated).length;
    const averageRating = this.communityData.reduce((sum, t) => sum + (t.userRating || 3), 0) / this.communityData.length;

    // Count tag frequency
    const tagCounts: Record<string, number> = {};
    this.communityData.forEach(tune => {
      (tune.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTunes: this.communityData.length,
      validatedTunes,
      averageRating,
      topTags
    };
  }

  /**
   * Export learned patterns for analysis
   */
  public exportLearnedPatterns(): {
    totalTunes: number;
    patternCache: Record<string, PatternAnalysis>;
    communityStats: any;
  } {
    return {
      totalTunes: this.communityData.length,
      patternCache: Object.fromEntries(this.patternCache),
      communityStats: this.getCommunityStats()
    };
  }
}

export default MachineLearningIntegration;