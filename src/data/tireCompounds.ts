/**
 * Forza Horizon 5 Tire Compound System
 * Comprehensive tire data based on FH5 game physics
 */

export interface TireCompound {
  id: 'street' | 'sport' | 'racing' | 'slick' | 'rally' | 'offroad' | 'drag';
  name: string;
  category: 'road' | 'racing' | 'specialty';
  
  // Grip characteristics
  baseGrip: number; // 0-2.0 multiplier (1.0 = sport baseline)
  dryGrip: number;
  wetGrip: number;
  dirtGrip: number;
  gravelGrip: number;
  
  // Temperature characteristics
  coldPressureTarget: number; // PSI
  warmPressureTarget: number; // PSI - after 2-3 laps
  temperatureRise: number; // PSI rise during driving
  optimalTempCelsius: number; // Temperature for peak grip
  gripPeakTempCelsius: number; // Temperature where grip peaks
  overheatingStartTemp: number; // Where grip falls off
  
  // Wear and degradation
  wearRate: number; // laps per full tire wear (lower = faster wear)
  degradationRate: number; // per-lap grip loss after wear starts
  
  // Forza game recommendations
  recommendedPI: { min: number; max: number };
  recommendedTuneTypes: string[];
  idealTracks: string[];
  
  // Pressure adjustments for different conditions
  pressureAdjustments: {
    hotClimate: number; // PSI adjustment
    coldClimate: number;
    highSpeed: number;
    technical: number;
    offroad: number;
  };
  
  notes: string[];
}

