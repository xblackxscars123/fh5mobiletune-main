/**
 * Load Transfer Calculations for Forza Horizon 5
 * Physics-based weight distribution during acceleration, braking, and cornering
 * Critical for suspension tuning and stability
 */

import { calculateLongitudinalTransfer as calcLongTransfer, calculateLateralTransfer as calcLatTransfer, calculateAxleLoads, analyzeLoadTransferGripEffect } from './loadTransferUtils';
import { LONGITUDINAL_LOAD_TRANSFER_RATE, LATERAL_LOAD_TRANSFER_RATE, GRADE_EFFECT_FACTOR } from './physicsConstants';

export interface LoadTransferCondition {
  longitudinal: number; // Weight transfer during acceleration/braking (-100 to +100 %)
  lateral: number; // Weight transfer during cornering (-100 to +100 %)
  combined: number; // Combined effect on grip
  frontAxleLoad: number; // % of total weight on front axle
  rearAxleLoad: number; // % of total weight on rear axle
}

export interface VehicleSetup {
  weight: number; // lbs
  weightDistribution: number; // % front (0-100)
  cgHeight: number; // inches from ground
  wheelBase: number; // inches
  trackWidth: number; // inches
  
  // Suspension
  frontSpringRate: number; // lbs/in
  rearSpringRate: number; // lbs/in
  frontARB: number; // 1-65 scale
  rearARB: number;
  
  // Tires
  tirePressureFront: number; // PSI
  tirePressureRear: number; // PSI
  tireGripFront: number; // 0-2.0 multiplier
  tireGripRear: number;
}

/**
 * Calculate static weight distribution
 */
export function calculateStaticWeightDistribution(setup: VehicleSetup): {
  frontWeight: number;
  rearWeight: number;
} {
  const frontWeight = (setup.weight * setup.weightDistribution) / 100;
  const rearWeight = setup.weight - frontWeight;
  
  return {
    frontWeight: Math.round(frontWeight),
    rearWeight: Math.round(rearWeight)
  };
}

/**
 * Calculate weight transfer during acceleration/braking
 * Positive = forward transfer (weight to rear during accel, front during brake)
 * Negative = rearward transfer
 */
/**
 * Calculate weight transfer during acceleration/braking (longitudinal)
 * @param setup - Vehicle setup configuration
 * @param acceleration - Acceleration factor (-1.0 to +1.0)
 * @param grade - Road slope in degrees
 * @returns Weight transfer percentage
 */
export function calculateLongitudinalTransfer(
  setup: VehicleSetup,
  acceleration: number,
  grade: number = 0
): number {
  // Delegate to loadTransferUtils with extracted parameters
  return calcLongTransfer(
    setup.weight,
    setup.cgHeight,
    setup.wheelBase,
    acceleration,
    grade
  );
}

/**
 * Calculate weight transfer during cornering (lateral)
 * @param setup - Vehicle setup configuration
 * @param lateralAccel - Lateral acceleration in G-forces
 * @param radius - Turn radius in feet
 * @returns Weight transfer percentage
 */
export function calculateLateralTransfer(
  setup: VehicleSetup,
  lateralAccel: number,
  radius: number
): number {
  // Delegate to loadTransferUtils with extracted parameters
  return calcLatTransfer(
    setup.weight,
    setup.cgHeight,
    setup.trackWidth,
    lateralAccel
  );
}

/**
 * Calculate combined load transfer (accel + cornering)
 */
export function calculateCombinedLoadTransfer(
  setup: VehicleSetup,
  acceleration: number, // -1.0 to +1.0
  lateralAccel: number, // 0-2.0 G
  grade: number = 0
): LoadTransferCondition {
  const longitudinal = calculateLongitudinalTransfer(setup, acceleration, grade);
  const lateral = calculateLateralTransfer(setup, lateralAccel, 200); // Average radius
  
  // Calculate resulting front/rear load distribution
  const staticFront = (setup.weight * setup.weightDistribution) / 100;
  const staticRear = setup.weight - staticFront;
  
  // Apply transfers
  const frontLoad = staticFront + (longitudinal * setup.weight / 100);
  const rearLoad = staticRear - (longitudinal * setup.weight / 100);
  
  return {
    longitudinal: Math.round(longitudinal * 10) / 10,
    lateral: Math.round(lateral * 10) / 10,
    combined: Math.round(Math.sqrt(longitudinal ** 2 + lateral ** 2) * 10) / 10,
    frontAxleLoad: Math.round((frontLoad / setup.weight) * 100),
    rearAxleLoad: Math.round((rearLoad / setup.weight) * 100)
  };
}

/**
 * Calculate tire load sensitivity effects on grip
 * Grip decreases slightly as tire load increases (non-linear)
 */
export function calculateTireLoadSensitivity(
  baseTireGrip: number,
  loadPercent: number, // 0-200% of static load
  surface: 'asphalt' | 'dirt' | 'gravel' = 'asphalt'
): number {
  // Tire grip vs load is slightly sublinear (diminishing returns)
  // 50% load = ~55% grip, 100% = 100%, 150% = ~145% grip
  
  const loadSensitivity = 0.45; // Load sensitivity factor
  const effectiveLoad = Math.pow(loadPercent / 100, loadSensitivity);
  
  let grip = baseTireGrip * effectiveLoad;
  
  // Dirt/gravel surfaces are MORE sensitive to load changes
  if (surface === 'dirt') {
    grip = baseTireGrip * (loadPercent / 100) ** 0.55;
  } else if (surface === 'gravel') {
    grip = baseTireGrip * (loadPercent / 100) ** 0.52;
  }
  
  return grip;
}

