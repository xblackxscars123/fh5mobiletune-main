/**
 * Comprehensive Test Suite for Advanced Performance Prediction & Optimization
 * Validates the new AI-powered tuning systems for Forza Horizon 5
 */

import { CarSpecs, TuneSettings } from '../tuningCalculator';
import { AdvancedPerformancePredictor, EnvironmentalConditions } from '../advancedPerformancePredictor';
import { MultiVariableOptimizer, OptimizationTarget, OptimizationConstraint } from '../multiVariableOptimizer';
import { findForzaCar } from '../../data/forzaCarDatabase';

// Test data
const testCarSpecs: CarSpecs = {
  weight: 3200,
  weightDistribution: 52,
  driveType: 'RWD',
  piClass: 'A',
  hasAero: true,
  frontDownforce: 150,
  rearDownforce: 200,
  tireCompound: 'sport',
  horsepower: 450
};

const testTune: TuneSettings = {
  tirePressureFront: 32,
  tirePressureRear: 32,
  finalDrive: 4.06,
  gearRatios: [3.82, 2.22, 1.61, 1.25, 1.00, 0.84],
  gearingNote: 'Test gearing',
  camberFront: -2.5,
  camberRear: -2.0,
  toeFront: 0.1,
  toeRear: -0.2,
  caster: 6.0,
  arbFront: 45,
  arbRear: 50,
  springsFront: 800,
  springsRear: 850,
  rideHeightFront: 4.5,
  rideHeightRear: 4.7,
  reboundFront: 12.5,
  reboundRear: 13.2,
  bumpFront: 8.5,
  bumpRear: 9.1,
  aeroFront: 45,
  aeroRear: 65,
  diffAccelFront: undefined,
  diffDecelFront: undefined,
  diffAccelRear: 55,
  diffDecelRear: 35,
  centerBalance: undefined,
  brakePressure: 90,
  brakeBalance: 52,
  brakeBalanceNote: 'Test brake setup'
};

const testEnvironmentalConditions: EnvironmentalConditions = {
  temperature: 22,
  humidity: 55,
  pressure: 1013,
  windSpeed: 8,
  trackTemperature: 28,
  trackConditions: 'dry',
  timeOfDay: 'day'
};