export const TIRE_COMPOUNDS: Record<string, TireCompound> = {
  // ==========================================
  // STREET TIRES (Legal road use)
  // ==========================================
  
  'street': {
    id: 'street',
    name: 'Street Tires',
    category: 'road',
    
    baseGrip: 0.85,
    dryGrip: 0.85,
    wetGrip: 0.70,
    dirtGrip: 0.60,
    gravelGrip: 0.55,
    
    coldPressureTarget: 32,
    warmPressureTarget: 36,
    temperatureRise: 4,
    optimalTempCelsius: 70,
    gripPeakTempCelsius: 85,
    overheatingStartTemp: 110,
    
    wearRate: 180, // Very long lasting
    degradationRate: 0.002,
    
    recommendedPI: { min: 100, max: 400 },
    recommendedTuneTypes: ['street'],
    idealTracks: ['mexico-city', 'alhambra-street', 'highway-1-north', 'highway-1-south'],
    
    pressureAdjustments: {
      hotClimate: 0.5,
      coldClimate: -0.5,
      highSpeed: 0.0,
      technical: 0.0,
      offroad: -2.0
    },
    
    notes: [
      'Lowest grip of all compounds',
      'Long tire life - economical',
      'Best for casual street driving',
      'Poor performance in extreme conditions',
      'Good all-weather characteristics'
    ]
  },

  // ==========================================
  // SPORT TIRES (Balanced road/track)
  // ==========================================
  
  'sport': {
    id: 'sport',
    name: 'Sport Tires',
    category: 'road',
    
    baseGrip: 1.0, // Baseline reference
    dryGrip: 1.0,
    wetGrip: 0.80,
    dirtGrip: 0.70,
    gravelGrip: 0.65,
    
    coldPressureTarget: 30,
    warmPressureTarget: 35,
    temperatureRise: 5,
    optimalTempCelsius: 85,
    gripPeakTempCelsius: 100,
    overheatingStartTemp: 120,
    
    wearRate: 120, // Moderate life
    degradationRate: 0.005,
    
    recommendedPI: { min: 300, max: 700 },
    recommendedTuneTypes: ['street', 'grip'],
    idealTracks: ['espíritu-del-bosque', 'lago-azul', 'calafatá'],
    
    pressureAdjustments: {
      hotClimate: 0.3,
      coldClimate: -0.3,
      highSpeed: 0.5,
      technical: -0.2,
      offroad: -3.0
    },
    
    notes: [
      'Best all-around tire',
      'Good grip and reasonable tire life',
      'Excellent street/circuit balance',
      'Responsive and predictable',
      'Most versatile choice',
      'Default for most tuning scenarios'
    ]
  },

  // ==========================================
  // RACING TIRES (Track focused)
  // ==========================================
  
  'racing': {
    id: 'racing',
    name: 'Racing Tires',
    category: 'racing',
    
    baseGrip: 1.15,
    dryGrip: 1.15,
    wetGrip: 0.85,
    dirtGrip: 0.75,
    gravelGrip: 0.70,
    
    coldPressureTarget: 28,
    warmPressureTarget: 33,
    temperatureRise: 5,
    optimalTempCelsius: 95,
    gripPeakTempCelsius: 110,
    overheatingStartTemp: 130,
    
    wearRate: 80, // Moderate wear
    degradationRate: 0.010,
    
    recommendedPI: { min: 600, max: 900 },
    recommendedTuneTypes: ['grip', 'drift', 'rally'],
    idealTracks: ['goliath', 'espíritu-del-bosque', 'punto-final-sprint'],
    
    pressureAdjustments: {
      hotClimate: 0.2,
      coldClimate: -0.2,
      highSpeed: 0.8,
      technical: 0.0,
      offroad: -4.0
    },
    
    notes: [
      'Significant grip improvement over sport',
      'Moderate tire life',
      'Best for circuits and high-speed driving',
      'Requires proper tire heat to perform',
      'Professional-grade tire',
      'Demands better suspension setup'
    ]
  },

  // ==========================================
  // SLICK TIRES (Pure track racing)
  // ==========================================
  
  'slick': {
    id: 'slick',
    name: 'Slick Tires',
    category: 'racing',
    
    baseGrip: 1.35,
    dryGrip: 1.35,
    wetGrip: 0.60, // VERY poor in wet
    dirtGrip: 0.50, // Terrible on dirt
    gravelGrip: 0.45,
    
    coldPressureTarget: 26,
    warmPressureTarget: 31,
    temperatureRise: 5,
    optimalTempCelsius: 100,
    gripPeakTempCelsius: 115,
    overheatingStartTemp: 135,
    
    wearRate: 50, // Fast wear
    degradationRate: 0.015,
    
    recommendedPI: { min: 800, max: 999 },
    recommendedTuneTypes: ['grip', 'drift', 'drag'],
    idealTracks: ['drag-strip', 'el-mirador-sprint', 'punto-final-sprint'],
    
    pressureAdjustments: {
      hotClimate: 0.1,
      coldClimate: 0.0,
      highSpeed: 1.0,
      technical: 0.2,
      offroad: -6.0
    },
    
    notes: [
      'Maximum grip on dry pavement',
      'ONLY for dry conditions',
      'Fastest lap times on circuits',
      'Poor tire life - frequent changes needed',
      'Needs high downforce to work well',
      'Not suitable for wet weather',
      'Extreme high-PI racing only'
    ]
  },

  // ==========================================
  // RALLY TIRES (Mixed surface)
  // ==========================================
  
  'rally': {
    id: 'rally',
    name: 'Rally Tires',
    category: 'specialty',
    
    baseGrip: 0.95,
    dryGrip: 0.95,
    wetGrip: 0.85,
    dirtGrip: 0.90,
    gravelGrip: 0.85,
    
    coldPressureTarget: 23.5,
    warmPressureTarget: 28,
    temperatureRise: 4.5,
    optimalTempCelsius: 80,
    gripPeakTempCelsius: 95,
    overheatingStartTemp: 125,
    
    wearRate: 100,
    degradationRate: 0.008,
    
    recommendedPI: { min: 200, max: 850 },
    recommendedTuneTypes: ['rally', 'offroad', 'street'],
    idealTracks: ['mulege-to-baja', 'mulegé-offroad', 'baja-offroad'],
    
    pressureAdjustments: {
      hotClimate: 0.5,
      coldClimate: -1.0,
      highSpeed: 0.5,
      technical: 0.2,
      offroad: 0.0
    },
    
    notes: [
      'Excellent on mixed surfaces',
      'Great grip on dirt and gravel',
      'Responsive and predictable',
      'Lower pressures improve traction',
      'Good all-weather performance',
      'Essential for rally events',
      'Handles dirt better than asphalt equivalents'
    ]
  },

  // ==========================================
  // OFFROAD TIRES (Dirt/gravel specialized)
  // ==========================================
  
  'offroad': {
    id: 'offroad',
    name: 'Offroad Tires',
    category: 'specialty',
    
    baseGrip: 0.75,
    dryGrip: 0.75,
    wetGrip: 0.65,
    dirtGrip: 1.0, // Maximum on dirt
    gravelGrip: 0.95,
    
    coldPressureTarget: 17.5,
    warmPressureTarget: 22,
    temperatureRise: 4.5,
    optimalTempCelsius: 75,
    gripPeakTempCelsius: 90,
    overheatingStartTemp: 115,
    
    wearRate: 140,
    degradationRate: 0.006,
    
    recommendedPI: { min: 100, max: 700 },
    recommendedTuneTypes: ['offroad', 'rally'],
    idealTracks: ['mulegé-offroad', 'baja-offroad', 'tres-cruces-offroad'],
    
    pressureAdjustments: {
      hotClimate: 1.0,
      coldClimate: -1.5,
      highSpeed: -0.5,
      technical: 0.0,
      offroad: 2.0
    },
    
    notes: [
      'Optimized for dirt/gravel surfaces',
      'Poor grip on pavement',
      'Very low pressures for flotation',
      'Excellent wheel independence',
      'Essential for offroad events',
      'NOT for tarmac driving',
      'Wider sidewalls absorb terrain impacts'
    ]
  },

  // ==========================================
  // DRAG TIRES (Launch specialized)
  // ==========================================
  
  'drag': {
    id: 'drag',
    name: 'Drag Tires',
    category: 'racing',
    
    baseGrip: 1.50, // Maximum initial grip
    dryGrip: 1.50,
    wetGrip: 0.50, // Useless in rain
    dirtGrip: 0.30,
    gravelGrip: 0.25,
    
    coldPressureTarget: 55.0, // EXTREMELY high - wrinkle-wall tires
    warmPressureTarget: 60.0,
    temperatureRise: 5,
    optimalTempCelsius: 110,
    gripPeakTempCelsius: 120,
    overheatingStartTemp: 140,
    
    wearRate: 30, // Very fast wear
    degradationRate: 0.020,
    
    recommendedPI: { min: 500, max: 999 },
    recommendedTuneTypes: ['drag'],
    idealTracks: ['drag-strip', 'el-mirador-sprint'],
    
    pressureAdjustments: {
      hotClimate: 0.0,
      coldClimate: 0.0,
      highSpeed: 0.0,
      technical: 0.0,
      offroad: -55.0
    },
    
    notes: [
      'MAXIMUM launch grip',
      'Wrinkle-wall tires for drag racing',
      'Extremely high pressures',
      'Only for straight-line acceleration',
      'Terrible cornering grip',
      'Designed for 0-60 domination',
      'Very short tire life'
    ]
  },
};

