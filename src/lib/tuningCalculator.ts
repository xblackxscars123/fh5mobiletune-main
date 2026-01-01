// Forza Horizon 5 Tuning Calculator - Based on community guides
// Sources: ForzaQuickTune, ForzaTune, PickleChunks Steam Guide, Forza Forums

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
}

export interface TuneSettings {
  // Tires
  tirePressureFront: number;
  tirePressureRear: number;
  
  // Gearing
  finalDrive: number;
  
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

// Base tire pressures by compound and tune type
const baseTirePressure: Record<string, Record<TuneType, { front: number; rear: number }>> = {
  street: {
    grip: { front: 32, rear: 32 },
    drift: { front: 30, rear: 33 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 26, rear: 26 },
    rally: { front: 26, rear: 26 },
    street: { front: 32, rear: 32 },
  },
  sport: {
    grip: { front: 31, rear: 31 },
    drift: { front: 29, rear: 32 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 25, rear: 25 },
    rally: { front: 25, rear: 25 },
    street: { front: 31, rear: 31 },
  },
  'semi-slick': {
    grip: { front: 30, rear: 30 },
    drift: { front: 28, rear: 31 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 24, rear: 24 },
    rally: { front: 24, rear: 24 },
    street: { front: 30, rear: 30 },
  },
  slick: {
    grip: { front: 29, rear: 29 },
    drift: { front: 27, rear: 30 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 23, rear: 23 },
    rally: { front: 23, rear: 23 },
    street: { front: 29, rear: 29 },
  },
  rally: {
    grip: { front: 26, rear: 26 },
    drift: { front: 24, rear: 27 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 24, rear: 24 },
    rally: { front: 24, rear: 24 },
    street: { front: 26, rear: 26 },
  },
  offroad: {
    grip: { front: 24, rear: 24 },
    drift: { front: 22, rear: 25 },
    offroad: { front: 18, rear: 18 },
    drag: { front: 22, rear: 22 },
    rally: { front: 22, rear: 22 },
    street: { front: 24, rear: 24 },
  },
  drag: {
    grip: { front: 28, rear: 28 },
    drift: { front: 26, rear: 29 },
    offroad: { front: 22, rear: 22 },
    drag: { front: 20, rear: 20 },
    rally: { front: 24, rear: 24 },
    street: { front: 28, rear: 28 },
  },
};

// Alignment presets by tune type
const alignmentPresets: Record<TuneType, { camberF: number; camberR: number; toeF: number; toeR: number; caster: number }> = {
  grip: { camberF: -1.5, camberR: -1.0, toeF: 0, toeR: 0.1, caster: 5.5 },
  drift: { camberF: -5.0, camberR: -2.0, toeF: 0.5, toeR: 0.5, caster: 7.0 },
  offroad: { camberF: -0.5, camberR: -0.5, toeF: 0, toeR: 0, caster: 5.0 },
  drag: { camberF: 0, camberR: 0, toeF: 0, toeR: 0, caster: 7.0 },
  rally: { camberF: -1.0, camberR: -0.8, toeF: 0, toeR: 0.1, caster: 5.2 },
  street: { camberF: -1.2, camberR: -0.8, toeF: 0, toeR: 0.1, caster: 5.0 },
};

// Differential presets
const diffPresets: Record<TuneType, Record<DriveType, { accelF?: number; decelF?: number; accelR: number; decelR: number; center?: number }>> = {
  grip: {
    RWD: { accelR: 65, decelR: 25 },
    FWD: { accelR: 0, decelR: 0, accelF: 45, decelF: 15 },
    AWD: { accelF: 35, decelF: 10, accelR: 65, decelR: 25, center: 70 },
  },
  drift: {
    RWD: { accelR: 100, decelR: 100 },
    FWD: { accelR: 0, decelR: 0, accelF: 100, decelF: 80 },
    AWD: { accelF: 30, decelF: 0, accelR: 100, decelR: 100, center: 90 },
  },
  offroad: {
    RWD: { accelR: 55, decelR: 20 },
    FWD: { accelR: 0, decelR: 0, accelF: 40, decelF: 10 },
    AWD: { accelF: 30, decelF: 10, accelR: 55, decelR: 20, center: 55 },
  },
  drag: {
    RWD: { accelR: 100, decelR: 0 },
    FWD: { accelR: 0, decelR: 0, accelF: 100, decelF: 0 },
    AWD: { accelF: 100, decelF: 0, accelR: 100, decelR: 0, center: 80 },
  },
  rally: {
    RWD: { accelR: 60, decelR: 25 },
    FWD: { accelR: 0, decelR: 0, accelF: 45, decelF: 15 },
    AWD: { accelF: 35, decelF: 15, accelR: 60, decelR: 25, center: 60 },
  },
  street: {
    RWD: { accelR: 55, decelR: 20 },
    FWD: { accelR: 0, decelR: 0, accelF: 40, decelF: 12 },
    AWD: { accelF: 32, decelF: 10, accelR: 55, decelR: 20, center: 65 },
  },
};

// Brake presets
const brakePresets: Record<TuneType, { pressure: number; balance: number }> = {
  grip: { pressure: 100, balance: 52 },
  drift: { pressure: 100, balance: 48 },
  offroad: { pressure: 90, balance: 50 },
  drag: { pressure: 100, balance: 50 },
  rally: { pressure: 95, balance: 50 },
  street: { pressure: 95, balance: 52 },
};

export function calculateTune(specs: CarSpecs, tuneType: TuneType): TuneSettings {
  const { weight, weightDistribution, driveType, hasAero, frontDownforce = 0, rearDownforce = 0, tireCompound } = specs;
  
  // Calculate distributed weights
  const frontWeight = (weight * weightDistribution) / 100;
  const rearWeight = weight - frontWeight;
  
  // Weight distribution offset from 50%
  const weightOffset = weightDistribution - 50;
  
  // === TIRES ===
  const tirePressures = baseTirePressure[tireCompound]?.[tuneType] || baseTirePressure.sport[tuneType];
  let tirePressureFront = tirePressures.front;
  let tirePressureRear = tirePressures.rear;
  
  // Adjust for weight distribution
  tirePressureFront += weightOffset * 0.05;
  tirePressureRear -= weightOffset * 0.05;
  
  // === ALIGNMENT ===
  const alignment = alignmentPresets[tuneType];
  let camberFront = alignment.camberF;
  let camberRear = alignment.camberR;
  
  // Adjust camber for weight
  if (weight > 3500) {
    camberFront -= 0.3;
    camberRear -= 0.2;
  }
  
  // === ANTI-ROLL BARS ===
  // Base ARB calculation using weight distribution
  const baseArbStiffness = 0.63; // 63% baseline stiffness for modern cars
  const arbBase = (weight / 2) / (200 - 200 * baseArbStiffness);
  
  let arbFront = Math.round(arbBase);
  let arbRear = Math.round(arbBase);
  
  // Adjust for weight distribution
  const arbAdjustment = driveType === 'AWD' ? 0.66 : 1.0;
  arbFront += Math.round(weightOffset * arbAdjustment);
  arbRear -= Math.round(weightOffset * arbAdjustment);
  
  // Tune type adjustments
  if (tuneType === 'drift') {
    arbFront = Math.max(1, arbFront - 10);
    arbRear = Math.min(65, arbRear + 15);
  } else if (tuneType === 'offroad') {
    arbFront = Math.max(1, arbFront - 8);
    arbRear = Math.max(1, arbRear - 8);
  }
  
  // Clamp values
  arbFront = Math.max(1, Math.min(65, arbFront));
  arbRear = Math.max(1, Math.min(65, arbRear));
  
  // === SPRINGS ===
  // Spring rate as percentage of distributed weight
  const springPercentFront = tuneType === 'offroad' ? 0.65 : tuneType === 'drift' ? 0.85 : 0.92;
  const springPercentRear = tuneType === 'offroad' ? 0.45 : tuneType === 'drift' ? 0.75 : 0.68;
  
  let springsFront = Math.round(frontWeight * springPercentFront);
  let springsRear = Math.round(rearWeight * springPercentRear);
  
  // Adjust for aero
  if (hasAero) {
    springsFront += Math.round(frontDownforce / 10 * 0.5);
    springsRear += Math.round(rearDownforce / 25 * 0.5);
  }
  
  // Ride height
  let rideHeightFront = tuneType === 'offroad' ? 8.0 : tuneType === 'drag' ? 4.0 : 5.0;
  let rideHeightRear = tuneType === 'offroad' ? 8.0 : tuneType === 'drag' ? 4.5 : 5.5;
  
  if (hasAero && tuneType === 'grip') {
    rideHeightFront = 4.5;
    rideHeightRear = 4.8;
  }
  
  // === DAMPING ===
  // Rebound should be higher than bump (bump is 50-75% of rebound)
  const bumpRatio = tuneType === 'offroad' ? 0.5 : 0.65;
  
  // Base rebound on springs
  let reboundFront = Math.round((springsFront / 25) + 5);
  let reboundRear = Math.round((springsRear / 25) + 5);
  
  // Adjust for weight shift
  reboundFront -= Math.round((50 - weightDistribution) * 0.2);
  reboundRear += Math.round((50 - weightDistribution) * 0.2);
  
  // Clamp values
  reboundFront = Math.max(1, Math.min(20, reboundFront));
  reboundRear = Math.max(1, Math.min(20, reboundRear));
  
  const bumpFront = Math.round(reboundFront * bumpRatio);
  const bumpRear = Math.round(reboundRear * bumpRatio);
  
  // === AERO ===
  let aeroFront = 0;
  let aeroRear = 0;
  
  if (hasAero) {
    if (tuneType === 'grip') {
      aeroFront = frontDownforce || 150;
      aeroRear = rearDownforce || 200;
    } else if (tuneType === 'drift') {
      aeroFront = 50;
      aeroRear = 100;
    } else if (tuneType === 'drag') {
      aeroFront = 0;
      aeroRear = 0;
    } else {
      aeroFront = frontDownforce || 100;
      aeroRear = rearDownforce || 150;
    }
  }
  
  // === DIFFERENTIAL ===
  const diff = diffPresets[tuneType][driveType];
  
  // === BRAKES ===
  const brakes = brakePresets[tuneType];
  let brakeBalance = brakes.balance;
  
  // Adjust brake balance for weight distribution
  brakeBalance += Math.round(weightOffset * 0.1);
  brakeBalance = Math.max(45, Math.min(58, brakeBalance));
  
  // === FINAL DRIVE (simplified calculation) ===
  let finalDrive = 3.50;
  if (tuneType === 'drag') {
    finalDrive = 2.80;
  } else if (tuneType === 'drift') {
    finalDrive = 4.20;
  } else if (tuneType === 'offroad') {
    finalDrive = 3.80;
  }
  
  return {
    tirePressureFront: Math.round(tirePressureFront * 10) / 10,
    tirePressureRear: Math.round(tirePressureRear * 10) / 10,
    finalDrive,
    camberFront: Math.round(camberFront * 10) / 10,
    camberRear: Math.round(camberRear * 10) / 10,
    toeFront: alignment.toeF,
    toeRear: alignment.toeR,
    caster: alignment.caster,
    arbFront,
    arbRear,
    springsFront,
    springsRear,
    rideHeightFront,
    rideHeightRear,
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

export const tuneTypeDescriptions: Record<TuneType, { title: string; description: string; icon: string }> = {
  grip: {
    title: 'Circuit/Grip',
    description: 'Maximum cornering grip for track racing',
    icon: '🏎️',
  },
  drift: {
    title: 'Drift',
    description: 'Loose rear end, high angle control',
    icon: '💨',
  },
  offroad: {
    title: 'Off-Road',
    description: 'Soft suspension, high clearance',
    icon: '🏔️',
  },
  drag: {
    title: 'Drag',
    description: 'Maximum straight-line acceleration',
    icon: '⚡',
  },
  rally: {
    title: 'Rally/Cross Country',
    description: 'Balanced for mixed surfaces',
    icon: '🌲',
  },
  street: {
    title: 'Street',
    description: 'Balanced everyday driving',
    icon: '🛣️',
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