/**
 * Calculate suspension travel required for load transfer
 */
export function calculateSuspensionTravel(
  setup: VehicleSetup,
  loadTransfer: number // lbs of transferred load
): {
  frontCompression: number; // inches
  rearExtension: number;
  maxNeeded: number;
} {
  // Suspension compression/extension = load / spring rate
  const frontCompression = Math.abs(loadTransfer) / setup.frontSpringRate;
  const rearExtension = Math.abs(loadTransfer) / setup.rearSpringRate;
  
  return {
    frontCompression: Math.round(frontCompression * 100) / 100,
    rearExtension: Math.round(rearExtension * 100) / 100,
    maxNeeded: Math.round(Math.max(frontCompression, rearExtension) * 100) / 100
  };
}

/**
 * Analyze balance bias from load transfer
 * Positive = understeer bias, Negative = oversteer bias
 */
export function analyzeBalanceBias(
  setup: VehicleSetup,
  lateralAccel: number
): {
  bias: 'neutral' | 'understeer' | 'oversteer';
  severity: number; // -100 to +100
  description: string;
} {
  const lateral = calculateLateralTransfer(setup, lateralAccel, 200);
  const weightDist = setup.weightDistribution;
  
  // Calculate which axle is more loaded
  const frontLoadPercent = weightDist + (lateral / 2);
  const rearLoadPercent = (100 - weightDist) - (lateral / 2);
  
  // Front-biased load = understeer, rear-biased = oversteer
  const bias = frontLoadPercent - rearLoadPercent;
  
  let severity: 'neutral' | 'understeer' | 'oversteer' = 'neutral';
  let description = '';
  
  if (bias > 5) {
    severity = 'understeer';
    description = `Front heavily loaded (+${Math.round(bias)}%). Car will push wide. Increase rear downforce or reduce front spring rate.`;
  } else if (bias < -5) {
    severity = 'oversteer';
    description = `Rear heavily loaded (${Math.round(bias)}%). Car will slide rear. Increase front downforce or reduce rear spring rate.`;
  } else {
    severity = 'neutral';
    description = 'Balance is neutral. Good for all driving styles.';
  }
  
  return {
    bias: severity,
    severity: Math.round(bias * 10) / 10,
    description
  };
}

/**
 * Recommend suspension adjustments based on load transfer analysis
 */
export function recommendSuspensionAdjustments(
  setup: VehicleSetup,
  drivingCondition: 'acceleration' | 'braking' | 'cornering'
): Array<{
  adjustment: string;
  reason: string;
  expectedEffect: string;
}> {
  const recommendations: Array<{
    adjustment: string;
    reason: string;
    expectedEffect: string;
  }> = [];
  
  if (drivingCondition === 'acceleration') {
    const longitudinal = calculateLongitudinalTransfer(setup, 0.8, 0);
    
    if (longitudinal > 20) {
      recommendations.push({
        adjustment: 'Increase front spring rate',
        reason: 'Excessive rear weight transfer causing rear squat',
        expectedEffect: 'Better launch control and stability'
      });
    }
    
    if (longitudinal < -20) {
      recommendations.push({
        adjustment: 'Increase rear spring rate',
        reason: 'Excessive front weight transfer causing nose dive',
        expectedEffect: 'More stable acceleration'
      });
    }
  }
  
  if (drivingCondition === 'cornering') {
    const balance = analyzeBalanceBias(setup, 1.5);
    
    if (balance.bias === 'understeer') {
      recommendations.push({
        adjustment: 'Reduce front ARB stiffness',
        reason: 'Front tires are over-loaded',
        expectedEffect: 'Better turn-in response'
      });
      
      recommendations.push({
        adjustment: 'Increase rear wing angle',
        reason: 'More rear downforce for balance',
        expectedEffect: 'Improved mid-corner rotation'
      });
    } else if (balance.bias === 'oversteer') {
      recommendations.push({
        adjustment: 'Increase front ARB stiffness',
        reason: 'Rear tires are over-loaded',
        expectedEffect: 'More front grip and stability'
      });
      
      recommendations.push({
        adjustment: 'Reduce rear wing angle',
        reason: 'Less rear downforce for balance',
        expectedEffect: 'Improved rear stability'
      });
    }
  }
  
  if (drivingCondition === 'braking') {
    const longitudinal = calculateLongitudinalTransfer(setup, -0.8, 0);
    
    if (longitudinal > 30) {
      recommendations.push({
        adjustment: 'Increase rear spring rate',
        reason: 'Excessive front weight transfer under braking',
        expectedEffect: 'Better brake balance and stability'
      });
    }
  }
  
  return recommendations;
}

export default {
  calculateStaticWeightDistribution,
  calculateLongitudinalTransfer,
  calculateLateralTransfer,
  calculateCombinedLoadTransfer,
  calculateTireLoadSensitivity,
  calculateSuspensionTravel,
  analyzeBalanceBias,
  recommendSuspensionAdjustments
};