/**
 * Get a tire compound by ID
 */
export function getTireCompound(id: string): TireCompound | null {
  return TIRE_COMPOUNDS[id] || null;
}

/**
 * Get all available tire compounds
 */
export function getAllTireCompounds(): TireCompound[] {
  return Object.values(TIRE_COMPOUNDS);
}

/**
 * Get tire compounds suitable for a PI class
 */
export function getTiresByPI(piClass: number): TireCompound[] {
  return Object.values(TIRE_COMPOUNDS).filter(
    tire => piClass >= tire.recommendedPI.min && piClass <= tire.recommendedPI.max
  );
}

/**
 * Get tire compounds for a specific tune type
 */
export function getTiresByTuneType(tuneType: string): TireCompound[] {
  return Object.values(TIRE_COMPOUNDS).filter(
    tire => tire.recommendedTuneTypes.includes(tuneType.toLowerCase())
  );
}

/**
 * Get tire compounds for a specific track
 */
export function getTiresByTrack(trackId: string): TireCompound[] {
  return Object.values(TIRE_COMPOUNDS).filter(
    tire => tire.idealTracks.includes(trackId)
  );
}

/**
 * Adjust tire pressure based on conditions
 */
export function adjustTirePressure(
  compound: TireCompound,
  conditions: {
    climate?: 'hot' | 'cold';
    speedProfile?: 'high-speed' | 'technical' | 'balanced';
    surfaceType?: 'asphalt' | 'dirt' | 'gravel';
  }
): number {
  let pressure = compound.coldPressureTarget;
  
  if (conditions.climate === 'hot') {
    pressure += compound.pressureAdjustments.hotClimate;
  } else if (conditions.climate === 'cold') {
    pressure += compound.pressureAdjustments.coldClimate;
  }
  
  if (conditions.speedProfile === 'high-speed') {
    pressure += compound.pressureAdjustments.highSpeed;
  } else if (conditions.speedProfile === 'technical') {
    pressure += compound.pressureAdjustments.technical;
  }
  
  if (conditions.surfaceType === 'dirt' || conditions.surfaceType === 'gravel') {
    pressure += compound.pressureAdjustments.offroad;
  }
  
  // Clamp to game limits: 14-55 PSI
  return Math.max(14, Math.min(55, Math.round(pressure * 10) / 10));
}

/**
 * Get grip multiplier for tire on specific surface
 */
export function getTireGrip(
  compound: TireCompound,
  surface: 'asphalt' | 'dirt' | 'gravel' | 'wet'
): number {
  switch (surface) {
    case 'asphalt':
      return compound.dryGrip;
    case 'dirt':
      return compound.dirtGrip;
    case 'gravel':
      return compound.gravelGrip;
    case 'wet':
      return compound.wetGrip;
    default:
      return compound.dryGrip;
  }
}

export default TIRE_COMPOUNDS;
