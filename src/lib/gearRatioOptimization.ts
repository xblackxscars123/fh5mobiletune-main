/**
 * Gear Ratio Optimization for Forza Horizon 5
 * Calculates optimal gear spreads for different cars and tracks
 * Physics-based gear selection for acceleration vs top speed
 */

import { MPH_TO_TIRE_RPM_CONVERSION, DEFAULT_REDLINE_RPM, DEFAULT_TIRE_RADIUS, MIN_GEAR_SPACING, MAX_GEAR_SPACING, OPTIMAL_GEAR_SPACING, ZERO_SIXTY_SCALING, ZERO_HUNDRED_MULTIPLIER } from './physicsConstants';
import { estimateTopSpeed, estimateZeroToSixty, estimateZeroToHundred } from './performancePrediction';

export interface GearSetup {
  finalDrive: number; // Ratio (2.5-5.5 FH5 range)
  gears: number[]; // Individual gear ratios (1st through 6th+)
  gearCount: number; // Number of gears
}

export interface GearAnalysis {
  accelerationProfile: {
    zeroToSixty: number; // seconds
    zeroToOneHundred: number; // seconds
    rating: number; // 0-10 scale
  };
  topSpeed: number; // mph
  powerDelivery: 'aggressive' | 'balanced' | 'smooth';
  gearingCharacter: string;
  trackSuitability: {
    highSpeed: number; // 0-10 (better for 150+ mph tracks)
    technical: number; // 0-10 (better for tight corners)
    balanced: number; // 0-10 (all-arounder)
  };
  recommendations: string[];
}

/**
 * Calculate RPM at given speed with specific gear
 */
export function calculateRPMAtSpeed(
  speed: number, // mph
  gearRatio: number,
  finalDrive: number,
  tireRadius: number = DEFAULT_TIRE_RADIUS // inches (typical for sports car)
): number {
  // RPM = (Speed × Gear Ratio × Final Drive × Conversion) / Tire Diameter
  
  const tireDiameter = tireRadius * 2;
  const rpm = (speed * gearRatio * finalDrive * MPH_TO_TIRE_RPM_CONVERSION) / tireDiameter;
  
  return Math.round(rpm);
}

/**
 * Calculate speed at given RPM with specific gear
 */
export function calculateSpeedAtRPM(
  rpm: number,
  gearRatio: number,
  finalDrive: number,
  tireRadius: number = DEFAULT_TIRE_RADIUS
): number {
  // Speed = (RPM × Tire Diameter) / (Gear Ratio × Final Drive × Conversion)
  
  const tireDiameter = tireRadius * 2;
  const speed = (rpm * tireDiameter) / (gearRatio * finalDrive * MPH_TO_TIRE_RPM_CONVERSION);
  
  return Math.round(speed * 10) / 10;
}

/**
 * Calculate redline speed for each gear
 */
export function calculateRedlineSpeeds(
  gearRatios: number[],
  finalDrive: number,
  redlineRPM: number = DEFAULT_REDLINE_RPM,
  tireRadius: number = DEFAULT_TIRE_RADIUS
): number[] {
  return gearRatios.map(ratio => 
    calculateSpeedAtRPM(redlineRPM, ratio, finalDrive, tireRadius)
  );
}

/**
 * Calculate gear spacing (ratio between consecutive gears)
 * Optimal is 1.15-1.35 for smooth power delivery
 */
export function calculateGearSpacing(gearRatios: number[]): {
  spacings: number[];
  avgSpacing: number;
  uniformity: number; // 0-10 (10 = perfectly uniform)
} {
  const spacings: number[] = [];
  
  for (let i = 0; i < gearRatios.length - 1; i++) {
    const spacing = gearRatios[i] / gearRatios[i + 1]; // Higher ratio / lower ratio
    spacings.push(spacing);
  }
  
  const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
  
  // Calculate uniformity (lower variance = higher uniformity)
  const variance = spacings.reduce((sum, spacing) => 
    sum + Math.pow(spacing - avgSpacing, 2), 0
  ) / spacings.length;
  
  const stdDev = Math.sqrt(variance);
  const uniformity = Math.max(0, 10 - stdDev * 5); // Convert to 0-10 scale
  
  // Validate spacing is within optimal range
  const spacingWarnings = spacings.filter(s => s < MIN_GEAR_SPACING || s > MAX_GEAR_SPACING).length;
  
  return {
    spacings,
    avgSpacing: Math.round(avgSpacing * 1000) / 1000,
    uniformity: Math.round(uniformity * 10) / 10
  };
}

