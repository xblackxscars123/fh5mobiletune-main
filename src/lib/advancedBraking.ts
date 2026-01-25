/**
 * Advanced Brake Balance Optimization for Forza Horizon 5
 * Speed-aware and load-aware brake tuning for optimal stopping power
 * Prevents front lockup while maximizing rear braking
 */

import { BRAKE_LOAD_TRANSFER, BRAKE_FADE_PER_HEAT_UNIT, MAX_BRAKE_FADE, FRONT_LOCKUP_RISK_PER_BIAS, REAR_LOCKUP_RISK_MULTIPLIER, SPEED_LOCKUP_RISK_FACTOR, GRAVITY_ACCELERATION } from './physicsConstants';
import { estimateBrakingDistance } from './performancePrediction';

export interface BrakeSetup {
  brakePressure: number; // 50-100 scale
  brakeBias: number; // % front (0-100)
  frontPadType: 'sport' | 'race' | 'slick';
  rearPadType: 'sport' | 'race' | 'slick';
}

export interface BrakeAnalysis {
  brakingPower: number; // 0-10 scale
  frontLockupRisk: number; // 0-100% (higher = more risk)
  rearLockupRisk: number; // 0-100%
  brakingBalance: 'front-heavy' | 'balanced' | 'rear-heavy';
  maxDeceleration: number; // G-forces
  description: string;
  recommendations: string[];
}

/**
 * Calculate brake fade effects at different speeds
 * Higher speeds = longer braking distance, heat buildup
 */
export function calculateBrakeFade(
  brakePressure: number, // 50-100
  speed: number, // mph
  brakingDuration: number, // seconds
  carWeight: number // lbs
): {
  heatGenerated: number; // Relative heat units
  fadePercentage: number; // 0-100% grip loss
  effectivePressure: number; // Adjusted for fade
  timeToStop: number; // seconds
} {
  // Heat generation scales with speed² and pressure
  const speedFactor = (speed / 100) ** 2; // Quadratic
  const heatGenerated = brakePressure * speedFactor * brakingDuration;
  
  // Fade effect: 10% fade per 100 heat units, capped at 40%
  const fadePercentage = Math.min(40, (heatGenerated / 100) * 10);
  
  // Effective pressure reduced by fade
  const effectivePressure = brakePressure * (1 - fadePercentage / 100);
  
  // Rough braking distance calculation
  // d = v² / (2 * a) where a = pressure / weight
  const maxDecel = effectivePressure / (carWeight / 1000); // G-forces
  const timeToStop = speed / (maxDecel * 32.2 * 3.6); // Convert to time
  
  return {
    heatGenerated: Math.round(heatGenerated),
    fadePercentage: Math.round(fadePercentage * 10) / 10,
    effectivePressure: Math.round(effectivePressure * 10) / 10,
    timeToStop: Math.round(timeToStop * 100) / 100
  };
}

/**
 * Calculate lockup probability for front/rear axles
 * Based on load transfer, brake bias, and tire grip
 */
