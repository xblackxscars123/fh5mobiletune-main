/**
 * Phase 2 Comprehensive Test Suite
 * Tests for load transfer, aerodynamics, track-specific tuning, and tire selection
 */

import {
  calculateStaticWeightDistribution,
  calculateLongitudinalTransfer,
  calculateLateralTransfer,
  calculateCombinedLoadTransfer,
  calculateTireLoadSensitivity,
  analyzeBalanceBias,
  recommendSuspensionAdjustments,
  type VehicleSetup
} from './loadTransfer';

import {
  calculateDownforceDistribution,
  estimateTopSpeed,
  analyzeAeroBalance,
  analyzeAerodynamics,
  optimizeForSpeedProfile,
  type AerodynamicsSetup
} from './aerodynamicsCalculations';

import {
  calculateTrackAdjustments,
  getTrackAdjustments,
  getTrackSummary
} from './trackSpecificTuning';

import {
  recommendTire,
  compareTires,
  getQuickRecommendation,
  calculateOptimalPressure,
  type TireSelectionCriteria
} from './tireSelectionLogic';

import { TRACKS } from '../data/trackDatabase';
import { CAR_AERODYNAMICS } from '../data/carAerodynamics';

// ==========================================
// TEST DATA: Realistic FH5 Cars
// ==========================================

const testSetups = {
  // Lamborghini Huracán - High-PI Hypercar
  huracán: {
    weight: 3465,
    weightDistribution: 42, // % front (42/58 front/rear)
    cgHeight: 17.5, // inches
    wheelBase: 104.3,
    trackWidth: 65.0,
    frontSpringRate: 420,
    rearSpringRate: 450,
    frontARB: 45,
    rearARB: 42,
    tirePressureFront: 32.5,
    tirePressureRear: 33.0,
    tireGripFront: 1.15,
    tireGripRear: 1.15
  },
  
  // Nissan Skyline R34 - Sports Car
  skyline: {
    weight: 2995,
    weightDistribution: 48,
    cgHeight: 17.0,
    wheelBase: 108.3,
    trackWidth: 60.2,
    frontSpringRate: 280,
    rearSpringRate: 290,
    frontARB: 32,
    rearARB: 28,
    tirePressureFront: 32.0,
    tirePressureRear: 33.0,
    tireGripFront: 1.0,
    tireGripRear: 1.0
  },
  
  // Ford Mustang RTR - Muscle Car
  mustang: {
    weight: 3700,
    weightDistribution: 58, // Front heavy (muscle car)
    cgHeight: 18.0,
    wheelBase: 107.5,
    trackWidth: 62.8,
    frontSpringRate: 350,
    rearSpringRate: 330,
    frontARB: 35,
    rearARB: 30,
    tirePressureFront: 31.5,
    tirePressureRear: 32.5,
    tireGripFront: 1.0,
    tireGripRear: 0.95
  },
  
  // Mitsubishi Lancer Evo VI - Rally Car
  evo: {
    weight: 2862,
    weightDistribution: 50,
    cgHeight: 16.5,
    wheelBase: 102.4,
    trackWidth: 59.8,
    frontSpringRate: 280,
    rearSpringRate: 270,
    frontARB: 28,
    rearARB: 25,
    tirePressureFront: 28.5,
    tirePressureRear: 29.0,
    tireGripFront: 0.95,
    tireGripRear: 0.95
  }
};

// ==========================================
// LOAD TRANSFER TESTS
// ==========================================

console.log('\n' + '='.repeat(60));
console.log('LOAD TRANSFER PHYSICS TESTS');
console.log('='.repeat(60));

