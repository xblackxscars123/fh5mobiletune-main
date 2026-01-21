// Physics-Based Tuning Calculations
// Implements Natural Frequency and Critical Damping Ratio formulas
// Based on automotive suspension engineering principles

import type { TuneType, DriveType } from './tuningCalculator';

// ==========================================
// NATURAL FREQUENCY SPRING CALCULATION
// Formula: k = m_sprung × (2π × f_n)²
// Where f_n is target frequency in Hz
// ==========================================

export interface NaturalFrequencyParams {
  cornerWeightLbs: number; // Weight on one corner
  targetFrequencyHz: number; // Target natural frequency
}

export interface SpringResult {
  springRateLbIn: number;
  naturalFrequencyHz: number;
  criticalDampingCoeff: number;
}

// Target frequencies by tune type (Hz)
// Street: 1.0-1.5 Hz (comfort)
// Sports: 1.5-2.0 Hz (balanced)
// Race: 2.0-3.0+ Hz (performance)
export const frequencyTargets: Record<TuneType, { front: number; rear: number }> = {
  street: { front: 1.35, rear: 1.25 },
  grip: { front: 2.25, rear: 2.05 },
  drift: { front: 2.05, rear: 1.85 },
  rally: { front: 1.65, rear: 1.55 },
  offroad: { front: 1.35, rear: 1.25 },
  drag: { front: 2.55, rear: 1.45 },
};

/**
 * Calculate spring rate from natural frequency
 * k = m × (2π × f)²
 */
export function calculateSpringFromFrequency(params: NaturalFrequencyParams): SpringResult {
  const { cornerWeightLbs, targetFrequencyHz } = params;
  
  // Convert lbs to slugs (mass = weight / g)
  // 1 slug = 14.5939 kg, g = 32.174 ft/s²
  const massSlug = cornerWeightLbs / 32.174;
  
  // Calculate spring rate: k = m × (2π × f)²
  // Result in lb/ft, convert to lb/in
  const omega = 2 * Math.PI * targetFrequencyHz;
  const springRateLbFt = massSlug * omega * omega;
  const springRateLbIn = springRateLbFt / 12;
  
  // Calculate critical damping coefficient
  // c_critical = 2 × √(k × m)
  const criticalDampingCoeff = 2 * Math.sqrt(springRateLbFt * massSlug);
  
  return {
    springRateLbIn: Math.round(springRateLbIn),
    naturalFrequencyHz: targetFrequencyHz,
    criticalDampingCoeff: Math.round(criticalDampingCoeff * 100) / 100,
  };
}

// ==========================================
// CRITICAL DAMPING RATIO CALCULATION
// Formula: c_actual = ζ × c_critical
// Where ζ is the damping ratio (0 = undamped, 1 = critically damped)
// ==========================================

export interface DampingRatioParams {
  springRateLbIn: number;
  cornerWeightLbs: number;
  reboundRatio: number; // 0.6-0.75 typical
  bumpRatio: number; // 0.35-0.50 typical
}

// Damping ratio targets by tune type
// Rebound: 0.65-0.75 (controls extension)
// Bump: 0.35-0.50 (controls compression)
export const dampingRatioTargets: Record<TuneType, { reboundRatio: number; bumpRatio: number }> = {
  street: { reboundRatio: 0.62, bumpRatio: 0.38 },
  grip: { reboundRatio: 0.68, bumpRatio: 0.42 },
  drift: { reboundRatio: 0.58, bumpRatio: 0.32 },
  rally: { reboundRatio: 0.70, bumpRatio: 0.44 },
  offroad: { reboundRatio: 0.75, bumpRatio: 0.48 },
  drag: { reboundRatio: 0.72, bumpRatio: 0.52 },
};

export interface DampingResult {
  reboundValue: number; // 1-20 scale for FH5
  bumpValue: number; // 1-20 scale for FH5
  reboundRatio: number;
  bumpRatio: number;
}

/**
 * Calculate damping values from critical damping ratio
 */
export function calculateDampingFromRatio(params: DampingRatioParams): DampingResult {
  const { springRateLbIn, cornerWeightLbs, reboundRatio, bumpRatio } = params;
  
  // Convert to consistent units
  const massSlug = cornerWeightLbs / 32.174;
  const springRateLbFt = springRateLbIn * 12;
  
  // Critical damping coefficient
  const cCritical = 2 * Math.sqrt(springRateLbFt * massSlug);
  
  // Actual damping coefficients
  const cRebound = reboundRatio * cCritical;
  const cBump = bumpRatio * cCritical;
  
  // Convert to FH5 1-20 scale
  // Mapping: higher coefficient = higher value
  // Baseline: c_critical of ~200 maps to roughly 10
  const baselineCoeff = 200;
  const reboundValue = Math.round((cRebound / baselineCoeff) * 10);
  const bumpValue = Math.round((cBump / baselineCoeff) * 10);
  
  return {
    reboundValue: Math.max(1, Math.min(20, reboundValue)),
    bumpValue: Math.max(1, Math.min(20, bumpValue)),
    reboundRatio,
    bumpRatio,
  };
}

