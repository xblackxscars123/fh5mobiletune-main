// Forza Horizon 5 Tuning Calculator
// Enhanced with ForzaTune Pro methodology, physics-first approach, and comprehensive research
// Based on:
// - ForzaTune Pro v6.9.0 framework (physics-first tuning)
// - Forza Horizon 5 Tuning Guide Research (terramechanics, thermal dynamics)
// - Natural Frequency spring calculation (k = m × (2πf)²)
// - Critical Damping Ratio formulas (c = ζ × 2√(km))
// - HokiHoshi weight distribution formulas
// - Community-verified drift/drag/rally expertise

import {
  frequencyTargets,
  dampingRatioTargets,
  calculateSpringFromFrequency,
  calculateDampingFromRatio,
  calculateLLTD,
  type LLTDResult,
} from './physicsCalculations';

export type DriveType = 'RWD' | 'FWD' | 'AWD';
export type TuneType = 'grip' | 'drift' | 'offroad' | 'drag' | 'rally' | 'street';

 export type TuneVariant =
  | 'balanced'
  | 'technical'
  | 'highSpeed'
  | 'powerbuild'
  | 'highAngle'
  | 'smooth'
  | 'bumpy'
  | 'mixed'
  | 'traction'
  | 'topSpeed';

 export const tuneVariantsByType: Record<TuneType, { value: TuneVariant; label: string }[]> = {
  grip: [
    { value: 'balanced', label: 'Balanced' },
    { value: 'technical', label: 'Technical Tracks' },
    { value: 'highSpeed', label: 'High Speed' },
    { value: 'powerbuild', label: 'Powerbuild Traction' },
  ],
  street: [
    { value: 'balanced', label: 'Balanced' },
    { value: 'highSpeed', label: 'High Speed' },
    { value: 'traction', label: 'Traction / Stability' },
  ],
  drift: [
    { value: 'balanced', label: 'Balanced' },
    { value: 'highAngle', label: 'High Angle' },
    { value: 'smooth', label: 'Smooth / Consistent' },
  ],
  rally: [
    { value: 'mixed', label: 'Mixed Surface' },
    { value: 'bumpy', label: 'Bumpy / Jumps' },
    { value: 'traction', label: 'Loose Traction' },
  ],
  offroad: [
    { value: 'bumpy', label: 'Bumpy / Jumps' },
    { value: 'traction', label: 'Traction / Stability' },
    { value: 'mixed', label: 'Mixed Terrain' },
  ],
  drag: [
    { value: 'traction', label: 'Launch / 0-60' },
    { value: 'topSpeed', label: 'Top Speed / Trap' },
  ],
 };

 export const defaultTuneVariantByType: Record<TuneType, TuneVariant> = {
  grip: 'balanced',
  street: 'balanced',
  drift: 'balanced',
  rally: 'mixed',
  offroad: 'bumpy',
  drag: 'traction',
 };

export interface CarSpecs {
  weight: number; // in lbs or kg depending on unitSystem
  weightDistribution: number; // front weight percentage (0-100)
  driveType: DriveType;
  piClass: string;
  hasAero: boolean;
  frontDownforce?: number;
  rearDownforce?: number;
  tireCompound: 'street' | 'sport' | 'semi-slick' | 'slick' | 'rally' | 'offroad' | 'drag';
  horsepower?: number;
  gearCount?: number; // 4-10 gears
  drivingStyle?: number; // -2 (stable/understeer) to +2 (loose/oversteer)
  tireCircumference?: number; // meters
}

 export interface CalculateTuneOptions {
  variant?: TuneVariant;
 }

 function normalizePiClass(raw: string | undefined): keyof typeof piClassScaling {
  const str = String(raw ?? '').toUpperCase();
  if (str.includes('S1')) return 'S1';
  if (str.includes('S2')) return 'S2';
  if (str.includes('X')) return 'X';
  if (str.includes('A')) return 'A';
  if (str.includes('B')) return 'B';
  if (str.includes('C')) return 'C';
  if (str.includes('D')) return 'D';
  return 'A';
 }

 function clampNumber(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
 }

export type UnitSystem = 'imperial' | 'metric';

export interface TuneSettings {
  // Tires
  tirePressureFront: number;
  tirePressureRear: number;
  
  // Gearing
  finalDrive: number;
  gearRatios: number[];
  gearingNote: string;
  
  // Alignment
  camberFront: number;
  camberRear: number;
  toeFront: number;
  toeRear: number;
  caster: number;
  
  // Anti-roll Bars
  arbFront: number;
  arbRear: number;
  
  // Springs
  springsFront: number;
  springsRear: number;
  rideHeightFront: number;
  rideHeightRear: number;
  
  // Damping
  reboundFront: number;
  reboundRear: number;
  bumpFront: number;
  bumpRear: number;
  
  // Aero
  aeroFront: number;
  aeroRear: number;
  
  // Differential
  diffAccelFront?: number;
  diffDecelFront?: number;
  diffAccelRear: number;
  diffDecelRear: number;
  centerBalance?: number;
  
  // Brakes
  brakePressure: number;
  brakeBalance: number;
  brakeBalanceNote: string;
  
  // Calculation breakdown for transparency
  modifiers?: TuneModifiers;
}

export interface TuneModifiers {
  powerToWeight: { ratio: number; multiplier: number };
  tireCompound: { name: string; pressureOffset: number; springMod: number };
  piClass: { name: string; stiffnessMod: number; diffAggression: number };
  drivingStyle: { value: number; description: string };
  combinedStiffness: number;
  // Physics-based calculations
  physics?: {
    frontFrequencyHz: number;
    rearFrequencyHz: number;
    reboundRatioFront: number;
    reboundRatioRear: number;
    bumpRatioFront: number;
    bumpRatioRear: number;
    lltd: LLTDResult;
  };
}

// ==========================================
// PI CLASS SCALING (ForzaTune Pro v6.9.0 style)
// Lower classes = MUCH softer setups
// Higher classes = more aggressive for aero loads
// ==========================================
const piClassScaling: Record<string, { 
  arbScale: number; 
  springScale: number; 
  dampingScale: number;
  diffAggression: number;
  alignmentAggression: number; // New: from research - higher classes need more camber
  name: string;
}> = {
  D: { arbScale: 0.68, springScale: 0.60, dampingScale: 0.75, diffAggression: -0.20, alignmentAggression: 0.70, name: 'D Class' },
  C: { arbScale: 0.76, springScale: 0.72, dampingScale: 0.82, diffAggression: -0.14, alignmentAggression: 0.80, name: 'C Class' },
  B: { arbScale: 0.85, springScale: 0.85, dampingScale: 0.90, diffAggression: -0.07, alignmentAggression: 0.90, name: 'B Class' },
  A: { arbScale: 1.00, springScale: 1.00, dampingScale: 1.00, diffAggression: 0, alignmentAggression: 1.00, name: 'A Class' },
  S1: { arbScale: 1.10, springScale: 1.12, dampingScale: 1.08, diffAggression: 0.06, alignmentAggression: 1.10, name: 'S1 Class' },
  S2: { arbScale: 1.18, springScale: 1.25, dampingScale: 1.14, diffAggression: 0.12, alignmentAggression: 1.18, name: 'S2 Class' },
  X: { arbScale: 1.25, springScale: 1.38, dampingScale: 1.20, diffAggression: 0.18, alignmentAggression: 1.25, name: 'X Class' },
};

