// Forza Horizon 5 Tuning Calculator
// Based on "Engineering Dynamics and Algorithmic Tuning Protocols in Forza Horizon 5"
// Implements Zero-Balance tuning with weight-proportionality principles

export type DriveType = 'RWD' | 'FWD' | 'AWD';
export type TuneType = 'grip' | 'drift' | 'offroad' | 'drag' | 'rally' | 'street';

export interface CarSpecs {
  weight: number; // in lbs
  weightDistribution: number; // front weight percentage (0-100)
  driveType: DriveType;
  piClass: string;
  hasAero: boolean;
  frontDownforce?: number;
  rearDownforce?: number;
  tireCompound: 'street' | 'sport' | 'semi-slick' | 'slick' | 'rally' | 'offroad' | 'drag';
  horsepower?: number;
  gearCount?: number; // 4-10 gears
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
  brakeBalanceNote: string; // Note about FH5 slider inversion
}

// ==========================================
// TIRE PRESSURE - Thermodynamics Model
// ==========================================
// Optimal Hot Pressure: 32-34 PSI for paved (2.2-2.3 Bar)
// Cold Pressure: 27-28.5 PSI (anticipates 4-6 PSI thermal rise)
// Flotation Physics: 15-19 PSI for off-road (1.0-1.3 Bar)

const tirePressurePresets: Record<TuneType, { front: number; rear: number }> = {
  grip: { front: 27.5, rear: 27.5 },     // Targets 32-34 PSI hot
  street: { front: 28.0, rear: 28.0 },   // Slightly higher for mixed
  drift: { front: 14.5, rear: 32.0 },    // Low front for friction, high rear for slip
  offroad: { front: 17.0, rear: 17.0 },  // Flotation physics (15-19 PSI range)
  rally: { front: 19.0, rear: 19.0 },    // Higher end of flotation for mixed
  drag: { front: 55.0, rear: 15.0 },     // Max front stability, soft rear for squat
};

// ==========================================
// ALIGNMENT PRESETS
// ==========================================
// Circuit: -1.5° to -1.0° negative camber
// Drift: -5.0° front for extreme angle

const alignmentPresets: Record<TuneType, { 
  camberF: number; 
  camberR: number; 
  toeF: number; 
  toeR: number; 
  caster: number 
}> = {
  grip: { camberF: -1.2, camberR: -0.8, toeF: 0, toeR: 0.1, caster: 5.5 },
  street: { camberF: -1.0, camberR: -0.5, toeF: 0, toeR: 0.1, caster: 5.0 },
  drift: { camberF: -5.0, camberR: -1.5, toeF: 2.0, toeR: 0, caster: 7.0 },
  offroad: { camberF: -0.5, camberR: -0.3, toeF: 0, toeR: 0, caster: 5.0 },
  rally: { camberF: -0.8, camberR: -0.5, toeF: 0, toeR: 0.1, caster: 5.5 },
  drag: { camberF: 0, camberR: -0.5, toeF: 0, toeR: 0, caster: 7.0 },
};

// ==========================================
// DIFFERENTIAL MATRIX
// ==========================================
// From comprehensive discipline-specific guide
// FWD/AWD front decel always 0
// AWD center balance: Circuit 65-75% Rear, Drift 95% Rear

const diffMatrix: Record<TuneType, Record<DriveType, { 
  accelF?: number; 
  decelF?: number; 
  accelR: number; 
  decelR: number; 
  center?: number 
}>> = {
  grip: {
    RWD: { accelR: 40, decelR: 20 },      // Low lock for corner exit traction
    FWD: { accelF: 35, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 25, decelF: 0, accelR: 50, decelR: 20, center: 70 }, // 70% rear
  },
  street: {
    RWD: { accelR: 35, decelR: 15 },
    FWD: { accelF: 30, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 22, decelF: 0, accelR: 40, decelR: 15, center: 60 },
  },
  drift: {
    RWD: { accelR: 100, decelR: 100 },    // Locked diff for consistent slides
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 20, decelF: 0, accelR: 100, decelR: 100, center: 95 }, // Nearly full rear
  },
  offroad: {
    RWD: { accelR: 35, decelR: 10 },
    FWD: { accelF: 28, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 18, decelF: 0, accelR: 40, decelR: 15, center: 50 }, // Balanced for traction
  },
  rally: {
    RWD: { accelR: 45, decelR: 20 },
    FWD: { accelF: 35, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 26, decelF: 0, accelR: 50, decelR: 20, center: 55 }, // +26% front bias
  },
  drag: {
    RWD: { accelR: 100, decelR: 0 },      // Max accel lock, no decel
    FWD: { accelF: 100, decelF: 0, accelR: 0, decelR: 0 },
    AWD: { accelF: 80, decelF: 0, accelR: 100, decelR: 0, center: 70 },
  },
};