// ==========================================
// LATERAL LOAD TRANSFER DISTRIBUTION (LLTD)
// Predicts understeer/oversteer balance
// LLTD% = Front Roll Stiffness / Total Roll Stiffness
// ==========================================

export interface LLTDParams {
  springFrontLbIn: number;
  springRearLbIn: number;
  arbFront: number; // 1-65 scale
  arbRear: number; // 1-65 scale
  trackWidthIn: number; // Track width (default 60")
}

export interface LLTDResult {
  lltdPercent: number;
  balance: 'understeer' | 'neutral' | 'oversteer';
  balanceDescription: string;
  frontRollStiffness: number;
  rearRollStiffness: number;
}

/**
 * Calculate Lateral Load Transfer Distribution
 * Lower LLTD = more rear bias = oversteer tendency
 * Higher LLTD = more front bias = understeer tendency
 */
export function calculateLLTD(params: LLTDParams): LLTDResult {
  const { springFrontLbIn, springRearLbIn, arbFront, arbRear, trackWidthIn = 60 } = params;
  
  // Estimate roll stiffness contribution
  // Spring roll stiffness ∝ spring rate × track width²
  // ARB roll stiffness is additive (scaled)
  const arbScale = 50; // Convert 1-65 scale to lb/in equivalent
  
  const frontSpringRoll = springFrontLbIn * (trackWidthIn * trackWidthIn) / 1000;
  const rearSpringRoll = springRearLbIn * (trackWidthIn * trackWidthIn) / 1000;
  
  const frontARBRoll = arbFront * arbScale;
  const rearARBRoll = arbRear * arbScale;
  
  const frontRollStiffness = frontSpringRoll + frontARBRoll;
  const rearRollStiffness = rearSpringRoll + rearARBRoll;
  const totalRollStiffness = frontRollStiffness + rearRollStiffness;
  
  const lltdPercent = (frontRollStiffness / totalRollStiffness) * 100;
  
  // Determine balance
  let balance: 'understeer' | 'neutral' | 'oversteer';
  let balanceDescription: string;
  
  if (lltdPercent > 52) {
    balance = 'understeer';
    balanceDescription = `Front-heavy roll stiffness (${lltdPercent.toFixed(1)}%) tends toward understeer`;
  } else if (lltdPercent < 48) {
    balance = 'oversteer';
    balanceDescription = `Rear-heavy roll stiffness (${lltdPercent.toFixed(1)}%) tends toward oversteer`;
  } else {
    balance = 'neutral';
    balanceDescription = `Balanced roll stiffness (${lltdPercent.toFixed(1)}%) provides neutral handling`;
  }
  
  return {
    lltdPercent: Math.round(lltdPercent * 10) / 10,
    balance,
    balanceDescription,
    frontRollStiffness: Math.round(frontRollStiffness),
    rearRollStiffness: Math.round(rearRollStiffness),
  };
}

// ==========================================
// SURFACE TYPE MODIFIERS
// Terrain-aware adjustments for different surfaces
// ==========================================

export type SurfaceType = 'tarmac' | 'gravel' | 'mud' | 'sand' | 'snow' | 'wet';

export interface SurfaceModifiers {
  springMod: number;
  dampingMod: number;
  pressureMod: number; // PSI offset
  diffMod: number; // % offset
  description: string;
}

export const surfaceModifiers: Record<SurfaceType, SurfaceModifiers> = {
  tarmac: {
    springMod: 1.00,
    dampingMod: 1.00,
    pressureMod: 0,
    diffMod: 0,
    description: 'Dry tarmac - baseline settings',
  },
  gravel: {
    springMod: 0.85,
    dampingMod: 1.10,
    pressureMod: -2,
    diffMod: 10,
    description: 'Gravel - softer springs, higher diff lock',
  },
  mud: {
    springMod: 0.75,
    dampingMod: 1.25,
    pressureMod: -4,
    diffMod: 20,
    description: 'Mud - very soft, maximum traction control',
  },
  sand: {
    springMod: 0.70,
    dampingMod: 1.15,
    pressureMod: -6,
    diffMod: 25,
    description: 'Sand - flotation priority, locked diff',
  },
  snow: {
    springMod: 0.80,
    dampingMod: 1.05,
    pressureMod: -3,
    diffMod: 15,
    description: 'Snow/Ice - moderate compliance, careful throttle',
  },
  wet: {
    springMod: 0.95,
    dampingMod: 1.02,
    pressureMod: 1,
    diffMod: 5,
    description: 'Wet tarmac - slight pressure increase for drainage',
  },
};

