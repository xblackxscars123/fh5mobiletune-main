/**
 * Phase 4 Validation Test Suite
 * Tests Enhanced Tuning Calculator and all Phase 1-4 integration
 */

import { generateEnhancedTune, type EnhancedTuneRequest } from './tuningCalculatorEnhanced';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, message?: string) {
  if (condition) {
    passedTests++;
    console.log(`✅ ${testName}`);
  } else {
    failedTests++;
    console.log(`❌ ${testName}: ${message || 'Failed'}`);
  }
}

function assertRange(value: number, min: number, max: number, testName: string) {
  const passed = value >= min && value <= max;
  assert(passed, testName, passed ? undefined : `Expected ${min}-${max}, got ${value}`);
}

console.log('\n═══════════════════════════════════════════');
console.log('PHASE 4 VALIDATION TEST SUITE');
console.log('═══════════════════════════════════════════\n');

// Test 1: Basic grip tune
console.log('[Test 1] Grip tune generation');
try {
  const tune = generateEnhancedTune({
    carName: 'Lamborghini Huracán',
    carWeight: 3242,
    carPower: 645,
    carDrivetrain: 'AWD',
    carWeightDistribution: 42,
    carPI: 950,
    tuneType: 'grip',
  });
  assert(tune.carName === 'Lamborghini Huracán', 'Car name preserved');
  assert(tune.tuneType === 'grip', 'Tune type preserved');
  assert(tune.suspension.frontSpring > 0, 'Front spring positive');
  assert(tune.suspension.rearSpring > 0, 'Rear spring positive');
  assert(tune.performance.expectedTopSpeed > 150, 'Top speed reasonable');
} catch (err) {
  assert(false, 'Grip tune generation', String(err));
}

// Test 2: Drift tune
console.log('\n[Test 2] Drift tune generation');
try {
  const tune = generateEnhancedTune({
    carName: 'Nissan Skyline GT-R V-Spec II',
    carWeight: 3060,
    carPower: 500,
    carDrivetrain: 'AWD',
    carWeightDistribution: 48,
    carPI: 900,
    tuneType: 'drift',
  });
  assert(tune.tuneType === 'drift', 'Drift type set');
  assert(tune.suspension.frontARB > 0, 'Front ARB positive');
  assert(tune.recommendations.length > 0, 'Has recommendations');
} catch (err) {
  assert(false, 'Drift tune generation', String(err));
}

// Test 3: Drag tune
console.log('\n[Test 3] Drag tune generation');
try {
  const tune = generateEnhancedTune({
    carName: 'Bugatti Bolide',
    carWeight: 2734,
    carPower: 1850,
    carDrivetrain: 'AWD',
    carWeightDistribution: 48,
    carPI: 999,
    tuneType: 'drag',
  });
  assert(tune.tuneType === 'drag', 'Drag type set');
  assert(tune.performance.expectedZeroToSixty < 4.0, 'Fast 0-60');
  assert(tune.gearing.finalDrive > 0, 'Valid final drive');
} catch (err) {
  assert(false, 'Drag tune generation', String(err));
}

// Test 4: Complete structure
console.log('\n[Test 4] Complete tune structure');
try {
  const tune = generateEnhancedTune({
    carName: 'Ferrari F8 Tributo',
    carWeight: 3247,
    carPower: 710,
    carDrivetrain: 'RWD',
    carWeightDistribution: 43,
    carPI: 950,
    tuneType: 'grip',
  });
  
  assert(tune.suspension !== undefined, 'Suspension exists');
  assert(tune.geometry !== undefined, 'Geometry exists');
  assert(tune.tires !== undefined, 'Tires exist');
  assert(tune.aerodynamics !== undefined, 'Aerodynamics exist');
  assert(tune.brakes !== undefined, 'Brakes exist');
  assert(tune.differential !== undefined, 'Differential exists');
  assert(tune.gearing !== undefined, 'Gearing exists');
  assert(tune.performance !== undefined, 'Performance exists');
} catch (err) {
  assert(false, 'Complete structure', String(err));
}

// Test 5: Multi-class PI testing
console.log('\n[Test 5] Multi-class PI testing');
try {
  const dClass = generateEnhancedTune({
    carName: 'VW Beetle',
    carWeight: 2583,
    carPower: 170,
    carDrivetrain: 'FWD',
    carWeightDistribution: 60,
    carPI: 100,
    tuneType: 'street',
  });
  
  const xClass = generateEnhancedTune({
    carName: 'Pagani Huayra BC',
    carWeight: 2470,
    carPower: 1386,
    carDrivetrain: 'RWD',
    carWeightDistribution: 45,
    carPI: 999,
    tuneType: 'grip',
  });
  
  assert(dClass.performance.expectedTopSpeed < 150, 'D-Class realistic');
  assert(xClass.performance.expectedTopSpeed > 220, 'X-Class high-performance');
} catch (err) {
  assert(false, 'PI class testing', String(err));
}

