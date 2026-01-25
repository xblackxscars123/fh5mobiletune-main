/**
 * Advanced Aerodynamics Calculations for Forza Horizon 5
 * Downforce, drag, and stability optimizations
 */

import { CarAerodynamicsProfile, calculateDownforce, calculateDragForce } from '../data/carAerodynamics';
import { AERO_REFERENCE_SPEED, AERO_SPEED_POWER } from './physicsConstants';
import { estimateTopSpeed } from './performancePrediction';

export interface AerodynamicsSetup {
  profile: CarAerodynamicsProfile;
  wingAngleFront: number; // degrees
  wingAngleRear: number; // degrees
  rideHeightFront: number; // inches
  rideHeightRear: number; // inches
  weight: number; // lbs
}

export interface AerodynamicsAnalysis {
  downforceFront: number; // lbs at 100 mph
  downforceRear: number;
  downforceTotal: number;
  balance: number; // % (50 = neutral)
  dragForce: number; // lbs at 100 mph
  topSpeed: number; // mph (estimated)
  downforceToWeight: number; // Downforce / weight ratio
  stability: 'stable' | 'balanced' | 'unstable';
  recommendations: string[];
}

/**
 * Calculate downforce distribution (front vs rear)
 */
export function calculateDownforceDistribution(
  setup: AerodynamicsSetup,
  speed: number = 100
): {
  front: number;
  rear: number;
  balance: number;
  ratio: number;
} {
  const profile = setup.profile;
  
  // Base downforce scaling with speed squared
  const speedFactor = (speed / 100) ** 2;
  
  // Front downforce (mainly from splitter and lower ride height)
  let frontDownforce = 0;
  if (profile.hasFrontSplitter) {
    frontDownforce = profile.splitterDownforce * speedFactor;
  }
  // Add wing contribution (front wing, if applicable)
  frontDownforce += setup.wingAngleFront * profile.frontWingEffect * speedFactor;
  
  // Ride height effect on front
  const frontHeightEffect = Math.max(0, 
    (profile.minRideHeight - setup.rideHeightFront) * -profile.rideHeightImpact * speedFactor
  );
  frontDownforce += frontHeightEffect;
  
  // Rear downforce (wing + diffuser)
  let rearDownforce = profile.baseDownforce * speedFactor;
  rearDownforce += setup.wingAngleRear * profile.rearWingEffect * speedFactor;
  
  if (profile.hasDiffuser) {
    rearDownforce += profile.diffuserDownforce * speedFactor;
  }
  
  // Ride height effect on rear
  const rearHeightEffect = Math.max(0,
    (profile.minRideHeight - setup.rideHeightRear) * -profile.rideHeightImpact * speedFactor
  );
  rearDownforce += rearHeightEffect;
  
  const total = frontDownforce + rearDownforce;
  const balance = total > 0 ? (frontDownforce / total) * 100 : 50;
  const ratio = rearDownforce > 0 ? frontDownforce / rearDownforce : 1;
  
  return {
    front: Math.round(frontDownforce),
    rear: Math.round(rearDownforce),
    balance: Math.round(balance * 10) / 10,
    ratio: Math.round(ratio * 100) / 100
  };
}

/**
 * Analyze aerodynamic balance and stability
 */
export function analyzeAeroBalance(
  setup: AerodynamicsSetup,
  speed: number = 100
): {
  bias: 'front-heavy' | 'balanced' | 'rear-heavy';
  severity: number; // -50 to +50
  understeerBias: boolean;
  description: string;
} {
  const distribution = calculateDownforceDistribution(setup, speed);
  
  // Balance deviation from ideal 50/50
  const deviation = distribution.balance - 50;
  
  let bias: 'front-heavy' | 'balanced' | 'rear-heavy' = 'balanced';
  let description = '';
  
  if (distribution.balance < 45) {
    bias = 'rear-heavy';
    description = `Rear-biased downforce (${Math.round(distribution.balance)}% front). `;
    description += deviation < -15 ? 'High oversteer tendency. ' : '';
  } else if (distribution.balance > 55) {
    bias = 'front-heavy';
    description = `Front-biased downforce (${Math.round(distribution.balance)}% front). `;
    description += deviation > 15 ? 'High understeer tendency. ' : '';
  } else {
    bias = 'balanced';
    description = 'Neutral downforce balance. Good for all conditions.';
  }
  
  return {
    bias,
    severity: Math.round(deviation * 10) / 10,
    understeerBias: distribution.balance > 50,
    description
  };
}

