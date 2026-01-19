// Forza Horizon 5 Tuning Calculator
// Enhanced with ForzaTune-style weight distribution formulas, PI-aware scaling,
// and dirt/rally expertise from community research

export type DriveType = 'RWD' | 'FWD' | 'AWD';
export type TuneType = 'grip' | 'drift' | 'offroad' | 'drag' | 'rally' | 'street';

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
}

// ==========================================
// PI CLASS SCALING (ForzaTune-style)
// Lower classes = MUCH softer setups
// ==========================================
const piClassScaling: Record<string, { 
  arbScale: number; 
  springScale: number; 
  dampingScale: number;
  diffAggression: number;
  name: string;
}> = {
  D: { arbScale: 0.70, springScale: 0.65, dampingScale: 0.78, diffAggression: -0.18, name: 'D Class' },
  C: { arbScale: 0.78, springScale: 0.75, dampingScale: 0.84, diffAggression: -0.12, name: 'C Class' },
  B: { arbScale: 0.86, springScale: 0.85, dampingScale: 0.90, diffAggression: -0.06, name: 'B Class' },
  A: { arbScale: 1.00, springScale: 1.00, dampingScale: 1.00, diffAggression: 0, name: 'A Class' },
  S1: { arbScale: 1.08, springScale: 1.10, dampingScale: 1.06, diffAggression: 0.05, name: 'S1 Class' },
  S2: { arbScale: 1.15, springScale: 1.20, dampingScale: 1.12, diffAggression: 0.10, name: 'S2 Class' },
  X: { arbScale: 1.22, springScale: 1.30, dampingScale: 1.18, diffAggression: 0.15, name: 'X Class' },
};

// ==========================================
// PI-AWARE SPRING RANGES
// Each class + tune type has appropriate min/max
// ==========================================
const springRangesByPI: Record<string, Record<TuneType, { min: number; max: number }>> = {
  D: {
    grip: { min: 120, max: 320 },
    street: { min: 100, max: 260 },
    drift: { min: 100, max: 240 },
    offroad: { min: 55, max: 160 },
    rally: { min: 70, max: 220 },
    drag: { min: 160, max: 420 },
  },
  C: {
    grip: { min: 150, max: 420 },
    street: { min: 120, max: 340 },
    drift: { min: 120, max: 300 },
    offroad: { min: 60, max: 180 },
    rally: { min: 85, max: 280 },
    drag: { min: 200, max: 550 },
  },
  B: {
    grip: { min: 180, max: 520 },
    street: { min: 145, max: 420 },
    drift: { min: 140, max: 360 },
    offroad: { min: 70, max: 200 },
    rally: { min: 100, max: 320 },
    drag: { min: 250, max: 700 },
  },
  A: {
    grip: { min: 220, max: 680 },
    street: { min: 170, max: 520 },
    drift: { min: 160, max: 440 },
    offroad: { min: 75, max: 230 },
    rally: { min: 115, max: 370 },
    drag: { min: 300, max: 900 },
  },
  S1: {
    grip: { min: 280, max: 850 },
    street: { min: 200, max: 620 },
    drift: { min: 180, max: 520 },
    offroad: { min: 85, max: 260 },
    rally: { min: 130, max: 420 },
    drag: { min: 380, max: 1100 },
  },
  S2: {
    grip: { min: 340, max: 1000 },
    street: { min: 240, max: 720 },
    drift: { min: 200, max: 600 },
    offroad: { min: 95, max: 290 },
    rally: { min: 150, max: 470 },
    drag: { min: 450, max: 1280 },
  },
  X: {
    grip: { min: 400, max: 1200 },
    street: { min: 280, max: 820 },
    drift: { min: 230, max: 680 },
    offroad: { min: 105, max: 320 },
    rally: { min: 170, max: 520 },
    drag: { min: 520, max: 1450 },
  },
};