// ==========================================
// BRAKE PRESETS
// ==========================================
// Note: FH5 slider is INVERTED - 60% front requires setting slider to 40%

const brakePresets: Record<TuneType, { pressure: number; targetFrontBias: number }> = {
  grip: { pressure: 100, targetFrontBias: 60 },   // 60% front = set slider to 40%
  street: { pressure: 95, targetFrontBias: 58 },
  drift: { pressure: 85, targetFrontBias: 50 },   // More rear for rotation
  offroad: { pressure: 90, targetFrontBias: 55 },
  rally: { pressure: 95, targetFrontBias: 55 },
  drag: { pressure: 100, targetFrontBias: 55 },
};

// ==========================================
// HOKIHOSHI SLIDER MATH FORMULA
// Pure weight-based: Value = (Max - Min) * Weight% + Min
// No frequency physics - simple and effective
// ==========================================

function sliderMath(min: number, max: number, weightPercent: number): number {
  return (max - min) * (weightPercent / 100) + min;
}

// Spring ranges by tune type (HokiHoshi baseline)
const springRanges: Record<TuneType, { min: number; max: number }> = {
  grip: { min: 200, max: 800 },      // Firm for track
  street: { min: 150, max: 600 },    // Balanced
  drift: { min: 150, max: 500 },     // Softer for weight transfer
  offroad: { min: 100, max: 300 },   // Very soft for absorption
  rally: { min: 120, max: 400 },     // Medium-soft
  drag: { min: 300, max: 1000 },     // Stiff for stability
};

// ==========================================
// GEOMETRIC GEARING FORMULA
// Ratio_n = Ratio_1 * (Ratio_Final / Ratio_1) ^ ((n-1) / (TotalGears-1))
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
  drift: { first: 3.80, last: 0.85, finalDrive: 4.20 },  // Short for low-speed control
  offroad: { first: 3.50, last: 0.78, finalDrive: 3.70 },
  rally: { first: 3.45, last: 0.75, finalDrive: 3.65 },
  drag: { first: 2.90, last: 0.55, finalDrive: 2.90 },   // Long for top speed
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
// MAIN CALCULATION FUNCTION
// Implements Zero-Balance Tuning Protocol
// ==========================================