for (const [name, setup] of Object.entries(testSetups)) {
  console.log(`\n📊 ${name.toUpperCase()}`);
  console.log('-'.repeat(40));
  
  // Static distribution
  const staticDist = calculateStaticWeightDistribution(setup as VehicleSetup);
  console.log(`Static Weight Distribution:`);
  console.log(`  Front: ${staticDist.frontWeight} lbs (${setup.weightDistribution}%)`);
  console.log(`  Rear:  ${staticDist.rearWeight} lbs (${100 - setup.weightDistribution}%)`);
  
  // Acceleration load transfer
  const accelTransfer = calculateLongitudinalTransfer(setup as VehicleSetup, 0.8, 0);
  console.log(`\nAcceleration (0.8G):`);
  console.log(`  Longitudinal Transfer: ${accelTransfer}%`);
  console.log(`  Effect: Weight shifts ${accelTransfer > 0 ? 'to rear' : 'to front'}`);
  
  // Braking load transfer
  const brakeTransfer = calculateLongitudinalTransfer(setup as VehicleSetup, -0.8, 0);
  console.log(`\nBraking (0.8G decel):`);
  console.log(`  Longitudinal Transfer: ${brakeTransfer}%`);
  console.log(`  Effect: Weight shifts ${brakeTransfer > 0 ? 'to front' : 'to rear'}`);
  
  // Cornering load transfer
  const cornerTransfer = calculateLateralTransfer(setup as VehicleSetup, 1.5, 200);
  console.log(`\nCornering (1.5G lateral):`);
  console.log(`  Lateral Transfer: ${cornerTransfer}%`);
  console.log(`  Inside/Outside tire load imbalance`);
  
  // Combined maneuver
  const combined = calculateCombinedLoadTransfer(setup as VehicleSetup, 0.6, 1.2, 0);
  console.log(`\nCombined (accel + corner):`);
  console.log(`  Front axle: ${combined.frontAxleLoad}% of weight`);
  console.log(`  Rear axle:  ${combined.rearAxleLoad}% of weight`);
  console.log(`  Combined transfer: ${combined.combined}%`);
  
  // Balance bias
  const balance = analyzeBalanceBias(setup as VehicleSetup, 1.5);
  console.log(`\nBalance Analysis:`);
  console.log(`  Bias: ${balance.bias} (${balance.severity})`);
  console.log(`  ${balance.description}`);
  
  // Suspension recommendations
  const suspRecs = recommendSuspensionAdjustments(setup as VehicleSetup, 'cornering');
  if (suspRecs.length > 0) {
    console.log(`\nSuspension Recommendations:`);
    suspRecs.slice(0, 2).forEach(rec => {
      console.log(`  • ${rec.adjustment}`);
    });
  }
}

// ==========================================
// AERODYNAMICS TESTS
// ==========================================

console.log('\n' + '='.repeat(60));
console.log('AERODYNAMICS TESTS');
console.log('='.repeat(60));

const testCars = [
  { name: 'Lamborghini Huracán', profile: CAR_AERODYNAMICS['hypercar'], hp: 645, weight: 3465 },
  { name: 'Nissan Skyline R34', profile: CAR_AERODYNAMICS['sports'], hp: 500, weight: 2995 },
  { name: 'Ford Mustang RTR', profile: CAR_AERODYNAMICS['muscle'], hp: 675, weight: 3700 },
  { name: 'Mitsubishi Evo VI', profile: CAR_AERODYNAMICS['rally'], hp: 550, weight: 2862 }
];

