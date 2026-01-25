/**
 * Validation Script for Advanced Performance Prediction & Optimization
 * Tests the new AI-powered tuning systems functionality
 */

import { CarSpecs, TuneSettings } from './tuningCalculator';
import { AdvancedPerformancePredictor, EnvironmentalConditions } from './advancedPerformancePredictor';
import { MultiVariableOptimizer } from './multiVariableOptimizer';
import { findForzaCar } from '../data/forzaCarDatabase';

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

// Validation results
interface ValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  data?: any;
}

class AdvancedFeaturesValidator {
  private results: ValidationResult[] = [];

  log(testName: string, passed: boolean, message: string, data?: any) {
    this.results.push({ testName, passed, message, data });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${message}`);
    if (data) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  async validateAdvancedPerformancePredictor() {
    console.log('\n🧠 Testing Advanced Performance Predictor...');

    try {
      const predictor = new AdvancedPerformancePredictor(
        testCarSpecs,
        testTune,
        testEnvironmentalConditions
      );

      // Test 1: Basic prediction
      const prediction = predictor.predictPerformance();
      const hasRequiredProps = prediction.baseline && prediction.withDegradation &&
                             prediction.environmentalImpact && prediction.confidence;

      this.log(
        'Basic Prediction Structure',
        hasRequiredProps,
        hasRequiredProps ? 'Prediction has all required properties' : 'Missing required properties',
        {
          hasBaseline: !!prediction.baseline,
          hasDegradation: !!prediction.withDegradation,
          hasEnvironmental: !!prediction.environmentalImpact,
          confidence: prediction.confidence
        }
      );

      // Test 2: Performance ranges
      const baseline = prediction.baseline;
      const reasonableRanges = baseline.zeroToSixty > 0 && baseline.zeroToSixty < 15 &&
                              baseline.topSpeed > 150 && baseline.handlingScore >= 0 && baseline.handlingScore <= 10;

      this.log(
        'Performance Ranges',
        reasonableRanges,
        reasonableRanges ? 'All metrics within reasonable ranges' : 'Some metrics outside expected ranges',
        {
          zeroToSixty: baseline.zeroToSixty,
          topSpeed: baseline.topSpeed,
          handlingScore: baseline.handlingScore
        }
      );

      // Test 3: Degradation modeling
      const freshPrediction = predictor.predictPerformance(0);
      const degradedPrediction = predictor.predictPerformance(1.0); // Full lap progress
      const degradationWorks = degradedPrediction.withDegradation.zeroToSixty >= freshPrediction.baseline.zeroToSixty;

      this.log(
        'Performance Degradation',
        degradationWorks,
        degradationWorks ? 'Degradation correctly applied' : 'Degradation not working properly',
        {
          fresh: freshPrediction.baseline.zeroToSixty,
          degraded: degradedPrediction.withDegradation.zeroToSixty
        }
      );

      // Test 4: Environmental impact
      predictor.updateEnvironmentalConditions({ temperature: 5 });
      const coldPrediction = predictor.predictPerformance();
      const hasEnvironmentalImpact = coldPrediction.environmentalImpact &&
                                   Object.keys(coldPrediction.environmentalImpact).length > 0;

      this.log(
        'Environmental Impact',
        hasEnvironmentalImpact,
        hasEnvironmentalImpact ? 'Environmental factors affect performance' : 'No environmental impact detected'
      );

      // Test 5: Wet track conditions
      predictor.updateEnvironmentalConditions({ trackConditions: 'wet' });
      const wetPrediction = predictor.predictPerformance();
      const wetImpact = wetPrediction.environmentalImpact?.corneringGrip;
      const wetWorks = wetImpact && wetImpact < -0.2;

      this.log(
        'Wet Track Simulation',
        wetWorks,
        wetWorks ? 'Wet conditions significantly reduce grip' : 'Wet conditions not properly simulated',
        { gripImpact: wetImpact }
      );

    } catch (error) {
      this.log('Advanced Performance Predictor', false, `Error: ${error.message}`);
    }
  }

  async validateMultiVariableOptimizer() {
    console.log('\n🎯 Testing Multi-Variable Optimizer...');

    try {
      const optimizer = new MultiVariableOptimizer(
        testCarSpecs,
        testTune,
        testEnvironmentalConditions
      );

      // Test 1: Lap time optimization
      const lapTimeResult = optimizer.optimizeForLapTime();

      const hasRequiredProps = lapTimeResult.optimalTune && lapTimeResult.performance &&
                             lapTimeResult.score && lapTimeResult.parameterSensitivity;

      this.log(
        'Lap Time Optimization',
        hasRequiredProps,
        hasRequiredProps ? 'Optimization completed successfully' : 'Missing required result properties'
      );

      // Test 2: Brake bias optimization
      const brakeResult = optimizer.optimizeBrakeBias({ min: 50, max: 150 }, 'dry');

      const brakeValid = brakeResult.optimalBias >= 45 && brakeResult.optimalBias <= 60 &&
                        brakeResult.confidence > 0.5;

      this.log(
        'Brake Bias Optimization',
        brakeValid,
        brakeValid ? 'Found optimal brake bias within range' : 'Brake optimization out of range',
        {
          optimalBias: brakeResult.optimalBias,
          confidence: brakeResult.confidence
        }
      );

      // Test 3: Suspension optimization
      const neutralResult = optimizer.optimizeSuspension('neutral', 'medium');
      const firmResult = optimizer.optimizeSuspension('understeer', 'firm');

      const suspensionValid = firmResult.optimalTune.springsFront > neutralResult.optimalTune.springsFront;

      this.log(
        'Suspension Optimization',
        suspensionValid,
        suspensionValid ? 'Firm setup has stiffer springs than neutral' : 'Suspension optimization incorrect'
      );

      // Test 4: Multi-objective optimization
      const targets = [
        { name: 'lapTime' as const, weight: 0.6, priority: 'high' as const },
        { name: 'handling' as const, weight: 0.4, priority: 'medium' as const }
      ];

      const paretoFront = optimizer.optimizeMultiObjective(targets);

      const multiObjectiveValid = paretoFront.solutions && paretoFront.solutions.length > 0;

      this.log(
        'Multi-Objective Optimization',
        multiObjectiveValid,
        multiObjectiveValid ? `Found ${paretoFront.solutions.length} Pareto-optimal solutions` : 'No Pareto solutions found'
      );

      // Test 5: Parameter sensitivity
      const sensitivity = lapTimeResult.parameterSensitivity;
      const hasSensitivity = sensitivity && Object.keys(sensitivity).length > 0;

      this.log(
        'Parameter Sensitivity',
        hasSensitivity,
        hasSensitivity ? 'Parameter sensitivity calculated' : 'No sensitivity data'
      );

    } catch (error) {
      this.log('Multi-Variable Optimizer', false, `Error: ${error.message}`);
    }
  }

  async validateIntegration() {
    console.log('\n🔗 Testing System Integration...');

    try {
      // Test 1: Forza car integration
      const forzaCar = findForzaCar('honda-civic-type-r');

      this.log(
        'Forza Car Database',
        !!forzaCar,
        forzaCar ? `Found ${forzaCar.name} in database` : 'Forza car not found'
      );

      if (forzaCar) {
        // Test 2: Integration with predictor
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
          testTune,
          testEnvironmentalConditions
        );

        const prediction = predictor.predictPerformance();
        const integrationWorks = prediction.baseline.zeroToSixty > 0 && prediction.confidence > 0;

        this.log(
          'Predictor + Forza Integration',
          integrationWorks,
          integrationWorks ? 'Successfully integrated with Forza data' : 'Integration failed'
        );
      }

      // Test 3: Performance under load
      const startTime = Date.now();
      let predictions = 0;

      for (let i = 0; i < 10; i++) {
        const predictor = new AdvancedPerformancePredictor(testCarSpecs, testTune, testEnvironmentalConditions);
        predictor.predictPerformance();
        predictions++;
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / predictions;
      const performanceOk = avgTime < 100; // Should be fast

      this.log(
        'Performance Under Load',
        performanceOk,
        performanceOk ? `${predictions} predictions in ${totalTime}ms (${avgTime.toFixed(1)}ms avg)` : 'Too slow',
        { totalTime, avgTime, predictions }
      );

    } catch (error) {
      this.log('System Integration', false, `Error: ${error.message}`);
    }
  }

  async validateBenchmarks() {
    console.log('\n📊 Testing Performance Benchmarks...');

    try {
      // Test 1: Honda Civic Type R benchmark
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

      // Real Honda Civic Type R: ~4.9 seconds 0-60, ~169 mph top speed
      const realisticAccel = prediction.baseline.zeroToSixty >= 4 && prediction.baseline.zeroToSixty <= 7;
      const realisticSpeed = prediction.baseline.topSpeed >= 160 && prediction.baseline.topSpeed <= 180;

      this.log(
        'Honda Civic Type R Benchmark',
        realisticAccel && realisticSpeed,
        realisticAccel && realisticSpeed ? 'Performance predictions realistic' : 'Predictions not realistic',
        {
          predictedZeroToSixty: prediction.baseline.zeroToSixty,
          predictedTopSpeed: prediction.baseline.topSpeed,
          expectedZeroToSixty: '4.9s',
          expectedTopSpeed: '169 mph'
        }
      );

      // Test 2: Parameter impact validation
      const basePrediction = predictor.predictPerformance();

      // Test aero impact
      const aeroTune = { ...testTune, aeroFront: 80, aeroRear: 90 };
      const aeroPredictor = new AdvancedPerformancePredictor(civicSpecs, aeroTune, testEnvironmentalConditions);
      const aeroPrediction = aeroPredictor.predictPerformance();

      const aeroImpactValid = aeroPrediction.baseline.handlingScore > basePrediction.baseline.handlingScore &&
                             aeroPrediction.baseline.topSpeed < basePrediction.baseline.topSpeed;

      this.log(
        'Parameter Impact Validation',
        aeroImpactValid,
        aeroImpactValid ? 'Aero correctly improves handling but reduces top speed' : 'Parameter impact incorrect'
      );

    } catch (error) {
      this.log('Performance Benchmarks', false, `Error: ${error.message}`);
    }
  }

  async runAllValidations() {
    console.log('🚀 Starting Advanced Features Validation...\n');

    await this.validateAdvancedPerformancePredictor();
    await this.validateMultiVariableOptimizer();
    await this.validateIntegration();
    await this.validateBenchmarks();

    this.printSummary();
  }

  private printSummary() {
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('=' .repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const successRate = ((passed / total) * 100).toFixed(1);

    console.log(`✅ Passed: ${passed}/${total} (${successRate}%)`);

    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Advanced features are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Review the issues above.');
    }

    // Show failed tests
    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failed.forEach(test => {
        console.log(`  - ${test.testName}: ${test.message}`);
      });
    }

    console.log('\n📈 SYSTEM STATUS: ' + (passed === total ? '✅ READY FOR PRODUCTION' : '⚠️  NEEDS FIXES'));
  }
}

// Export for use in browser console or other scripts
export const validateAdvancedFeatures = async () => {
  const validator = new AdvancedFeaturesValidator();
  await validator.runAllValidations();
  return validator;
};

// Auto-run if this script is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - make available globally
  (window as any).validateAdvancedFeatures = validateAdvancedFeatures;
  console.log('🔧 Advanced Features Validator loaded. Run validateAdvancedFeatures() to test.');
} else {
  // Node.js environment - run automatically
  validateAdvancedFeatures();
}