// ==========================================
// TIRE COMPOUND MODIFIERS
// ==========================================
const tireCompoundModifiers: Record<string, { pressureOffset: number; springMod: number; name: string }> = {
  street: { pressureOffset: 1.0, springMod: 0.90, name: 'Street' },
  sport: { pressureOffset: 0, springMod: 1.00, name: 'Sport' },
  'semi-slick': { pressureOffset: -0.5, springMod: 1.05, name: 'Semi-Slick' },
  slick: { pressureOffset: -1.0, springMod: 1.10, name: 'Slick/Race' },
  rally: { pressureOffset: -4.0, springMod: 0.85, name: 'Rally' },
  offroad: { pressureOffset: -8.0, springMod: 0.78, name: 'Offroad' },
  drag: { pressureOffset: 0, springMod: 1.12, name: 'Drag' },
};

// ==========================================
// HOKIHOSHI / WEIGHT DISTRIBUTION SLIDER MATH
// ==========================================
function sliderMath(min: number, max: number, weightPercent: number): number {
  return (max - min) * (weightPercent / 100) + min;
}

// ==========================================
// ARB CALCULATION - ForzaTune Style
// Pure weight distribution + offset approach
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
  const arbOffsets: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 0, rear: 0 },
    street: { front: -3, rear: -3 },
    drift: { front: -18, rear: +12 },
    offroad: { front: -22, rear: -22 },  // Very soft for terrain absorption
    rally: { front: -14, rear: -12 },
    drag: { front: +6, rear: -12 },
  };
  
  // Drive type offsets
  const driveOffsets: Record<DriveType, { front: number; rear: number }> = {
    FWD: { front: -6, rear: +6 },   // Reduce understeer
    RWD: { front: +3, rear: -4 },   // Improve rear traction
    AWD: { front: 0, rear: 0 },
  };
  
  // Apply offsets
  const tuneOffset = arbOffsets[tuneType];
  const driveOffset = driveOffsets[driveType];
  
  arbFront = arbFront + tuneOffset.front + driveOffset.front;
  arbRear = arbRear + tuneOffset.rear + driveOffset.rear;
  
  // Apply PI class scaling (gentler for lower classes)
  const piScale = piClassScaling[piClass]?.arbScale || 1.0;
  arbFront = Math.round(arbFront * piScale);
  arbRear = Math.round(arbRear * piScale);
  
  return {
    front: Math.max(1, Math.min(65, arbFront)),
    rear: Math.max(1, Math.min(65, arbRear)),
  };
}

// ==========================================
// TIRE PRESSURE - Enhanced with Weight Scaling
// ==========================================
function calculateTirePressure(
  specs: CarSpecs,
  tuneType: TuneType
): { front: number; rear: number } {
  const { weight, weightDistribution, tireCompound } = specs;
  const tireMod = tireCompoundModifiers[tireCompound] || tireCompoundModifiers['sport'];
  
  // Base pressures by tune type
  const basePressures: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 28.0, rear: 28.0 },
    street: { front: 28.5, rear: 28.5 },
    drift: { front: 32.0, rear: 25.0 },
    drag: { front: 55.0, rear: 15.0 },
    rally: { front: 24.0, rear: 24.0 },
    offroad: { front: 18.0, rear: 18.0 },
  };
  
  let { front, rear } = basePressures[tuneType];
  
  // Apply tire compound offset
  front += tireMod.pressureOffset;
  rear += tireMod.pressureOffset;
  
  // Weight-based adjustment for offroad/rally (from dirt guide)
  if (tuneType === 'offroad') {
    // Heavy cars need more pressure to avoid bottoming rims
    if (weight > 3500) {
      const extraPressure = ((weight - 3500) / 2000) * 4;
      front += extraPressure;
      rear += extraPressure;
    }
    // Light cars can go even lower
    if (weight < 3000) {
      const reduction = ((3000 - weight) / 1500) * 2;
      front -= reduction;
      rear -= reduction;
    }
  }
  
  // Weight distribution adjustment (heavier end needs slightly more)
  if (tuneType !== 'drift' && tuneType !== 'drag') {
    const weightOffset = (weightDistribution - 50) * 0.03;
    front += weightOffset;
    rear -= weightOffset;
  }
  
  return {
    front: Math.max(14, Math.min(55, Math.round(front * 10) / 10)),
    rear: Math.max(14, Math.min(55, Math.round(rear * 10) / 10)),
  };
}