// ==========================================
// PI-AWARE SPRING RANGES
// From Research: Spring frequency targets:
// - Street: 1.0-1.5 Hz
// - Sports: 1.5-2.0 Hz  
// - Race: 2.0-3.0+ Hz
// Each class + tune type has appropriate min/max
// ==========================================
const springRangesByPI: Record<string, Record<TuneType, { min: number; max: number }>> = {
  D: {
    grip: { min: 110, max: 300 },
    street: { min: 90, max: 240 },
    drift: { min: 90, max: 220 },
    offroad: { min: 50, max: 150 },  // Very soft - 1.0-1.5 Hz range
    rally: { min: 65, max: 200 },
    drag: { min: 150, max: 400 },
  },
  C: {
    grip: { min: 140, max: 400 },
    street: { min: 110, max: 320 },
    drift: { min: 110, max: 280 },
    offroad: { min: 55, max: 165 },
    rally: { min: 78, max: 260 },
    drag: { min: 190, max: 520 },
  },
  B: {
    grip: { min: 170, max: 500 },
    street: { min: 135, max: 400 },
    drift: { min: 130, max: 340 },
    offroad: { min: 62, max: 185 },
    rally: { min: 92, max: 305 },
    drag: { min: 235, max: 680 },
  },
  A: {
    grip: { min: 210, max: 650 },
    street: { min: 165, max: 500 },
    drift: { min: 155, max: 420 },
    offroad: { min: 70, max: 215 },
    rally: { min: 108, max: 355 },
    drag: { min: 285, max: 870 },
  },
  S1: {
    grip: { min: 270, max: 820 },
    street: { min: 195, max: 600 },
    drift: { min: 175, max: 500 },
    offroad: { min: 80, max: 250 },
    rally: { min: 125, max: 405 },
    drag: { min: 360, max: 1050 },
  },
  S2: {
    grip: { min: 330, max: 980 },
    street: { min: 235, max: 700 },
    drift: { min: 195, max: 580 },
    offroad: { min: 90, max: 280 },
    rally: { min: 145, max: 455 },
    drag: { min: 430, max: 1240 },
  },
  X: {
    grip: { min: 390, max: 1150 },
    street: { min: 275, max: 800 },
    drift: { min: 220, max: 660 },
    offroad: { min: 100, max: 310 },
    rally: { min: 165, max: 505 },
    drag: { min: 500, max: 1400 },
  },
};

// ==========================================
// TIRE COMPOUND MODIFIERS
// From Research: Different compounds have different thermal characteristics
// ==========================================
const tireCompoundModifiers: Record<string, { pressureOffset: number; springMod: number; name: string }> = {
  street: { pressureOffset: 1.0, springMod: 0.88, name: 'Street' },
  sport: { pressureOffset: 0, springMod: 1.00, name: 'Sport' },
  'semi-slick': { pressureOffset: -0.5, springMod: 1.06, name: 'Semi-Slick' },
  slick: { pressureOffset: -1.0, springMod: 1.12, name: 'Slick/Race' },
  rally: { pressureOffset: -4.5, springMod: 0.82, name: 'Rally' },
  offroad: { pressureOffset: -9.0, springMod: 0.75, name: 'Offroad' },
  drag: { pressureOffset: 0, springMod: 1.15, name: 'Drag' },
};

// ==========================================
// HOKIHOSHI / WEIGHT DISTRIBUTION SLIDER MATH
// From Research: "Slider Math" approach - slider values align with weight distribution
// S = (Max - Min) × W% + Offset
// ==========================================
function sliderMath(min: number, max: number, weightPercent: number): number {
  return (max - min) * (weightPercent / 100) + min;
}

// ==========================================
// ARB CALCULATION - ForzaTune Pro Style
// From Research: ARB = (64 × W%) + 0.5
// Pure weight distribution + offset approach (not multipliers)
// This prevents the "chasing balance" problem
// ==========================================
function calculateARB_Enhanced(
  weightDistribution: number,
  tuneType: TuneType,
  driveType: DriveType,
  piClass: string
): { front: number; rear: number } {
  // Base from pure weight distribution (ForzaTune formula: 64 × W% + 0.5)
  let arbFront = Math.round((64 * (weightDistribution / 100)) + 0.5);
  let arbRear = Math.round((64 * ((100 - weightDistribution) / 100)) + 0.5);
  
  // Tune type OFFSETS (not multipliers - more predictable)
  // From Research: ARBs control lateral balance - primary understeer/oversteer tool
  const arbOffsets: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 0, rear: 0 },
    street: { front: -3, rear: -3 },
    drift: { front: -20, rear: +14 },  // Soft front for rotation, stiff rear for control
    offroad: { front: -24, rear: -24 },  // Very soft for wheel independence over bumps
    rally: { front: -16, rear: -14 },    // Soft but stiffer than offroad for some stability
    drag: { front: +8, rear: -14 },      // Stiff front for straight tracking, soft rear for squat
  };
  
  // Drive type offsets
  // From Research: FWD needs less front stiffness to reduce understeer
  const driveOffsets: Record<DriveType, { front: number; rear: number }> = {
    FWD: { front: -7, rear: +7 },   // Reduce understeer bias
    RWD: { front: +4, rear: -5 },   // Improve rear traction
    AWD: { front: 0, rear: 0 },     // Neutral - relies on center diff
  };
  
  // Apply offsets
  const tuneOffset = arbOffsets[tuneType];
  const driveOffset = driveOffsets[driveType];
  
  arbFront = arbFront + tuneOffset.front + driveOffset.front;
  arbRear = arbRear + tuneOffset.rear + driveOffset.rear;
  
  // Apply PI class scaling (critical for lower classes)
  const piScale = piClassScaling[piClass]?.arbScale || 1.0;
  arbFront = Math.round(arbFront * piScale);
  arbRear = Math.round(arbRear * piScale);
  
  return {
    front: Math.max(1, Math.min(65, arbFront)),
    rear: Math.max(1, Math.min(65, arbRear)),
  };
}

