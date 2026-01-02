// Forza Horizon 5 Tuning Calculator - Based on community guides
// Sources: ForzaQuickTune, ForzaTune, PickleChunks Steam Guide, Forza Forums
// Updated with accurate formulas from expert tuners

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
  horsepower?: number; // optional for high-power adjustments
}

export interface TuneSettings {
  // Tires
  tirePressureFront: number;
  tirePressureRear: number;
  
  // Gearing
  finalDrive: number;
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
}

// Tire pressure by compound and tune type (PSI)
// Drift uses extremely low front pressure for angle control per Steam guide
const baseTirePressure: Record<string, Record<TuneType, { front: number; rear: number }>> = {
  street: {
    grip: { front: 27.5, rear: 27.5 },
    drift: { front: 14.5, rear: 32 }, // 100kPa front, 220kPa rear per guide
    offroad: { front: 22, rear: 22 },
    drag: { front: 30, rear: 26 },
    rally: { front: 26, rear: 26 },
    street: { front: 30, rear: 30 },
  },
  sport: {
    grip: { front: 27, rear: 27 },
    drift: { front: 14.5, rear: 32 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 29, rear: 25 },
    rally: { front: 25, rear: 25 },
    street: { front: 29, rear: 29 },
  },
  'semi-slick': {
    grip: { front: 26.5, rear: 26.5 },
    drift: { front: 14.5, rear: 32 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 28, rear: 24 },
    rally: { front: 24, rear: 24 },
    street: { front: 28, rear: 28 },
  },
  slick: {
    grip: { front: 26, rear: 26 },
    drift: { front: 14.5, rear: 32 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 28, rear: 23 },
    rally: { front: 24, rear: 24 },
    street: { front: 27, rear: 27 },
  },
  rally: {
    grip: { front: 26, rear: 26 },
    drift: { front: 16, rear: 30 },
    offroad: { front: 20, rear: 20 },
    drag: { front: 26, rear: 24 },
    rally: { front: 24, rear: 24 },
    street: { front: 26, rear: 26 },
  },
  offroad: {
    grip: { front: 24, rear: 24 },
    drift: { front: 16, rear: 28 },
    offroad: { front: 18, rear: 18 },
    drag: { front: 24, rear: 22 },
    rally: { front: 20, rear: 20 },
    street: { front: 24, rear: 24 },
  },
  drag: {
    grip: { front: 28, rear: 28 },
    drift: { front: 14.5, rear: 32 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 32, rear: 20 }, // High front, low rear for traction
    rally: { front: 26, rear: 24 },
    street: { front: 28, rear: 28 },
  },
};

// Alignment presets by tune type - refined values per guides
const alignmentPresets: Record<TuneType, { camberF: number; camberR: number; toeF: number; toeR: number; caster: number }> = {
  grip: { camberF: -1.0, camberR: -0.5, toeF: 0, toeR: 0.1, caster: 5.0 },
  drift: { camberF: -5.5, camberR: -1.5, toeF: 2.0, toeR: 0, caster: 7.0 }, // High front camber for angle
  offroad: { camberF: -0.5, camberR: -0.3, toeF: 0, toeR: 0, caster: 5.0 },
  drag: { camberF: 0, camberR: -0.5, toeF: 0, toeR: 0, caster: 7.0 },
  rally: { camberF: -0.8, camberR: -0.5, toeF: 0, toeR: 0.1, caster: 5.5 },
  street: { camberF: -1.0, camberR: -0.5, toeF: 0, toeR: 0.1, caster: 5.0 },
};

