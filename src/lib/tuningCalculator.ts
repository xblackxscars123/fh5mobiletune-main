// Forza Horizon 5 Tuning Calculator
// Enhanced with power-to-weight scaling, tire compound modifiers, PI class awareness, 
// dynamic gearing, and driving style adjustments

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
// TIRE COMPOUND MODIFIERS
// Affects pressure and suspension stiffness
// Research: Different compounds have different optimal operating ranges
// ==========================================
const tireCompoundModifiers: Record<string, { pressureOffset: number; springMod: number; name: string }> = {
  street: { pressureOffset: 1.0, springMod: 0.88, name: 'Street' },
  sport: { pressureOffset: 0, springMod: 1.00, name: 'Sport' },
  'semi-slick': { pressureOffset: -0.5, springMod: 1.05, name: 'Semi-Slick' },
  slick: { pressureOffset: -1.0, springMod: 1.12, name: 'Slick/Race' },
  rally: { pressureOffset: -5.0, springMod: 0.82, name: 'Rally' },         // Research: Rally needs 22-25 PSI
  offroad: { pressureOffset: -9.0, springMod: 0.75, name: 'Offroad' },     // Research: Flotation physics - 15-19 PSI
  drag: { pressureOffset: 0, springMod: 1.15, name: 'Drag' },              // Research: Special handling (front/rear differ)
};

// ==========================================
// PI CLASS MODIFIERS
// Higher classes need stiffer, more aggressive setups
// ==========================================
const piClassModifiers: Record<string, { stiffnessMod: number; diffAggression: number; name: string }> = {
  D: { stiffnessMod: 0.80, diffAggression: -0.15, name: 'D Class' },
  C: { stiffnessMod: 0.85, diffAggression: -0.10, name: 'C Class' },
  B: { stiffnessMod: 0.90, diffAggression: -0.05, name: 'B Class' },
  A: { stiffnessMod: 1.00, diffAggression: 0, name: 'A Class' },
  S1: { stiffnessMod: 1.10, diffAggression: 0.05, name: 'S1 Class' },
  S2: { stiffnessMod: 1.20, diffAggression: 0.10, name: 'S2 Class' },
  X: { stiffnessMod: 1.30, diffAggression: 0.15, name: 'X Class' },
};

// ==========================================
// TIRE PRESSURE - Thermodynamics Model
// Research: Target "hot" pressure 32-34 PSI for road surfaces
// Cold pressure should be 27-28.5 PSI anticipating 4-6 PSI rise
// Off-road: 15-19 PSI for flotation physics (reduces sink depth)
// ==========================================
const tirePressurePresets: Record<TuneType, { front: number; rear: number }> = {
  grip: { front: 28.0, rear: 28.0 },     // Research: Circuit optimal cold start
  street: { front: 28.5, rear: 28.5 },   // Research: Slightly higher for mixed use
  drift: { front: 32.0, rear: 25.0 },    // Research: High front reduces grip, low rear modulates slide
  offroad: { front: 17.0, rear: 17.0 },  // Research: Flotation physics - maximize footprint
  rally: { front: 23.0, rear: 23.0 },    // Research: Rally 22-25 PSI for loose surfaces
  drag: { front: 55.0, rear: 15.0 },     // Research: Max front stability, min rear for wrinkle-wall effect
};

// ==========================================
// ALIGNMENT PRESETS
// Research: Camber counteracts body roll, keeping tire flat
// Circuit: -1.5° to -2.5° Front, -1.0° to -1.8° Rear
// Drift: -5.0° Front (flat at full lock), near 0° Rear
// Toe: Positive front toe-out aids turn-in; rear toe-in adds stability
// Caster: 5.5°-6.5° for dynamic camber gain during cornering
// ==========================================
const alignmentPresets: Record<TuneType, { 
  camberF: number; 
  camberR: number; 
  toeF: number; 
  toeR: number; 
  caster: number 
}> = {
  grip: { camberF: -1.8, camberR: -1.2, toeF: 0.1, toeR: -0.2, caster: 6.0 },   // Research: Circuit values
  street: { camberF: -1.2, camberR: -0.8, toeF: 0, toeR: -0.1, caster: 5.5 },
  drift: { camberF: -5.0, camberR: -0.5, toeF: 2.5, toeR: -0.5, caster: 7.0 },  // Research: Extreme front, flat rear
  offroad: { camberF: -0.5, camberR: -0.3, toeF: 0, toeR: 0, caster: 5.0 },
  rally: { camberF: -1.0, camberR: -0.5, toeF: 0, toeR: -0.1, caster: 5.5 },
  drag: { camberF: 0, camberR: -0.3, toeF: 0, toeR: 0, caster: 7.0 },
};