// ==========================================
// TIRE PRESSURE - Enhanced with Thermodynamic Model
// From Research:
// - Optimal hot pressure: 32-34 PSI (2.2-2.3 Bar)
// - Cold pressure should be 27-28.5 PSI anticipating 4-6 PSI rise
// - Flotation physics: Lower pressure = larger contact patch on deformable surfaces
// ==========================================
function calculateTirePressure(
  specs: CarSpecs,
  tuneType: TuneType
): { front: number; rear: number } {
  const { weight, weightDistribution, tireCompound } = specs;
  const tireMod = tireCompoundModifiers[tireCompound] || tireCompoundModifiers['sport'];
  
  // Base cold pressures by tune type (targeting 32-34 PSI hot)
  // From Research: Cold pressure usually 27-28.5 PSI for road, anticipating 4-6 PSI rise
  const basePressures: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 28.0, rear: 28.0 },      // Circuit - targets 32-34 hot
    street: { front: 28.5, rear: 28.5 },    // Street - slightly higher for varied conditions
    drift: { front: 32.0, rear: 25.0 },     // High front reduces grip, low rear for slide
    drag: { front: 55.0, rear: 15.0 },      // Max front, min rear for wrinkle-wall effect
    rally: { front: 23.5, rear: 23.5 },     // From Research: 22-25 PSI for mixed surfaces
    offroad: { front: 17.5, rear: 17.5 },   // From Research: Very low (15-19 PSI) for flotation
  };
  
  let { front, rear } = basePressures[tuneType];
  
  // Apply tire compound offset
  front += tireMod.pressureOffset;
  rear += tireMod.pressureOffset;
  
  // Weight-based adjustment for offroad/rally (from flotation physics model)
  // From Research: Ground pressure = weight / contact patch area
  // Heavier cars need more pressure to avoid rim contact
  if (tuneType === 'offroad') {
    if (weight > 3500) {
      const extraPressure = ((weight - 3500) / 2000) * 4.5;
      front += extraPressure;
      rear += extraPressure;
    }
    if (weight < 2800) {
      const reduction = ((2800 - weight) / 1400) * 2.5;
      front -= reduction;
      rear -= reduction;
    }
  }
  
  if (tuneType === 'rally') {
    if (weight > 3200) {
      const extraPressure = ((weight - 3200) / 2200) * 3.5;
      front += extraPressure;
      rear += extraPressure;
    }
  }
  
  // Weight distribution adjustment (heavier end needs slightly more pressure)
  // From Research: Front/rear balance affects thermal equilibrium
  if (tuneType !== 'drift' && tuneType !== 'drag') {
    const weightOffset = (weightDistribution - 50) * 0.035;
    front += weightOffset;
    rear -= weightOffset;
  }
  
  return {
    front: Math.max(14, Math.min(55, Math.round(front * 10) / 10)),
    rear: Math.max(14, Math.min(55, Math.round(rear * 10) / 10)),
  };
}

// ==========================================
// DAMPING CALCULATION - Critical Damping Ratio Based
// From Physics:
// - c_critical = 2 × √(k × m)
// - c_actual = ζ × c_critical
// - Rebound ζ: 0.60-0.75 (controls extension speed)
// - Bump ζ: 0.32-0.52 (controls compression speed)
// ==========================================
function calculateDampingPhysics(
  springFront: number,
  springRear: number,
  cornerWeightFront: number,
  cornerWeightRear: number,
  tuneType: TuneType,
  piClass: string
): { 
  reboundF: number; 
  reboundR: number; 
  bumpF: number; 
  bumpR: number;
  ratios: { reboundF: number; reboundR: number; bumpF: number; bumpR: number };
} {
  const dampingTarget = dampingRatioTargets[tuneType];
  const piScale = piClassScaling[piClass]?.dampingScale || 1.0;
  
  // Front damping from critical ratio
  const frontDamping = calculateDampingFromRatio({
    springRateLbIn: springFront,
    cornerWeightLbs: cornerWeightFront,
    reboundRatio: dampingTarget.reboundRatio * piScale,
    bumpRatio: dampingTarget.bumpRatio * piScale,
  });
  
  // Rear damping from critical ratio
  const rearDamping = calculateDampingFromRatio({
    springRateLbIn: springRear,
    cornerWeightLbs: cornerWeightRear,
    reboundRatio: dampingTarget.reboundRatio * piScale * 1.05, // Rear slightly higher
    bumpRatio: dampingTarget.bumpRatio * piScale,
  });
  
  return { 
    reboundF: frontDamping.reboundValue, 
    reboundR: rearDamping.reboundValue, 
    bumpF: frontDamping.bumpValue, 
    bumpR: rearDamping.bumpValue,
    ratios: {
      reboundF: frontDamping.reboundRatio,
      reboundR: rearDamping.reboundRatio,
      bumpF: frontDamping.bumpRatio,
      bumpR: rearDamping.bumpRatio,
    }
  };
}

// Legacy damping calculation (fallback)
function calculateDampingLegacy(
  weightDistribution: number,
  tuneType: TuneType,
  piClass: string
): { reboundF: number; reboundR: number; bumpF: number; bumpR: number } {
  let reboundFront = Math.round(19 * (weightDistribution / 100) + 0.5);
  let reboundRear = Math.round(19 * ((100 - weightDistribution) / 100) + 1.0);
  
  const tuneMultipliers: Record<TuneType, { reboundF: number; reboundR: number; bumpRatio: number }> = {
    grip: { reboundF: 1.0, reboundR: 1.0, bumpRatio: 0.62 },
    street: { reboundF: 0.94, reboundR: 0.94, bumpRatio: 0.60 },
    drift: { reboundF: 0.82, reboundR: 0.98, bumpRatio: 0.56 },
    offroad: { reboundF: 1.20, reboundR: 1.28, bumpRatio: 0.52 },
    rally: { reboundF: 1.12, reboundR: 1.18, bumpRatio: 0.54 },
    drag: { reboundF: 1.10, reboundR: 0.70, bumpRatio: 0.68 },
  };
  
  const tuneMod = tuneMultipliers[tuneType];
  const piScale = piClassScaling[piClass]?.dampingScale || 1.0;
  
  reboundFront = Math.max(1, Math.min(20, Math.round(reboundFront * tuneMod.reboundF * piScale)));
  reboundRear = Math.max(1, Math.min(20, Math.round(reboundRear * tuneMod.reboundR * piScale)));
  
  const bumpFront = Math.max(1, Math.min(20, Math.round(reboundFront * tuneMod.bumpRatio)));
  const bumpRear = Math.max(1, Math.min(20, Math.round(reboundRear * tuneMod.bumpRatio)));
  
  return { reboundF: reboundFront, reboundR: reboundRear, bumpF: bumpFront, bumpR: bumpRear };
}