describe('Advanced Performance Prediction Engine', () => {
  let predictor: AdvancedPerformancePredictor;

  beforeEach(() => {
    predictor = new AdvancedPerformancePredictor(
      testCarSpecs,
      testTune,
      testEnvironmentalConditions
    );
  });

  test('should initialize correctly', () => {
    expect(predictor).toBeDefined();
    expect(typeof predictor.predictPerformance).toBe('function');
  });

  test('should generate comprehensive performance prediction', () => {
    const prediction = predictor.predictPerformance();

    expect(prediction).toHaveProperty('baseline');
    expect(prediction).toHaveProperty('withDegradation');
    expect(prediction).toHaveProperty('environmentalImpact');
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('limitingFactors');
    expect(prediction).toHaveProperty('recommendations');

    // Validate baseline performance structure
    const baseline = prediction.baseline;
    expect(baseline).toHaveProperty('zeroToSixty');
    expect(baseline).toHaveProperty('topSpeed');
    expect(baseline).toHaveProperty('handlingScore');
    expect(baseline).toHaveProperty('corneringGrip');
    expect(baseline).toHaveProperty('fuelEfficiency');

    // Validate reasonable ranges
    expect(baseline.zeroToSixty).toBeGreaterThan(0);
    expect(baseline.zeroToSixty).toBeLessThan(15); // Should be reasonable for 450hp car
    expect(baseline.topSpeed).toBeGreaterThan(150);
    expect(baseline.handlingScore).toBeGreaterThan(0);
    expect(baseline.handlingScore).toBeLessThanOrEqual(10);
  });

  test('should apply performance degradation correctly', () => {
    const fullLap = predictor.predictPerformance(1.0); // Full lap
    const fresh = predictor.predictPerformance(0); // Fresh tires

    // Performance should degrade over lap
    expect(fullLap.withDegradation.zeroToSixty).toBeGreaterThanOrEqual(fresh.baseline.zeroToSixty);
    expect(fullLap.withDegradation.handlingScore).toBeLessThanOrEqual(fresh.baseline.handlingScore);
    expect(fullLap.withDegradation.tireWearRate).toBeGreaterThan(fresh.baseline.tireWearRate);
  });

  test('should calculate environmental impact', () => {
    const prediction = predictor.predictPerformance();

    // Should have some environmental impact
    expect(prediction.environmentalImpact).toBeDefined();

    // Test cold weather impact
    predictor.updateEnvironmentalConditions({ temperature: 5 });
    const coldPrediction = predictor.predictPerformance();

    // Cold weather should affect performance
    expect(coldPrediction.environmentalImpact.corneringGrip).toBeDefined();
    expect(coldPrediction.environmentalImpact.zeroToSixty).toBeDefined();
  });

  test('should provide reasonable confidence levels', () => {
    const prediction = predictor.predictPerformance();

    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(0.95);
  });

  test('should generate useful recommendations', () => {
    const prediction = predictor.predictPerformance();

    expect(Array.isArray(prediction.recommendations)).toBe(true);

    if (prediction.recommendations.length > 0) {
      prediction.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(10); // Reasonable recommendation length
      });
    }
  });

  test('should identify limiting factors', () => {
    const prediction = predictor.predictPerformance();

    expect(Array.isArray(prediction.limitingFactors)).toBe(true);

    if (prediction.limitingFactors.length > 0) {
      prediction.limitingFactors.forEach(factor => {
        expect(typeof factor).toBe('string');
        expect(factor.length).toBeGreaterThan(5);
      });
    }
  });

  test('should handle wet track conditions', () => {
    predictor.updateEnvironmentalConditions({ trackConditions: 'wet' });
    const wetPrediction = predictor.predictPerformance();

    // Wet conditions should significantly impact grip
    expect(wetPrediction.environmentalImpact.corneringGrip).toBeDefined();
    expect(wetPrediction.environmentalImpact.corneringGrip!).toBeLessThan(-0.3); // At least 30% grip loss
  });
});