// ==========================================
// DIFFERENTIAL MATRIX
// Research: Based on verified discipline-specific settings
// Circuit RWD: 45-60% accel, 20-30% decel for rotation vs traction balance
// Circuit AWD: 10-20% front, 60-80% rear, 65-75% center (rear bias reduces understeer)
// Drift: 100%/100% for consistent slide character
// Off-Road AWD: Near-locked (80-100%) to prevent wheelspin on airborne wheels
// ==========================================
const diffMatrix: Record<TuneType, Record<DriveType, { 
  accelF?: number; 
  decelF?: number; 
  accelR: number; 
  decelR: number; 
  center?: number 
}>> = {
  grip: {
    RWD: { accelR: 52, decelR: 25 },                                          // Research: 45-60% / 20-30%
    FWD: { accelF: 30, decelF: 2, accelR: 0, decelR: 0 },                      // Research: Low decel prevents lift-off spin
    AWD: { accelF: 15, decelF: 0, accelR: 70, decelR: 15, center: 70 },        // Research: Rear bias 65-75%
  },
  street: {
    RWD: { accelR: 40, decelR: 18 },
    FWD: { accelF: 28, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 18, decelF: 0, accelR: 55, decelR: 12, center: 62 },
  },
  drift: {
    RWD: { accelR: 100, decelR: 100 },                                         // Research: Locked for consistent slides
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 100, decelF: 0, accelR: 100, decelR: 100, center: 82 },     // Research: 75-90% center
  },
  offroad: {
    RWD: { accelR: 45, decelR: 15 },
    FWD: { accelF: 40, decelF: 5, accelR: 0, decelR: 0 },
    AWD: { accelF: 80, decelF: 5, accelR: 95, decelR: 40, center: 50 },        // Research: Near-locked for airborne wheels
  },
  rally: {
    RWD: { accelR: 55, decelR: 30 },                                           // Research: Higher lock for loose surfaces
    FWD: { accelF: 45, decelF: 8, accelR: 0, decelR: 0 },
    AWD: { accelF: 40, decelF: 5, accelR: 65, decelR: 32, center: 55 },        // Research: 50-60% center
  },
  drag: {
    RWD: { accelR: 100, decelR: 0 },                                           // Research: Locked launch, open decel
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 85, decelF: 0, accelR: 100, decelR: 0, center: 70 },
  },
};

// ==========================================
// BRAKE PRESETS
// Research: FH5 brake bias slider is INVERTED
// To achieve 60% front bias → set slider to 40%
// With ABS: 100%+ pressure; Without ABS: 85-100% for threshold braking
// ==========================================
const brakePresets: Record<TuneType, { pressure: number; targetFrontBias: number }> = {
  grip: { pressure: 100, targetFrontBias: 60 },      // Research: Standard stable bias
  street: { pressure: 92, targetFrontBias: 58 },     // Research: Slightly less for unpredictable obstacles
  drift: { pressure: 85, targetFrontBias: 52 },      // Research: More rear bias for rotation
  offroad: { pressure: 88, targetFrontBias: 54 },
  rally: { pressure: 92, targetFrontBias: 56 },
  drag: { pressure: 100, targetFrontBias: 55 },
};