export function calculateLockupRisk(
  brakeBias: number, // % front
  brakePressure: number, // 50-100
  speed: number, // mph
  weightDistribution: number, // % front
  tireGrip: number, // 0-2.0
  isABS: boolean = true
): {
  frontRisk: number; // 0-100%
  rearRisk: number;
  absEffective: boolean;
  recommendations: string[];
} {
  // During braking, weight transfers to front
  // Heavy braking (high pressure) increases lockup risk
  
  // Front bias effect
  // Higher bias = more front braking = higher front lockup risk
  const frontBiasEffect = (brakeBias / 100) * 0.8;
  
  // Load transfer during braking (~40% of weight to front at full stop)
  const brakeLoadTransfer = 40; // Percentage points
  const frontLoadPercent = Math.min(100, weightDistribution + brakeLoadTransfer);
  
  // Front lockup risk
  // Increases with: high bias, high pressure, low grip, high speed
  let frontRisk = frontBiasEffect * 100; // Base from bias
  frontRisk += (brakePressure - 50) * 0.5; // Pressure effect
  frontRisk -= tireGrip * 20; // Grip reduces risk
  frontRisk += (speed / 200) * 30; // Speed effect
  frontRisk = Math.max(0, Math.min(100, frontRisk));
  
  // Rear lockup risk (lower overall, but increases with low bias)
  const rearBiasEffect = ((100 - brakeBias) / 100) * 0.6;
  let rearRisk = rearBiasEffect * 100;
  rearRisk += (brakePressure - 50) * 0.3;
  rearRisk -= tireGrip * 15;
  rearRisk += (speed / 200) * 20;
  rearRisk = Math.max(0, Math.min(100, rearRisk));
  
  // ABS reduces lockup risk by 60-80%
  let finalFrontRisk = frontRisk;
  let finalRearRisk = rearRisk;
  
  if (isABS) {
    finalFrontRisk *= 0.3; // ABS prevents 70% of front lockups
    finalRearRisk *= 0.4; // ABS less effective on rear
  }
  
  const recommendations: string[] = [];
  
  if (finalFrontRisk > 60) {
    recommendations.push('Reduce front brake bias - high lockup risk');
  }
  if (finalRearRisk > 50) {
    recommendations.push('Increase rear brake bias for balance');
  }
  if (brakePressure > 80 && finalFrontRisk > 40) {
    recommendations.push('Reduce brake pressure slightly');
  }
  
  return {
    frontRisk: Math.round(finalFrontRisk),
    rearRisk: Math.round(finalRearRisk),
    absEffective: isABS && (frontRisk > 40 || rearRisk > 40),
    recommendations
  };
}

/**
 * Pad type effects on braking performance
 */
export function getPadTypeEffect(padType: 'sport' | 'race' | 'slick'): {
  gripMultiplier: number;
  modulation: number; // Ease of control (0-10)
  fadeResistance: number; // 0-10
  cost: number;
  description: string;
} {
  const effects = {
    sport: {
      gripMultiplier: 1.0,
      modulation: 8,
      fadeResistance: 6,
      cost: 100,
      description: 'Balanced grip and modulation, good fade resistance'
    },
    race: {
      gripMultiplier: 1.15,
      modulation: 7,
      fadeResistance: 8,
      cost: 150,
      description: 'High grip, reduced modulation, excellent fade resistance'
    },
    slick: {
      gripMultiplier: 1.30,
      modulation: 5,
      fadeResistance: 9,
      cost: 200,
      description: 'Maximum grip, difficult modulation, extreme fade resistance'
    }
  };
  
  return effects[padType];
}

/**
 * Comprehensive brake analysis
 */
