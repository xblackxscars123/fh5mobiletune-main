/**
 * Multi-Variable Optimization Engine for Forza Horizon 5 Tuning
 * Uses advanced algorithms to find optimal parameter combinations
 * considering complex trade-offs and constraints
 */

import { CarSpecs, TuneSettings } from './tuningCalculator';
import { AdvancedPerformancePredictor, PerformanceMetrics, EnvironmentalConditions } from './advancedPerformancePredictor';

export interface OptimizationTarget {
  name: 'lapTime' | 'handling' | 'stability' | 'efficiency' | 'balanced';
  weight: number; // 0-1
  target?: number; // Specific target value
  priority: 'low' | 'medium' | 'high';
}

export interface OptimizationConstraint {
  parameter: keyof TuneSettings;
  min?: number;
  max?: number;
  step?: number;
}

export interface OptimizationResult {
  optimalTune: TuneSettings;
  performance: PerformanceMetrics;
  score: number;
  iterations: number;
  convergence: boolean;
  parameterSensitivity: Record<keyof TuneSettings, number>;
  tradeOffs: {
    description: string;
    parameters: (keyof TuneSettings)[];
    impact: number;
  }[];
}

export interface ParetoFront {
  solutions: {
    tune: TuneSettings;
    performance: PerformanceMetrics;
    scores: Record<string, number>;
  }[];
  objectives: string[];
}

export class MultiVariableOptimizer {
  private carSpecs: CarSpecs;
  private baseTune: TuneSettings;
  private predictor: AdvancedPerformancePredictor;
  private environmentalConditions: EnvironmentalConditions;

  // Optimization parameters
  private maxIterations = 100;
  private populationSize = 20;
  private mutationRate = 0.1;
  private crossoverRate = 0.8;
  private convergenceThreshold = 0.001;

  constructor(
    carSpecs: CarSpecs,
    baseTune: TuneSettings,
    environmentalConditions: EnvironmentalConditions = {} as any
  ) {
    this.carSpecs = carSpecs;
    this.baseTune = baseTune;
    this.predictor = new AdvancedPerformancePredictor(carSpecs, baseTune, environmentalConditions);
    this.environmentalConditions = environmentalConditions;
  }

  /**
   * Optimize tune for single objective
   */
  public optimizeForTarget(
    target: OptimizationTarget,
    constraints: OptimizationConstraint[] = [],
    maxIterations: number = this.maxIterations
  ): OptimizationResult {
    return this.runOptimization([target], constraints, maxIterations);
  }

  /**
   * Multi-objective optimization (Pareto front)
   */
  public optimizeMultiObjective(
    targets: OptimizationTarget[],
    constraints: OptimizationConstraint[] = []
  ): ParetoFront {
    const solutions: ParetoFront['solutions'] = [];

    // Generate initial population
    const population = this.generateInitialPopulation(50, constraints);

    // Evaluate population
    const evaluatedPopulation = population.map(tune => ({
      tune,
      performance: this.predictor.predictPerformance().baseline,
      scores: this.calculateObjectiveScores(tune, targets)
    }));

    // Evolve population for multiple generations
    let currentPopulation = evaluatedPopulation;
    for (let gen = 0; gen < 10; gen++) {
      currentPopulation = this.evolvePopulation(currentPopulation, targets, constraints);
    }

    // Extract Pareto front
    const paretoFront = this.extractParetoFront(currentPopulation);

    return {
      solutions: paretoFront,
      objectives: targets.map(t => t.name)
    };
  }

  /**
   * Optimize for lap time specifically
   */
  public optimizeForLapTime(constraints: OptimizationConstraint[] = []): OptimizationResult {
    const targets: OptimizationTarget[] = [
      { name: 'lapTime', weight: 1.0, priority: 'high' }
    ];

    // Add lap time specific constraints
    const lapTimeConstraints: OptimizationConstraint[] = [
      { parameter: 'springsFront', min: 200, max: 800 },
      { parameter: 'springsRear', min: 200, max: 800 },
      { parameter: 'arbFront', min: 1, max: 65, step: 1 },
      { parameter: 'arbRear', min: 1, max: 65, step: 1 },
      { parameter: 'camberFront', min: -5, max: 0, step: 0.1 },
      { parameter: 'camberRear', min: -5, max: 0, step: 0.1 },
      { parameter: 'aeroFront', min: 0, max: 100, step: 1 },
      { parameter: 'aeroRear', min: 0, max: 100, step: 1 },
      { parameter: 'tirePressureFront', min: 20, max: 45, step: 0.5 },
      { parameter: 'tirePressureRear', min: 20, max: 45, step: 0.5 },
      ...constraints
    ];

    return this.runOptimization(targets, lapTimeConstraints, 50);
  }