// ==========================================
// HOKIHOSHI / WEIGHT DISTRIBUTION SLIDER MATH FORMULA
// Research confirmed: SpringFront = (Max - Min) × W_Front% + Min
// This ensures mechanical grip is distributed proportionally to weight
// ==========================================
function sliderMath(min: number, max: number, weightPercent: number): number {
  return (max - min) * (weightPercent / 100) + min;
}

// ==========================================
// ARB FORMULA (Research: Range is 1-65, hence multiplier 64)
// ARB_Front = (64 × W_Front%) + 0.5
// ARB_Rear = (64 × W_Rear%) + 0.5
// ==========================================
function calculateARB(weightPercent: number): number {
  return Math.round((64 * (weightPercent / 100)) + 0.5);
}

// ==========================================
// REBOUND FORMULA (Research validated)
// Rebound_Front = (19 × W_Front%) + 0.5
// Rebound_Rear = (19 × W_Rear%) + 1.0 (slightly higher to prevent lift-off oversteer)
// ==========================================
function calculateRebound(weightPercent: number, isRear: boolean): number {
  const base = 19 * (weightPercent / 100);
  return Math.round(base + (isRear ? 1.0 : 0.5));
}

// Spring ranges by tune type (based on ride frequency research)
// Street: 1.0-1.5 Hz, Sports: 1.5-2.0 Hz, Race: 2.0-3.0+ Hz
const springRanges: Record<TuneType, { min: number; max: number }> = {
  grip: { min: 250, max: 850 },     // Circuit - stiff for lateral G
  street: { min: 180, max: 550 },   // Softer for potholes/curbs
  drift: { min: 180, max: 480 },    // Medium for predictable transitions
  offroad: { min: 80, max: 250 },   // Very soft (1.0-1.5 Hz) for terrain absorption
  rally: { min: 120, max: 380 },    // Soft (1.5-2.0 Hz) for washboards
  drag: { min: 350, max: 1100 },    // Split: stiff front, soft rear (handled in calculation)
};

// ==========================================
// POWER-TO-WEIGHT CALCULATION
// Higher power = stiffer suspension to handle g-forces
// ==========================================
function getPowerToWeightMultiplier(horsepower: number, weightLbs: number): { ratio: number; multiplier: number } {
  // Power to weight in HP per 1000 lbs
  const ratio = horsepower / (weightLbs / 1000);
  
  // Scale from 0.80 (low power) to 1.35 (very high power)
  // ~200 hp/1000lbs = 1.0 baseline
  // ~100 hp/1000lbs = 0.80
  // ~400 hp/1000lbs = 1.35
  const multiplier = 0.80 + (ratio / 500) * 0.55;
  
  return {
    ratio: Math.round(ratio),
    multiplier: Math.max(0.75, Math.min(1.40, multiplier))
  };
}

// ==========================================
// DYNAMIC FINAL DRIVE CALCULATION
// Research formula: Final Drive ≈ (400 - HP) / 600 + 4.25 (for 6-speed)
// Higher HP = longer (lower) final drive to hit top speed at redline
// ==========================================
function calculateDynamicFinalDrive(baseFD: number, horsepower: number, tuneType: TuneType): number {
  // Research-based formula: (400 - HP) / 600 + 4.25
  const researchFD = ((400 - horsepower) / 600) + 4.25;
  
  // Blend with discipline-specific base (70% research, 30% preset)
  let finalDrive = (researchFD * 0.7) + (baseFD * 0.3);
  
  // Discipline adjustments
  if (tuneType === 'drag') {
    // Drag prioritizes top speed - go longer
    finalDrive *= 0.85;
  } else if (tuneType === 'drift') {
    // Drift needs shorter for angle control
    finalDrive *= 1.08;
  } else if (tuneType === 'offroad' || tuneType === 'rally') {
    // Off-road needs more torque multiplication
    finalDrive *= 1.05;
  }
  
  return Math.max(2.5, Math.min(5.5, Math.round(finalDrive * 100) / 100));
}