// ==========================================
// DIFFERENTIAL - Enhanced with Research Data
// From Research Differential Matrix:
// - Circuit RWD: 45-60% accel / 20-30% decel
// - Drift: 100% locked for consistent slide
// - Off-Road AWD: Near-locked (80-100%) to prevent stuck wheels
// - Rally AWD: 70-90% accel / 25-40% decel, 50-60% center
// ==========================================
const enhancedDiffMatrix: Record<TuneType, Record<DriveType, {
  accelF?: number;
  decelF?: number;
  accelR: number;
  decelR: number;
  center?: number;
}>> = {
  grip: {
    RWD: { accelR: 52, decelR: 25 },
    FWD: { accelF: 32, decelF: 3, accelR: 0, decelR: 0 },
    AWD: { accelF: 16, decelF: 0, accelR: 72, decelR: 16, center: 70 },
  },
  street: {
    RWD: { accelR: 42, decelR: 20 },
    FWD: { accelF: 28, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 18, decelF: 0, accelR: 58, decelR: 14, center: 65 },
  },
  drift: {
    // From Research: Locked (100% Accel / 100% Decel) for consistent slide
    RWD: { accelR: 100, decelR: 100 },
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 100, decelF: 0, accelR: 100, decelR: 100, center: 85 },
  },
  offroad: {
    // From Research: Near-locked (90-100%) prevents power loss to airborne wheels
    RWD: { accelR: 68, decelR: 38 },
    FWD: { accelF: 58, decelF: 18, accelR: 0, decelR: 0 },
    AWD: { accelF: 88, decelF: 18, accelR: 95, decelR: 48, center: 52 },
  },
  rally: {
    // From Research: 70-90% accel, 25-40% decel, center 50-60%
    RWD: { accelR: 62, decelR: 34 },
    FWD: { accelF: 50, decelF: 12, accelR: 0, decelR: 0 },
    AWD: { accelF: 52, decelF: 12, accelR: 82, decelR: 38, center: 58 },
  },
  drag: {
    // From Research: 100% accel for max traction, 0% decel (no cornering)
    RWD: { accelR: 100, decelR: 0 },
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 88, decelF: 0, accelR: 100, decelR: 0, center: 72 },
  },
};

// ==========================================
// RIDE HEIGHT by Tune Type
// From Research:
// - Off-Road: Maximum height for suspension travel (jumps)
// - Drag: Max front / min rear for weight transfer squat
// - Grip: Low for aero efficiency and CG
// ==========================================
const rideHeightPresets: Record<TuneType, { front: number; rear: number }> = {
  grip: { front: 4.4, rear: 4.6 },
  street: { front: 5.4, rear: 5.6 },
  drift: { front: 5.4, rear: 4.6 },      // Lower rear for weight transfer
  offroad: { front: 10.0, rear: 9.8 },   // Maximum - lower rear 0.2" for slight understeer
  rally: { front: 8.0, rear: 8.3 },      // High but less than offroad
  drag: { front: 6.5, rear: 3.8 },       // Max front, min rear for squat
};

// ==========================================
// ALIGNMENT - Enhanced with Research Data
// From Research:
// - Circuit: -1.5° to -2.5° F, -1.0° to -1.8° R
// - Drift: Extreme front camber (-5.0°) for full lock
// - Dirt: Less aggressive (-1.0° to -1.5°) for stability
// - Caster: 5.5-6.5° provides dynamic camber gain
// - Toe: 0° recommended for stability, toe-out for turn-in
// ==========================================
const alignmentPresets: Record<TuneType, { 
  camberF: number; 
  camberR: number; 
  toeF: number; 
  toeR: number; 
  caster: number 
}> = {
  grip: { camberF: -1.8, camberR: -1.3, toeF: 0.1, toeR: -0.2, caster: 6.2 },
  street: { camberF: -1.3, camberR: -0.9, toeF: 0.0, toeR: -0.1, caster: 5.6 },
  drift: { camberF: -5.0, camberR: -0.5, toeF: 2.8, toeR: -0.5, caster: 7.0 },
  offroad: { camberF: -1.0, camberR: -0.5, toeF: 0.0, toeR: 0.1, caster: 5.4 },
  rally: { camberF: -1.4, camberR: -0.9, toeF: 0.0, toeR: 0.0, caster: 5.7 },
  drag: { camberF: 0.0, camberR: -0.3, toeF: 0.0, toeR: 0.0, caster: 7.0 },
};

// ==========================================
// BRAKE PRESETS
// From Research: BRAKE BALANCE SLIDER IS INVERTED!
// Moving slider toward "Rear" increases Front bias
// Target_Front% -> Set slider to (100 - Target_Front%)
// ==========================================
const brakePresets: Record<TuneType, { pressure: number; targetFrontBias: number }> = {
  grip: { pressure: 100, targetFrontBias: 60 },
  street: { pressure: 92, targetFrontBias: 58 },
  drift: { pressure: 85, targetFrontBias: 52 },
  offroad: { pressure: 88, targetFrontBias: 50 },  // Lower pressure prevents lockups
  rally: { pressure: 90, targetFrontBias: 52 },
  drag: { pressure: 100, targetFrontBias: 55 },
};

// ==========================================
// GEARING
// From Research - Geometric Gearing Strategy:
// - Final Drive ≈ (400 - HP) / 600 + 4.25 (for 6-speed)
// - Gear ratios follow geometric progression
// - Ratio_n = Ratio_1 × (Ratio_Final / Ratio_1) ^ ((n-1)/(TotalGears-1))
// ==========================================
const gearingPresets: Record<TuneType, { first: number; last: number; finalDrive: number }> = {
  grip: { first: 3.40, last: 0.72, finalDrive: 3.80 },
  street: { first: 3.30, last: 0.68, finalDrive: 3.50 },
  drift: { first: 3.80, last: 0.85, finalDrive: 4.20 },
  offroad: { first: 3.50, last: 0.78, finalDrive: 3.70 },
  rally: { first: 3.45, last: 0.75, finalDrive: 3.65 },
  drag: { first: 2.90, last: 0.55, finalDrive: 2.90 },
};

// Geometric gear ratio calculation (from research)
function calculateGearRatios(firstGear: number, lastGear: number, gearCount: number): number[] {
  const ratios: number[] = [];
  for (let n = 1; n <= gearCount; n++) {
    // Power series formula: Ratio_n = Ratio_1 × (Ratio_Final / Ratio_1) ^ ((n-1)/(TotalGears-1))
    const ratio = firstGear * Math.pow(lastGear / firstGear, (n - 1) / (gearCount - 1));
    ratios.push(Math.round(ratio * 100) / 100);
  }
  return ratios;
}

// Dynamic final drive based on horsepower (from research)
function calculateDynamicFinalDrive(baseFD: number, horsepower: number, tuneType: TuneType): number {
  // From Research: Final Drive ≈ (400 - HP) / 600 + 4.25
  const researchFD = ((400 - horsepower) / 600) + 4.25;
  
  // Blend research formula with preset (70% research, 30% preset)
  let finalDrive = (researchFD * 0.7) + (baseFD * 0.3);
  
  // Tune type adjustments
  if (tuneType === 'drag') finalDrive *= 0.82;      // Longer for top speed
  else if (tuneType === 'drift') finalDrive *= 1.10; // Shorter for angle control
  else if (tuneType === 'offroad' || tuneType === 'rally') finalDrive *= 1.06; // Shorter for torque
  
  return Math.max(2.5, Math.min(5.5, Math.round(finalDrive * 100) / 100));
}