export function analyzeBrakeSetup(
  setup: BrakeSetup,
  speed: number, // Current speed mph
  carWeight: number, // lbs
  weightDistribution: number, // % front
  tireGrip: number, // 0-2.0
  hasABS: boolean = true
): BrakeAnalysis {
  // Calculate braking power
  const frontPadEffect = getPadTypeEffect(setup.frontPadType);
  const rearPadEffect = getPadTypeEffect(setup.rearPadType);
  
  const brakingPower = (
    (setup.brakePressure / 100) * 10 *
    ((frontPadEffect.gripMultiplier + rearPadEffect.gripMultiplier) / 2)
  );
  
  // Calculate lockup risks
  const lockupAnalysis = calculateLockupRisk(
    setup.brakeBias,
    setup.brakePressure,
    speed,
    weightDistribution,
    tireGrip,
    hasABS
  );
  
  // Calculate brake fade
  const fadeAnalysis = calculateBrakeFade(
    setup.brakePressure,
    speed,
    0.5, // Assume 0.5s brake duration
    carWeight
  );
  
  // Determine balance character
  let brakingBalance: 'front-heavy' | 'balanced' | 'rear-heavy' = 'balanced';
  if (setup.brakeBias > 55) {
    brakingBalance = 'front-heavy';
  } else if (setup.brakeBias < 45) {
    brakingBalance = 'rear-heavy';
  }
  
  // Generate description
  const description = `Power: ${brakingPower.toFixed(1)}/10 | Balance: ${brakingBalance} | Front risk: ${lockupAnalysis.frontRisk}%`;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (lockupAnalysis.frontRisk > 60) {
    recommendations.push(`Reduce front brake bias from ${setup.brakeBias}% to ${Math.max(40, setup.brakeBias - 5)}%`);
  }
  
  if (lockupAnalysis.rearRisk > 50) {
    recommendations.push(`Increase rear brake bias (reduce front from ${setup.brakeBias}%)`);
  }
  
  if (fadeAnalysis.fadePercentage > 20) {
    recommendations.push('Use race or slick brake pads to reduce fade');
  }
  
  if (brakingPower < 5) {
    recommendations.push('Increase brake pressure for more stopping power');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Brake setup is well-balanced for current conditions');
  }
  
  return {
    brakingPower: Math.round(brakingPower * 10) / 10,
    frontLockupRisk: lockupAnalysis.frontRisk,
    rearLockupRisk: lockupAnalysis.rearRisk,
    brakingBalance,
    maxDeceleration: Math.round(brakingPower * 10) / 10,
    description,
    recommendations
  };
}

/**
 * Optimize brake setup for specific conditions
 */
export function optimizeBrakesFor(
  condition: 'street' | 'circuit' | 'drag' | 'wet'
): BrakeSetup {
  switch (condition) {
    case 'street':
      return {
        brakePressure: 65,
        brakeBias: 50,
        frontPadType: 'sport',
        rearPadType: 'sport'
      };
    
    case 'circuit':
      return {
        brakePressure: 85,
        brakeBias: 52,
        frontPadType: 'race',
        rearPadType: 'sport'
      };
    
    case 'drag':
      return {
        brakePressure: 75,
        brakeBias: 55,
        frontPadType: 'race',
        rearPadType: 'race'
      };
    
    case 'wet':
      return {
        brakePressure: 70,
        brakeBias: 48,
        frontPadType: 'sport',
        rearPadType: 'sport'
      };
    
    default:
      return {
        brakePressure: 70,
        brakeBias: 50,
        frontPadType: 'sport',
        rearPadType: 'sport'
      };
  }
}

/**
 * Find optimal brake bias for current conditions
 */
export function findOptimalBrakeBias(
  speed: number,
  carWeight: number,
  weightDistribution: number,
  tireGrip: number,
  hasABS: boolean = true
): {
  optimalBias: number;
  biasRange: { min: number; max: number };
  reasoning: string;
} {
  // Optimal bias is usually 50-52% for most cars
  // But it varies with weight distribution
  
  // Front-heavy cars need less front bias
  const weightBiasFactor = (weightDistribution - 50) * 0.2;
  
  // Higher speeds need slightly more front bias for better control
  const speedFactor = (speed / 200) * 3; // Up to 3% more front
  
  // Better tire grip allows more aggressive front bias
  const gripFactor = (tireGrip - 1.0) * 3; // Up to 3% more with good grip
  
  const baseBias = 50;
  const optimalBias = Math.max(45, Math.min(58, 
    baseBias - weightBiasFactor + speedFactor + gripFactor
  ));
  
  const biasRange = {
    min: Math.max(45, optimalBias - 3),
    max: Math.min(58, optimalBias + 3)
  };
  
  let reasoning = `Optimal for: ${carWeight} lbs, ${weightDistribution}% front weight, `;
  reasoning += `${speed} mph, ${tireGrip.toFixed(2)}x grip`;
  
  return {
    optimalBias: Math.round(optimalBias * 10) / 10,
    biasRange,
    reasoning
  };
}

export default {
  calculateBrakeFade,
  calculateLockupRisk,
  getPadTypeEffect,
  analyzeBrakeSetup,
  optimizeBrakesFor,
  findOptimalBrakeBias
};