/**
 * Comprehensive aerodynamics analysis
 */
export function analyzeAerodynamics(
  setup: AerodynamicsSetup,
  horsePower: number,
  speed: number = 100
): AerodynamicsAnalysis {
  const distribution = calculateDownforceDistribution(setup, speed);
  const drag = calculateDragForce(setup.profile, speed, setup.weight);
  const topSpeed = estimateTopSpeed(setup, horsePower);
  const balance = analyzeAeroBalance(setup, speed);
  
  const downforceToWeight = (distribution.front + distribution.rear) / setup.weight;
  
  let stability: 'stable' | 'balanced' | 'unstable' = 'balanced';
  if (Math.abs(balance.severity) > 20) {
    stability = 'unstable';
  } else if (Math.abs(balance.severity) < 5) {
    stability = 'stable';
  }
  
  const recommendations: string[] = [];
  
  // Generate recommendations
  if (distribution.balance < 45) {
    recommendations.push('Increase front wing angle for more front downforce');
    recommendations.push('Lower front ride height for better downforce');
  } else if (distribution.balance > 55) {
    recommendations.push('Reduce front wing angle or increase rear');
    recommendations.push('Raise front ride height or lower rear');
  }
  
  if (downforceToWeight < 0.3) {
    recommendations.push('Increase wing angles for more stability at high speed');
  } else if (downforceToWeight > 0.8) {
    recommendations.push('Consider reducing downforce - high drag penalty');
  }
  
  if (topSpeed < 150 && setup.profile.category !== 'offroad') {
    recommendations.push('Reduce wing angles or increase ride height to decrease drag');
  }
  
  return {
    downforceFront: distribution.front,
    downforceRear: distribution.rear,
    downforceTotal: distribution.front + distribution.rear,
    balance: distribution.balance,
    dragForce: Math.round(drag),
    topSpeed,
    downforceToWeight: Math.round(downforceToWeight * 100) / 100,
    stability,
    recommendations: recommendations.length > 0 ? recommendations : ['Setup is well-balanced. No adjustments needed.']
  };
}

/**
 * Optimize setup for a specific speed range
 */
export function optimizeForSpeedProfile(
  setup: AerodynamicsSetup,
  horsePower: number,
  targetSpeedProfile: 'low' | 'medium' | 'high'
): {
  recommendedFrontWing: number;
  recommendedRearWing: number;
  recommendedFrontHeight: number;
  recommendedRearHeight: number;
  expectedTopSpeed: number;
  expectedBalance: string;
} {
  const profile = setup.profile;
  
  let frontWing = profile.defaultWingAngle - 10;
  let rearWing = profile.defaultWingAngle + 5;
  let frontHeight = (profile.minRideHeight + profile.maxRideHeight) / 2;
  let rearHeight = frontHeight;
  
  if (targetSpeedProfile === 'low') {
    // Low speed: More downforce for grip
    frontWing = Math.min(profile.defaultWingAngle + 10, profile.wingAngleRange.max);
    rearWing = Math.min(profile.defaultWingAngle + 15, profile.wingAngleRange.max);
    frontHeight = profile.minRideHeight + 0.5;
    rearHeight = profile.minRideHeight + 0.5;
  } else if (targetSpeedProfile === 'high') {
    // High speed: Less drag, more top speed
    frontWing = Math.max(profile.defaultWingAngle - 15, profile.wingAngleRange.min);
    rearWing = Math.max(profile.defaultWingAngle - 10, profile.wingAngleRange.min);
    frontHeight = profile.maxRideHeight - 0.5;
    rearHeight = profile.maxRideHeight - 0.5;
  }
  
  const testSetup = {
    ...setup,
    wingAngleFront: frontWing,
    wingAngleRear: rearWing,
    rideHeightFront: frontHeight,
    rideHeightRear: rearHeight
  };
  
  const analysis = analyzeAerodynamics(testSetup, horsePower);
  
  return {
    recommendedFrontWing: Math.round(frontWing * 10) / 10,
    recommendedRearWing: Math.round(rearWing * 10) / 10,
    recommendedFrontHeight: Math.round(frontHeight * 10) / 10,
    recommendedRearHeight: Math.round(rearHeight * 10) / 10,
    expectedTopSpeed: analysis.topSpeed,
    expectedBalance: `${Math.round(analysis.balance)}% front bias`
  };
}

export default {
  calculateDownforceDistribution,
  analyzeAeroBalance,
  analyzeAerodynamics,
  optimizeForSpeedProfile
};