// ==========================================
// GEOMETRIC GEARING FORMULA
// ==========================================
function calculateGearRatios(firstGear: number, lastGear: number, gearCount: number): number[] {
  const ratios: number[] = [];
  for (let n = 1; n <= gearCount; n++) {
    const ratio = firstGear * Math.pow(lastGear / firstGear, (n - 1) / (gearCount - 1));
    ratios.push(Math.round(ratio * 100) / 100);
  }
  return ratios;
}

// Gear ratio targets by tune type
const gearingPresets: Record<TuneType, { first: number; last: number; finalDrive: number }> = {
  grip: { first: 3.40, last: 0.72, finalDrive: 3.80 },
  street: { first: 3.30, last: 0.68, finalDrive: 3.50 },
  drift: { first: 3.80, last: 0.85, finalDrive: 4.20 },
  offroad: { first: 3.50, last: 0.78, finalDrive: 3.70 },
  rally: { first: 3.45, last: 0.75, finalDrive: 3.65 },
  drag: { first: 2.90, last: 0.55, finalDrive: 2.90 },
};

// ==========================================
// UNIT CONVERSION UTILITIES
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

// ==========================================
// DRIVING STYLE DESCRIPTIONS
// ==========================================
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
// Discipline-specific starting points
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
// Enhanced with all modifiers
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
  
  // Weight distribution as decimals
  const frontWeightPct = weightDistribution / 100;
  const rearWeightPct = 1 - frontWeightPct;
  
  // ==========================================
  // GET ALL MODIFIERS
  // ==========================================
  const tireMod = tireCompoundModifiers[tireCompound] || tireCompoundModifiers['sport'];
  const piMod = piClassModifiers[piClass] || piClassModifiers['A'];
  const powerWeight = getPowerToWeightMultiplier(horsepower, weight);
  
  // Combined stiffness modifier
  const combinedStiffness = powerWeight.multiplier * piMod.stiffnessMod * tireMod.springMod;
  
  // Build modifiers object for transparency
  const modifiers: TuneModifiers = {
    powerToWeight: powerWeight,
    tireCompound: tireMod,
    piClass: piMod,
    drivingStyle: { value: drivingStyle, description: getDrivingStyleDescription(drivingStyle) },
    combinedStiffness: Math.round(combinedStiffness * 100) / 100
  };
  
  // ==========================================
  // TIRES - With compound modifier
  // ==========================================
  const basePressures = tirePressurePresets[tuneType];
  let tirePressureFront = basePressures.front + tireMod.pressureOffset;
  let tirePressureRear = basePressures.rear + tireMod.pressureOffset;
  
  // Adjust for weight distribution (heavier end needs slightly more pressure)
  if (tuneType !== 'drift' && tuneType !== 'drag') {
    const weightOffset = weightDistribution - 50;
    tirePressureFront += weightOffset * 0.03;
    tirePressureRear -= weightOffset * 0.03;
  }
  
  // ==========================================
  // ALIGNMENT
  // ==========================================
  const alignment = alignmentPresets[tuneType];
  let camberFront = alignment.camberF;
  let camberRear = alignment.camberR;
  
  // Adjust for heavy cars (>3500 lbs)
  if (weight > 3500) {
    camberFront -= 0.2;
    camberRear -= 0.1;
  }
  
  // Adjust for extreme weight distribution
  if (weightDistribution > 55) {
    camberFront -= 0.2;
  } else if (weightDistribution < 45) {
    camberRear -= 0.2;
  }
  
  // ==========================================
  // ANTI-ROLL BARS - Research formula: ARB = (64 × Weight%) + 0.5
  // Range is 1-65, applying weight-proportional distribution
  // ==========================================
  
  // Use research-validated ARB formula
  let arbFront = calculateARB(weightDistribution);
  let arbRear = calculateARB(100 - weightDistribution);
  
  // Drive type balance offsets
  if (driveType === 'FWD') {
    arbFront *= 0.75;   // Softer front reduces understeer
    arbRear *= 1.15;    // Stiffer rear aids rotation
  } else if (driveType === 'RWD') {
    arbFront *= 1.05;
    arbRear *= 0.92;    // Softer rear aids traction
  }
  
  // Discipline-specific modifiers
  if (tuneType === 'drift') {
    arbFront *= 0.55;   // Very soft front for easy initiation
    arbRear *= 1.25;    // Stiffer rear for consistent slides
  } else if (tuneType === 'offroad' || tuneType === 'rally') {
    arbFront *= 0.55;   // Soft for wheel independence
    arbRear *= 0.55;
  } else if (tuneType === 'drag') {
    arbFront *= 1.1;    // Stiff front for stability
    arbRear *= 0.7;     // Soft rear for squat
  }
  
  // Apply driving style: negative = more understeer (stiffer rear)
  // positive = more oversteer (stiffer front)
  arbFront += drivingStyle * 2.5;
  arbRear -= drivingStyle * 2.5;
  
  // Apply combined stiffness modifier
  arbFront = Math.round(arbFront * combinedStiffness);
  arbRear = Math.round(arbRear * combinedStiffness);
  
  arbFront = Math.max(1, Math.min(65, arbFront));
  arbRear = Math.max(1, Math.min(65, arbRear));
  
  // ==========================================
  // SPRINGS - With all modifiers applied
  // ==========================================
  const springRange = springRanges[tuneType];
  
  // Pure weight-based calculation
  let springsFront = sliderMath(springRange.min, springRange.max, weightDistribution);
  let springsRear = sliderMath(springRange.min, springRange.max, 100 - weightDistribution);
  
  // Apply combined stiffness modifier (power + PI + tire compound)
  springsFront = Math.round(springsFront * combinedStiffness);
  springsRear = Math.round(springsRear * combinedStiffness);
  
  // Aero adjustment
  if (hasAero && frontDownforce > 100) {
    springsFront += Math.round(frontDownforce * 0.1);
    springsRear += Math.round(rearDownforce * 0.1);
  }
  
  // Clamp to expanded range for high-power builds
  const maxSpring = Math.round(springRange.max * 1.4);
  springsFront = Math.max(springRange.min, Math.min(maxSpring, springsFront));
  springsRear = Math.max(springRange.min, Math.min(maxSpring, springsRear));
  
  // Ride height - Research: Drag needs max front/min rear for weight transfer
  const rideHeightPresets: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 4.5, rear: 4.8 },
    street: { front: 5.5, rear: 5.8 },
    drift: { front: 5.5, rear: 4.8 },     // Slightly lower rear
    offroad: { front: 9.5, rear: 10.0 },  // Research: Maximum ride height
    rally: { front: 8.0, rear: 8.5 },     // High for jumps
    drag: { front: 6.5, rear: 4.0 },      // Research: Max front / Min rear for squat
  };
  
  let rideHeightFront = rideHeightPresets[tuneType].front;
  let rideHeightRear = rideHeightPresets[tuneType].rear;
  
  if (hasAero && (tuneType === 'grip' || tuneType === 'street')) {
    rideHeightFront = 4.0;
    rideHeightRear = 4.2;
  }
  
  // Research: Drag rear springs should be SOFT for squat/weight transfer
  // Override the spring calculation for drag
  if (tuneType === 'drag') {
    // Stiff front prevents nose dive
    springsFront = Math.round(springsFront * 1.15);
    // Soft rear allows squat for launch traction
    springsRear = Math.round(springsRear * 0.70);
  }
  
  // ==========================================
  // DAMPING - Research-validated formulas
  // Rebound_Front = (19 × W_Front%) + 0.5
  // Rebound_Rear = (19 × W_Rear%) + 1.0 (slightly higher prevents lift-off oversteer)
  // Bump = Rebound × 0.60 (research: 50-75% of rebound)
  // ==========================================
  let reboundFront = calculateRebound(weightDistribution, false);
  let reboundRear = calculateRebound(100 - weightDistribution, true);
  
  // Scale with stiffness modifier (slightly dampened to prevent over-stiffening)
  reboundFront = Math.round(reboundFront * (combinedStiffness * 0.88));
  reboundRear = Math.round(reboundRear * (combinedStiffness * 0.88));
  
  // Discipline-specific adjustments
  if (tuneType === 'offroad') {
    // Research: High rebound to "stick" jump landings
    reboundFront = Math.round(reboundFront * 1.15);
    reboundRear = Math.round(reboundRear * 1.20);
  } else if (tuneType === 'rally') {
    reboundFront = Math.round(reboundFront * 1.08);
    reboundRear = Math.round(reboundRear * 1.12);
  } else if (tuneType === 'drift') {
    reboundFront = Math.round(reboundFront * 0.88);
    reboundRear = Math.round(reboundRear * 1.02);
  } else if (tuneType === 'drag') {
    // Stiff front, soft rear for weight transfer
    reboundFront = Math.round(reboundFront * 1.10);
    reboundRear = Math.round(reboundRear * 0.75);
  }
  
  reboundFront = Math.max(1, Math.min(20, reboundFront));
  reboundRear = Math.max(1, Math.min(20, reboundRear));
  
  // Research: Bump = 50-75% of Rebound (60% is baseline)
  const bumpRatio = tuneType === 'offroad' ? 0.55 : (tuneType === 'drag' ? 0.65 : 0.60);
  let bumpFront = Math.round(reboundFront * bumpRatio);
  let bumpRear = Math.round(reboundRear * bumpRatio);
  
  bumpFront = Math.max(1, Math.min(20, bumpFront));
  bumpRear = Math.max(1, Math.min(20, bumpRear));
  
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
  // DIFFERENTIAL - With PI class modifier
  // ==========================================
  const diff = diffMatrix[tuneType][driveType];
  
  // Apply PI class aggression modifier
  let diffAccelRear = Math.round((diff.accelR || 0) * (1 + piMod.diffAggression));
  let diffDecelRear = Math.round((diff.decelR || 0) * (1 + piMod.diffAggression * 0.5));
  let diffAccelFront = diff.accelF ? Math.round(diff.accelF * (1 + piMod.diffAggression)) : undefined;
  let diffDecelFront = diff.decelF;
  let centerBalance = diff.center;
  
  // Apply driving style: loose = more aggressive diff
  diffAccelRear = Math.round(diffAccelRear + (drivingStyle * 5));
  
  // Clamp values
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
  // GEARING - Dynamic based on horsepower
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
    tirePressureFront: Math.round(tirePressureFront * 10) / 10,
    tirePressureRear: Math.round(tirePressureRear * 10) / 10,
    finalDrive: Math.round(finalDrive * 100) / 100,
    gearRatios,
    gearingNote: gearingNotes[tuneType],
    camberFront: Math.round(camberFront * 10) / 10,
    camberRear: Math.round(camberRear * 10) / 10,
    toeFront: Math.round(alignment.toeF * 10) / 10,
    toeRear: Math.round(alignment.toeR * 10) / 10,
    caster: Math.round(alignment.caster * 10) / 10,
    arbFront,
    arbRear,
    springsFront,
    springsRear,
    rideHeightFront: Math.round(rideHeightFront * 10) / 10,
    rideHeightRear: Math.round(rideHeightRear * 10) / 10,
    reboundFront,
    reboundRear,
    bumpFront,
    bumpRear,
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
// TUNE TYPE DESCRIPTIONS
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
    description: 'Flotation physics for rough terrain',
    icon: '🏔️',
    tips: [
      'Very low pressure (15-19 PSI) maximizes footprint for flotation',
      'FH5 simulates ground pressure - low PSI reduces "bogging down"',
      'High rebound damping dissipates spring energy to "stick" landings',
      'Near-locked diff (80-100%) keeps power to grounded wheels',
    ],
  },
  rally: {
    title: 'Rally',
    description: 'Mixed surface versatility (tarmac + dirt)',
    icon: '🌲',
    tips: [
      'Medium-low pressure (22-25 PSI) balances tarmac and loose surfaces',
      'Softer springs (1.5-2.0 Hz) maintain contact over washboards',
      'Higher diff lock than circuit for loose surface traction',
      'Rally tires are hybrid - good tarmac grip + moderate dirt grip',
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