// ==========================================
// DAMPING CALCULATION - Direct Weight Distribution
// ==========================================
function calculateDamping(
  weightDistribution: number,
  tuneType: TuneType,
  piClass: string
): { reboundF: number; reboundR: number; bumpF: number; bumpR: number } {
  // Base rebound from weight distribution (19 × W% + offset)
  let reboundFront = Math.round(19 * (weightDistribution / 100) + 0.5);
  let reboundRear = Math.round(19 * ((100 - weightDistribution) / 100) + 1.0);
  
  // Tune type multipliers
  const tuneMultipliers: Record<TuneType, { reboundF: number; reboundR: number; bumpRatio: number }> = {
    grip: { reboundF: 1.0, reboundR: 1.0, bumpRatio: 0.60 },
    street: { reboundF: 0.95, reboundR: 0.95, bumpRatio: 0.60 },
    drift: { reboundF: 0.85, reboundR: 1.0, bumpRatio: 0.58 },
    offroad: { reboundF: 1.18, reboundR: 1.22, bumpRatio: 0.55 },  // High rebound for jumps
    rally: { reboundF: 1.10, reboundR: 1.15, bumpRatio: 0.55 },
    drag: { reboundF: 1.08, reboundR: 0.75, bumpRatio: 0.65 },
  };
  
  const tuneMod = tuneMultipliers[tuneType];
  const piScale = piClassScaling[piClass]?.dampingScale || 1.0;
  
  // Apply tune type and PI scaling
  reboundFront = Math.round(reboundFront * tuneMod.reboundF * piScale);
  reboundRear = Math.round(reboundRear * tuneMod.reboundR * piScale);
  
  // Clamp to valid range
  reboundFront = Math.max(1, Math.min(20, reboundFront));
  reboundRear = Math.max(1, Math.min(20, reboundRear));
  
  // Bump = percentage of rebound
  const bumpFront = Math.max(1, Math.min(20, Math.round(reboundFront * tuneMod.bumpRatio)));
  const bumpRear = Math.max(1, Math.min(20, Math.round(reboundRear * tuneMod.bumpRatio)));
  
  return { reboundF: reboundFront, reboundR: reboundRear, bumpF: bumpFront, bumpR: bumpRear };
}

// ==========================================
// DIFFERENTIAL - Enhanced with Dirt Knowledge
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
    FWD: { accelF: 30, decelF: 2, accelR: 0, decelR: 0 },
    AWD: { accelF: 15, decelF: 0, accelR: 70, decelR: 15, center: 70 },
  },
  street: {
    RWD: { accelR: 40, decelR: 18 },
    FWD: { accelF: 28, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 18, decelF: 0, accelR: 55, decelR: 12, center: 62 },
  },
  drift: {
    RWD: { accelR: 100, decelR: 100 },
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 100, decelF: 0, accelR: 100, decelR: 100, center: 82 },
  },
  // From dirt guide: Near-locked for airborne wheels
  offroad: {
    RWD: { accelR: 65, decelR: 35 },
    FWD: { accelF: 55, decelF: 15, accelR: 0, decelR: 0 },
    AWD: { accelF: 85, decelF: 15, accelR: 95, decelR: 45, center: 55 },
  },
  // From dirt guide: Higher lock than circuit
  rally: {
    RWD: { accelR: 60, decelR: 32 },
    FWD: { accelF: 48, decelF: 10, accelR: 0, decelR: 0 },
    AWD: { accelF: 50, decelF: 10, accelR: 78, decelR: 38, center: 58 },
  },
  drag: {
    RWD: { accelR: 100, decelR: 0 },
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 85, decelF: 0, accelR: 100, decelR: 0, center: 70 },
  },
};