// ==========================================
// POWER-TO-WEIGHT CALCULATION
// From Research: P/W ratio affects stiffness requirements
// Higher P/W = stiffer setup to manage acceleration forces
// ==========================================
function getPowerToWeightMultiplier(horsepower: number, weightLbs: number): { ratio: number; multiplier: number } {
  const ratio = horsepower / (weightLbs / 1000);
  // More gentle scaling to avoid extreme values
  const multiplier = 0.82 + (ratio / 550) * 0.48;
  return {
    ratio: Math.round(ratio),
    multiplier: Math.max(0.78, Math.min(1.35, multiplier))
  };
}

// ==========================================
// UNIT CONVERSIONS
// ==========================================
export const unitConversions = {
  lbsToKg: (lbs: number) => Math.round(lbs * 0.453592),
  kgToLbs: (kg: number) => Math.round(kg * 2.20462),
  psiToBar: (psi: number) => Math.round(psi * 0.0689476 * 100) / 100,
  barToPsi: (bar: number) => Math.round(bar * 14.5038 * 10) / 10,
  inchesToCm: (inches: number) => Math.round(inches * 2.54 * 10) / 10,
  cmToInches: (cm: number) => Math.round(cm / 2.54 * 10) / 10,
  lbInToKgMm: (lbIn: number) => Math.round(lbIn * 0.017858 * 100) / 100,
  kgMmToLbIn: (kgMm: number) => Math.round(kgMm / 0.017858),
  lbsToN: (lbs: number) => Math.round(lbs * 4.44822),
  nToLbs: (n: number) => Math.round(n / 4.44822),
  hpToKw: (hp: number) => Math.round(hp * 0.7457),
  kwToHp: (kw: number) => Math.round(kw / 0.7457),
};

export function convertTuneToUnits(tune: TuneSettings, toSystem: UnitSystem): TuneSettings {
  if (toSystem === 'imperial') return tune;
  
  return {
    ...tune,
    tirePressureFront: unitConversions.psiToBar(tune.tirePressureFront),
    tirePressureRear: unitConversions.psiToBar(tune.tirePressureRear),
    springsFront: unitConversions.lbInToKgMm(tune.springsFront),
    springsRear: unitConversions.lbInToKgMm(tune.springsRear),
    rideHeightFront: unitConversions.inchesToCm(tune.rideHeightFront),
    rideHeightRear: unitConversions.inchesToCm(tune.rideHeightRear),
    aeroFront: unitConversions.lbsToN(tune.aeroFront),
    aeroRear: unitConversions.lbsToN(tune.aeroRear),
  };
}

export function getUnitLabels(system: UnitSystem) {
  return system === 'imperial' ? {
    pressure: 'PSI',
    springs: 'LB/IN',
    rideHeight: 'IN',
    aero: 'LB',
    weight: 'lbs',
    power: 'HP',
  } : {
    pressure: 'BAR',
    springs: 'KG/MM',
    rideHeight: 'CM',
    aero: 'N',
    weight: 'kg',
    power: 'kW',
  };
}

export function getDrivingStyleDescription(value: number): string {
  if (value <= -2) return 'Very Stable (understeer bias)';
  if (value === -1) return 'Stable';
  if (value === 0) return 'Neutral';
  if (value === 1) return 'Loose';
  if (value >= 2) return 'Very Loose (oversteer bias)';
  return 'Neutral';
}

// ==========================================
// SIMPLE MODE DEFAULTS
// ==========================================
export function getSimpleModeDefaults(tuneType: TuneType): {
  weight: number;
  horsepower: number;
  weightDist: number;
  driveType: DriveType;
  piClass: string;
  tireCompound: string;
  description: string;
} {
  const defaults: Record<TuneType, ReturnType<typeof getSimpleModeDefaults>> = {
    grip: {
      weight: 3100,
      horsepower: 500,
      weightDist: 52,
      driveType: 'RWD',
      piClass: 'S1',
      tireCompound: 'semi-slick',
      description: 'Circuit racing - balanced power, RWD preferred for rotation'
    },
    drift: {
      weight: 2900,
      horsepower: 550,
      weightDist: 52,
      driveType: 'RWD',
      piClass: 'S1',
      tireCompound: 'sport',
      description: 'Drift - mid-high power RWD, front-heavy aids initiation'
    },
    drag: {
      weight: 2600,
      horsepower: 1000,
      weightDist: 45,
      driveType: 'AWD',
      piClass: 'X',
      tireCompound: 'drag',
      description: 'Drag - maximum power, AWD for launch, rear weight bias'
    },
    rally: {
      weight: 3000,
      horsepower: 400,
      weightDist: 55,
      driveType: 'AWD',
      piClass: 'A',
      tireCompound: 'rally',
      description: 'Rally - moderate power AWD, slightly front-heavy'
    },
    offroad: {
      weight: 3300,
      horsepower: 350,
      weightDist: 50,
      driveType: 'AWD',
      piClass: 'B',
      tireCompound: 'offroad',
      description: 'Offroad - lower power, balanced weight, AWD essential'
    },
    street: {
      weight: 3100,
      horsepower: 450,
      weightDist: 52,
      driveType: 'RWD',
      piClass: 'A',
      tireCompound: 'sport',
      description: 'Street - versatile all-around setup'
    }
  };
  
  return defaults[tuneType];
}

