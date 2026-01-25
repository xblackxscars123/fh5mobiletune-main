/**
 * Phase 2: Intelligence & Learning - Comprehensive Validation Tests
 * Tests Machine Learning Integration and Advanced Environmental Modeling
 */

import { MachineLearningIntegration, TuneDataPoint } from '../machineLearningIntegration';
import { AdvancedEnvironmentalModeling, EnvironmentalConditions } from '../advancedEnvironmentalModeling';
import { AdvancedPerformancePredictor } from '../advancedPerformancePredictor';
import { CarSpecs, TuneSettings } from '../tuningCalculator';

describe('Phase 2: Intelligence & Learning Validation', () => {
  let mlIntegration: MachineLearningIntegration;
  let envModeling: AdvancedEnvironmentalModeling;
  let predictor: AdvancedPerformancePredictor;

  beforeEach(() => {
    predictor = new AdvancedPerformancePredictor();
    mlIntegration = new MachineLearningIntegration(predictor);
    envModeling = new AdvancedEnvironmentalModeling();

    // Add some test data to the ML system
    const testTunes: TuneDataPoint[] = [
      {
        id: 'test-1',
        car: {
          weight: 3100,
          weightDistribution: 52,
          driveType: 'RWD',
          piClass: 'A',
          hasAero: true,
          tireCompound: 'sport',
          horsepower: 450
        } as CarSpecs,
        carName: 'Honda Civic Type R',
        tune: {
          tirePressureFront: 30,
          tirePressureRear: 28,
          finalDrive: 3.8,
          gearRatios: [3.4, 2.1, 1.5, 1.1, 0.9, 0.8],
          gearingNote: 'Test gearing',
          camberFront: -2.0,
          camberRear: -1.5,
          toeFront: 0.1,
          toeRear: -0.2,
          caster: 6.0,
          arbFront: 45,
          arbRear: 38,
          springsFront: 550,
          springsRear: 580,
          rideHeightFront: 4.5,
          rideHeightRear: 4.7,
          reboundFront: 8.5,
          reboundRear: 9.2,
          bumpFront: 6.8,
          bumpRear: 7.2,
          aeroFront: 15,
          aeroRear: 20,
          diffAccelRear: 55,
          diffDecelRear: 28,
          brakePressure: 95,
          brakeBalance: 55,
          brakeBalanceNote: 'Test balance'
        } as TuneSettings,
        performance: {
          handlingScore: 8.5,
          stabilityScore: 7.8,
          brakingPower: 8.2,
          zeroToSixty: 4.2,
          topSpeed: 155,
          fuelEfficiency: 12.5,
          tireWearRate: 1.2,
          confidence: 0.85
        },
        trackId: 'goliath',
        userRating: 4,
        lapTime: 92.5,
        tags: ['circuit', 'performance'],
        submittedBy: 'test-user-1',
        timestamp: Date.now() - 86400000, // 1 day ago
        validated: true
      },
      {
        id: 'test-2',
        car: {
          weight: 2900,
          weightDistribution: 50,
          driveType: 'AWD',
          piClass: 'S1',
          hasAero: true,
          tireCompound: 'semi-slick',
          horsepower: 520
        } as CarSpecs,
        carName: 'Nissan GT-R',
        tune: {
          tirePressureFront: 32,
          tirePressureRear: 30,
          finalDrive: 3.9,
          gearRatios: [3.2, 2.0, 1.4, 1.0, 0.85, 0.75],
          gearingNote: 'Test gearing 2',
          camberFront: -1.8,
          camberRear: -1.3,
          toeFront: 0.0,
          toeRear: -0.1,
          caster: 6.2,
          arbFront: 52,
          arbRear: 45,
          springsFront: 620,
          springsRear: 650,
          rideHeightFront: 4.2,
          rideHeightRear: 4.4,
          reboundFront: 9.1,
          reboundRear: 9.8,
          bumpFront: 7.3,
          bumpRear: 7.7,
          aeroFront: 18,
          aeroRear: 22,
          diffAccelFront: 25,
          diffDecelFront: 5,
          diffAccelRear: 65,
          diffDecelRear: 35,
          centerBalance: 60,
          brakePressure: 98,
          brakeBalance: 58,
          brakeBalanceNote: 'Test balance 2'
        } as TuneSettings,
        performance: {
          handlingScore: 9.1,
          stabilityScore: 8.5,
          brakingPower: 8.8,
          zeroToSixty: 3.8,
          topSpeed: 165,
          fuelEfficiency: 11.8,
          tireWearRate: 1.5,
          confidence: 0.92
        },
        trackId: 'mountain-circuit',
        userRating: 5,
        lapTime: 145.2,
        tags: ['circuit', 'aero'],
        submittedBy: 'test-user-2',
        timestamp: Date.now() - 43200000, // 12 hours ago
        validated: true
      }
    ];

    testTunes.forEach(tune => mlIntegration.addTuneData(tune));
  });

  describe('Machine Learning Integration', () => {
    test('should provide smart recommendations based on community data', () => {
      const testCar: CarSpecs = {
        weight: 3000,
        weightDistribution: 51,
        driveType: 'RWD',
        piClass: 'A',
        hasAero: true,
        tireCompound: 'sport',
        horsepower: 480
      };

      const testTune: TuneSettings = {
        tirePressureFront: 31,
        tirePressureRear: 29,
        finalDrive: 3.85,
        gearRatios: [3.3, 2.05, 1.45, 1.05, 0.88, 0.78],
        gearingNote: 'Test',
        camberFront: -1.9,
        camberRear: -1.4,
        toeFront: 0.05,
        toeRear: -0.15,
        caster: 6.1,
        arbFront: 48,
        arbRear: 41,
        springsFront: 580,
        springsRear: 610,
        rideHeightFront: 4.4,
        rideHeightRear: 4.6,
        reboundFront: 8.8,
        reboundRear: 9.5,
        bumpFront: 7.0,
        bumpRear: 7.4,
        aeroFront: 16,
        aeroRear: 21,
        diffAccelRear: 58,
        diffDecelRear: 30,
        brakePressure: 96,
        brakeBalance: 56,
        brakeBalanceNote: 'Test'
      } as TuneSettings;

      const recommendations = mlIntegration.getSmartRecommendations(testCar, testTune, 'performance');

      expect(recommendations).toBeDefined();
      expect(recommendations.confidence).toBeGreaterThan(0);
      expect(recommendations.confidence).toBeLessThanOrEqual(1);
      expect(recommendations.reasoning).toBeInstanceOf(Array);
      expect(recommendations.reasoning.length).toBeGreaterThan(0);
      expect(recommendations.similarTunes).toBeInstanceOf(Array);
      expect(recommendations.predictedImprovement).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(recommendations.riskLevel);
    });

    test('should find similar tunes correctly', () => {
      const testCar: CarSpecs = {
        weight: 3100,
        weightDistribution: 52,
        driveType: 'RWD',
        piClass: 'A',
        hasAero: true,
        tireCompound: 'sport',
        horsepower: 450
      };

      const testTune: TuneSettings = {
        tirePressureFront: 30,
        tirePressureRear: 28,
        finalDrive: 3.8,
        gearRatios: [3.4, 2.1, 1.5, 1.1, 0.9, 0.8],
        gearingNote: 'Test',
        camberFront: -2.0,
        camberRear: -1.5,
        toeFront: 0.1,
        toeRear: -0.2,
        caster: 6.0,
        arbFront: 45,
        arbRear: 38,
        springsFront: 550,
        springsRear: 580,
        rideHeightFront: 4.5,
        rideHeightRear: 4.7,
        reboundFront: 8.5,
        reboundRear: 9.2,
        bumpFront: 6.8,
        bumpRear: 7.2,
        aeroFront: 15,
        aeroRear: 20,
        diffAccelRear: 55,
        diffDecelRear: 28,
        brakePressure: 95,
        brakeBalance: 55,
        brakeBalanceNote: 'Test'
      } as TuneSettings;

      const similarTunes = (mlIntegration as any).findSimilarTunes(testCar, testTune);

      expect(similarTunes).toBeInstanceOf(Array);
      expect(similarTunes.length).toBeGreaterThan(0);
      // Should find the first test tune as very similar
      expect(similarTunes[0].id).toBe('test-1');
    });

    test('should calculate confidence correctly', () => {
      const similarTunes: TuneDataPoint[] = [
        {
          id: 'validated-tune',
          car: {} as CarSpecs,
          carName: 'Test Car',
          tune: {} as TuneSettings,
          performance: {
            handlingScore: 8.0,
            stabilityScore: 7.5,
            brakingPower: 8.0,
            zeroToSixty: 4.5,
            topSpeed: 150,
            fuelEfficiency: 12.0,
            tireWearRate: 1.0,
            confidence: 0.8
          },
          submittedBy: 'user',
          timestamp: Date.now(),
          validated: true,
          userRating: 5
        }
      ];

      const confidence = (mlIntegration as any).calculateConfidence(similarTunes, {} as CarSpecs);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(0.95);
    });

    test('should export learned patterns', () => {
      const patterns = mlIntegration.exportLearnedPatterns();

      expect(patterns).toBeDefined();
      expect(patterns.totalTunes).toBeGreaterThan(0);
      expect(patterns.patternCache).toBeDefined();
      expect(patterns.communityStats).toBeDefined();
    });
  });

  describe('Advanced Environmental Modeling', () => {
    test('should calculate environmental effects for clear weather', () => {
      const conditions: EnvironmentalConditions = {
        weather: 'clear',
        temperature: 20,
        humidity: 50,
        windSpeed: 5,
        windDirection: 90,
        trackTemperature: 25,
        trackCondition: 'dry',
        timeOfDay: 'noon',
        altitude: 0,
        airPressure: 1013.25
      };

      const effects = envModeling.calculateEnvironmentalEffects(conditions);

      expect(effects).toBeDefined();
      expect(effects.tireGripMultiplier).toBeCloseTo(1.0, 1);
      expect(effects.aeroEfficiencyMultiplier).toBeCloseTo(1.0, 1);
      expect(effects.enginePowerMultiplier).toBeCloseTo(1.0, 1);
      expect(effects.predictedLapTimeAdjustment).toBeCloseTo(0, 1);
    });

    test('should calculate rain effects correctly', () => {
      const conditions: EnvironmentalConditions = {
        weather: 'rain',
        temperature: 15,
        humidity: 85,
        windSpeed: 10,
        windDirection: 0,
        trackTemperature: 12,
        trackCondition: 'wet',
        timeOfDay: 'afternoon',
        altitude: 100,
        airPressure: 1000
      };

      const effects = envModeling.calculateEnvironmentalEffects(conditions);

      expect(effects.tireGripMultiplier).toBeLessThan(1.0);
      expect(effects.brakePerformanceMultiplier).toBeLessThan(1.0);
      expect(effects.aeroEfficiencyMultiplier).toBeGreaterThan(1.0); // More drag
      expect(effects.tireWearRateMultiplier).toBeGreaterThan(1.0);
      expect(effects.predictedLapTimeAdjustment).toBeGreaterThan(0); // Slower lap
    });

    test('should calculate temperature effects on tire grip', () => {
      // Cold track
      const coldConditions: EnvironmentalConditions = {
        weather: 'clear',
        temperature: 5,
        humidity: 40,
        windSpeed: 0,
        windDirection: 0,
        trackTemperature: 8,
        trackCondition: 'dry',
        timeOfDay: 'morning',
        altitude: 0,
        airPressure: 1013.25
      };

      const coldEffects = envModeling.calculateEnvironmentalEffects(coldConditions);
      expect(coldEffects.tireGripMultiplier).toBeLessThan(1.0);

      // Hot track
      const hotConditions: EnvironmentalConditions = {
        weather: 'clear',
        temperature: 35,
        humidity: 30,
        windSpeed: 0,
        windDirection: 0,
        trackTemperature: 45,
        trackCondition: 'dry',
        timeOfDay: 'noon',
        altitude: 0,
        airPressure: 1013.25
      };

      const hotEffects = envModeling.calculateEnvironmentalEffects(hotConditions);
      expect(hotEffects.tireGripMultiplier).toBeLessThan(1.0);
      expect(hotEffects.coolingEfficiencyMultiplier).toBeGreaterThan(1.0);
    });

    test('should calculate wind effects on aerodynamics', () => {
      // Headwind
      const headwindConditions: EnvironmentalConditions = {
        weather: 'clear',
        temperature: 20,
        humidity: 50,
        windSpeed: 20,
        windDirection: 0, // Headwind
        trackTemperature: 25,
        trackCondition: 'dry',
        timeOfDay: 'afternoon',
        altitude: 0,
        airPressure: 1013.25
      };

      const headwindEffects = envModeling.calculateEnvironmentalEffects(headwindConditions);
      expect(headwindEffects.aeroEfficiencyMultiplier).toBeGreaterThan(1.0); // More drag

      // Tailwind
      const tailwindConditions: EnvironmentalConditions = {
        ...headwindConditions,
        windDirection: 180 // Tailwind
      };

      const tailwindEffects = envModeling.calculateEnvironmentalEffects(tailwindConditions);
      expect(tailwindEffects.aeroEfficiencyMultiplier).toBeLessThan(1.0); // Less drag
    });

    test('should predict race degradation correctly', () => {
      const conditions: EnvironmentalConditions = {
        weather: 'clear',
        temperature: 25,
        humidity: 60,
        windSpeed: 5,
        windDirection: 90,
        trackTemperature: 35,
        trackCondition: 'dry',
        timeOfDay: 'afternoon',
        altitude: 0,
        airPressure: 1013.25
      };

      const degradation = envModeling.predictRaceDegradation(conditions, 50, 'sport');

      expect(degradation.tireWear).toBeInstanceOf(Array);
      expect(degradation.performanceDrop).toBeInstanceOf(Array);
      expect(degradation.tireWear.length).toBeGreaterThan(1);
      expect(degradation.performanceDrop.length).toBeGreaterThan(1);
      expect(degradation.pitStopRecommendation).toBeDefined();

      // Tire wear should increase over distance
      expect(degradation.tireWear[degradation.tireWear.length - 1]).toBeGreaterThan(degradation.tireWear[0]);
    });

    test('should optimize setup for conditions', () => {
      const conditions: EnvironmentalConditions = {
        weather: 'rain',
        temperature: 15,
        humidity: 80,
        windSpeed: 15,
        windDirection: 0,
        trackTemperature: 12,
        trackCondition: 'wet',
        timeOfDay: 'afternoon',
        altitude: 0,
        airPressure: 1013.25
      };

      const baseSetup = {}; // Mock setup
      const optimization = envModeling.optimizeForConditions(baseSetup, conditions);

      expect(optimization.recommendedAdjustments).toBeDefined();
      expect(optimization.reasoning).toBeInstanceOf(Array);
      expect(optimization.expectedImprovement).toBeDefined();
      expect(optimization.expectedImprovement).toBeGreaterThanOrEqual(0);
    });

    test('should handle track-specific effects', () => {
      const conditions: EnvironmentalConditions = {
        weather: 'rain',
        temperature: 20,
        humidity: 70,
        windSpeed: 10,
        windDirection: 90,
        trackTemperature: 18,
        trackCondition: 'wet',
        timeOfDay: 'morning',
        altitude: 500,
        airPressure: 950
      };

      const effectsWithTrack = envModeling.calculateEnvironmentalEffects(conditions, 'rally-stage');
      const effectsWithoutTrack = envModeling.calculateEnvironmentalEffects(conditions);

      // Effects should be different with track-specific modeling
      expect(effectsWithTrack.tireGripMultiplier).not.toBe(effectsWithoutTrack.tireGripMultiplier);
    });

    test('should generate weather forecast', () => {
      const currentConditions: EnvironmentalConditions = {
        weather: 'clear',
        temperature: 22,
        humidity: 55,
        windSpeed: 8,
        windDirection: 45,
        trackTemperature: 28,
        trackCondition: 'dry',
        timeOfDay: 'afternoon',
        altitude: 0,
        airPressure: 1013.25
      };

      const forecast = envModeling.generateWeatherForecast(currentConditions, 3);

      expect(forecast).toBeInstanceOf(Array);
      expect(forecast).toHaveLength(3);

      forecast.forEach(predicted => {
        expect(predicted.temperature).toBeGreaterThanOrEqual(-10);
        expect(predicted.temperature).toBeLessThanOrEqual(45);
        expect(predicted.humidity).toBeGreaterThanOrEqual(10);
        expect(predicted.humidity).toBeLessThanOrEqual(100);
        expect(predicted.windSpeed).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should combine ML and environmental modeling for comprehensive recommendations', () => {
      const testCar: CarSpecs = {
        weight: 3200,
        weightDistribution: 53,
        driveType: 'RWD',
        piClass: 'A',
        hasAero: true,
        tireCompound: 'sport',
        horsepower: 420
      };

      const testTune: TuneSettings = {
        tirePressureFront: 29,
        tirePressureRear: 27,
        finalDrive: 3.75,
        gearRatios: [3.5, 2.2, 1.6, 1.2, 0.95, 0.82],
        gearingNote: 'Integration test',
        camberFront: -2.1,
        camberRear: -1.6,
        toeFront: 0.08,
        toeRear: -0.18,
        caster: 5.9,
        arbFront: 42,
        arbRear: 36,
        springsFront: 520,
        springsRear: 550,
        rideHeightFront: 4.6,
        rideHeightRear: 4.8,
        reboundFront: 8.2,
        reboundRear: 8.9,
        bumpFront: 6.5,
        bumpRear: 6.9,
        aeroFront: 12,
        aeroRear: 18,
        diffAccelRear: 52,
        diffDecelRear: 26,
        brakePressure: 93,
        brakeBalance: 54,
        brakeBalanceNote: 'Integration test'
      } as TuneSettings;

      const raceConditions: EnvironmentalConditions = {
        weather: 'rain',
        temperature: 18,
        humidity: 75,
        windSpeed: 12,
        windDirection: 30,
        trackTemperature: 15,
        trackCondition: 'wet',
        timeOfDay: 'afternoon',
        altitude: 200,
        airPressure: 990
      };

      // Get ML recommendations
      const mlRecommendations = mlIntegration.getSmartRecommendations(testCar, testTune, 'performance');

      // Get environmental effects
      const envEffects = envModeling.calculateEnvironmentalEffects(raceConditions, 'mountain-circuit');

      // Both should work together
      expect(mlRecommendations).toBeDefined();
      expect(envEffects).toBeDefined();
      expect(mlRecommendations.confidence).toBeGreaterThan(0);
      expect(envEffects.tireGripMultiplier).toBeLessThan(1.0); // Rain reduces grip
    });

    test('should handle extreme environmental conditions', () => {
      const extremeConditions: EnvironmentalConditions = {
        weather: 'snow',
        temperature: -5,
        humidity: 95,
        windSpeed: 35,
        windDirection: 0,
        trackTemperature: -8,
        trackCondition: 'icy',
        timeOfDay: 'night',
        altitude: 2500,
        airPressure: 750
      };

      const effects = envModeling.calculateEnvironmentalEffects(extremeConditions);

      // Should handle extreme conditions without breaking
      expect(effects).toBeDefined();
      expect(effects.tireGripMultiplier).toBeLessThan(0.5); // Severe grip loss
      expect(effects.enginePowerMultiplier).toBeLessThan(1.0); // Altitude effect
      expect(effects.aeroEfficiencyMultiplier).toBeGreaterThan(1.0); // Wind drag
    });
  });
});