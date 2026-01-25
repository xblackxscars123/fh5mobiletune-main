/**
 * Differential Speed Optimization for Forza Horizon 5
 * Speed-based differential locking strategies for acceleration and braking
 * Improves traction on corners and straight acceleration
 */

import { MAX_LOCK_PERCENTAGE, DIFF_LOCK_SPEED_THRESHOLD, ACCEL_LOCK_RATE_MULTIPLIER, DECEL_LOCK_RATE_MULTIPLIER } from './physicsConstants';

export interface DifferentialSetup {
  // FH5 differential settings: 0-100 scale
  accelLock: number; // 0-100 (acceleration differential lock %)
  brakingLock: number; // 0-100 (braking differential lock %)
  decelLock: number; // 0-100 (deceleration lock on engine braking)
}

export interface DifferentialAnalysis {
  accelerationTraction: number; // 0-10 scale
  cornerExitGrip: number; // 0-10 scale
  brakingStability: number; // 0-10 scale
  understeerTendency: number; // -10 to +10 (negative = oversteer)
  drivabilityRating: number; // 0-10 (ease of use)
  description: string;
  recommendations: string[];
}

/**
 * Analyze acceleration lock effects
 * Higher lock = better traction off corners, but more understeer tendency
 */
export function analyzeAccelerationLock(
  accelLock: number, // 0-100
  driveTrain: 'FWD' | 'RWD' | 'AWD',
  power: number, // horsepower
  weight: number // lbs
): {
  traction: number; // 0-10
  understeer: number; // 0-10
  powerTransfer: string;
  description: string;
} {
  // Lock effect varies by drivetrain
  // RWD: Benefits most from lock (prevents wheelspin)
  // FWD: Lock reduces understeer but increases torque steer
  // AWD: Lock provides moderate improvement
  
  let tractionBenefit = 5; // Base
  let understeerIncrease = 0;
  let powerTransfer = '';
  
  switch (driveTrain) {
    case 'RWD':
      // RWD benefits significantly from lock - prevents wheelspin
      tractionBenefit += (accelLock / 100) * 5; // Up to 10
      understeerIncrease = (accelLock / 100) * 3; // Mild understeer increase
      powerTransfer = 'Both rear wheels equally engaged';
      break;
    
    case 'FWD':
      // FWD can have torque steer issues with lock
      tractionBenefit += (accelLock / 100) * 4; // Up to 9
      understeerIncrease = (accelLock / 100) * 5; // Significant understeer
      powerTransfer = 'Both front wheels locked - may cause torque steer';
      break;
    
    case 'AWD':
      // AWD has moderate improvement
      tractionBenefit += (accelLock / 100) * 3.5; // Up to 8.5
      understeerIncrease = (accelLock / 100) * 2; // Mild
      powerTransfer = 'Front and rear wheels engaged together';
      break;
  }
  
  const powerToWeightRatio = power / (weight / 1000);
  
  // High power cars benefit more from lock
  if (powerToWeightRatio > 0.25) {
    tractionBenefit += 1.5; // Bonus for powerful cars
  }
  
  const traction = Math.min(10, tractionBenefit);
  const understeer = Math.min(10, understeerIncrease);
  
  const description = `Acceleration lock at ${accelLock}%: ${traction.toFixed(1)}/10 traction, ${understeer.toFixed(1)}/10 understeer tendency`;
  
  return {
    traction: Math.round(traction * 10) / 10,
    understeer: Math.round(understeer * 10) / 10,
    powerTransfer,
    description
  };
}

/**
 * Analyze braking lock effects
 * Lock during braking improves stability but can cause lockup
 */
export function analyzeBrakingLock(
  brakingLock: number, // 0-100
  wheelBase: number, // inches
  weight: number, // lbs
  tireGrip: number // 0-2.0
): {
  stability: number; // 0-10
  lockupRisk: number; // 0-100%
  controlEase: number; // 0-10 (10 = easiest)
  description: string;
} {
  // Braking lock improves stability but increases lockup risk
  // Lower lock = easier to modulate but less stable
  // Higher lock = more stable but harder to control
  
  // Stability improves with lock
  const stability = (brakingLock / 100) * 8; // Max 8/10
  
  // Lockup risk increases with lock and tire grip
  let lockupRisk = (brakingLock / 100) * 60; // Base lockup risk
  
  // Better grip reduces lockup risk
  lockupRisk -= (tireGrip - 1.0) * 20; // Up to 20% reduction
  
  // Wheelbase affects stability (longer = more stable)
  const wheelBaseEffect = (wheelBase / 100 - 1.0) * 5;
  lockupRisk -= wheelBaseEffect;
  
  lockupRisk = Math.max(0, Math.min(100, lockupRisk));
  
  // Control ease (inverse relationship with lock)
  const controlEase = 10 - (brakingLock / 100) * 5; // 10 down to 5
  
  const description = `Braking lock at ${brakingLock}%: ${stability.toFixed(1)}/10 stability, ${lockupRisk.toFixed(0)}% lockup risk`;
  
  return {
    stability: Math.round(stability * 10) / 10,
    lockupRisk: Math.round(lockupRisk),
    controlEase: Math.round(controlEase * 10) / 10,
    description
  };
}