// Differential presets - refined based on ForzaQuickTune recommendations
const diffPresets: Record<TuneType, Record<DriveType, { accelF?: number; decelF?: number; accelR: number; decelR: number; center?: number }>> = {
  grip: {
    RWD: { accelR: 45, decelR: 20 }, // Lower accel for better corner exit traction
    FWD: { accelR: 0, decelR: 0, accelF: 35, decelF: 0 }, // Front decel always 0 per guide
    AWD: { accelF: 25, decelF: 0, accelR: 50, decelR: 100, center: 65 }, // Race diff: +50% front
  },
  drift: {
    RWD: { accelR: 100, decelR: 50 }, // Locked accel, medium decel for control
    FWD: { accelR: 0, decelR: 0, accelF: 100, decelF: 0 },
    AWD: { accelF: 20, decelF: 0, accelR: 100, decelR: 100, center: 95 }, // Nearly full rear
  },
  offroad: {
    RWD: { accelR: 40, decelR: 15 },
    FWD: { accelR: 0, decelR: 0, accelF: 30, decelF: 0 },
    AWD: { accelF: 16, decelF: 0, accelR: 45, decelR: 100, center: 50 }, // Offroad diff: +14% front
  },
  drag: {
    RWD: { accelR: 85, decelR: 0 }, // High accel, no decel
    FWD: { accelR: 0, decelR: 0, accelF: 85, decelF: 0 },
    AWD: { accelF: 75, decelF: 0, accelR: 85, decelR: 0, center: 75 },
  },
  rally: {
    RWD: { accelR: 50, decelR: 25 },
    FWD: { accelR: 0, decelR: 0, accelF: 40, decelF: 0 },
    AWD: { accelF: 28, decelF: 0, accelR: 55, decelR: 100, center: 55 }, // Rally diff: +26% front
  },
  street: {
    RWD: { accelR: 40, decelR: 15 },
    FWD: { accelR: 0, decelR: 0, accelF: 32, decelF: 0 },
    AWD: { accelF: 22, decelF: 0, accelR: 45, decelR: 100, center: 60 },
  },
};

// Brake presets - weight distribution affects balance
const brakePresets: Record<TuneType, { pressure: number; balance: number }> = {
  grip: { pressure: 100, balance: 52 },
  drift: { pressure: 85, balance: 46 }, // Lower pressure, rear-biased for rotation
  offroad: { pressure: 90, balance: 50 },
  drag: { pressure: 100, balance: 50 },
  rally: { pressure: 95, balance: 50 },
  street: { pressure: 95, balance: 52 },
};

// Spring stiffness multipliers by tune type per ForzaQuickTune
// Grip gets -24%, Speed gets +24% from baseline
const springMultipliers: Record<TuneType, { grip: number; speed: number }> = {
  grip: { grip: 0.76, speed: 0.76 }, // -24% for max grip
  drift: { grip: 0.70, speed: 0.90 }, // Soft front, stiffer rear
  offroad: { grip: 0.50, speed: 0.50 }, // Very soft
  drag: { grip: 1.10, speed: 1.24 }, // Stiff for stability (+24% speed)
  rally: { grip: 0.65, speed: 0.65 }, // Medium soft
  street: { grip: 0.88, speed: 0.88 }, // Balanced
};

// Damper offsets by tune type - from ForzaQuickTune guide
const damperOffsets: Record<TuneType, { frontRebound: number; rearRebound: number; frontBump: number; rearBump: number }> = {
  grip: { frontRebound: 2.5, rearRebound: 0, frontBump: 2.5, rearBump: 0 }, // Grip bias front
  drift: { frontRebound: -1.0, rearRebound: 3.0, frontBump: -1.0, rearBump: 2.0 }, // Loose front, stiff rear
  offroad: { frontRebound: -2.0, rearRebound: -2.0, frontBump: -2.0, rearBump: -2.0 }, // Soft all around
  drag: { frontRebound: 0, rearRebound: 2.5, frontBump: 0, rearBump: 2.5 }, // Speed bias rear
  rally: { frontRebound: -1.0, rearRebound: -0.5, frontBump: -1.0, rearBump: -0.5 },
  street: { frontRebound: 0, rearRebound: 0, frontBump: 0, rearBump: 0 },
};