// ==========================================
// MAIN CALCULATION FUNCTION
// Implements the holistic system integration from ForzaTune Pro
// All settings calculated as a cohesive unit to prevent "chasing balance"
// ==========================================
export function calculateTune(specs: CarSpecs, tuneType: TuneType, options: CalculateTuneOptions = {}): TuneSettings {
  const { 
    weight, 
    weightDistribution, 
    driveType, 
    hasAero, 
    frontDownforce = 0, 
    rearDownforce = 0,
    horsepower = 400,
    tireCompound = 'sport',
    piClass = 'A',
    drivingStyle = 0
  } = specs;

  const normalizedPI = normalizePiClass(piClass);
  const variant = options.variant ?? defaultTuneVariantByType[tuneType];
  const gearCount = clampNumber(specs.gearCount ?? 6, 4, 10);
  
  // Get modifiers
  const tireMod = tireCompoundModifiers[tireCompound] || tireCompoundModifiers['sport'];
  const piMod = piClassScaling[normalizedPI] || piClassScaling['A'];
  const powerWeight = getPowerToWeightMultiplier(horsepower, weight);
  
  // Combined modifier (gentler scaling than before)
  const combinedStiffness = powerWeight.multiplier * (piMod.springScale * 0.55 + 0.45) * tireMod.springMod;
  
  // Modifiers will be enhanced with physics data after spring/damping calculation
  const modifiers: TuneModifiers = {
    powerToWeight: powerWeight,
    tireCompound: tireMod,
    piClass: { name: piMod.name, stiffnessMod: piMod.springScale, diffAggression: piMod.diffAggression },
    drivingStyle: { value: drivingStyle, description: getDrivingStyleDescription(drivingStyle) },
    combinedStiffness: Math.round(combinedStiffness * 100) / 100,
  };
  
  // ==========================================
  // TIRES - Thermodynamic model
  // ==========================================
  const tirePressures = calculateTirePressure(specs, tuneType);
  
  // ==========================================
  // ALIGNMENT - PI-scaled aggression
  // ==========================================
  const alignment = alignmentPresets[tuneType];
  let camberFront = alignment.camberF * piMod.alignmentAggression;
  let camberRear = alignment.camberR * piMod.alignmentAggression;
  
  // Adjust for heavy cars (more negative camber needed)
  if (weight > 3600) {
    camberFront -= 0.2;
    camberRear -= 0.15;
  }
  
  // Extreme weight distribution adjustment
  if (weightDistribution > 56) {
    camberFront -= 0.25;
  } else if (weightDistribution < 44) {
    camberRear -= 0.25;
  }
  
  // Round alignment values
  camberFront = Math.round(camberFront * 10) / 10;
  camberRear = Math.round(camberRear * 10) / 10;
  
  // ==========================================
  // ANTI-ROLL BARS - Weight distribution based
  // ==========================================
  const arbs = calculateARB_Enhanced(weightDistribution, tuneType, driveType, normalizedPI);
  
  // Apply driving style offset (±4 per style point)
  arbs.front = Math.max(1, Math.min(65, arbs.front + drivingStyle * 3));
  arbs.rear = Math.max(1, Math.min(65, arbs.rear - drivingStyle * 3));
  
  // ==========================================
  // SPRINGS - Physics-Based Natural Frequency
  // Formula: k = m × (2πf)² where f is target frequency in Hz
  // ==========================================
  
  // Calculate corner weights
  const frontWeight = (weight * weightDistribution) / 100;
  const rearWeight = weight - frontWeight;
  const frontCornerWeight = frontWeight / 2;
  const rearCornerWeight = rearWeight / 2;
  
  // Get target frequencies for this tune type
  const freqTargets = frequencyTargets[tuneType];
  
  // PI class frequency scaling (higher classes = stiffer = higher frequency)
  const piFrequencyScale: Record<string, number> = {
    D: 0.82,
    C: 0.88,
    B: 0.94,
    A: 1.00,
    S1: 1.08,
    S2: 1.15,
    X: 1.22,
  };
  const piFreqScale = piFrequencyScale[normalizedPI] || 1.0;
  
  // Calculate physics-based spring rates
  // Variant frequency scaling applied here so it influences the physics spring calculation.
  const variantFrequencyScale = (() => {
    if (tuneType === 'grip') {
      if (variant === 'technical') return 1.03;
      if (variant === 'highSpeed') return 0.98;
      if (variant === 'powerbuild') return 1.02;
    }
    if (tuneType === 'street') {
      if (variant === 'highSpeed') return 0.98;
      if (variant === 'traction') return 1.01;
    }
    if (tuneType === 'drift') {
      if (variant === 'highAngle') return 1.02;
      if (variant === 'smooth') return 0.98;
    }
    if (tuneType === 'rally' || tuneType === 'offroad') {
      if (variant === 'bumpy') return 0.92;
      if (variant === 'traction') return 0.96;
      if (variant === 'mixed') return 0.97;
    }
    return 1.0;
  })();

  const frontFreqHz = freqTargets.front * piFreqScale * variantFrequencyScale;
  const rearFreqHz = freqTargets.rear * piFreqScale * variantFrequencyScale;
  
  const frontSpringResult = calculateSpringFromFrequency({
    cornerWeightLbs: frontCornerWeight,
    targetFrequencyHz: frontFreqHz,
  });
  
  const rearSpringResult = calculateSpringFromFrequency({
    cornerWeightLbs: rearCornerWeight,
    targetFrequencyHz: rearFreqHz,
  });
  
  let springsFront = frontSpringResult.springRateLbIn;
  let springsRear = rearSpringResult.springRateLbIn;
  
  // Apply tire compound modifier (compound affects grip, needs spring adjustment)
  springsFront = Math.round(springsFront * tireMod.springMod);
  springsRear = Math.round(springsRear * tireMod.springMod);
  
  // Aero adjustment (aero load adds to effective spring rate needed)
  if (hasAero && frontDownforce > 100) {
    // Aero wheel rate = downforce / suspension travel (~4 inches)
    const aeroWheelRateFront = frontDownforce / 4;
    const aeroWheelRateRear = rearDownforce / 4;
    springsFront += Math.round(aeroWheelRateFront * 0.35);
    springsRear += Math.round(aeroWheelRateRear * 0.35);
  }
  
  // Drag: stiff front for stability, soft rear for squat/weight transfer
  if (tuneType === 'drag') {
    springsFront = Math.round(springsFront * 1.12);
    springsRear = Math.round(springsRear * 0.72);
  }
  
  // Clamp to FH5 valid ranges (use PI-aware bounds as sanity check)
  const springRange = springRangesByPI[normalizedPI]?.[tuneType] || springRangesByPI['A'][tuneType];
  const minSpring = Math.round(springRange.min * 0.7);
  const maxSpring = Math.round(springRange.max * 1.5);
  springsFront = Math.max(minSpring, Math.min(maxSpring, springsFront));
  springsRear = Math.max(minSpring, Math.min(maxSpring, springsRear));
  
  // ==========================================
  // RIDE HEIGHT - Tune type based
  // ==========================================
  let rideHeightFront = rideHeightPresets[tuneType].front;
  let rideHeightRear = rideHeightPresets[tuneType].rear;
  
  // Lower ride height for aero cars
  if (hasAero && (tuneType === 'grip' || tuneType === 'street')) {
    rideHeightFront = 3.9;
    rideHeightRear = 4.1;
  }
  
  // ==========================================
  // DAMPING - Critical Damping Ratio Based
  // Formula: c = ζ × 2√(km) where ζ is the damping ratio
  // ==========================================
  const damping = calculateDampingPhysics(
    springsFront,
    springsRear,
    frontCornerWeight,
    rearCornerWeight,
    tuneType,
    normalizedPI
  );
  
  // ==========================================
  // LLTD - Lateral Load Transfer Distribution
  // Predicts understeer/oversteer tendency
  // ==========================================
  const lltd = calculateLLTD({
    springFrontLbIn: springsFront,
    springRearLbIn: springsRear,
    arbFront: arbs.front,
    arbRear: arbs.rear,
    trackWidthIn: 60, // Standard track width estimate
  });
  
  // ==========================================
  // AERO - Match to weight distribution
  // From Research: Downforce should match CoP to weight distribution
  // ==========================================
  let aeroFront = 0;
  let aeroRear = 0;
  
  if (hasAero) {
    const aeroTargets: Record<TuneType, { frontPct: number; rearPct: number }> = {
      grip: { frontPct: 0.68, rearPct: 0.78 },
      street: { frontPct: 0.42, rearPct: 0.52 },
      drift: { frontPct: 0.15, rearPct: 0.32 },
      offroad: { frontPct: 0.25, rearPct: 0.35 },
      rally: { frontPct: 0.35, rearPct: 0.45 },
      drag: { frontPct: 0.0, rearPct: 0.0 },
    };
    
    const targets = aeroTargets[tuneType];
    const maxFrontAero = frontDownforce > 0 ? frontDownforce : 400;
    const maxRearAero = rearDownforce > 0 ? rearDownforce : 400;
    
    let frontAdjust = 0;
    let rearAdjust = 0;
    
    // Drive type aero adjustments
    if (driveType === 'FWD') {
      frontAdjust = -0.12;
      rearAdjust = 0.15;
    } else if (driveType === 'RWD') {
      rearAdjust = 0.12;
    }
    
    // Weight distribution aero adjustments
    if (weightDistribution > 55) {
      rearAdjust += 0.12;
    } else if (weightDistribution < 45) {
      frontAdjust += 0.12;
    }
    
    aeroFront = Math.round(maxFrontAero * Math.max(0, Math.min(1, targets.frontPct + frontAdjust)));
    aeroRear = Math.round(maxRearAero * Math.max(0, Math.min(1, targets.rearPct + rearAdjust)));
  }
  
  // ==========================================
  // DIFFERENTIAL - Enhanced matrix with PI scaling
  // ==========================================
  const diff = enhancedDiffMatrix[tuneType][driveType];
  
  // Apply PI class aggression
  let diffAccelRear = Math.round((diff.accelR || 0) * (1 + piMod.diffAggression));
  let diffDecelRear = Math.round((diff.decelR || 0) * (1 + piMod.diffAggression * 0.5));
  let diffAccelFront = diff.accelF ? Math.round(diff.accelF * (1 + piMod.diffAggression)) : undefined;
  const diffDecelFront = diff.decelF;
  const centerBalance = diff.center;
  
  // Driving style: loose = more aggressive diff
  diffAccelRear = Math.round(diffAccelRear + (drivingStyle * 4));
  
  // Clamp diff values
  diffAccelRear = Math.max(0, Math.min(100, diffAccelRear));
  diffDecelRear = Math.max(0, Math.min(100, diffDecelRear));
  if (diffAccelFront !== undefined) {
    diffAccelFront = Math.max(0, Math.min(100, diffAccelFront));
  }
  
  // ==========================================
  // BRAKES - With inverted slider note
  // ==========================================
  const brakes = brakePresets[tuneType];
  let targetFrontBias = brakes.targetFrontBias;
  
  // Weight distribution affects brake bias
  const weightOffset = weightDistribution - 50;
  targetFrontBias += Math.round(weightOffset * 0.16);
  targetFrontBias = Math.max(45, Math.min(70, targetFrontBias));
  
  // IMPORTANT: FH5 slider is inverted! To get 60% front, set slider to 40%
  const brakeBalance = 100 - targetFrontBias;
  const brakeBalanceNote = `Set slider to ${brakeBalance}% to achieve ${targetFrontBias}% front bias (FH5 slider is inverted)`;
  
  // ==========================================
  // GEARING - Geometric progression
  // ==========================================
  const gearing = gearingPresets[tuneType];
  const gearRatios = calculateGearRatios(gearing.first, gearing.last, gearCount);
  const finalDrive = calculateDynamicFinalDrive(gearing.finalDrive, horsepower, tuneType);
  
  const gearingNotes: Record<TuneType, string> = {
    grip: `Final drive ${finalDrive.toFixed(2)} calculated for ${horsepower}HP - keep engine in power band`,
    street: `Balanced gearing for ${horsepower}HP - acceleration priority`,
    drift: `Short gearing for angle control at ${horsepower}HP - stay in torque`,
    offroad: `Torque-focused gearing for ${horsepower}HP - low-end power`,
    rally: `Mixed surface gearing for ${horsepower}HP - versatile ratios`,
    drag: `Top speed gearing for ${horsepower}HP - reach V-max at redline`,
  };
  
  // ==========================================
  // RETURN FINAL TUNE (holistically calculated)
  // ==========================================
  const variantMods: Partial<{
    frequencyScale: number;
    diffAccelRearOffset: number;
    diffDecelRearOffset: number;
    targetFrontBiasOffset: number;
    finalDriveScale: number;
    toeFrontOffset: number;
  }> = (() => {
    if (tuneType === 'grip') {
      if (variant === 'technical') return { frequencyScale: 1.03, diffDecelRearOffset: 6, targetFrontBiasOffset: 2, finalDriveScale: 1.02, toeFrontOffset: 0.05 };
      if (variant === 'highSpeed') return { frequencyScale: 0.98, diffDecelRearOffset: 8, targetFrontBiasOffset: 4, finalDriveScale: 0.96 };
      if (variant === 'powerbuild') return { frequencyScale: 1.02, diffAccelRearOffset: 8, targetFrontBiasOffset: 2, finalDriveScale: 1.06 };
      return { frequencyScale: 1.0 };
    }
    if (tuneType === 'street') {
      if (variant === 'highSpeed') return { frequencyScale: 0.98, diffDecelRearOffset: 6, targetFrontBiasOffset: 3, finalDriveScale: 0.96 };
      if (variant === 'traction') return { frequencyScale: 1.01, diffAccelRearOffset: -4, diffDecelRearOffset: 6, targetFrontBiasOffset: 3 };
      return { frequencyScale: 1.0 };
    }
    if (tuneType === 'drift') {
      if (variant === 'highAngle') return { frequencyScale: 1.02, toeFrontOffset: 0.2, diffAccelRearOffset: 0, diffDecelRearOffset: 0 };
      if (variant === 'smooth') return { frequencyScale: 0.98, toeFrontOffset: -0.2, diffDecelRearOffset: -10 };
      return { frequencyScale: 1.0 };
    }
    if (tuneType === 'rally' || tuneType === 'offroad') {
      if (variant === 'bumpy') return { frequencyScale: 0.92, diffAccelRearOffset: 6, diffDecelRearOffset: 4, targetFrontBiasOffset: -2, finalDriveScale: 1.04 };
      if (variant === 'traction') return { frequencyScale: 0.96, diffAccelRearOffset: 10, diffDecelRearOffset: 6, targetFrontBiasOffset: -1 };
      if (variant === 'mixed') return { frequencyScale: 0.97, diffAccelRearOffset: 6, diffDecelRearOffset: 4 };
      return { frequencyScale: 1.0 };
    }
    if (tuneType === 'drag') {
      if (variant === 'topSpeed') return { finalDriveScale: 0.88, diffAccelRearOffset: -2, targetFrontBiasOffset: 2 };
      return { finalDriveScale: 1.0 };
    }
    return { frequencyScale: 1.0 };
  })();

  // Apply variant modifications (guardrails applied after)
  const finalTargetFrontBias = clampNumber(targetFrontBias + (variantMods.targetFrontBiasOffset ?? 0), 45, 70);
  const finalBrakeBalance = 100 - finalTargetFrontBias;
  const finalBrakeBalanceNote = `Set slider to ${finalBrakeBalance}% to achieve ${finalTargetFrontBias}% front bias (FH5 slider is inverted)`;

  const finalDiffAccelRear = clampNumber(diffAccelRear + (variantMods.diffAccelRearOffset ?? 0), 0, 100);
  const finalDiffDecelRear = clampNumber(diffDecelRear + (variantMods.diffDecelRearOffset ?? 0), 0, 100);

  const finalFinalDrive = clampNumber(finalDrive * (variantMods.finalDriveScale ?? 1.0), 2.5, 5.5);

  return {
    tirePressureFront: tirePressures.front,
    tirePressureRear: tirePressures.rear,
    finalDrive: Math.round(finalFinalDrive * 100) / 100,
    gearRatios,
    gearingNote: gearingNotes[tuneType],
    camberFront: clampNumber(camberFront, -10, 1),
    camberRear: clampNumber(camberRear, -10, 1),
    toeFront: clampNumber(Math.round((alignment.toeF + (variantMods.toeFrontOffset ?? 0)) * 10) / 10, -5, 5),
    toeRear: clampNumber(Math.round(alignment.toeR * 10) / 10, -5, 5),
    caster: clampNumber(Math.round(alignment.caster * 10) / 10, 0, 10),
    arbFront: arbs.front,
    arbRear: arbs.rear,
    springsFront,
    springsRear,
    rideHeightFront: Math.round(rideHeightFront * 10) / 10,
    rideHeightRear: Math.round(rideHeightRear * 10) / 10,
    reboundFront: damping.reboundF,
    reboundRear: damping.reboundR,
    bumpFront: damping.bumpF,
    bumpRear: damping.bumpR,
    aeroFront,
    aeroRear,
    diffAccelFront,
    diffDecelFront,
    diffAccelRear: finalDiffAccelRear,
    diffDecelRear: finalDiffDecelRear,
    centerBalance,
    brakePressure: brakes.pressure,
    brakeBalance: finalBrakeBalance,
    brakeBalanceNote: finalBrakeBalanceNote,
    modifiers: {
      ...modifiers,
      physics: {
        frontFrequencyHz: Math.round(frontFreqHz * 100) / 100,
        rearFrequencyHz: Math.round(rearFreqHz * 100) / 100,
        reboundRatioFront: damping.ratios.reboundF,
        reboundRatioRear: damping.ratios.reboundR,
        bumpRatioFront: damping.ratios.bumpF,
        bumpRatioRear: damping.ratios.bumpR,
        lltd,
      },
    },
  };
}