for (const car of testCars) {
  console.log(`\n📈 ${car.name}`);
  console.log('-'.repeat(40));
  
  const aeroSetup: AerodynamicsSetup = {
    profile: car.profile,
    wingAngleFront: car.profile.defaultWingAngle,
    wingAngleRear: car.profile.defaultWingAngle + 5,
    rideHeightFront: (car.profile.minRideHeight + car.profile.maxRideHeight) / 2,
    rideHeightRear: (car.profile.minRideHeight + car.profile.maxRideHeight) / 2,
    weight: car.weight
  };
  
  // Downforce distribution at 100 mph
  const df100 = calculateDownforceDistribution(aeroSetup, 100);
  console.log(`Downforce at 100 mph:`);
  console.log(`  Front: ${df100.front} lbs`);
  console.log(`  Rear:  ${df100.rear} lbs`);
  console.log(`  Balance: ${df100.balance}% front (${df100.ratio.toFixed(2)} ratio)`);
  
  // Downforce at 150 mph
  const df150 = calculateDownforceDistribution(aeroSetup, 150);
  console.log(`\nDownforce at 150 mph:`);
  console.log(`  Total: ${df150.front + df150.rear} lbs`);
  
  // Top speed estimate
  const topSpeed = estimateTopSpeed(aeroSetup, car.hp);
  console.log(`\nEstimated Top Speed: ${topSpeed} mph`);
  
  // Full analysis
  const analysis = analyzeAerodynamics(aeroSetup, car.hp, 120);
  console.log(`\nAerodynamic Analysis at 120 mph:`);
  console.log(`  Downforce: ${analysis.downforceTotal} lbs`);
  console.log(`  Drag force: ${analysis.dragForce} lbs`);
  console.log(`  Balance: ${analysis.balance}% front`);
  console.log(`  Stability: ${analysis.stability}`);
  
  // Optimization for high speed
  const hiSpeed = optimizeForSpeedProfile(aeroSetup, car.hp, 'high');
  console.log(`\nOptimized for High Speed:`);
  console.log(`  Front wing: ${hiSpeed.recommendedFrontWing}°`);
  console.log(`  Rear wing: ${hiSpeed.recommendedRearWing}°`);
  console.log(`  Expected top speed: ${hiSpeed.expectedTopSpeed} mph`);
}

// ==========================================
// TRACK-SPECIFIC TUNING TESTS
// ==========================================

console.log('\n' + '='.repeat(60));
console.log('TRACK-SPECIFIC TUNING TESTS');
console.log('='.repeat(60));

const tracksToTest = ['goliath', 'lago-azul', 'drag-strip', 'mulegé-offroad'];

for (const trackId of tracksToTest) {
  const track = TRACKS[trackId];
  if (!track) continue;
  
  console.log(`\n🏁 ${track.name}`);
  console.log('-'.repeat(40));
  
  console.log(`Summary: ${getTrackSummary(track)}`);
  
  // Get adjustments for Huracán
  const adjustments = calculateTrackAdjustments(track, 3465, 645, 'grip');
  
  console.log(`\nSuspension Adjustments:`);
  console.log(`  Spring rate: ${adjustments.suspension.frontSpringRate}x`);
  console.log(`  Front ARB: ${adjustments.suspension.frontARB}x`);
  console.log(`  Ride height front: ${adjustments.suspension.frontRideHeight > 0 ? '+' : ''}${adjustments.suspension.frontRideHeight}"`);
  
  console.log(`\nAerodynamics:`);
  console.log(`  Wing adjustment: ${adjustments.aerodynamics.frontWingAngle}° front`);
  console.log(`  Target: ${adjustments.aerodynamics.downforceTarget}`);
  
  console.log(`\nTire Compound: ${adjustments.tires.recommendedCompound}`);
  console.log(`  Pressure adj: ${adjustments.tires.pressureFront > 0 ? '+' : ''}${adjustments.tires.pressureFront} PSI front`);
  
  console.log(`\nGearing: ${(adjustments.gearing.finalDriveAdjustment * 100).toFixed(0)}% of default`);
  
  console.log(`\nReasoning:`);
  adjustments.reasoning.slice(0, 3).forEach(r => {
    console.log(`  • ${r}`);
  });
}

// ==========================================
// TIRE SELECTION TESTS
// ==========================================

console.log('\n' + '='.repeat(60));
console.log('TIRE SELECTION TESTS');
console.log('='.repeat(60));

const tireScenarios: Array<{ name: string; criteria: TireSelectionCriteria }> = [
  {
    name: 'High-PI Grip Racing (Goliath)',
    criteria: {
      piClass: 900,
      trackId: 'goliath',
      tuneType: 'grip',
      weatherCondition: 'dry',
      drivingStyle: 'aggressive',
      priority: 'grip'
    }
  },
  {
    name: 'Street Casual Driving',
    criteria: {
      piClass: 350,
      tuneType: 'street',
      weatherCondition: 'mixed',
      drivingStyle: 'casual',
      priority: 'balanced'
    }
  },
  {
    name: 'Offroad Rally (Mulegé)',
    criteria: {
      piClass: 600,
      trackId: 'mulegé-offroad',
      tuneType: 'rally',
      weatherCondition: 'dry',
      drivingStyle: 'balanced',
      priority: 'grip'
    }
  },
  {
    name: 'Drag Racing (Max Speed)',
    criteria: {
      piClass: 950,
      trackId: 'drag-strip',
      tuneType: 'drag',
      weatherCondition: 'dry',
      drivingStyle: 'aggressive',
      priority: 'grip'
    }
  }
];