// Test 6: FH5 constraints
console.log('\n[Test 6] FH5 setting constraints');
try {
  const tune = generateEnhancedTune({
    carName: 'Dodge Viper GTS',
    carWeight: 3420,
    carPower: 648,
    carDrivetrain: 'RWD',
    carWeightDistribution: 45,
    carPI: 900,
    tuneType: 'grip',
  });
  
  assertRange(tune.suspension.frontSpring, 50, 1000, 'Front spring FH5 range');
  assertRange(tune.suspension.rearSpring, 50, 1000, 'Rear spring FH5 range');
  assertRange(tune.suspension.frontARB, 0, 100, 'Front ARB FH5 range');
  assertRange(tune.suspension.rearARB, 0, 100, 'Rear ARB FH5 range');
  assertRange(tune.tires.pressureFront, 14, 55, 'Front tire pressure FH5');
  assertRange(tune.tires.pressureRear, 14, 55, 'Rear tire pressure FH5');
} catch (err) {
  assert(false, 'FH5 constraint validation', String(err));
}

// Test 7: All tune types
console.log('\n[Test 7] All tune types');
try {
  const tuneTypes: Array<'grip' | 'drift' | 'drag' | 'rally' | 'offroad' | 'street'> = 
    ['grip', 'drift', 'drag', 'rally', 'offroad', 'street'];
  
  for (const tuneType of tuneTypes) {
    const tune = generateEnhancedTune({
      carName: 'Test Car',
      carWeight: 3200,
      carPower: 500,
      carDrivetrain: 'AWD',
      carWeightDistribution: 50,
      carPI: 900,
      tuneType,
    });
    assert(tune.tuneType === tuneType, `Tune type ${tuneType}`);
  }
} catch (err) {
  assert(false, 'All tune types', String(err));
}

// Test 8: All drivetrains
console.log('\n[Test 8] All drivetrain types');
try {
  const drivetrains: Array<'FWD' | 'RWD' | 'AWD'> = ['FWD', 'RWD', 'AWD'];
  
  for (const drivetrain of drivetrains) {
    const tune = generateEnhancedTune({
      carName: 'Test Car',
      carWeight: 3200,
      carPower: 500,
      carDrivetrain: drivetrain,
      carWeightDistribution: 50,
      carPI: 900,
      tuneType: 'grip',
    });
    assert(tune.differential !== undefined, `Drivetrain ${drivetrain}`);
  }
} catch (err) {
  assert(false, 'Drivetrain types', String(err));
}

// Test 9: Weather conditions
console.log('\n[Test 9] Weather conditions');
try {
  const wet = generateEnhancedTune({
    carName: 'McLaren 720S',
    carWeight: 3247,
    carPower: 710,
    carDrivetrain: 'RWD',
    carWeightDistribution: 42,
    carPI: 950,
    tuneType: 'grip',
    weatherCondition: 'wet',
  });
  
  const dry = generateEnhancedTune({
    carName: 'McLaren 720S',
    carWeight: 3247,
    carPower: 710,
    carDrivetrain: 'RWD',
    carWeightDistribution: 42,
    carPI: 950,
    tuneType: 'grip',
    weatherCondition: 'dry',
  });
  
  assert(wet.tires !== undefined, 'Wet condition tires');
  assert(dry.tires !== undefined, 'Dry condition tires');
  assert(wet.tires.compound !== dry.tires.compound || 
         wet.tires.pressureFront !== dry.tires.pressureFront,
         'Weather affects setup');
} catch (err) {
  assert(false, 'Weather handling', String(err));
}

// Test 10: Track integration
console.log('\n[Test 10] Track integration');
try {
  const tune = generateEnhancedTune({
    carName: 'Lamborghini Aventador SVJ',
    carWeight: 3472,
    carPower: 770,
    carDrivetrain: 'AWD',
    carWeightDistribution: 43,
    carPI: 975,
    tuneType: 'grip',
    trackId: 'Goliath',
  });
  
  assert(tune.trackName !== undefined, 'Track loaded');
  assert(tune.recommendations.length > 0, 'Track recommendations');
  assert(tune.gearing.finalDrive !== undefined, 'Phase 4 integration');
} catch (err) {
  assert(false, 'Track integration', String(err));
}

// Summary
console.log('\n═══════════════════════════════════════════');
console.log('TEST SUMMARY');
console.log('═══════════════════════════════════════════');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total:  ${passedTests + failedTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
console.log('═══════════════════════════════════════════\n');

if (failedTests === 0) {
  console.log('✅ ALL TESTS PASSED - Phase 4 validation complete!');
} else {
  console.log(`⚠️  ${failedTests} test(s) failed.`);
}
