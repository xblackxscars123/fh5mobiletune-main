/**
 * Forza Horizon 5 Car Aerodynamics Database
 * Aero profiles for different car categories
 * Based on real-world aero characteristics and FH5 physics
 */

export type CarCategory = 
  | 'hypercar' | 'supercar' | 'muscle' | 'sports' 
  | 'gt' | 'touring' | 'hot-hatch' | 'rally' 
  | 'offroad' | 'truck' | 'van' | 'classic';

export interface CarAerodynamicsProfile {
  category: CarCategory;
  name: string;
  
  // Base drag and downforce characteristics
  baseCD: number; // Drag coefficient (lower = faster at top speed)
  baseDownforce: number; // % of weight at 100 mph
  wingMountPoint: 'rear' | 'integrated'; // Affects aero balance
  
  // Wing adjustment ranges
  wingAngleRange: { min: number; max: number }; // degrees
  defaultWingAngle: number;
  frontWingEffect: number; // Downforce per degree
  rearWingEffect: number; // Downforce per degree
  
  // Ride height effects
  minRideHeight: number; // inches
  maxRideHeight: number;
  rideHeightImpact: number; // Aero per inch of height change
  // (negative number: lower = more downforce)
  
  // Splitter/diffuser effects
  hasFrontSplitter: boolean;
  splitterDownforce: number; // lbs at 100 mph
  hasDiffuser: boolean;
  diffuserDownforce: number;
  
  // Speed effects
  criticalSpeed: number; // mph where downforce becomes significant
  dragPenaltyHighSpeed: number; // % drag increase per 10 mph over 150
  
  // Aero efficiency
  aeroEfficiency: number; // 0-1.0 (how responsive aero adjustments are)
  notes: string[];
}