/**
 * Comprehensive gear analysis
 */
/**
 * Comprehensive gear analysis
 */
export function analyzeGearing(
  setup: GearSetup,
  power: number,
  weight: number,
  dragCoefficient: number = 0.30,
  redlineRPM: number = 7500
): GearAnalysis {
  // Calculate acceleration metrics
  const zeroToSixty = estimate0to60Time(power, weight, setup.finalDrive, setup.gears[0]);
  const zeroToOneHundred = estimate0to100Time(zeroToSixty, power, weight);
  const accelerationRating = Math.max(0, Math.min(10, 10 - zeroToSixty));
  
  // Calculate top speed
  const topSpeed = estimateTopSpeed(power, weight, dragCoefficient, setup.finalDrive);
  
  // Analyze gear spacing
  const spacing = calculateGearSpacing(setup.gears);
  
  // Power delivery character
  let powerDelivery: 'aggressive' | 'balanced' | 'smooth' = 'balanced';
  if (spacing.avgSpacing < 1.15) {
    powerDelivery = 'smooth';
  } else if (spacing.avgSpacing > 1.25) {
    powerDelivery = 'aggressive';
  }
  
  // Gearing character description
  const finalDriveRatio = setup.finalDrive;
  let gearingCharacter = '';
  if (finalDriveRatio > 4.5) {
    gearingCharacter = `Very short gearing (${finalDriveRatio.toFixed(2)}) - Extreme acceleration focus`;
  } else if (finalDriveRatio > 4.0) {
    gearingCharacter = `Short gearing (${finalDriveRatio.toFixed(2)}) - Acceleration optimized`;
  } else if (finalDriveRatio > 3.5) {
    gearingCharacter = `Moderately short (${finalDriveRatio.toFixed(2)}) - Balanced`;
  } else if (finalDriveRatio > 3.0) {
    gearingCharacter = `Moderately long (${finalDriveRatio.toFixed(2)}) - Speed oriented`;
  } else {
    gearingCharacter = `Long gearing (${finalDriveRatio.toFixed(2)}) - Maximum top speed`;
  }
  
  // Track suitability
  const trackSuitability = {
    highSpeed: Math.max(0, Math.min(10, 10 - (zeroToSixty * 0.5))), // High speed favors good acceleration too
    technical: accelerationRating, // Technical tracks benefit from acceleration
    balanced: 5 + (spacing.uniformity / 2) // Balanced setup uses smooth spacing
  };
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (zeroToSixty > 5.5) {
    recommendations.push('Shorter gearing recommended for better acceleration');
  } else if (zeroToSixty < 3.5) {
    recommendations.push('Could extend gearing for better top speed');
  }
  
  if (spacing.avgSpacing < 1.10) {
    recommendations.push('Gears are too close together - less efficient power delivery');
  } else if (spacing.avgSpacing > 1.35) {
    recommendations.push('Gears are too spread out - gaps in power band');
  }
  
  if (topSpeed < 120 && finalDriveRatio > 4.0) {
    recommendations.push('Current gearing may limit top speed too much');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Gearing is well-optimized for current setup');
  }
  
  return {
    accelerationProfile: {
      zeroToSixty: Math.round(zeroToSixty * 100) / 100,
      zeroToOneHundred: Math.round(zeroToOneHundred * 100) / 100,
      rating: Math.round(accelerationRating * 10) / 10
    },
    topSpeed,
    powerDelivery,
    gearingCharacter,
    trackSuitability: {
      highSpeed: Math.round(trackSuitability.highSpeed * 10) / 10,
      technical: Math.round(trackSuitability.technical * 10) / 10,
      balanced: Math.round(trackSuitability.balanced * 10) / 10
    },
    recommendations
  };
}

/**
 * Optimize gearing for specific condition
 */