describe('Multi-Variable Optimizer', () => {
  let optimizer: MultiVariableOptimizer;

  beforeEach(() => {
    optimizer = new MultiVariableOptimizer(
      testCarSpecs,
      testTune,
      testEnvironmentalConditions
    );
  });

  test('should initialize correctly', () => {
    expect(optimizer).toBeDefined();
    expect(typeof optimizer.optimizeForTarget).toBe('function');
    expect(typeof optimizer.optimizeForLapTime).toBe('function');
  });

  test('should optimize for lap time', () => {
    const result = optimizer.optimizeForLapTime();

    expect(result).toHaveProperty('optimalTune');
    expect(result).toHaveProperty('performance');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('iterations');
    expect(result).toHaveProperty('parameterSensitivity');

    // Validate optimal tune structure
    expect(result.optimalTune).toHaveProperty('springsFront');
    expect(result.optimalTune).toHaveProperty('arbFront');
    expect(result.optimalTune).toHaveProperty('camberFront');

    // Score should be reasonable
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  test('should optimize brake bias', () => {
    const brakeResult = optimizer.optimizeBrakeBias(
      { min: 50, max: 150 },
      'dry'
    );

    expect(brakeResult).toHaveProperty('optimalBias');
    expect(brakeResult).toHaveProperty('performance');
    expect(brakeResult).toHaveProperty('confidence');

    // Bias should be within reasonable range
    expect(brakeResult.optimalBias).toBeGreaterThanOrEqual(45);
    expect(brakeResult.optimalBias).toBeLessThanOrEqual(60);

    expect(brakeResult.confidence).toBeGreaterThan(0.5);
  });

  test('should optimize suspension for different characteristics', () => {
    const neutralResult = optimizer.optimizeSuspension('neutral', 'medium');

    expect(neutralResult).toHaveProperty('optimalTune');
    expect(neutralResult).toHaveProperty('performance');
    expect(neutralResult.score).toBeGreaterThan(0);

    const firmResult = optimizer.optimizeSuspension('understeer', 'firm');

    // Firm setup should have stiffer springs
    expect(firmResult.optimalTune.springsFront).toBeGreaterThan(neutralResult.optimalTune.springsFront);
  });

  test('should perform multi-objective optimization', () => {
    const targets: OptimizationTarget[] = [
      { name: 'lapTime', weight: 0.6, priority: 'high' },
      { name: 'handling', weight: 0.4, priority: 'medium' }
    ];

    const paretoFront = optimizer.optimizeMultiObjective(targets);

    expect(paretoFront).toHaveProperty('solutions');
    expect(paretoFront).toHaveProperty('objectives');
    expect(Array.isArray(paretoFront.solutions)).toBe(true);
    expect(paretoFront.solutions.length).toBeGreaterThan(0);

    // Each solution should have required properties
    paretoFront.solutions.forEach(solution => {
      expect(solution).toHaveProperty('tune');
      expect(solution).toHaveProperty('performance');
      expect(solution).toHaveProperty('scores');
    });
  });

  test('should respect optimization constraints', () => {
    const constraints: OptimizationConstraint[] = [
      { parameter: 'springsFront', min: 500, max: 700 },
      { parameter: 'arbFront', min: 30, max: 50 }
    ];

    const result = optimizer.optimizeForTarget(
      { name: 'handling', weight: 1.0, priority: 'high' },
      constraints
    );

    // Should respect spring constraints
    expect(result.optimalTune.springsFront).toBeGreaterThanOrEqual(500);
    expect(result.optimalTune.springsFront).toBeLessThanOrEqual(700);

    // Should respect ARB constraints
    expect(result.optimalTune.arbFront).toBeGreaterThanOrEqual(30);
    expect(result.optimalTune.arbFront).toBeLessThanOrEqual(50);
  });

  test('should calculate parameter sensitivity', () => {
    const result = optimizer.optimizeForLapTime();

    expect(result.parameterSensitivity).toBeDefined();

    // Should have sensitivity values for key parameters
    expect(result.parameterSensitivity.springsFront).toBeDefined();
    expect(result.parameterSensitivity.arbFront).toBeDefined();
    expect(result.parameterSensitivity.camberFront).toBeDefined();

    // Sensitivity values should be reasonable
    Object.values(result.parameterSensitivity).forEach(sensitivity => {
      expect(typeof sensitivity).toBe('number');
      expect(sensitivity).toBeGreaterThanOrEqual(0);
    });
  });

  test('should analyze trade-offs', () => {
    const result = optimizer.optimizeForLapTime();

    expect(Array.isArray(result.tradeOffs)).toBe(true);

    if (result.tradeOffs.length > 0) {
      result.tradeOffs.forEach(tradeoff => {
        expect(tradeoff).toHaveProperty('description');
        expect(tradeoff).toHaveProperty('parameters');
        expect(tradeoff).toHaveProperty('impact');
        expect(typeof tradeoff.description).toBe('string');
        expect(Array.isArray(tradeoff.parameters)).toBe(true);
        expect(typeof tradeoff.impact).toBe('number');
      });
    }
  });
});

describe('Integration Tests', () => {
  test('should work with Forza car data', () => {
    const forzaCar = findForzaCar('honda-civic-type-r');
    expect(forzaCar).toBeDefined();

    if (forzaCar) {
      const forzaTune = testTune; // Use test tune for simplicity

      const predictor = new AdvancedPerformancePredictor(
        {
          weight: forzaCar.weight,
          weightDistribution: forzaCar.weightDistribution,
          driveType: 'RWD',
          piClass: forzaCar.class,
          hasAero: true,
          tireCompound: 'sport',
          horsepower: forzaCar.engine.power
        },
        forzaTune,
        testEnvironmentalConditions
      );

      const prediction = predictor.predictPerformance();

      expect(prediction.baseline.zeroToSixty).toBeGreaterThan(0);
      expect(prediction.baseline.topSpeed).toBeGreaterThan(150);
      expect(prediction.confidence).toBeGreaterThan(0.5);
    }
  });

  test('should handle edge cases gracefully', () => {
    // Test with minimal specs
    const minimalSpecs: CarSpecs = {
      weight: 2000,
      weightDistribution: 50,
      driveType: 'FWD',
      piClass: 'D',
      hasAero: false,
      tireCompound: 'street'
    };

    const predictor = new AdvancedPerformancePredictor(
      minimalSpecs,
      testTune,
      testEnvironmentalConditions
    );

    const prediction = predictor.predictPerformance();

    // Should still produce valid results
    expect(prediction.baseline.zeroToSixty).toBeGreaterThan(0);
    expect(prediction.baseline.handlingScore).toBeGreaterThan(0);
  });

  test('should maintain performance under stress', () => {
    const startTime = Date.now();

    // Run multiple predictions quickly
    for (let i = 0; i < 10; i++) {
      const prediction = predictor.predictPerformance();
      expect(prediction.baseline.zeroToSixty).toBeDefined();
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should complete 10 predictions in reasonable time (< 2 seconds)
    expect(totalTime).toBeLessThan(2000);
  });
});

describe('Performance Benchmarks', () => {
  test('should predict realistic performance for known cars', () => {
    // Test with Honda Civic Type R specs
    const civicSpecs: CarSpecs = {
      weight: 3130,
      weightDistribution: 60,
      driveType: 'RWD',
      piClass: 'S1',
      hasAero: true,
      tireCompound: 'sport',
      horsepower: 315
    };

    const predictor = new AdvancedPerformancePredictor(
      civicSpecs,
      testTune,
      testEnvironmentalConditions
    );

    const prediction = predictor.predictPerformance();

    // Honda Civic Type R 0-60 is ~4.9 seconds
    expect(prediction.baseline.zeroToSixty).toBeGreaterThan(4);
    expect(prediction.baseline.zeroToSixty).toBeLessThan(7);

    // Top speed should be reasonable
    expect(prediction.baseline.topSpeed).toBeGreaterThan(160);
    expect(prediction.baseline.topSpeed).toBeLessThan(200);
  });

  test('should show meaningful performance differences', () => {
    const basePrediction = predictor.predictPerformance();

    // Create modified tune with better aero
    const aeroTune = { ...testTune, aeroFront: 80, aeroRear: 90 };
    const aeroPredictor = new AdvancedPerformancePredictor(
      testCarSpecs,
      aeroTune,
      testEnvironmentalConditions
    );
    const aeroPrediction = aeroPredictor.predictPerformance();

    // Aero should improve handling but reduce top speed
    expect(aeroPrediction.baseline.handlingScore).toBeGreaterThan(basePrediction.baseline.handlingScore);
    expect(aeroPrediction.baseline.topSpeed).toBeLessThan(basePrediction.baseline.topSpeed);
  });
});

// Test utilities
export const createTestScenario = (
  carMods: Partial<CarSpecs> = {},
  tuneMods: Partial<TuneSettings> = {},
  envMods: Partial<EnvironmentalConditions> = {}
) => {
  const specs = { ...testCarSpecs, ...carMods };
  const tune = { ...testTune, ...tuneMods };
  const env = { ...testEnvironmentalConditions, ...envMods };

  return {
    specs,
    tune,
    env,
    predictor: new AdvancedPerformancePredictor(specs, tune, env),
    optimizer: new MultiVariableOptimizer(specs, tune, env)
  };
};

export default {
  createTestScenario
};