export const CAR_AERODYNAMICS: Record<CarCategory, CarAerodynamicsProfile> = {
  // ==========================================
  // HYPERCARS & SUPERCARS
  // ==========================================
  
  'hypercar': {
    category: 'hypercar',
    name: 'Hypercar',
    
    baseCD: 0.25,
    baseDownforce: 45,
    wingMountPoint: 'rear',
    
    wingAngleRange: { min: 0, max: 90 },
    defaultWingAngle: 45,
    frontWingEffect: 2.5,
    rearWingEffect: 3.2,
    
    minRideHeight: 2.0,
    maxRideHeight: 6.0,
    rideHeightImpact: -3.5, // Very sensitive to ride height
    
    hasFrontSplitter: true,
    splitterDownforce: 150,
    hasDiffuser: true,
    diffuserDownforce: 200,
    
    criticalSpeed: 80,
    dragPenaltyHighSpeed: 0.08,
    
    aeroEfficiency: 1.0,
    notes: [
      'Maximum aero capability',
      'Very responsive to adjustments',
      'High-speed aerodynamics dominate handling',
      'Requires smooth, consistent driving',
      'Over 200 mph in straight line possible',
      'Best on high-speed circuits'
    ]
  },

  'supercar': {
    category: 'supercar',
    name: 'Supercar',
    
    baseCD: 0.30,
    baseDownforce: 35,
    wingMountPoint: 'rear',
    
    wingAngleRange: { min: 0, max: 90 },
    defaultWingAngle: 35,
    frontWingEffect: 2.0,
    rearWingEffect: 2.8,
    
    minRideHeight: 2.5,
    maxRideHeight: 6.5,
    rideHeightImpact: -3.0,
    
    hasFrontSplitter: true,
    splitterDownforce: 120,
    hasDiffuser: true,
    diffuserDownforce: 150,
    
    criticalSpeed: 90,
    dragPenaltyHighSpeed: 0.09,
    
    aeroEfficiency: 0.95,
    notes: [
      'High-performance aero',
      'Excellent downforce generation',
      'Can handle aggressive aero setups',
      '180+ mph achievable',
      'Great for all circuits'
    ]
  },

  'gt': {
    category: 'gt',
    name: 'GT Car',
    
    baseCD: 0.32,
    baseDownforce: 30,
    wingMountPoint: 'rear',
    
    wingAngleRange: { min: 0, max: 70 },
    defaultWingAngle: 30,
    frontWingEffect: 1.8,
    rearWingEffect: 2.5,
    
    minRideHeight: 3.0,
    maxRideHeight: 7.0,
    rideHeightImpact: -2.8,
    
    hasFrontSplitter: true,
    splitterDownforce: 100,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 100,
    dragPenaltyHighSpeed: 0.10,
    
    aeroEfficiency: 0.90,
    notes: [
      'Good high-speed stability',
      'Balanced aero design',
      '170+ mph possible',
      'Responsive wing adjustments'
    ]
  },

  // ==========================================
  // SPORTS & PERFORMANCE CARS
  // ==========================================
  
  'sports': {
    category: 'sports',
    name: 'Sports Car',
    
    baseCD: 0.33,
    baseDownforce: 25,
    wingMountPoint: 'rear',
    
    wingAngleRange: { min: 0, max: 60 },
    defaultWingAngle: 25,
    frontWingEffect: 1.5,
    rearWingEffect: 2.0,
    
    minRideHeight: 3.5,
    maxRideHeight: 7.5,
    rideHeightImpact: -2.5,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 110,
    dragPenaltyHighSpeed: 0.11,
    
    aeroEfficiency: 0.85,
    notes: [
      'Moderate aero assistance',
      'Good all-around balance',
      '160+ mph achievable',
      'Wing angle matters at high speeds'
    ]
  },

  'touring': {
    category: 'touring',
    name: 'Touring Car',
    
    baseCD: 0.35,
    baseDownforce: 15,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 40 },
    defaultWingAngle: 15,
    frontWingEffect: 1.0,
    rearWingEffect: 1.3,
    
    minRideHeight: 4.0,
    maxRideHeight: 8.0,
    rideHeightImpact: -1.8,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 120,
    dragPenaltyHighSpeed: 0.12,
    
    aeroEfficiency: 0.75,
    notes: [
      'Minimal aero effects',
      'Engine power more important',
      '150+ mph typical',
      'Aero adjustments have minimal impact'
    ]
  },

  // ==========================================
  // MUSCLE CARS
  // ==========================================
  
  'muscle': {
    category: 'muscle',
    name: 'Muscle Car',
    
    baseCD: 0.35,
    baseDownforce: 20,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 60 },
    defaultWingAngle: 25,
    frontWingEffect: 1.5,
    rearWingEffect: 2.0,
    
    minRideHeight: 4.5,
    maxRideHeight: 8.5,
    rideHeightImpact: -2.0,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 100,
    dragPenaltyHighSpeed: 0.10,
    
    aeroEfficiency: 0.80,
    notes: [
      'Moderate aero improvement available',
      'Power-focused design',
      '170+ mph on straights',
      'Drag is significant concern',
      'Wing helps stability more than speed'
    ]
  },

  // ==========================================
  // HOT HATCHES & COMPACT CARS
  // ==========================================
  
  'hot-hatch': {
    category: 'hot-hatch',
    name: 'Hot Hatch',
    
    baseCD: 0.32,
    baseDownforce: 12,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 40 },
    defaultWingAngle: 15,
    frontWingEffect: 0.8,
    rearWingEffect: 1.0,
    
    minRideHeight: 3.8,
    maxRideHeight: 8.0,
    rideHeightImpact: -1.5,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 130,
    dragPenaltyHighSpeed: 0.13,
    
    aeroEfficiency: 0.70,
    notes: [
      'Minimal aero effects',
      'Lightweight design',
      'Aero matters less than weight reduction',
      '140-160 mph typical'
    ]
  },

  // ==========================================
  // RALLY & OFFROAD
  // ==========================================
  
  'rally': {
    category: 'rally',
    name: 'Rally Car',
    
    baseCD: 0.38,
    baseDownforce: 5,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 30 },
    defaultWingAngle: 10,
    frontWingEffect: 0.5,
    rearWingEffect: 0.7,
    
    minRideHeight: 6.0,
    maxRideHeight: 12.0, // Very high ride height
    rideHeightImpact: -0.5, // Minimal effect due to design
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 150,
    dragPenaltyHighSpeed: 0.15,
    
    aeroEfficiency: 0.5,
    notes: [
      'Aero is least important for rally',
      'Suspension geometry dominates',
      'Drag is very high',
      'Top speed less critical than control',
      'Focus on handling, not aero'
    ]
  },

  'offroad': {
    category: 'offroad',
    name: 'Offroad Vehicle',
    
    baseCD: 0.45,
    baseDownforce: 3,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 20 },
    defaultWingAngle: 5,
    frontWingEffect: 0.3,
    rearWingEffect: 0.5,
    
    minRideHeight: 7.0,
    maxRideHeight: 13.0, // Maximum clearance
    rideHeightImpact: 0.0, // No aero effect at high heights
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 160,
    dragPenaltyHighSpeed: 0.20,
    
    aeroEfficiency: 0.3,
    notes: [
      'Aero almost irrelevant',
      'Extreme drag penalty',
      'Designed for terrain, not speed',
      'Suspension & tires critical',
      'Top speed not a factor'
    ]
  },

  'truck': {
    category: 'truck',
    name: 'Truck',
    
    baseCD: 0.50,
    baseDownforce: 5,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 30 },
    defaultWingAngle: 10,
    frontWingEffect: 0.4,
    rearWingEffect: 0.6,
    
    minRideHeight: 6.5,
    maxRideHeight: 14.0,
    rideHeightImpact: 0.0,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 140,
    dragPenaltyHighSpeed: 0.18,
    
    aeroEfficiency: 0.4,
    notes: [
      'Very high drag',
      'Aero has minimal effect',
      'Focus on weight and power',
      'Top speed severely limited',
      'Best on offroad courses'
    ]
  },

  'van': {
    category: 'van',
    name: 'Van',
    
    baseCD: 0.52,
    baseDownforce: 2,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 20 },
    defaultWingAngle: 5,
    frontWingEffect: 0.2,
    rearWingEffect: 0.3,
    
    minRideHeight: 5.0,
    maxRideHeight: 12.0,
    rideHeightImpact: 0.0,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 180,
    dragPenaltyHighSpeed: 0.25,
    
    aeroEfficiency: 0.2,
    notes: [
      'Extremely high drag',
      'Aero essentially irrelevant',
      'Weight is biggest penalty',
      'Top speed rarely relevant',
      'Focus on momentum and gearing'
    ]
  },

  // ==========================================
  // CLASSIC & SPECIALTY
  // ==========================================
  
  'classic': {
    category: 'classic',
    name: 'Classic Car',
    
    baseCD: 0.40,
    baseDownforce: 8,
    wingMountPoint: 'integrated',
    
    wingAngleRange: { min: 0, max: 35 },
    defaultWingAngle: 12,
    frontWingEffect: 0.7,
    rearWingEffect: 0.9,
    
    minRideHeight: 3.5,
    maxRideHeight: 7.5,
    rideHeightImpact: -1.2,
    
    hasFrontSplitter: false,
    splitterDownforce: 0,
    hasDiffuser: false,
    diffuserDownforce: 0,
    
    criticalSpeed: 120,
    dragPenaltyHighSpeed: 0.14,
    
    aeroEfficiency: 0.65,
    notes: [
      'Vintage aero design',
      'Limited downforce capability',
      'Often underpowered',
      'Lightness advantage important',
      'Good handling more important than raw power'
    ]
  },
};