/**
 * Apply surface modifiers to base tune values
 */
export function applySurfaceModifiers(
  baseSprings: { front: number; rear: number },
  basePressure: { front: number; rear: number },
  baseDiff: { accel: number; decel: number },
  surface: SurfaceType
): {
  springs: { front: number; rear: number };
  pressure: { front: number; rear: number };
  diff: { accel: number; decel: number };
  surfaceInfo: SurfaceModifiers;
} {
  const mods = surfaceModifiers[surface];
  
  return {
    springs: {
      front: Math.round(baseSprings.front * mods.springMod),
      rear: Math.round(baseSprings.rear * mods.springMod),
    },
    pressure: {
      front: Math.round((basePressure.front + mods.pressureMod) * 10) / 10,
      rear: Math.round((basePressure.rear + mods.pressureMod) * 10) / 10,
    },
    diff: {
      accel: Math.min(100, Math.max(0, baseDiff.accel + mods.diffMod)),
      decel: Math.min(100, Math.max(0, baseDiff.decel + Math.round(mods.diffMod * 0.5))),
    },
    surfaceInfo: mods,
  };
}

// ==========================================
// PHYSICS-BASED SPRING CALCULATION (ENHANCED)
// Combines natural frequency with weight distribution
// ==========================================

export interface PhysicsSpringParams {
  totalWeightLbs: number;
  weightDistribution: number; // Front %
  tuneType: TuneType;
  piClass: string;
  tireCompound: string;
}

export function calculatePhysicsBasedSprings(params: PhysicsSpringParams): {
  front: number;
  rear: number;
  frontFrequency: number;
  rearFrequency: number;
} {
  const { totalWeightLbs, weightDistribution, tuneType, piClass } = params;
  
  // Calculate corner weights
  const frontWeight = (totalWeightLbs * weightDistribution) / 100;
  const rearWeight = totalWeightLbs - frontWeight;
  const frontCornerWeight = frontWeight / 2;
  const rearCornerWeight = rearWeight / 2;
  
  // Get target frequencies
  const targets = frequencyTargets[tuneType];
  
  // PI class frequency scaling
  const piFrequencyScale: Record<string, number> = {
    D: 0.82,
    C: 0.88,
    B: 0.94,
    A: 1.00,
    S1: 1.08,
    S2: 1.15,
    X: 1.22,
  };
  const piScale = piFrequencyScale[piClass] || 1.0;
  
  // Calculate springs
  const frontResult = calculateSpringFromFrequency({
    cornerWeightLbs: frontCornerWeight,
    targetFrequencyHz: targets.front * piScale,
  });
  
  const rearResult = calculateSpringFromFrequency({
    cornerWeightLbs: rearCornerWeight,
    targetFrequencyHz: targets.rear * piScale,
  });
  
  return {
    front: frontResult.springRateLbIn,
    rear: rearResult.springRateLbIn,
    frontFrequency: Math.round(targets.front * piScale * 100) / 100,
    rearFrequency: Math.round(targets.rear * piScale * 100) / 100,
  };
}

// ==========================================
// CONFIDENCE INTERVAL CALCULATION
// Shows uncertainty in recommendations
// ==========================================

export interface ConfidenceResult {
  confidence: number; // 0-100%
  uncertaintyFactors: string[];
  recommendedTestRange: { min: number; max: number };
}

export function calculateTuneConfidence(
  hasVerifiedSpecs: boolean,
  hasAero: boolean,
  isExtremePI: boolean,
  hasCustomHorsepower: boolean
): ConfidenceResult {
  let confidence = 85; // Base confidence
  const uncertaintyFactors: string[] = [];
  
  if (!hasVerifiedSpecs) {
    confidence -= 15;
    uncertaintyFactors.push('Using estimated car specs (not verified)');
  }
  
  if (hasAero && !hasCustomHorsepower) {
    confidence -= 8;
    uncertaintyFactors.push('Aero package details unknown');
  }
  
  if (isExtremePI) {
    confidence -= 10;
    uncertaintyFactors.push('Extreme PI class - wider variance expected');
  }
  
  if (!hasCustomHorsepower) {
    confidence -= 5;
    uncertaintyFactors.push('Horsepower not specified');
  }
  
  // Calculate test range (±percentage based on confidence)
  const variancePercent = Math.round((100 - confidence) / 2);
  
  return {
    confidence: Math.max(50, confidence),
    uncertaintyFactors,
    recommendedTestRange: {
      min: 100 - variancePercent,
      max: 100 + variancePercent,
    },
  };
}