export function calculateTune(specs: CarSpecs, tuneType: TuneType): TuneSettings {
  const { 
    weight, 
    weightDistribution, 
    driveType, 
    hasAero, 
    frontDownforce = 0, 
    rearDownforce = 0, 
    tireCompound,
    horsepower = 400 
  } = specs;
  
  // Calculate distributed weights
  const frontWeight = (weight * weightDistribution) / 100;
  const rearWeight = weight - frontWeight;
  
  // Weight distribution offset from 50%
  const weightOffset = weightDistribution - 50;
  
  // High power adjustment (>= 400hp per ForzaQuickTune)
  const isHighPower = horsepower >= 400;
  
  // === TIRES ===
  const tirePressures = baseTirePressure[tireCompound]?.[tuneType] || baseTirePressure.sport[tuneType];
  let tirePressureFront = tirePressures.front;
  let tirePressureRear = tirePressures.rear;
  
  // Adjust for weight distribution (heavier end gets slightly more pressure)
  if (tuneType !== 'drift') { // Drift pressures are fixed
    tirePressureFront += weightOffset * 0.04;
    tirePressureRear -= weightOffset * 0.04;
  }
  
  // === ALIGNMENT ===
  const alignment = alignmentPresets[tuneType];
  let camberFront = alignment.camberF;
  let camberRear = alignment.camberR;
  let toeFront = alignment.toeF;
  let toeRear = alignment.toeR;
  let caster = alignment.caster;
  
  // Adjust camber for heavy cars
  if (weight > 3500) {
    camberFront -= 0.2;
    camberRear -= 0.1;
  }
  
  // Adjust for weight distribution
  if (weightDistribution > 55) {
    camberFront -= 0.2;
  } else if (weightDistribution < 45) {
    camberRear -= 0.2;
  }
  
  // === ANTI-ROLL BARS ===
  // Formula: Use weight distribution to balance ARBs
  // Stiffer ARB on the heavier end to reduce understeer/oversteer
  const arbStiffnessBase = 0.63; // 63% baseline
  const arbScaleFactor = tuneType === 'offroad' ? 0.35 : tuneType === 'drift' ? 0.55 : 0.5;
  
  let arbFront = Math.round(20 + (weightDistribution * arbScaleFactor));
  let arbRear = Math.round(20 + ((100 - weightDistribution) * arbScaleFactor));
  
  // Tune type specific adjustments
  if (tuneType === 'drift') {
    arbFront = Math.max(1, arbFront - 15); // Very soft front
    arbRear = Math.min(65, arbRear + 10); // Stiff rear
  } else if (tuneType === 'grip') {
    // High power grip gets stiffer ARBs
    if (isHighPower) {
      arbFront = Math.round(arbFront * 0.76); // -24% for grip
      arbRear = Math.round(arbRear * 0.76);
    }
  } else if (tuneType === 'drag') {
    arbFront = Math.round(arbFront * 1.24); // +24% for stability
    arbRear = Math.round(arbRear * 1.24);
  }
  
  // Clamp values
  arbFront = Math.max(1, Math.min(65, arbFront));
  arbRear = Math.max(1, Math.min(65, arbRear));
  
  // === SPRINGS ===
  // Base formula: Springs scale with distributed weight
  // Formula from ForzaQuickTune: (Max - Min) * Weight% + Min
  const springMin = 100;
  const springMax = tuneType === 'offroad' ? 400 : 1200;
  
  const springMult = springMultipliers[tuneType];
  let springsFront = Math.round(((springMax - springMin) * (frontWeight / weight) + springMin) * springMult.grip);
  let springsRear = Math.round(((springMax - springMin) * (rearWeight / weight) + springMin) * springMult.speed);
  
  // High power adjustment per ForzaQuickTune: -24% for grip
  if (isHighPower && tuneType === 'grip') {
    springsFront = Math.round(springsFront * 0.76);
    springsRear = Math.round(springsRear * 0.76);
  }
  
  // Aero adjustment
  if (hasAero) {
    springsFront += Math.round(frontDownforce * 0.3);
    springsRear += Math.round(rearDownforce * 0.25);
  }
  
  // Clamp to reasonable values
  springsFront = Math.max(springMin, Math.min(springMax, springsFront));
  springsRear = Math.max(springMin, Math.min(springMax, springsRear));
  
  // Ride height
  const rideHeightPresets: Record<TuneType, { front: number; rear: number }> = {
    grip: { front: 4.5, rear: 4.8 },
    drift: { front: 5.5, rear: 5.0 }, // Slightly raised front for weight transfer
    offroad: { front: 9.0, rear: 9.5 }, // Max clearance
    drag: { front: 4.0, rear: 4.5 },
    rally: { front: 7.5, rear: 8.0 },
    street: { front: 5.5, rear: 5.8 },
  };
  
  let rideHeightFront = rideHeightPresets[tuneType].front;
  let rideHeightRear = rideHeightPresets[tuneType].rear;
  
  // Lower with aero for grip
  if (hasAero && tuneType === 'grip') {
    rideHeightFront = 4.0;
    rideHeightRear = 4.2;
  }
  
  // === DAMPING ===
  // Base rebound scales with spring rate
  // Bump is 50-75% of rebound
  const bumpRatio = tuneType === 'offroad' ? 0.50 : tuneType === 'drift' ? 0.60 : 0.65;
  
  // Base calculation
  let reboundFront = Math.round((springsFront / 80) + 5);
  let reboundRear = Math.round((springsRear / 80) + 5);
  
  // Apply tune type offsets from ForzaQuickTune
  const offsets = damperOffsets[tuneType];
  reboundFront += offsets.frontRebound;
  reboundRear += offsets.rearRebound;
  
  // High power grip gets +2.5 front offset per guide
  if (isHighPower && tuneType === 'grip') {
    reboundFront += 2.5;
  }
  
  // Clamp values
  reboundFront = Math.max(1, Math.min(20, Math.round(reboundFront * 10) / 10));
  reboundRear = Math.max(1, Math.min(20, Math.round(reboundRear * 10) / 10));
  
  let bumpFront = Math.round((reboundFront * bumpRatio + offsets.frontBump) * 10) / 10;
  let bumpRear = Math.round((reboundRear * bumpRatio + offsets.rearBump) * 10) / 10;
  
  // Clamp bump
  bumpFront = Math.max(1, Math.min(20, bumpFront));
  bumpRear = Math.max(1, Math.min(20, bumpRear));
  
  // === AERO ===
  let aeroFront = 0;
  let aeroRear = 0;
  
  if (hasAero) {
    const aeroPresets: Record<TuneType, { front: number; rear: number }> = {
      grip: { front: 180, rear: 220 }, // High downforce
      drift: { front: 40, rear: 80 }, // Low for speed, slight rear bias
      offroad: { front: 80, rear: 100 },
      drag: { front: 0, rear: 0 }, // Minimum drag
      rally: { front: 100, rear: 140 },
      street: { front: 120, rear: 160 },
    };
    aeroFront = frontDownforce || aeroPresets[tuneType].front;
    aeroRear = rearDownforce || aeroPresets[tuneType].rear;
    
    // Adjust for weight distribution
    if (weightDistribution > 52) {
      aeroRear += 20; // More rear downforce for front-heavy cars
    }
  }
  
  // === DIFFERENTIAL ===
  const diff = diffPresets[tuneType][driveType];
  
  // === BRAKES ===
  const brakes = brakePresets[tuneType];
  let brakeBalance = brakes.balance;
  
  // Adjust brake balance for weight distribution
  // Heavier front = more front bias
  brakeBalance += Math.round(weightOffset * 0.15);
  brakeBalance = Math.max(40, Math.min(60, brakeBalance));
  
  // === GEARING ===
  // Final drive adjustments per ForzaQuickTune
  // Grip: +0.5, Speed: -0.5
  const baseFinalDrive = 3.50;
  const gearingOffsets: Record<TuneType, number> = {
    grip: 0.50, // Shorter gears for acceleration
    drift: 0.80, // Even shorter for low speed control
    offroad: 0.30,
    drag: -0.60, // Longer gears for top speed
    rally: 0.25,
    street: 0,
  };
  
  let finalDrive = baseFinalDrive + gearingOffsets[tuneType];
  
  // Gearing note
  const gearingNotes: Record<TuneType, string> = {
    grip: 'Shorter gearing (+0.5) for better corner exit acceleration',
    drift: 'Very short gearing for low-speed angle control',
    offroad: 'Slightly shorter for torque on rough terrain',
    drag: 'Longer gearing (-0.6) for maximum top speed',
    rally: 'Balanced gearing for mixed conditions',
    street: 'Stock-like balanced gearing',
  };
  
  return {
    tirePressureFront: Math.round(tirePressureFront * 10) / 10,
    tirePressureRear: Math.round(tirePressureRear * 10) / 10,
    finalDrive: Math.round(finalDrive * 100) / 100,
    gearingNote: gearingNotes[tuneType],
    camberFront: Math.round(camberFront * 10) / 10,
    camberRear: Math.round(camberRear * 10) / 10,
    toeFront: Math.round(toeFront * 10) / 10,
    toeRear: Math.round(toeRear * 10) / 10,
    caster: Math.round(caster * 10) / 10,
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
  };
}