// ==========================================
// TUNE TYPE DESCRIPTIONS - Enhanced with Research Insights
// ==========================================
export const tuneTypeDescriptions: Record<TuneType, { 
  title: string; 
  description: string; 
  icon: string; 
  tips: string[] 
}> = {
  grip: {
    title: 'Circuit/Grip',
    description: 'Maximum cornering grip for track racing - physics-first approach',
    icon: '🏎️',
    tips: [
      'Target hot tire pressure: 32-34 PSI (start cold at 28 PSI, anticipate 4-6 PSI rise)',
      'Camber: -1.5° to -2.5° Front, -1.0° to -1.8° Rear for flat contact patch under load',
      'Diff: 45-60% accel / 20-30% decel balances rotation vs traction',
      'AWD center: 65-75% rear bias reduces understeer characteristic',
      'Damping: Bump = 60-70% of Rebound for controlled oscillation',
    ],
  },
  street: {
    title: 'Street',
    description: 'Versatile setup for traffic, varied surfaces, and unpredictable conditions',
    icon: '🛣️',
    tips: [
      'Softer springs (10-15% less than circuit) for potholes and curbs',
      'Reduced brake pressure (90-95%) for panic stops near traffic',
      'Slightly shorter final drive - street races prioritize acceleration over top speed',
      'Moderate camber for tire longevity and predictability in mixed conditions',
      'Compliance > outright grip for real-world street racing',
    ],
  },
  drift: {
    title: 'Drift',
    description: 'Maximum angle and slide control with snappy response',
    icon: '💨',
    tips: [
      'High front pressure (30-36 PSI) reduces grip for easier initiation',
      'Low rear pressure (20-30 PSI) modulates the slide threshold',
      'Extreme front camber (-5.0°) keeps tire flat at full steering lock',
      'Positive front toe (1-5°) increases Ackerman effect for deep angles',
      'Locked diff (100%/100%) for consistent, predictable slide character',
      'Caster maxed (7.0°) for self-centering force and steering feel',
    ],
  },
  offroad: {
    title: 'Off-Road/Cross Country',
    description: 'Flotation physics - survival and stability on hostile terrain',
    icon: '🏔️',
    tips: [
      'Very low pressure (15-19 PSI) exploits flotation physics - max footprint reduces sink',
      'Maximum ride height (9-10") prevents bottoming out on jumps and ruts',
      'High rebound damping (1.2-1.3x) "sticks" landings - aim for 20-80% travel',
      'Near-locked diff (90-100%) prevents power loss to airborne wheels',
      'Softer springs (25-50% less than road) maintain tire contact over bumps',
      'AWD essential - center diff 50-55% for balanced traction',
    ],
  },
  rally: {
    title: 'Rally',
    description: 'Mixed surface versatility for tarmac, gravel, and loose dirt',
    icon: '🌲',
    tips: [
      'Medium-low pressure (22-25 PSI) balances tarmac grip and loose surface flotation',
      'Softer springs than road but stiffer than cross-country (1.5-2.0 Hz frequency)',
      'Higher ride height (8") for jumps while maintaining some cornering stability',
      'Trail braking rotation - rear bias helps initiate controlled slides',
      'Diff lock higher than road (70-90% accel) for loose surface traction',
      'ARBs slightly stiffer than offroad for predictability on mixed surfaces',
    ],
  },
  drag: {
    title: 'Drag',
    description: 'Maximum straight-line acceleration with weight transfer optimization',
    icon: '⚡',
    tips: [
      'Max front pressure (55 PSI) reduces rolling resistance and steering interference',
      'Min rear pressure (15 PSI) creates "wrinkle wall" effect for maximum grip',
      'Soft rear springs + max rear height enables squat for weight transfer on launch',
      '100% accel / 0% decel diff - locked launch, open for stability at trap speed',
      'Zero camber front maintains contact patch for straight tracking',
      'Final drive tuned so car hits V-max exactly at redline in top gear',
    ],
  },
};

export const piClasses = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X'] as const;

export const tireCompounds = [
  { value: 'street', label: 'Street' },
  { value: 'sport', label: 'Sport' },
  { value: 'semi-slick', label: 'Semi-Slick' },
  { value: 'slick', label: 'Slick' },
  { value: 'rally', label: 'Rally' },
  { value: 'offroad', label: 'Off-Road' },
  { value: 'drag', label: 'Drag' },
] as const;