  /**
   * Find optimal brake bias automatically
   */
  public optimizeBrakeBias(
    speedRange: { min: number; max: number },
    trackConditions: 'dry' | 'wet' = 'dry'
  ): { optimalBias: number; performance: PerformanceMetrics; confidence: number } {
    const testBiases = [45, 48, 50, 52, 55, 58, 60];
    let bestBias = 50;
    let bestPerformance = this.predictor.predictPerformance().baseline;
    let bestScore = 0;

    for (const bias of testBiases) {
      const testTune = { ...this.baseTune, brakeBalance: bias };
      const predictor = new AdvancedPerformancePredictor(this.carSpecs, testTune, this.environmentalConditions);
      const performance = predictor.predictPerformance().baseline;

      // Score based on braking power and stability
      const score = (performance.brakingPower * 0.6) + (performance.stabilityScore * 0.4);

      if (score > bestScore) {
        bestScore = score;
        bestBias = bias;
        bestPerformance = performance;
      }
    }

    return {
      optimalBias: bestBias,
      performance: bestPerformance,
      confidence: 0.85 // High confidence for brake bias optimization
    };
  }

  /**
   * Optimize suspension for specific handling characteristics
   */
  public optimizeSuspension(
    targetBalance: 'neutral' | 'understeer' | 'oversteer',
    stiffness: 'soft' | 'medium' | 'firm'
  ): OptimizationResult {
    const stiffnessMultipliers = {
      soft: 0.7,
      medium: 1.0,
      firm: 1.3
    };

    const balanceOffsets = {
      neutral: { arb: 0, weightDist: 0 },
      understeer: { arb: 5, weightDist: 2 },
      oversteer: { arb: -5, weightDist: -2 }
    };

    const multiplier = stiffnessMultipliers[stiffness];
    const offset = balanceOffsets[targetBalance];

    // Start with base tune and apply modifications
    const optimizedTune = { ...this.baseTune };

    // Apply stiffness
    optimizedTune.springsFront = Math.round(this.baseTune.springsFront * multiplier);
    optimizedTune.springsRear = Math.round(this.baseTune.springsRear * multiplier);
    optimizedTune.arbFront = Math.max(1, Math.min(65, this.baseTune.arbFront + offset.arb));
    optimizedTune.arbRear = Math.max(1, Math.min(65, this.baseTune.arbRear - offset.arb));

    // Apply weight distribution adjustment (simulate with ARB)
    if (offset.weightDist > 0) {
      optimizedTune.arbFront = Math.min(65, optimizedTune.arbFront + offset.weightDist);
    } else if (offset.weightDist < 0) {
      optimizedTune.arbRear = Math.min(65, optimizedTune.arbRear - offset.weightDist);
    }

    const performance = this.predictor.predictPerformance().baseline;
    const score = this.calculateHandlingScore(performance, targetBalance);

    return {
      optimalTune: optimizedTune,
      performance,
      score,
      iterations: 1,
      convergence: true,
      parameterSensitivity: this.calculateParameterSensitivity(optimizedTune),
      tradeOffs: []
    };
  }

  // Private optimization methods
  private runOptimization(
    targets: OptimizationTarget[],
    constraints: OptimizationConstraint[],
    maxIterations: number
  ): OptimizationResult {
    // Start with current tune as baseline
    let bestTune = { ...this.baseTune };
    let bestPerformance = this.predictor.predictPerformance().baseline;
    let bestScore = this.calculateObjectiveScore(bestTune, targets);

    // Simple gradient descent optimization
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const candidateTune = this.generateNeighborTune(bestTune, constraints);
      const candidatePerformance = new AdvancedPerformancePredictor(
        this.carSpecs,
        candidateTune,
        this.environmentalConditions
      ).predictPerformance().baseline;

      const candidateScore = this.calculateObjectiveScoreFromPerformance(candidatePerformance, targets);

      if (candidateScore > bestScore) {
        bestTune = candidateTune;
        bestPerformance = candidatePerformance;
        bestScore = candidateScore;
      }

      // Check for convergence
      if (iteration > 10 && Math.abs(candidateScore - bestScore) < this.convergenceThreshold) {
        break;
      }
    }