// ==========================================
// RIDE HEIGHT by Tune Type (From Dirt Guide)
// ==========================================
const rideHeightPresets: Record<TuneType, { front: number; rear: number }> = {
  grip: { front: 4.5, rear: 4.8 },
  street: { front: 5.5, rear: 5.8 },
  drift: { front: 5.5, rear: 4.8 },
  offroad: { front: 10.0, rear: 9.9 },  // Max height, rear slightly lower for understeer
  rally: { front: 8.2, rear: 8.5 },
  drag: { front: 6.5, rear: 4.0 },
};

// ==========================================
// ALIGNMENT - Enhanced with Dirt Values
// ==========================================
const alignmentPresets: Record<TuneType, { 
  camberF: number; 
  camberR: number; 
  toeF: number; 
  toeR: number; 
  caster: number 
}> = {
  grip: { camberF: -1.8, camberR: -1.2, toeF: 0.1, toeR: -0.2, caster: 6.0 },
  street: { camberF: -1.2, camberR: -0.8, toeF: 0.0, toeR: -0.1, caster: 5.5 },
  drift: { camberF: -5.0, camberR: -0.5, toeF: 2.5, toeR: -0.5, caster: 7.0 },
  // From dirt guide: Less aggressive camber for stability
  offroad: { camberF: -1.0, camberR: -0.5, toeF: 0.0, toeR: 0.1, caster: 5.5 },
  rally: { camberF: -1.3, camberR: -0.8, toeF: 0.0, toeR: 0.0, caster: 5.8 },
  drag: { camberF: 0.0, camberR: -0.3, toeF: 0.0, toeR: 0.0, caster: 7.0 },
};

// ==========================================
// BRAKE PRESETS - With Dirt Adjustments
// ==========================================
const brakePresets: Record<TuneType, { pressure: number; targetFrontBias: number }> = {
  grip: { pressure: 100, targetFrontBias: 60 },
  street: { pressure: 92, targetFrontBias: 58 },
  drift: { pressure: 85, targetFrontBias: 52 },
  // From dirt guide: Lower pressure, rear bias for rotation
  offroad: { pressure: 88, targetFrontBias: 50 },
  rally: { pressure: 90, targetFrontBias: 52 },
  drag: { pressure: 100, targetFrontBias: 55 },
};

// ==========================================
// GEARING
// ==========================================
const gearingPresets: Record<TuneType, { first: number; last: number; finalDrive: number }> = {
  grip: { first: 3.40, last: 0.72, finalDrive: 3.80 },
  street: { first: 3.30, last: 0.68, finalDrive: 3.50 },
  drift: { first: 3.80, last: 0.85, finalDrive: 4.20 },
  offroad: { first: 3.50, last: 0.78, finalDrive: 3.70 },
  rally: { first: 3.45, last: 0.75, finalDrive: 3.65 },
  drag: { first: 2.90, last: 0.55, finalDrive: 2.90 },
};

function calculateGearRatios(firstGear: number, lastGear: number, gearCount: number): number[] {
  const ratios: number[] = [];
  for (let n = 1; n <= gearCount; n++) {
    const ratio = firstGear * Math.pow(lastGear / firstGear, (n - 1) / (gearCount - 1));
    ratios.push(Math.round(ratio * 100) / 100);
  }
  return ratios;
}

function calculateDynamicFinalDrive(baseFD: number, horsepower: number, tuneType: TuneType): number {
  const researchFD = ((400 - horsepower) / 600) + 4.25;
  let finalDrive = (researchFD * 0.7) + (baseFD * 0.3);
  
  if (tuneType === 'drag') finalDrive *= 0.85;
  else if (tuneType === 'drift') finalDrive *= 1.08;
  else if (tuneType === 'offroad' || tuneType === 'rally') finalDrive *= 1.05;
  
  return Math.max(2.5, Math.min(5.5, Math.round(finalDrive * 100) / 100));
}