for (const scenario of tireScenarios) {
  console.log(`\n🛞 ${scenario.name}`);
  console.log('-'.repeat(40));
  
  const recommendation = recommendTire(scenario.criteria);
  
  console.log(`Primary: ${recommendation.primary.name}`);
  console.log(`Score: ${recommendation.score}/100`);
  console.log(`Cold pressure: ${recommendation.pressureRecommendation.cold} PSI`);
  console.log(`Warm pressure: ${recommendation.pressureRecommendation.warm} PSI`);
  
  console.log(`\nReasoning:`);
  recommendation.reasoning.forEach(r => {
    console.log(`  • ${r}`);
  });
  
  if (recommendation.alternatives.length > 0) {
    console.log(`\nAlternatives:`);
    recommendation.alternatives.forEach(alt => {
      console.log(`  • ${alt.name}`);
    });
  }
}

// ==========================================
// INTEGRATED TEST: Full Setup Flow
// ==========================================

console.log('\n' + '='.repeat(60));
console.log('INTEGRATED TEST: Complete Setup');
console.log('='.repeat(60));

console.log(`\n🎯 Building optimized tune for Huracán on Goliath Circuit`);
console.log('-'.repeat(40));

const goalTrack = TRACKS['goliath'];
const goalCar = testSetups.huracán;

// Get track adjustments
const trackAdj = calculateTrackAdjustments(goalTrack, 3465, 645, 'grip');
console.log(`\n✓ Track analysis complete`);
console.log(`  ${trackAdj.reasoning[0]}`);

// Get tire recommendation
const tireRec = recommendTire({
  piClass: 900,
  trackId: 'goliath',
  tuneType: 'grip',
  weatherCondition: 'dry',
  drivingStyle: 'aggressive',
  priority: 'grip'
});
console.log(`\n✓ Tire selected: ${tireRec.primary.name}`);
console.log(`  Pressure: ${tireRec.pressureRecommendation.cold}/${tireRec.pressureRecommendation.warm} PSI`);

// Aero analysis
const goalAero: AerodynamicsSetup = {
  profile: CAR_AERODYNAMICS['hypercar'],
  wingAngleFront: 35 + trackAdj.aerodynamics.frontWingAngle,
  wingAngleRear: 40 + trackAdj.aerodynamics.rearWingAngle,
  rideHeightFront: 3.0 + trackAdj.suspension.frontRideHeight,
  rideHeightRear: 3.0 + trackAdj.suspension.rearRideHeight,
  weight: 3465
};

const aeroAnalysis = analyzeAerodynamics(goalAero, 645, 100);
console.log(`\n✓ Aerodynamics optimized`);
console.log(`  Downforce: ${aeroAnalysis.downforceTotal} lbs @ 100 mph`);
console.log(`  Balance: ${aeroAnalysis.balance}% front`);
console.log(`  Top speed: ${aeroAnalysis.topSpeed} mph`);

// Load transfer analysis
const combined = calculateCombinedLoadTransfer(goalCar as VehicleSetup, 0.6, 1.2);
console.log(`\n✓ Load transfer analyzed`);
console.log(`  Front axle load: ${combined.frontAxleLoad}%`);
console.log(`  Balance: ${analyzeBalanceBias(goalCar as VehicleSetup, 1.5).bias}`);

console.log(`\n✅ Complete integrated tune prepared!`);

console.log('\n' + '='.repeat(60));
console.log('ALL TESTS COMPLETE');
console.log('='.repeat(60));