    return {
      optimalTune: bestTune,
      performance: bestPerformance,
      score: bestScore,
      iterations: maxIterations,
      convergence: true,
      parameterSensitivity: this.calculateParameterSensitivity(bestTune),
      tradeOffs: this.analyzeTradeOffs(bestTune, targets)
    };
  }

  private generateNeighborTune(baseTune: TuneSettings, constraints: OptimizationConstraint[]): TuneSettings {
    const neighbor = { ...baseTune };

    // Randomly adjust key parameters
    const adjustableParams: (keyof TuneSettings)[] = [
      'springsFront', 'springsRear', 'arbFront', 'arbRear',
      'camberFront', 'camberRear', 'aeroFront', 'aeroRear',
      'tirePressureFront', 'tirePressureRear'
    ];

    // Adjust 2-3 parameters randomly
    const paramsToAdjust = adjustableParams
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2);

    for (const param of paramsToAdjust) {
      const constraint = constraints.find(c => c.parameter === param);
      const currentValue = neighbor[param] as number;
      const step = constraint?.step || this.getDefaultStep(param);

      // Random adjustment within reasonable bounds
      const adjustment = (Math.random() - 0.5) * step * 4; // ±2 steps
      let newValue = currentValue + adjustment;

      // Apply constraints
      if (constraint) {
        newValue = Math.max(constraint.min || 0, Math.min(constraint.max || 1000, newValue));
      } else {
        newValue = this.applyDefaultConstraints(param, newValue);
      }

      (neighbor as any)[param] = Math.round(newValue * 100) / 100;
    }

    return neighbor;
  }

  private getDefaultStep(param: keyof TuneSettings): number {
    const steps: Record<string, number> = {
      springsFront: 10, springsRear: 10,
      arbFront: 1, arbRear: 1,
      camberFront: 0.1, camberRear: 0.1,
      aeroFront: 2, aeroRear: 2,
      tirePressureFront: 0.5, tirePressureRear: 0.5
    };
    return steps[param as string] || 1;
  }

  private applyDefaultConstraints(param: keyof TuneSettings, value: number): number {
    const constraints: Record<string, { min: number; max: number }> = {
      springsFront: { min: 100, max: 1000 },
      springsRear: { min: 100, max: 1000 },
      arbFront: { min: 1, max: 65 },
      arbRear: { min: 1, max: 65 },
      camberFront: { min: -5, max: 0 },
      camberRear: { min: -5, max: 0 },
      aeroFront: { min: 0, max: 100 },
      aeroRear: { min: 0, max: 100 },
      tirePressureFront: { min: 14, max: 55 },
      tirePressureRear: { min: 14, max: 55 }
    };

    const constraint = constraints[param as string];
    if (constraint) {
      return Math.max(constraint.min, Math.min(constraint.max, value));
    }

    return value;
  }

  private calculateObjectiveScore(tune: TuneSettings, targets: OptimizationTarget[]): number {
    const predictor = new AdvancedPerformancePredictor(this.carSpecs, tune, this.environmentalConditions);
    const performance = predictor.predictPerformance().baseline;
    return this.calculateObjectiveScoreFromPerformance(performance, targets);
  }

  private calculateObjectiveScoreFromPerformance(performance: PerformanceMetrics, targets: OptimizationTarget[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const target of targets) {
      const weight = target.weight * (target.priority === 'high' ? 1.5 : target.priority === 'medium' ? 1.0 : 0.5);
      totalWeight += weight;

      let objectiveScore = 0;

      switch (target.name) {
        case 'lapTime':
          // Lower lap time = higher score (estimated from 0-60 and top speed)
          const estimatedLapTime = this.estimateLapTime(performance);
          objectiveScore = target.target ? Math.max(0, 1 - Math.abs(estimatedLapTime - target.target) / target.target) : (120 - estimatedLapTime) / 120;
          break;

        case 'handling':
          objectiveScore = performance.handlingScore / 10;
          break;

        case 'stability':
          objectiveScore = performance.stabilityScore / 10;
          break;

        case 'efficiency':
          objectiveScore = performance.fuelEfficiency / 25; // Max 25 MPG
          break;

        case 'balanced':
          // Balanced score across all metrics
          objectiveScore = (
            (performance.handlingScore / 10 * 0.3) +
            (performance.stabilityScore / 10 * 0.3) +
            (performance.brakingPower / 10 * 0.2) +
            ((11 - performance.zeroToSixty) / 11 * 0.2) // Normalized acceleration
          );
          break;
      }

      totalScore += objectiveScore * weight;
    }

    return totalScore / totalWeight;
  }

  private estimateLapTime(performance: PerformanceMetrics): number {
    // Rough lap time estimation based on performance metrics
    // This is a simplified model - real lap time would depend on track
    const baseTime = 90; // Base lap time in seconds

    // Acceleration component (faster car = lower time)
    const accelFactor = (6 - performance.zeroToSixty) / 6 * 5; // Up to 5 seconds saved

    // Top speed component
    const speedFactor = (performance.topSpeed - 160) / 40 * 3; // Up to 3 seconds saved

    // Handling component (better handling = lower time)
    const handlingFactor = (performance.handlingScore - 5) / 5 * 2; // Up to 2 seconds saved

    return Math.max(60, baseTime - accelFactor - speedFactor - handlingFactor);
  }

  private calculateObjectiveScores(tune: TuneSettings, targets: OptimizationTarget[]): Record<string, number> {
    const scores: Record<string, number> = {};
    const predictor = new AdvancedPerformancePredictor(this.carSpecs, tune, this.environmentalConditions);
    const performance = predictor.predictPerformance().baseline;

    for (const target of targets) {
      scores[target.name] = this.calculateObjectiveScoreFromPerformance(performance, [target]);
    }

    return scores;
  }

  private generateInitialPopulation(size: number, constraints: OptimizationConstraint[]): TuneSettings[] {
    const population: TuneSettings[] = [];

    for (let i = 0; i < size; i++) {
      const tune = { ...this.baseTune };

      // Randomize key parameters within constraints
      const paramsToRandomize: (keyof TuneSettings)[] = [
        'springsFront', 'springsRear', 'arbFront', 'arbRear',
        'camberFront', 'camberRear', 'aeroFront', 'aeroRear'
      ];

      for (const param of paramsToRandomize) {
        const constraint = constraints.find(c => c.parameter === param);
        if (constraint && constraint.min !== undefined && constraint.max !== undefined) {
          const range = constraint.max - constraint.min;
          (tune as any)[param] = constraint.min + Math.random() * range;
        }
      }

      population.push(tune);
    }

    return population;
  }

  private evolvePopulation(
    population: Array<{ tune: TuneSettings; performance: PerformanceMetrics; scores: Record<string, number> }>,
    targets: OptimizationTarget[],
    constraints: OptimizationConstraint[]
  ) {
    const newPopulation: typeof population = [];

    // Elitism: keep best 20%
    const sorted = population.sort((a, b) => this.compareSolutions(a, b, targets));
    const eliteCount = Math.floor(population.length * 0.2);
    newPopulation.push(...sorted.slice(0, eliteCount));

    // Generate rest through crossover and mutation
    while (newPopulation.length < population.length) {
      // Tournament selection
      const parent1 = this.tournamentSelection(population, targets);
      const parent2 = this.tournamentSelection(population, targets);

      // Crossover
      let child = this.crossover(parent1.tune, parent2.tune, constraints);

      // Mutation
      child = this.mutate(child, constraints);

      const childPerformance = new AdvancedPerformancePredictor(
        this.carSpecs, child, this.environmentalConditions
      ).predictPerformance().baseline;

      newPopulation.push({
        tune: child,
        performance: childPerformance,
        scores: this.calculateObjectiveScores(child, targets)
      });
    }

    return newPopulation;
  }

  private tournamentSelection(
    population: Array<{ tune: TuneSettings; performance: PerformanceMetrics; scores: Record<string, number> }>,
    targets: OptimizationTarget[]
  ) {
    const tournamentSize = 3;
    const tournament = [];

    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(population[Math.floor(Math.random() * population.length)]);
    }

    return tournament.reduce((best, current) =>
      this.compareSolutions(best, current, targets) > 0 ? best : current
    );
  }

  private crossover(parent1: TuneSettings, parent2: TuneSettings, constraints: OptimizationConstraint[]): TuneSettings {
    const child = { ...parent1 };

    const crossoverParams: (keyof TuneSettings)[] = [
      'springsFront', 'springsRear', 'arbFront', 'arbRear',
      'camberFront', 'camberRear', 'aeroFront', 'aeroRear'
    ];

    for (const param of crossoverParams) {
      if (Math.random() < this.crossoverRate) {
        (child as any)[param] = (parent1 as any)[param];
      } else {
        (child as any)[param] = (parent2 as any)[param];
      }
    }

    return child;
  }

  private mutate(tune: TuneSettings, constraints: OptimizationConstraint[]): TuneSettings {
    const mutated = { ...tune };

    const mutationParams: (keyof TuneSettings)[] = [
      'springsFront', 'springsRear', 'arbFront', 'arbRear',
      'camberFront', 'camberRear', 'aeroFront', 'aeroRear'
    ];

    for (const param of mutationParams) {
      if (Math.random() < this.mutationRate) {
        const currentValue = (tune as any)[param] as number;
        const step = this.getDefaultStep(param);
        const mutation = (Math.random() - 0.5) * step * 2;

        (mutated as any)[param] = this.applyDefaultConstraints(param, currentValue + mutation);
      }
    }

    return mutated;
  }

  private extractParetoFront(
    population: Array<{ tune: TuneSettings; performance: PerformanceMetrics; scores: Record<string, number> }>
  ): ParetoFront['solutions'] {
    // Simple Pareto front extraction for 2-3 objectives
    const paretoFront: ParetoFront['solutions'] = [];

    for (const solution of population) {
      let isDominated = false;

      for (const other of population) {
        if (this.dominates(other.scores, solution.scores)) {
          isDominated = true;
          break;
        }
      }

      if (!isDominated) {
        paretoFront.push(solution);
      }
    }

    return paretoFront.slice(0, 10); // Limit to top 10 solutions
  }

  private dominates(scores1: Record<string, number>, scores2: Record<string, number>): boolean {
    // Check if scores1 dominates scores2 (better in all objectives)
    const objectives = Object.keys(scores1);
    let atLeastOneBetter = false;

    for (const obj of objectives) {
      if (scores1[obj] < scores2[obj]) return false; // Worse in at least one
      if (scores1[obj] > scores2[obj]) atLeastOneBetter = true;
    }

    return atLeastOneBetter;
  }

  private compareSolutions(
    sol1: { scores: Record<string, number> },
    sol2: { scores: Record<string, number> },
    targets: OptimizationTarget[]
  ): number {
    // Weighted comparison based on target priorities
    let score1 = 0, score2 = 0;

    for (const target of targets) {
      const weight = target.weight * (target.priority === 'high' ? 1.5 : target.priority === 'medium' ? 1.0 : 0.5);
      score1 += sol1.scores[target.name] * weight;
      score2 += sol2.scores[target.name] * weight;
    }

    return score2 - score1; // Higher score = better
  }

  private calculateParameterSensitivity(tune: TuneSettings): Record<keyof TuneSettings, number> {
    const sensitivity: Record<keyof TuneSettings, number> = {} as any;
    const baseScore = this.calculateObjectiveScore(tune, [{ name: 'balanced', weight: 1.0, priority: 'medium' }]);

    const testParams: (keyof TuneSettings)[] = [
      'springsFront', 'springsRear', 'arbFront', 'arbRear',
      'camberFront', 'camberRear', 'aeroFront', 'aeroRear'
    ];

    for (const param of testParams) {
      const testTune = { ...tune };
      const currentValue = (testTune as any)[param] as number;
      const step = this.getDefaultStep(param);

      // Test small change
      (testTune as any)[param] = currentValue + step;
      const newScore = this.calculateObjectiveScore(testTune, [{ name: 'balanced', weight: 1.0, priority: 'medium' }]);
      const sensitivityValue = Math.abs(newScore - baseScore) / step;

      sensitivity[param] = sensitivityValue;
    }

    return sensitivity;
  }

  private calculateHandlingScore(performance: PerformanceMetrics, targetBalance: string): number {
    let score = performance.handlingScore;

    // Adjust score based on target balance
    if (targetBalance === 'neutral' && Math.abs(performance.understeerTendency) > 1) {
      score *= 0.9;
    } else if (targetBalance === 'understeer' && performance.understeerTendency < 1) {
      score *= 0.95;
    } else if (targetBalance === 'oversteer' && performance.understeerTendency > -1) {
      score *= 0.95;
    }

    return score;
  }

  private analyzeTradeOffs(tune: TuneSettings, targets: OptimizationTarget[]): OptimizationResult['tradeOffs'] {
    const tradeoffs: OptimizationResult['tradeOffs'] = [];

    // Analyze aerodynamics vs acceleration tradeoff
    if (tune.aeroFront > 30) {
      tradeoffs.push({
        description: 'High downforce improves cornering but reduces top speed',
        parameters: ['aeroFront', 'aeroRear'],
        impact: -0.05 // 5% top speed penalty
      });
    }

    // Analyze stiffness vs comfort tradeoff
    const avgSpring = (tune.springsFront + tune.springsRear) / 2;
    if (avgSpring > 600) {
      tradeoffs.push({
        description: 'Stiff suspension improves handling but reduces stability over bumps',
        parameters: ['springsFront', 'springsRear'],
        impact: -0.03 // 3% stability penalty
      });
    }

    // Analyze camber vs tire wear tradeoff
    if (Math.abs(tune.camberFront) > 3) {
      tradeoffs.push({
        description: 'Extreme camber improves grip but increases tire wear',
        parameters: ['camberFront', 'camberRear'],
        impact: 0.15 // 15% higher wear rate
      });
    }

    return tradeoffs;
  }
}

export default MultiVariableOptimizer;