/**
 * Analyze deceleration (engine brake) lock effects
 * Lock during engine braking helps with trail braking and stability
 */
export function analyzeDecelerationLock(
  decelLock: number, // 0-100
  engineBrakePower: number, // Estimated HP/100
  driveTrain: 'FWD' | 'RWD' | 'AWD'
): {
  engineBrakingEffect: number; // 0-10
  turnInResponse: string; // 'slow' | 'medium' | 'responsive'
  trailBrakingEase: number; // 0-10 (how easy to trail brake)
  description: string;
} {
  // Engine braking with lock helps slow the car and improves turn-in
  
  let engineBrakingEffect = (decelLock / 100) * 8;
  
  // RWD benefits from engine brake lock for trail braking
  if (driveTrain === 'RWD') {
    engineBrakingEffect += 1;
  }
  
  // Turn-in response improves with lock
  let turnInResponse = 'slow';
  if (decelLock < 30) {
    turnInResponse = 'slow';
  } else if (decelLock < 70) {
    turnInResponse = 'medium';
  } else {
    turnInResponse = 'responsive';
  }
  
  // Trail braking becomes easier with moderate lock
  const trailBrakingEase = Math.max(4, Math.min(9, 5 + (decelLock / 100) * 3));
  
  const description = `Deceleration lock at ${decelLock}%: ${engineBrakingEffect.toFixed(1)}/10 engine braking, ${turnInResponse} turn-in`;
  
  return {
    engineBrakingEffect: Math.round(engineBrakingEffect * 10) / 10,
    turnInResponse,
    trailBrakingEase: Math.round(trailBrakingEase * 10) / 10,
    description
  };
}

/**
 * Comprehensive differential analysis
 */