export const tuneTypeDescriptions: Record<TuneType, { title: string; description: string; icon: string; tips: string[] }> = {
  grip: {
    title: 'Circuit/Grip',
    description: 'Maximum cornering grip for track racing',
    icon: '🏎️',
    tips: [
      'Springs reduced by 24% for mechanical grip (400+ HP)',
      'Front dampers stiffened for corner entry stability',
      'Lower ride height with aero for downforce efficiency',
      'Diff set for smooth power delivery out of corners',
    ],
  },
  drift: {
    title: 'Drift',
    description: 'Loose rear end, high angle control',
    icon: '💨',
    tips: [
      'Front tire pressure at 14.5 PSI for maximum friction',
      'Rear tires at 32 PSI for controlled slip',
      'High front camber (-5.5°) for wide angle stability',
      'Rear diff locked (100%) for consistent power slides',
    ],
  },
  offroad: {
    title: 'Off-Road',
    description: 'Soft suspension, high clearance',
    icon: '🏔️',
    tips: [
      'Very soft springs (50% reduction) for terrain absorption',
      'Maximum ride height for obstacle clearance',
      'Low ARBs for wheel independence over rough surfaces',
      'Reduced brake pressure to prevent lockup on loose surfaces',
    ],
  },
  drag: {
    title: 'Drag',
    description: 'Maximum straight-line acceleration',
    icon: '⚡',
    tips: [
      'Stiff suspension (+24%) for stability and weight transfer',
      'Longer final drive (-0.6) for top speed',
      'Zero aero for minimum drag resistance',
      'High diff accel (85%) for maximum traction',
    ],
  },
  rally: {
    title: 'Rally/Cross Country',
    description: 'Balanced for mixed surfaces',
    icon: '🌲',
    tips: [
      'Medium-soft springs for mixed terrain handling',
      'Higher ride height for jumps and rough sections',
      'Rally diff balance (+26% front) for AWD traction',
      'Moderate damping for predictable landings',
    ],
  },
  street: {
    title: 'Street',
    description: 'Balanced everyday driving',
    icon: '🛣️',
    tips: [
      'Neutral spring rates for comfort and control',
      'Stock-like final drive for balanced performance',
      'Moderate ARBs for predictable handling',
      'Comfortable ride height with good grip',
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