// ==========================================
// POWER-TO-WEIGHT CALCULATION
// ==========================================
function getPowerToWeightMultiplier(horsepower: number, weightLbs: number): { ratio: number; multiplier: number } {
  const ratio = horsepower / (weightLbs / 1000);
  const multiplier = 0.80 + (ratio / 500) * 0.55;
  return {
    ratio: Math.round(ratio),
    multiplier: Math.max(0.75, Math.min(1.40, multiplier))
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
// ==========================================
export function calculateTune(specs: CarSpecs, tuneType: TuneType): TuneSettings {
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
  
  // Get modifiers
  const tireMod = tireCompoundModifiers[tireCompound] || tireCompoundModifiers['sport'];
  const piMod = piClassScaling[piClass] || piClassScaling['A'];
  const powerWeight = getPowerToWeightMultiplier(horsepower, weight);
  
  // Combined modifier (gentler than before)
  const combinedStiffness = powerWeight.multiplier * (piMod.springScale * 0.5 + 0.5) * tireMod.springMod;
  
  const modifiers: TuneModifiers = {
    powerToWeight: powerWeight,
    tireCompound: tireMod,
    piClass: { name: piMod.name, stiffnessMod: piMod.springScale, diffAggression: piMod.diffAggression },
    drivingStyle: { value: drivingStyle, description: getDrivingStyleDescription(drivingStyle) },
    combinedStiffness: Math.round(combinedStiffness * 100) / 100
  };
  
  // ==========================================
  // TIRES - Weight-scaled calculation
  // ==========================================
  const tirePressures = calculateTirePressure(specs, tuneType);
  
  // ==========================================
  // ALIGNMENT
  // ==========================================
  const alignment = alignmentPresets[tuneType];
  let camberFront = alignment.camberF;
  let camberRear = alignment.camberR;
  
  // Adjust for heavy cars
  if (weight > 3500) {
    camberFront -= 0.2;
    camberRear -= 0.1;
  }
  
  // Extreme weight distribution adjustment
  if (weightDistribution > 55) {
    camberFront -= 0.2;
  } else if (weightDistribution < 45) {
    camberRear -= 0.2;
  }
  
  // ==========================================
  // ANTI-ROLL BARS - Enhanced ForzaTune-style
  // ==========================================
  let arbs = calculateARB_Enhanced(weightDistribution, tuneType, driveType, piClass);
  
  // Apply driving style offset (±5 per style point)
  arbs.front = Math.max(1, Math.min(65, arbs.front + drivingStyle * 3));
  arbs.rear = Math.max(1, Math.min(65, arbs.rear - drivingStyle * 3));
  
  // ==========================================
  // SPRINGS - PI-aware ranges
  // ==========================================
  const springRange = springRangesByPI[piClass]?.[tuneType] || springRangesByPI['A'][tuneType];
  
  let springsFront = sliderMath(springRange.min, springRange.max, weightDistribution);
  let springsRear = sliderMath(springRange.min, springRange.max, 100 - weightDistribution);
  
  // Apply power-to-weight and tire compound modifiers (gentler)
  const springMod = powerWeight.multiplier * tireMod.springMod;
  springsFront = Math.round(springsFront * springMod);
  springsRear = Math.round(springsRear * springMod);
  
  // Aero adjustment
  if (hasAero && frontDownforce > 100) {
    springsFront += Math.round(frontDownforce * 0.08);
    springsRear += Math.round(rearDownforce * 0.08);
  }
  
  // Drag: stiff front, soft rear for squat
  if (tuneType === 'drag') {
    springsFront = Math.round(springsFront * 1.12);
    springsRear = Math.round(springsRear * 0.72);
  }
  
  // Clamp
  const maxSpring = Math.round(springRange.max * 1.3);
  springsFront = Math.max(springRange.min, Math.min(maxSpring, springsFront));
  springsRear = Math.max(springRange.min, Math.min(maxSpring, springsRear));
  
  // ==========================================
  // RIDE HEIGHT
  // ==========================================
  let rideHeightFront = rideHeightPresets[tuneType].front;
  let rideHeightRear = rideHeightPresets[tuneType].rear;
  
  if (hasAero && (tuneType === 'grip' || tuneType === 'street')) {
    rideHeightFront = 4.0;
    rideHeightRear = 4.2;
  }
  
  // ==========================================
  // DAMPING - Direct weight distribution
  // ==========================================
  const damping = calculateDamping(weightDistribution, tuneType, piClass);
  
  // ==========================================
  // AERO
  // ==========================================
  let aeroFront = 0;
  let aeroRear = 0;
  
  if (hasAero) {
    const aeroTargets: Record<TuneType, { frontPct: number; rearPct: number }> = {
      grip: { frontPct: 0.65, rearPct: 0.75 },
      street: { frontPct: 0.40, rearPct: 0.50 },
      drift: { frontPct: 0.15, rearPct: 0.30 },
      offroad: { frontPct: 0.25, rearPct: 0.35 },
      rally: { frontPct: 0.35, rearPct: 0.45 },
      drag: { frontPct: 0.0, rearPct: 0.0 },
    };
    
    const targets = aeroTargets[tuneType];
    const maxFrontAero = frontDownforce > 0 ? frontDownforce : 400;
    const maxRearAero = rearDownforce > 0 ? rearDownforce : 400;
    
    let frontAdjust = 0;
    let rearAdjust = 0;
    
    if (driveType === 'FWD') {
      frontAdjust = -0.10;
      rearAdjust = 0.15;
    } else if (driveType === 'RWD') {
      rearAdjust = 0.10;
    }
    
    if (weightDistribution > 55) {
      rearAdjust += 0.10;
    } else if (weightDistribution < 45) {
      frontAdjust += 0.10;
    }
    
    aeroFront = Math.round(maxFrontAero * Math.max(0, Math.min(1, targets.frontPct + frontAdjust)));
    aeroRear = Math.round(maxRearAero * Math.max(0, Math.min(1, targets.rearPct + rearAdjust)));
  }
  
  // ==========================================
  // DIFFERENTIAL - Enhanced matrix
  // ==========================================
  const diff = enhancedDiffMatrix[tuneType][driveType];
  
  // Apply PI class aggression
  let diffAccelRear = Math.round((diff.accelR || 0) * (1 + piMod.diffAggression));
  let diffDecelRear = Math.round((diff.decelR || 0) * (1 + piMod.diffAggression * 0.5));
  let diffAccelFront = diff.accelF ? Math.round(diff.accelF * (1 + piMod.diffAggression)) : undefined;
  let diffDecelFront = diff.decelF;
  let centerBalance = diff.center;
  
  // Driving style: loose = more aggressive
  diffAccelRear = Math.round(diffAccelRear + (drivingStyle * 4));
  
  // Clamp
  diffAccelRear = Math.max(0, Math.min(100, diffAccelRear));
  diffDecelRear = Math.max(0, Math.min(100, diffDecelRear));
  if (diffAccelFront !== undefined) {
    diffAccelFront = Math.max(0, Math.min(100, diffAccelFront));
  }
  
  // ==========================================
  // BRAKES
  // ==========================================
  const brakes = brakePresets[tuneType];
  let targetFrontBias = brakes.targetFrontBias;
  
  const weightOffset = weightDistribution - 50;
  targetFrontBias += Math.round(weightOffset * 0.15);
  targetFrontBias = Math.max(45, Math.min(70, targetFrontBias));
  
  const brakeBalance = 100 - targetFrontBias;
  const brakeBalanceNote = `Set slider to ${brakeBalance}% to achieve ${targetFrontBias}% front bias (FH5 slider is inverted)`;
  
  // ==========================================
  // GEARING
  // ==========================================
  const gearing = gearingPresets[tuneType];
  const gearCount = specs.gearCount || 6;
  const gearRatios = calculateGearRatios(gearing.first, gearing.last, gearCount);
  const finalDrive = calculateDynamicFinalDrive(gearing.finalDrive, horsepower, tuneType);
  
  const gearingNotes: Record<TuneType, string> = {
    grip: `Final drive ${finalDrive.toFixed(2)} calculated for ${horsepower}HP`,
    street: `Balanced gearing for ${horsepower}HP`,
    drift: `Short gearing for angle control at ${horsepower}HP`,
    offroad: `Torque-focused gearing for ${horsepower}HP`,
    rally: `Mixed surface gearing for ${horsepower}HP`,
    drag: `Top speed gearing for ${horsepower}HP`,
  };
  
  // ==========================================
  // RETURN FINAL TUNE
  // ==========================================
  return {
    tirePressureFront: tirePressures.front,
    tirePressureRear: tirePressures.rear,
    finalDrive: Math.round(finalDrive * 100) / 100,
    gearRatios,
    gearingNote: gearingNotes[tuneType],
    camberFront: Math.round(camberFront * 10) / 10,
    camberRear: Math.round(camberRear * 10) / 10,
    toeFront: Math.round(alignment.toeF * 10) / 10,
    toeRear: Math.round(alignment.toeR * 10) / 10,
    caster: Math.round(alignment.caster * 10) / 10,
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
    diffAccelRear,
    diffDecelRear,
    centerBalance,
    brakePressure: brakes.pressure,
    brakeBalance,
    brakeBalanceNote,
    modifiers,
  };
}

// ==========================================
// TUNE TYPE DESCRIPTIONS - Enhanced with Dirt Tips
// ==========================================
export const tuneTypeDescriptions: Record<TuneType, { 
  title: string; 
  description: string; 
  icon: string; 
  tips: string[] 
}> = {
  grip: {
    title: 'Circuit/Grip',
    description: 'Maximum cornering grip for track racing',
    icon: '🏎️',
    tips: [
      'Target hot tire pressure: 32-34 PSI (start cold at 28 PSI)',
      'Camber: -1.5° to -2.5° Front, -1.0° to -1.8° Rear for flat contact',
      'Diff: 45-60% accel / 20-30% decel balances rotation vs traction',
      'AWD center: 65-75% rear bias reduces understeer',
    ],
  },
  street: {
    title: 'Street',
    description: 'Versatile setup for mixed conditions and traffic',
    icon: '🛣️',
    tips: [
      'Softer springs than circuit (10-15%) for potholes and curbs',
      'Reduced brake pressure (90-95%) for panic stops near traffic',
      'Slightly shorter final drive - street races prioritize acceleration',
      'Moderate camber for tire longevity and predictability',
    ],
  },
  drift: {
    title: 'Drift',
    description: 'Maximum angle and slide control',
    icon: '💨',
    tips: [
      'High front pressure (30-36 PSI) reduces grip for easier initiation',
      'Low rear pressure (20-30 PSI) modulates the slide threshold',
      'Extreme front camber (-5.0°) keeps tire flat at full steering lock',
      'Positive front toe (1-5°) increases Ackerman for deep angles',
    ],
  },
  offroad: {
    title: 'Off-Road/Cross Country',
    description: 'Maximum flotation and stability for rough terrain',
    icon: '🏔️',
    tips: [
      'Very low pressure (17-22 PSI) maximizes footprint for flotation',
      'Maximum ride height (9-10") prevents bottoming out on jumps',
      'High rebound damping "sticks" landings - aim for 20-80% travel',
      'Near-locked diff (80-100%) keeps power to grounded wheels',
      'Softer springs (25-50% less than road) maintain tire contact',
      'AWD preferred - center diff 50-55% for balanced traction',
    ],
  },
  rally: {
    title: 'Rally',
    description: 'Mixed surface versatility (tarmac + dirt)',
    icon: '🌲',
    tips: [
      'Medium-low pressure (22-25 PSI) balances tarmac and loose surfaces',
      'Softer springs than road but stiffer than cross-country',
      'Higher ride height (8") for jumps while maintaining cornering',
      'Trail braking into corners helps rotate the car',
      'Diff lock higher than road (60-75%) for loose surface traction',
      'ARBs slightly stiffer than road for stability on unpredictable surfaces',
    ],
  },
  drag: {
    title: 'Drag',
    description: 'Maximum straight-line acceleration',
    icon: '⚡',
    tips: [
      'Max front pressure (55 PSI) reduces rolling resistance',
      'Min rear pressure (15 PSI) creates "wrinkle wall" effect for grip',
      'Soft rear springs + max rear ride height for squat/weight transfer',
      '100% accel / 0% decel diff - locked launch, open for stability at trap',
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