export function analyzeDifferential(
  setup: DifferentialSetup,
  driveTrain: 'FWD' | 'RWD' | 'AWD',
  power: number,
  weight: number,
  wheelBase: number,
  tireGrip: number
): DifferentialAnalysis {
  // Analyze each lock type
  const accelAnalysis = analyzeAccelerationLock(setup.accelLock, driveTrain, power, weight);
  const brakingAnalysis = analyzeBrakingLock(setup.brakingLock, wheelBase, weight, tireGrip);
  const decelAnalysis = analyzeDecelerationLock(setup.decelLock, power / 100, driveTrain);
  
  // Combine into overall picture
  const accelerationTraction = accelAnalysis.traction;
  const cornerExitGrip = Math.min(10, accelerationTraction + (decelAnalysis.engineBrakingEffect / 2));
  const brakingStability = brakingAnalysis.stability;
  
  // Understeer tendency increases with accel lock
  let understeerTendency = accelAnalysis.understeer - 5; // -5 to +5 range
  
  // Drivability is best with moderate lock values
  let drivabilityRating = 7; // Base
  
  if (setup.accelLock > 80 || setup.accelLock < 20) {
    drivabilityRating -= 2; // Extreme settings are hard to drive
  }
  
  if (brakingAnalysis.lockupRisk > 60) {
    drivabilityRating -= 2; // High lockup risk reduces drivability
  }
  
  if (setup.decelLock > 80) {
    drivabilityRating -= 1; // Very high decel lock can be abrupt
  }
  
  const description = `Traction: ${accelerationTraction.toFixed(1)}/10 | Exit: ${cornerExitGrip.toFixed(1)}/10 | Stability: ${brakingStability.toFixed(1)}/10`;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // Acceleration lock recommendations
  if (accelAnalysis.understeer > 7) {
    recommendations.push(`Reduce acceleration lock (${setup.accelLock}%) - too much understeer`);
  } else if (setup.accelLock < 20 && power > 400) {
    recommendations.push(`Increase acceleration lock - traction loss on exit`);
  }
  
  // Braking lock recommendations
  if (brakingAnalysis.lockupRisk > 60) {
    recommendations.push(`Reduce braking lock (${setup.brakingLock}%) - high lockup risk`);
  } else if (setup.brakingLock < 20) {
    recommendations.push(`Consider increasing braking lock for stability`);
  }
  
  // Deceleration recommendations
  if (decelAnalysis.engineBrakingEffect < 3 && driveTrain === 'RWD') {
    recommendations.push(`Increase deceleration lock for trail braking control`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Differential settings are well-balanced');
  }
  
  return {
    accelerationTraction,
    cornerExitGrip: Math.round(cornerExitGrip * 10) / 10,
    brakingStability,
    understeerTendency: Math.round(understeerTendency * 10) / 10,
    drivabilityRating: Math.round(drivabilityRating * 10) / 10,
    description,
    recommendations
  };
}

/**
 * Optimize differential for specific driving condition
 */
export function optimizeDifferentialFor(
  condition: 'grip' | 'drift' | 'drag' | 'offroad' | 'rally',
  driveTrain: 'FWD' | 'RWD' | 'AWD'
): DifferentialSetup {
  // FWD setups
  if (driveTrain === 'FWD') {
    switch (condition) {
      case 'grip':
        return { accelLock: 75, brakingLock: 40, decelLock: 50 };
      case 'drift':
        return { accelLock: 95, brakingLock: 30, decelLock: 70 };
      case 'drag':
        return { accelLock: 100, brakingLock: 45, decelLock: 50 };
      case 'offroad':
        return { accelLock: 80, brakingLock: 50, decelLock: 60 };
      case 'rally':
        return { accelLock: 85, brakingLock: 45, decelLock: 65 };
    }
  }
  
  // RWD setups
  else if (driveTrain === 'RWD') {
    switch (condition) {
      case 'grip':
        return { accelLock: 60, brakingLock: 50, decelLock: 70 };
      case 'drift':
        return { accelLock: 30, brakingLock: 40, decelLock: 80 };
      case 'drag':
        return { accelLock: 90, brakingLock: 60, decelLock: 50 };
      case 'offroad':
        return { accelLock: 75, brakingLock: 55, decelLock: 65 };
      case 'rally':
        return { accelLock: 70, brakingLock: 50, decelLock: 75 };
    }
  }
  
  // AWD setups
  else {
    switch (condition) {
      case 'grip':
        return { accelLock: 50, brakingLock: 40, decelLock: 60 };
      case 'drift':
        return { accelLock: 40, brakingLock: 30, decelLock: 65 };
      case 'drag':
        return { accelLock: 80, brakingLock: 50, decelLock: 55 };
      case 'offroad':
        return { accelLock: 70, brakingLock: 50, decelLock: 70 };
      case 'rally':
        return { accelLock: 65, brakingLock: 45, decelLock: 70 };
    }
  }
  
  // Fallback
  return { accelLock: 50, brakingLock: 40, decelLock: 60 };
}

/**
 * Get differential recommendations based on car characteristics
 */
export function getDifferentialRecommendations(
  carWeight: number,
  power: number,
  driveTrain: 'FWD' | 'RWD' | 'AWD',
  targetUse: 'street' | 'circuit' | 'mixed'
): Partial<DifferentialSetup> {
  const powerToWeight = power / (carWeight / 1000);
  const recommendations: Partial<DifferentialSetup> = {};
  
  // High-power cars benefit from higher accel lock
  if (powerToWeight > 0.3) {
    recommendations.accelLock = driveTrain === 'FWD' ? 80 : 65;
  } else if (powerToWeight > 0.2) {
    recommendations.accelLock = driveTrain === 'FWD' ? 70 : 55;
  } else {
    recommendations.accelLock = driveTrain === 'FWD' ? 60 : 45;
  }
  
  // Circuit driving benefits from higher braking lock
  if (targetUse === 'circuit') {
    recommendations.brakingLock = 50;
    recommendations.decelLock = 70;
  } else if (targetUse === 'street') {
    recommendations.brakingLock = 35;
    recommendations.decelLock = 55;
  }
  
  return recommendations;
}

export default {
  analyzeAccelerationLock,
  analyzeBrakingLock,
  analyzeDecelerationLock,
  analyzeDifferential,
  optimizeDifferentialFor,
  getDifferentialRecommendations
};