export function optimizeGearingFor(
  condition: 'acceleration' | 'topSpeed' | 'balanced' | 'technical' | 'drag',
  power: number,
  weight: number
): GearSetup {
  // Typical 6-gear setups for different conditions
  // Ratios are engineered examples from real cars
  
  const powerToWeight = power / (weight / 1000);
  
  switch (condition) {
    case 'acceleration':
      return {
        finalDrive: powerToWeight > 0.3 ? 4.5 : 4.2,
        gears: [3.5, 2.5, 1.8, 1.3, 1.0, 0.75],
        gearCount: 6
      };
    
    case 'topSpeed':
      return {
        finalDrive: 3.2,
        gears: [3.0, 2.2, 1.6, 1.2, 0.95, 0.70],
        gearCount: 6
      };
    
    case 'balanced':
      return {
        finalDrive: 3.7,
        gears: [3.2, 2.3, 1.7, 1.25, 0.95, 0.72],
        gearCount: 6
      };
    
    case 'technical':
      return {
        finalDrive: 4.0,
        gears: [3.4, 2.4, 1.75, 1.28, 0.97, 0.73],
        gearCount: 6
      };
    
    case 'drag':
      return {
        finalDrive: powerToWeight > 0.25 ? 5.0 : 4.7,
        gears: [3.8, 2.7, 1.9, 1.4, 1.0, 0.75],
        gearCount: 6
      };
    
    default:
      return {
        finalDrive: 3.7,
        gears: [3.2, 2.3, 1.7, 1.25, 0.95, 0.72],
        gearCount: 6
      };
  }
}

/**
 * Find optimal final drive for target top speed
 */
export function findOptimalFinalDrive(
  targetTopSpeed: number, // mph
  power: number,
  weight: number,
  dragCoefficient: number = 0.30,
  maxGearRatio: number = 0.7 // Typical 6th gear
): number {
  // Using power = drag × velocity equation
  // Solving backwards to find required final drive
  
  const baseFinalDrive = 3.5; // Starting point
  let finalDrive = baseFinalDrive;
  
  // Iterative search for optimal final drive
  for (let i = 0; i < 5; i++) {
    const currentTopSpeed = estimateTopSpeed(power, weight, dragCoefficient, finalDrive);
    
    if (Math.abs(currentTopSpeed - targetTopSpeed) < 2) {
      break; // Close enough
    }
    
    if (currentTopSpeed < targetTopSpeed) {
      finalDrive *= 0.95; // Need longer gears
    } else {
      finalDrive *= 1.05; // Need shorter gears
    }
    
    finalDrive = Math.max(2.5, Math.min(5.5, finalDrive)); // FH5 limits
  }
  
  return Math.round(finalDrive * 100) / 100;
}

/**
 * Get gearing recommendations for a specific car
 */
export function getGearingRecommendations(
  tuneType: string,
  power: number,
  weight: number,
  isAWD: boolean = false
): {
  condition: string;
  setup: GearSetup;
  reasoning: string[];
} {
  let condition = 'balanced';
  const reasoning: string[] = [];
  
  const powerToWeight = power / (weight / 1000);
  
  if (tuneType === 'grip' || tuneType === 'circuit') {
    condition = 'balanced';
    reasoning.push('Circuit racing requires balanced acceleration and top speed');
  } else if (tuneType === 'drag') {
    condition = 'drag';
    reasoning.push('Drag racing optimized for maximum launch acceleration');
  } else if (tuneType === 'drift') {
    condition = 'acceleration';
    reasoning.push('Drift setup benefits from aggressive acceleration for entry');
  } else if (tuneType === 'street') {
    condition = 'balanced';
    reasoning.push('Street driving benefits from balanced gearing');
  } else if (tuneType === 'rally' || tuneType === 'offroad') {
    condition = 'technical';
    reasoning.push('Off-road requires excellent mid-range acceleration');
  }
  
  // Power-based adjustments
  if (powerToWeight > 0.3) {
    reasoning.push(`High power (${powerToWeight.toFixed(2)} hp/lb) - Using aggressive gearing`);
  } else if (powerToWeight < 0.15) {
    reasoning.push(`Lower power (${powerToWeight.toFixed(2)} hp/lb) - Using longer gears for efficiency`);
  }
  
  // AWD adjustment
  if (isAWD) {
    reasoning.push('AWD drivetrain allows more aggressive gearing without wheelspin');
  }
  
  const setup = optimizeGearingFor(condition as any, power, weight);
  
  return {
    condition,
    setup,
    reasoning
  };
}

export default {
  calculateRPMAtSpeed,
  calculateSpeedAtRPM,
  calculateRedlineSpeeds,
  calculateGearSpacing,
  analyzeGearing,
  optimizeGearingFor,
  findOptimalFinalDrive,
  getGearingRecommendations
};
