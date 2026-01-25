/**
 * Advanced Performance Prediction Engine for Forza Horizon 5
 * Multi-variable performance modeling with environmental factors,
 * thermal dynamics, and real-time performance degradation
 */

import { CarSpecs, TuneSettings } from './tuningCalculator';
import { estimateTopSpeed, estimateZeroToSixty, estimateZeroToHundred } from './performancePrediction';
import { calculateLLTD } from './physicsCalculations';

export interface PerformanceMetrics {
  // Acceleration
  zeroToSixty: number;
  zeroToHundred: number;
  quarterMile: { time: number; speed: number };

  // Top Speed
  topSpeed: number;
  topSpeedWithAero: number;

  // Handling
  handlingScore: number; // 0-10 scale
  understeerTendency: number; // -5 (oversteer) to +5 (understeer)
  stabilityScore: number; // 0-10 scale

  // Efficiency
  fuelEfficiency: number; // MPG equivalent
  tireWearRate: number; // Relative wear per lap

  // Dynamics
  corneringGrip: number; // 0-2.0 multiplier
  brakingPower: number; // 0-10 scale
  tractionControl: number; // 0-10 scale
}

export interface EnvironmentalConditions {
  temperature: number; // Celsius
  humidity: number; // 0-100%
  pressure: number; // hPa (air pressure)
  windSpeed: number; // km/h
  trackTemperature: number; // Celsius
  trackConditions: 'dry' | 'damp' | 'wet' | 'flooded';
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
}

export interface LapData {
  lapTime: number;
  sectorTimes: number[];
  maxSpeed: number;
  avgSpeed: number;
  tireTemps: { front: number; rear: number };
  brakeTemps: { front: number; rear: number };
  fuelRemaining: number;
  tireWear: number; // 0-100%
}

export interface PerformancePrediction {
  baseline: PerformanceMetrics;
  withDegradation: PerformanceMetrics;
  environmentalImpact: Partial<PerformanceMetrics>;
  confidence: number; // 0-1 scale
  limitingFactors: string[];
  recommendations: string[];
}

export class AdvancedPerformancePredictor {
  private baseCarSpecs: CarSpecs;
  private currentTune: TuneSettings;
  private environmentalConditions: EnvironmentalConditions;

  constructor(
    carSpecs: CarSpecs,
    tuneSettings: TuneSettings,
    environmentalConditions: EnvironmentalConditions = this.getDefaultEnvironmentalConditions()
  ) {
    this.baseCarSpecs = carSpecs;
    this.currentTune = tuneSettings;
    this.environmentalConditions = environmentalConditions;
  }

  /**
   * Generate comprehensive performance prediction
   */
  public predictPerformance(lapProgress: number = 0): PerformancePrediction {
    const baseline = this.calculateBaselinePerformance();
    const withDegradation = this.applyPerformanceDegradation(baseline, lapProgress);
    const environmentalImpact = this.calculateEnvironmentalImpact(baseline);
    const confidence = this.calculatePredictionConfidence();

    return {
      baseline,
      withDegradation,
      environmentalImpact,
      confidence,
      limitingFactors: this.identifyLimitingFactors(baseline),
      recommendations: this.generateRecommendations(baseline, environmentalImpact)
    };
  }