export function calculateTune(specs: CarSpecs, tuneType: TuneType): TuneSettings {
  const { 
    weight, 
    weightDistribution, 
    driveType, 
    hasAero, 
    frontDownforce = 0, 
    rearDownforce = 0,
    horsepower = 400 
  } = specs;
  
  // Weight distribution as decimals
  const frontWeightPct = weightDistribution / 100;
  const rearWeightPct = 1 - frontWeightPct;
  
  // ==========================================
  // TIRES - Thermal Delta Model
  // ==========================================
  const basePressures = tirePressurePresets[tuneType];
  let tirePressureFront = basePressures.front;
  let tirePressureRear = basePressures.rear;
  
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
  // ANTI-ROLL BARS - HokiHoshi Weight-Based
  // Simple formula: (65 - 1) * weight% + 1
  // Then offset for drive type balance
  // ==========================================
  const arbMin = 1;
  const arbMax = 65;
  
  // Base calculation from weight distribution
  let arbFront = Math.round(sliderMath(arbMin, arbMax, weightDistribution));
  let arbRear = Math.round(sliderMath(arbMin, arbMax, 100 - weightDistribution));
  
  // Drive type balance offsets (HokiHoshi method)
  if (driveType === 'FWD') {
    // FWD understeers: soften front, stiffen rear
    arbFront = Math.round(arbFront * 0.75);
    arbRear = Math.round(arbRear * 1.15);
  } else if (driveType === 'RWD') {
    // RWD oversteers: stiffen front slightly
    arbFront = Math.round(arbFront * 1.05);
    arbRear = Math.round(arbRear * 0.95);
  }
  // AWD: keep balanced
  
  // Tune type modifiers
  if (tuneType === 'drift') {
    arbFront = Math.round(arbFront * 0.5);
    arbRear = Math.round(arbRear * 1.2);
  } else if (tuneType === 'offroad' || tuneType === 'rally') {
    arbFront = Math.round(arbFront * 0.6);
    arbRear = Math.round(arbRear * 0.6);
  }
  
  arbFront = Math.max(1, Math.min(65, arbFront));
  arbRear = Math.max(1, Math.min(65, arbRear));
  
  // ==========================================
  // SPRINGS - Pure HokiHoshi Slider Math
  // Value = (Max - Min) * Weight% + Min
  // Simple, predictable, proven effective
  // ==========================================
  const springRange = springRanges[tuneType];
  
  // Pure weight-based calculation - no frequency physics
  let springsFront = Math.round(sliderMath(springRange.min, springRange.max, weightDistribution));
  let springsRear = Math.round(sliderMath(springRange.min, springRange.max, 100 - weightDistribution));
  
  // Minimal aero adjustment (only if significant downforce)
  if (hasAero && frontDownforce > 100) {
    springsFront += Math.round(frontDownforce * 0.1);
    springsRear += Math.round(rearDownforce * 0.1);
  }
  
  springsFront = Math.max(springRange.min, Math.min(springRange.max, springsFront));
  springsRear = Math.max(springRange.min, Math.min(springRange.max, springsRear));
  
  // Ride height
  const rideHeightPresets: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 4.5, rear: 4.8 },
    street: { front: 5.5, rear: 5.8 },
    drift: { front: 5.5, rear: 5.0 },
    offroad: { front: 9.0, rear: 9.5 },  // Max clearance
    rally: { front: 7.5, rear: 8.0 },
    drag: { front: 4.0, rear: 4.5 },     // Low for stability
  };
  
  let rideHeightFront = rideHeightPresets[tuneType].front;
  let rideHeightRear = rideHeightPresets[tuneType].rear;
  
  if (hasAero && (tuneType === 'grip' || tuneType === 'street')) {
    rideHeightFront = 4.0;
    rideHeightRear = 4.2;
  }
  
  // ==========================================
  // DAMPING - HokiHoshi Weight-Based
  // Rebound: (19 * Weight%) + offset
  // Bump: 50-65% of Rebound
  // Simple and effective
  // ==========================================
  let reboundFront = Math.round((19 * frontWeightPct) + 1);
  let reboundRear = Math.round((19 * rearWeightPct) + 1);
  
  // Tune type adjustments
  if (tuneType === 'offroad' || tuneType === 'rally') {
    reboundFront = Math.round(reboundFront * 1.1);
    reboundRear = Math.round(reboundRear * 1.1);
  } else if (tuneType === 'drift') {
    reboundFront = Math.round(reboundFront * 0.9);
    reboundRear = Math.round(reboundRear * 1.05);
  }
  
  reboundFront = Math.max(1, Math.min(20, reboundFront));
  reboundRear = Math.max(1, Math.min(20, reboundRear));
  
  // Bump is 55-60% of rebound (HokiHoshi standard)
  const bumpRatio = tuneType === 'offroad' ? 0.55 : 0.60;
  let bumpFront = Math.round(reboundFront * bumpRatio);
  let bumpRear = Math.round(reboundRear * bumpRatio);
  
  bumpFront = Math.max(1, Math.min(20, bumpFront));
  bumpRear = Math.max(1, Math.min(20, bumpRear));
  
  // ==========================================
  // AERO - Calculated Based on Weight, Speed Needs, and Balance
  // Does NOT just echo user input - calculates optimal values
  // User's input is the RANGE (min/max available), we calculate optimal within it
  // ==========================================
  let aeroFront = 0;
  let aeroRear = 0;
  
  if (hasAero) {
    // Base downforce targets by tune type (as percentage of max)
    const aeroTargets: Record<TuneType, { frontPct: number; rearPct: number }> = {
      grip: { frontPct: 0.65, rearPct: 0.75 },     // High downforce for corners
      street: { frontPct: 0.40, rearPct: 0.50 },   // Moderate for mixed use
      drift: { frontPct: 0.15, rearPct: 0.30 },    // Low for speed, some rear for stability
      offroad: { frontPct: 0.25, rearPct: 0.35 },  // Low-moderate
      rally: { frontPct: 0.35, rearPct: 0.45 },    // Moderate
      drag: { frontPct: 0.0, rearPct: 0.0 },       // Minimum drag
    };
    
    const targets = aeroTargets[tuneType];
    
    // Assume standard aero range is 0-400 lbs if user didn't specify
    const maxFrontAero = frontDownforce > 0 ? frontDownforce : 400;
    const maxRearAero = rearDownforce > 0 ? rearDownforce : 400;
    
    // Calculate optimal aero based on weight distribution and drive type
    let frontAdjust = 0;
    let rearAdjust = 0;
    
    // FWD: needs more rear downforce to help rotate
    // RWD: needs balanced aero, slightly more rear for traction
    // AWD: balanced approach
    if (driveType === 'FWD') {
      frontAdjust = -0.10;  // Less front downforce
      rearAdjust = 0.15;    // More rear for rotation
    } else if (driveType === 'RWD') {
      rearAdjust = 0.10;    // More rear for traction
    }
    
    // Heavy front bias needs more rear aero
    if (weightDistribution > 55) {
      rearAdjust += 0.10;
    } else if (weightDistribution < 45) {
      frontAdjust += 0.10;
    }
    
    // Calculate final values
    aeroFront = Math.round(maxFrontAero * Math.max(0, Math.min(1, targets.frontPct + frontAdjust)));
    aeroRear = Math.round(maxRearAero * Math.max(0, Math.min(1, targets.rearPct + rearAdjust)));
  }
  
  // ==========================================
  // DIFFERENTIAL - From Matrix
  // ==========================================
  const diff = diffMatrix[tuneType][driveType];
  
  // ==========================================
  // BRAKES - Inverted Slider Anomaly
  // To get 60% front, set slider to 40%
  // ==========================================
  const brakes = brakePresets[tuneType];
  
  // Calculate the inverted slider value
  // targetFrontBias of 60% means set slider to 40%
  let targetFrontBias = brakes.targetFrontBias;
  
  // Adjust for weight distribution
  const weightOffset = weightDistribution - 50;
  targetFrontBias += Math.round(weightOffset * 0.15);
  targetFrontBias = Math.max(45, Math.min(70, targetFrontBias));
  
  // The actual slider value (inverted)
  const brakeBalance = 100 - targetFrontBias;
  
  // Generate note about the inversion
  const brakeBalanceNote = `Set slider to ${brakeBalance}% to achieve ${targetFrontBias}% front bias (FH5 slider is inverted)`;
  
  // ==========================================
  // GEARING - Geometric Decay Function
  // ==========================================
  const gearing = gearingPresets[tuneType];
  const gearCount = specs.gearCount || 6;
  const gearRatios = calculateGearRatios(gearing.first, gearing.last, gearCount);
  let finalDrive = gearing.finalDrive;
  
  // Adjust for high power
  if (horsepower && horsepower >= 600) {
    finalDrive += 0.15; // Shorter for more torque multiplication
  }
  
  const gearingNotes: Record<TuneType, string> = {
    grip: 'Balanced gearing for acceleration and corner exit',
    street: 'Stock-like balanced gearing for mixed driving',
    drift: 'Short gearing for precise low-speed angle control',
    offroad: 'Medium gearing for torque on rough terrain',
    rally: 'Balanced for mixed surface acceleration',
    drag: 'Long gearing (low ratios) for maximum top speed',
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
    diffAccelFront: diff.accelF,
    diffDecelFront: diff.decelF,
    diffAccelRear: diff.accelR,
    diffDecelRear: diff.decelR,
    centerBalance: diff.center,
    brakePressure: brakes.pressure,
    brakeBalance,
    brakeBalanceNote,
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
      'Target hot tire pressure: 32-34 PSI (2.2-2.3 Bar)',
      'Negative camber -1.2° to -1.5° for optimal contact patch',
      'Diff 40% accel / 10-30% decel for smooth power delivery',
      'AWD center balance: 65-75% rear bias for rotation',
    ],
  },
  street: {
    title: 'Street',
    description: 'Balanced everyday driving',
    icon: '🛣️',
    tips: [
      'Balanced pressures for mixed conditions',
      'Moderate camber for tire longevity',
      'Comfortable ride height with good grip',
      'Stock-like differential for predictability',
    ],
  },
  drift: {
    title: 'Drift',
    description: 'Maximum angle and slide control',
    icon: '💨',
    tips: [
      'Low front pressure (14.5 PSI) maximizes steering friction',
      'High rear pressure (32 PSI) promotes controlled slip',
      'Extreme front camber (-5.0°) for wide angle stability',
      'Locked diff (100%/100%) for consistent power slides',
    ],
  },
  offroad: {
    title: 'Off-Road/Cross Country',
    description: 'Flotation physics for rough terrain',
    icon: '🏔️',
    tips: [
      'Low tire pressure (15-19 PSI / 1.0-1.3 Bar) for flotation',
      'Soft springs (1.0-1.5 Hz frequency) for terrain absorption',
      'High rebound damping to "stick" jump landings',
      'Soft ARBs for maximum wheel independence',
    ],
  },
  rally: {
    title: 'Rally',
    description: 'Mixed surface performance',
    icon: '🌲',
    tips: [
      'Medium-low pressure (19 PSI) for grip on loose surfaces',
      'Higher ride height for jumps and rough sections',
      'AWD center: +26% front bias for traction',
      'Moderate damping for predictable landings',
    ],
  },
  drag: {
    title: 'Drag',
    description: 'Maximum straight-line acceleration',
    icon: '⚡',
    tips: [
      'Max front pressure (55 PSI) for stability',
      'Low rear pressure (15 PSI) for squat and traction',
      'Soft rear springs allow weight transfer for launch',
      '100% accel diff lock for maximum power delivery',
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