/**
 * Get aerodynamics profile for a car category
 */
export function getAeroProfile(category: CarCategory): CarAerodynamicsProfile {
  return CAR_AERODYNAMICS[category] || CAR_AERODYNAMICS['sports'];
}

/**
 * Calculate downforce at a given speed
 * Downforce scales with speed squared
 */
export function calculateDownforce(
  profile: CarAerodynamicsProfile,
  speedMph: number,
  wingAngle: number,
  rideHeight: number
): number {
  const speedRatio = (speedMph / 100) ** 2; // Downforce scales with v²
  
  // Base downforce
  let downforce = profile.baseDownforce * speedRatio;
  
  // Wing contribution (scales with angle and speed)
  const wingDownforce = wingAngle * profile.rearWingEffect * speedRatio;
  
  // Ride height effect (lower = more downforce)
  const heightFromMin = rideHeight - profile.minRideHeight;
  const heightPenalty = heightFromMin * profile.rideHeightImpact * speedRatio;
  
  // Add splitter downforce if applicable
  let splitterBonus = 0;
  if (profile.hasFrontSplitter && rideHeight <= profile.minRideHeight + 0.5) {
    splitterBonus = (profile.splitterDownforce / 100) * speedRatio;
  }
  
  // Add diffuser downforce
  let diffuserBonus = 0;
  if (profile.hasDiffuser && rideHeight <= profile.minRideHeight + 1.0) {
    diffuserBonus = (profile.diffuserDownforce / 100) * speedRatio;
  }
  
  return Math.max(0, downforce + wingDownforce + heightPenalty + splitterBonus + diffuserBonus);
}

/**
 * Calculate drag force at a given speed
 */
export function calculateDragForce(
  profile: CarAerodynamicsProfile,
  speedMph: number,
  carWeight: number
): number {
  let cd = profile.baseCD;
  
  // Drag increases at very high speeds
  if (speedMph > 150) {
    const extraSpeed = speedMph - 150;
    cd += (extraSpeed / 10) * profile.dragPenaltyHighSpeed;
  }
  
  // Drag force formula: F = 0.5 * ρ * v² * A * Cd
  // Simplified: drag = cd * speed²
  return cd * (speedMph ** 2) / 200; // Constant derived from FH5 physics
}

/**
 * Get optimal wing angle for a speed profile
 */
export function getOptimalWingAngle(
  profile: CarAerodynamicsProfile,
  speedProfile: 'low' | 'medium' | 'high'
): number {
  switch (speedProfile) {
    case 'low':
      return Math.min(profile.defaultWingAngle - 10, profile.wingAngleRange.max);
    case 'medium':
      return profile.defaultWingAngle;
    case 'high':
      return Math.min(profile.defaultWingAngle + 15, profile.wingAngleRange.max);
    default:
      return profile.defaultWingAngle;
  }
}

/**
 * Get all available aero profiles
 */
export function getAllAeroProfiles(): CarAerodynamicsProfile[] {
  return Object.values(CAR_AERODYNAMICS);
}

export default CAR_AERODYNAMICS;