  /**
   * Calculate baseline performance without degradation
   */
  private calculateBaselinePerformance(): PerformanceMetrics {
    const { baseCarSpecs: specs, currentTune: tune } = this;

    // Base calculations using existing physics
    const zeroToSixty = estimateZeroToSixty(
      specs.horsepower || 400,
      specs.weight,
      this.getTireGripMultiplier(),
      undefined,
      0.1
    );

    const topSpeed = estimateTopSpeed(
      specs.horsepower || 400,
      specs.weight,
      this.getAerodynamicDrag(),
      this.getEffectiveFrontalArea()
    );

    // Enhanced handling calculations
    const handlingScore = this.calculateHandlingScore();
    const understeerTendency = this.calculateUndersteerTendency();
    const stabilityScore = this.calculateStabilityScore();

    // Advanced metrics
    const corneringGrip = this.calculateCorneringGrip();
    const brakingPower = this.calculateBrakingPower();
    const tractionControl = this.calculateTractionControl();

    return {
      zeroToSixty,
      zeroToHundred: estimateZeroToHundred(zeroToSixty),
      quarterMile: this.calculateQuarterMile(zeroToSixty, topSpeed),
      topSpeed,
      topSpeedWithAero: this.calculateTopSpeedWithAero(topSpeed),
      handlingScore,
      understeerTendency,
      stabilityScore,
      fuelEfficiency: this.calculateFuelEfficiency(),
      tireWearRate: this.calculateTireWearRate(),
      corneringGrip,
      brakingPower,
      tractionControl
    };
  }

  /**
   * Apply performance degradation based on lap progress
   */
  private applyPerformanceDegradation(baseline: PerformanceMetrics, lapProgress: number): PerformanceMetrics {
    if (lapProgress === 0) return baseline;

    const degradation = { ...baseline };

    // Tire grip degradation (5-15% loss over race distance)
    const tireDegradation = Math.min(0.15, lapProgress * 0.08);
    degradation.corneringGrip *= (1 - tireDegradation);
    degradation.handlingScore *= (1 - tireDegradation * 0.5);

    // Brake performance degradation (thermal fade)
    const brakeDegradation = Math.min(0.1, lapProgress * 0.05);
    degradation.brakingPower *= (1 - brakeDegradation);

    // Fuel weight reduction (slight performance gain)
    const fuelWeightReduction = lapProgress * 0.02; // Assume 2% fuel weight loss
    degradation.zeroToSixty *= (1 - fuelWeightReduction * 0.1);
    degradation.topSpeed *= (1 + fuelWeightReduction * 0.05);

    // Tire wear effects
    const tireWear = lapProgress * 0.3; // 30% wear over full lap
    degradation.tireWearRate = tireWear;
    degradation.stabilityScore *= (1 - tireWear * 0.1);

    return degradation;
  }

  /**
   * Calculate environmental impact on performance
   */
  private calculateEnvironmentalImpact(baseline: PerformanceMetrics): Partial<PerformanceMetrics> {
    const impact: Partial<PerformanceMetrics> = {};
    const env = this.environmentalConditions;

    // Temperature effects
    if (env.temperature < 15) {
      // Cold conditions reduce grip and performance
      impact.corneringGrip = baseline.corneringGrip * -0.15; // 15% reduction
      impact.zeroToSixty = baseline.zeroToSixty * 0.05; // 5% slower
    } else if (env.temperature > 30) {
      // Hot conditions increase rolling resistance
      impact.topSpeed = baseline.topSpeed * -0.02; // 2% slower
      impact.fuelEfficiency = baseline.fuelEfficiency * -0.08; // 8% worse
    }

    // Humidity effects
    if (env.humidity > 80) {
      impact.corneringGrip = (impact.corneringGrip || 0) + (baseline.corneringGrip * -0.1);
      impact.brakingPower = baseline.brakingPower * -0.05;
    }

    // Track conditions
    switch (env.trackConditions) {
      case 'damp':
        impact.corneringGrip = (impact.corneringGrip || 0) + (baseline.corneringGrip * -0.2);
        impact.brakingPower = baseline.brakingPower * -0.1;
        break;
      case 'wet':
        impact.corneringGrip = (impact.corneringGrip || 0) + (baseline.corneringGrip * -0.4);
        impact.brakingPower = baseline.brakingPower * -0.15;
        impact.zeroToSixty = baseline.zeroToSixty * 0.15;
        break;
      case 'flooded':
        impact.corneringGrip = (impact.corneringGrip || 0) + (baseline.corneringGrip * -0.7);
        impact.brakingPower = baseline.brakingPower * -0.3;
        impact.zeroToSixty = baseline.zeroToSixty * 0.3;
        break;
    }

    // Wind effects on aerodynamics
    if (env.windSpeed > 20) {
      impact.topSpeed = baseline.topSpeed * -0.05; // Headwind reduces top speed
      impact.fuelEfficiency = baseline.fuelEfficiency * -0.05;
    }

    return impact;
  }

  /**
   * Calculate prediction confidence based on data completeness
   */
  private calculatePredictionConfidence(): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for incomplete data
    if (!this.baseCarSpecs.horsepower) confidence *= 0.9;
    if (!this.baseCarSpecs.hasAero) confidence *= 0.95;
    if (this.environmentalConditions.temperature === 20) confidence *= 0.98; // Default value

    // Increase confidence for detailed tuning
    if (this.currentTune.aeroFront > 0) confidence *= 1.05;
    if (this.currentTune.tirePressureFront !== this.currentTune.tirePressureRear) confidence *= 1.02;

    return Math.min(0.95, Math.max(0.6, confidence));
  }

  /**
   * Identify performance limiting factors
   */
  private identifyLimitingFactors(performance: PerformanceMetrics): string[] {
    const factors: string[] = [];

    if (performance.handlingScore < 6) {
      factors.push('Suspension setup limiting cornering performance');
    }

    if (performance.brakingPower < 7) {
      factors.push('Brake system not optimized for track use');
    }

    if (performance.tireWearRate > 0.8) {
      factors.push('Tire compound may not last full race distance');
    }

    if (performance.fuelEfficiency < 8) {
      factors.push('Aerodynamic drag significantly impacting efficiency');
    }

    if (Math.abs(performance.understeerTendency) > 2) {
      factors.push('Balance heavily biased - may cause handling issues');
    }

    if (performance.topSpeed < 180) {
      factors.push('Power-to-weight ratio limiting straight-line speed');
    }

    return factors.length > 0 ? factors : ['Setup appears well-balanced'];
  }

  /**
   * Generate intelligent recommendations
   */
  private generateRecommendations(
    baseline: PerformanceMetrics,
    environmentalImpact: Partial<PerformanceMetrics>
  ): string[] {
    const recommendations: string[] = [];

    if (baseline.handlingScore < 7) {
      recommendations.push('Consider stiffer front anti-roll bar to improve turn-in response');
    }

    if (baseline.brakingPower < 8) {
      recommendations.push('Increase brake pressure and bias for better stopping power');
    }

    if (baseline.tireWearRate > 0.7) {
      recommendations.push('Switch to harder tire compound or increase pressures');
    }

    if (environmentalImpact.corneringGrip && environmentalImpact.corneringGrip < -0.2) {
      recommendations.push('Weather conditions require softer tire pressures for better grip');
    }

    if (baseline.zeroToSixty > 6) {
      recommendations.push('Consider gear ratio optimization for better acceleration');
    }

    if (baseline.topSpeed < 190 && this.currentTune.aeroFront < 50) {
      recommendations.push('Add front wing angle to reduce drag and increase top speed');
    }

    return recommendations.length > 0 ? recommendations : ['Current setup is well-optimized'];
  }

  // Helper calculation methods
  private getTireGripMultiplier(): number {
    const tireCompound = this.baseCarSpecs.tireCompound;
    const multipliers: Record<string, number> = {
      'street': 0.85,
      'sport': 1.0,
      'semi-slick': 1.15,
      'slick': 1.25,
      'rally': 0.95,
      'offroad': 0.8,
      'drag': 1.1
    };
    return multipliers[tireCompound] || 1.0;
  }

  private getAerodynamicDrag(): number {
    return this.baseCarSpecs.hasAero ? 0.32 : 0.35;
  }

  private getEffectiveFrontalArea(): number {
    return this.baseCarSpecs.hasAero ? 22 : 24;
  }

  private calculateHandlingScore(): number {
    const { currentTune: tune } = this;
    let score = 7; // Base score

    // ARB balance affects handling
    const arbBalance = Math.abs(tune.arbFront - tune.arbRear);
    score -= arbBalance * 0.1;

    // Camber affects grip
    if (tune.camberFront < -2.5) score += 0.5;
    if (tune.camberRear < -2.0) score += 0.5;

    // Toe settings affect turn-in
    if (Math.abs(tune.toeFront) > 0.2) score += 0.3;

    return Math.max(1, Math.min(10, score));
  }

  private calculateUndersteerTendency(): number {
    const { currentTune: tune, baseCarSpecs: specs } = this;

    // Weight distribution bias
    const weightBias = (specs.weightDistribution - 50) * 0.1;

    // ARB bias (stiffer front = more understeer)
    const arbBias = (tune.arbFront - tune.arbRear) * 0.05;

    // Aero bias
    const aeroBias = (tune.aeroFront - tune.aeroRear) * 0.02;

    return Math.max(-5, Math.min(5, weightBias + arbBias + aeroBias));
  }

  private calculateStabilityScore(): number {
    const { currentTune: tune } = this;
    let score = 7;

    // Differential lock affects stability
    if (tune.diffAccelRear > 80) score += 0.5;
    if (tune.diffDecelRear > 60) score += 0.3;

    // ARB stiffness affects stability
    const avgArb = (tune.arbFront + tune.arbRear) / 2;
    score += (avgArb - 50) * 0.02;

    return Math.max(1, Math.min(10, score));
  }

  private calculateCorneringGrip(): number {
    const baseGrip = this.getTireGripMultiplier();
    const camberBonus = (Math.abs(this.currentTune.camberFront) - 2) * 0.05;
    const pressureBonus = (this.currentTune.tirePressureFront - 30) * 0.01;

    return Math.max(0.5, Math.min(2.0, baseGrip + camberBonus + pressureBonus));
  }

  private calculateBrakingPower(): number {
    const pressure = this.currentTune.brakePressure;
    const bias = this.currentTune.brakeBalance;

    // Optimal bias around 52-55% front
    const biasEfficiency = 1 - Math.abs(bias - 53) * 0.02;

    return Math.max(1, Math.min(10, (pressure / 10) * biasEfficiency));
  }

  private calculateTractionControl(): number {
    const diffLock = this.currentTune.diffAccelRear;
    const tirePressure = this.currentTune.tirePressureRear;

    // Higher diff lock and optimal pressure improve traction
    const diffBonus = diffLock / 100;
    const pressureBonus = Math.max(0, 1 - Math.abs(tirePressure - 32) * 0.03);

    return Math.max(1, Math.min(10, 7 + diffBonus + pressureBonus));
  }

  private calculateFuelEfficiency(): number {
    const weight = this.baseCarSpecs.weight;
    const power = this.baseCarSpecs.horsepower || 400;
    const aeroDrag = this.getAerodynamicDrag();

    // Simplified fuel efficiency calculation
    const baseEfficiency = power / (weight / 1000) / aeroDrag * 10;

    return Math.max(5, Math.min(25, baseEfficiency));
  }

  private calculateTireWearRate(): number {
    const camberWear = Math.abs(this.currentTune.camberFront) * 0.02;
    const pressureWear = Math.abs(this.currentTune.tirePressureFront - 32) * 0.01;
    const loadWear = (this.baseCarSpecs.weight / 3000) * 0.5;

    return Math.max(0.1, Math.min(2.0, camberWear + pressureWear + loadWear));
  }

  private calculateQuarterMile(zeroToSixty: number, topSpeed: number): { time: number; speed: number } {
    // Empirical formula based on 0-60 time and top speed
    const time = zeroToSixty * 1.35 + (400 / Math.min(topSpeed, 160)) * 0.8;
    const speed = Math.min(topSpeed, 160) * 0.95;

    return { time: Math.round(time * 100) / 100, speed: Math.round(speed) };
  }

  private calculateTopSpeedWithAero(topSpeed: number): number {
    if (!this.baseCarSpecs.hasAero) return topSpeed;

    // Aero typically reduces top speed by 2-5% due to drag
    return Math.round(topSpeed * 0.97);
  }

  private getDefaultEnvironmentalConditions(): EnvironmentalConditions {
    return {
      temperature: 20, // Celsius
      humidity: 50, // %
      pressure: 1013, // hPa
      windSpeed: 5, // km/h
      trackTemperature: 25, // Celsius
      trackConditions: 'dry',
      timeOfDay: 'day'
    };
  }

  /**
   * Update environmental conditions
   */
  public updateEnvironmentalConditions(conditions: Partial<EnvironmentalConditions>): void {
    this.environmentalConditions = { ...this.environmentalConditions, ...conditions };
  }

  /**
   * Compare two performance predictions
   */
  public comparePredictions(prediction1: PerformancePrediction, prediction2: PerformancePrediction) {
    const improvements: Record<string, number> = {};

    // Calculate percentage improvements
    Object.keys(prediction1.baseline).forEach(key => {
      const k = key as keyof PerformanceMetrics;
      const val1 = prediction1.baseline[k] as number;
      const val2 = prediction2.baseline[k] as number;

      if (typeof val1 === 'number' && typeof val2 === 'number' && val1 !== 0) {
        // For metrics where higher is better
        if (['handlingScore', 'stabilityScore', 'corneringGrip', 'brakingPower', 'tractionControl', 'fuelEfficiency'].includes(key)) {
          improvements[key] = ((val2 - val1) / val1) * 100;
        }
        // For metrics where lower is better
        else if (['zeroToSixty', 'tireWearRate'].includes(key)) {
          improvements[key] = ((val1 - val2) / val1) * 100;
        }
      }
    });

    return {
      improvements,
      winner: this.determineBetterPrediction(prediction1, prediction2),
      tradeoffs: this.analyzeTradeoffs(prediction1.baseline, prediction2.baseline)
    };
  }

  private determineBetterPrediction(pred1: PerformancePrediction, pred2: PerformancePrediction): 'prediction1' | 'prediction2' | 'tie' {
    const score1 = this.calculateOverallScore(pred1.baseline);
    const score2 = this.calculateOverallScore(pred2.baseline);

    if (Math.abs(score1 - score2) < 0.05) return 'tie';
    return score1 > score2 ? 'prediction1' : 'prediction2';
  }

  private calculateOverallScore(perf: PerformanceMetrics): number {
    // Weighted scoring of key metrics
    return (
      (perf.handlingScore * 0.25) +
      (perf.stabilityScore * 0.2) +
      (perf.brakingPower * 0.15) +
      (perf.corneringGrip * 0.15) +
      ((11 - perf.zeroToSixty) * 0.15) + // Invert acceleration (lower time = higher score)
      ((perf.topSpeed - 150) / 50 * 0.1) // Normalize top speed contribution
    ) / 10;
  }

  private analyzeTradeoffs(perf1: PerformanceMetrics, perf2: PerformanceMetrics): string[] {
    const tradeoffs: string[] = [];

    // Check for speed vs handling tradeoffs
    if (perf1.zeroToSixty < perf2.zeroToSixty && perf1.handlingScore > perf2.handlingScore) {
      tradeoffs.push('Better acceleration but worse handling');
    }

    if (perf1.topSpeed > perf2.topSpeed && perf1.fuelEfficiency < perf2.fuelEfficiency) {
      tradeoffs.push('Higher top speed but worse fuel efficiency');
    }

    if (perf1.brakingPower > perf2.brakingPower && perf1.stabilityScore < perf2.stabilityScore) {
      tradeoffs.push('Better braking but reduced stability');
    }

    return tradeoffs;
  }
}

export default AdvancedPerformancePredictor;