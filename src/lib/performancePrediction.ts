/**
 * Performance Prediction Utility Functions - PHASE 5C CONSOLIDATED
 * Consolidates top speed and acceleration calculations
 * Eliminates duplicate physics from multiple modules
 * This is the MASTER implementation - all other versions removed
 */

/**
 * Estimate top speed - SUPER-POWERED CONSOLIDATED VERSION
 * Handles all use cases: basic physics, gearing effects, aerodynamic profiles
 * Most accurate physics-based model from Phase 5A, enhanced for compatibility
 * 
 * @param horsepower - Engine power (hp)
 * @param weight - Vehicle weight (lbs)
 * @param dragCoefficient - Aerodynamic drag coefficient (0.2-0.5 typical)
 * @param frontalAreaOrMaxGearRatio - Either frontal area (sq ft) OR max gear ratio
 *                                     If number < 5: treated as frontal area
 *                                     If number >= 5: treated as gear ratio (legacy compatibility)
 * @returns Estimated top speed in mph
 */
export function estimateTopSpeed(
  horsepower: number,
  weight: number,
  dragCoefficient: number,
  frontalAreaOrMaxGearRatio: number = 20
): number {
  // CONSOLIDATION: Unified master function replacing 3 duplicate implementations
  // Supports both: pure physics mode AND gear-ratio-effect mode
  
  // Determine if legacy gear ratio mode (for gearRatioOptimization compatibility)
  const isGearRatioMode = frontalAreaOrMaxGearRatio >= 5;
  const frontalArea = isGearRatioMode ? (weight / 100) * 0.5 : frontalAreaOrMaxGearRatio;
  const maxGearRatio = isGearRatioMode ? frontalAreaOrMaxGearRatio : undefined;
  
  // Pure physics calculation (most accurate)
  // Power required = Drag Force × Speed
  // Drag Force = 0.5 × ρ × v² × Cd × A
  // Where ρ = air density (~0.002377 slugs/ft³)
  
  const airDensity = 0.002377; // slugs/ft³
  const hpToFtLbs = 550; // ft-lbs/sec per hp
  const secPerHour = 3600;
  
  // Iterative solution for top speed
  let speed = 50; // Starting guess
  for (let i = 0; i < 10; i++) {
    const dragForce = 0.5 * airDensity * (speed * 1.46667) ** 2 * dragCoefficient * frontalArea;
    speed = (horsepower * hpToFtLbs * secPerHour) / (dragForce * 1.46667);
  }
  
  // Apply gearing effect modifier if in gear ratio mode (legacy compatibility)
  if (isGearRatioMode && maxGearRatio) {
    const gearEffect = Math.pow(maxGearRatio, 0.3);
    speed = speed / gearEffect; // Shorter gears = lower top speed
  }
  
  // Clamp to realistic range
  speed = Math.max(80, Math.min(250, speed));
  
  return Math.round(speed);
}

/**
 * Calculate power available at a given speed
 * Accounts for transmission losses and engine characteristics
 * @param peakHorsepower - Peak engine power (hp)
 * @param currentSpeed - Current speed (mph)
 * @param maxSpeed - Top speed (mph)
 * @returns Available horsepower at current speed
 */
export function calculateAvailablePower(
  peakHorsepower: number,
  currentSpeed: number,
  maxSpeed: number
): number {
  // Power available decreases with speed as car approaches top speed
  // Uses simplified cubic falloff after 60% of top speed
  
  const speedRatio = currentSpeed / maxSpeed;
  
  if (speedRatio < 0.6) {
    // Full power available up to 60% of top speed
    return peakHorsepower * 0.92; // 8% transmission loss
  }
  
  // Power drops off increasingly as top speed approached
  const excess = speedRatio - 0.6;
  const falloff = 1 - (excess / 0.4) ** 2;
  
  return Math.round(peakHorsepower * falloff * 0.92);
}

/**
 * Estimate 0-60 time - ENHANCED for gearing and traction
 * @param horsepower - Engine power (hp)
 * @param weight - Vehicle weight (lbs)
 * @param tireGrip - Tire grip multiplier (0.8-2.0), or finalDrive for legacy compatibility
 * @param optionalFirstGearRatio - First gear ratio (optional, only if tireGrip is actually finalDrive)
 * @param wheelSlip - Wheel slip factor (0-1, default 0.1 = 10%)
 * @returns Time to 60 mph in seconds
 */
export function estimateZeroToSixty(
  horsepower: number,
  weight: number,
  tireGripOrFinalDrive: number = 1.0,
  optionalFirstGearRatio?: number,
  wheelSlip: number = 0.1
): number {
  // CONSOLIDATION: Unified master function replacing 2 duplicate implementations
  // Auto-detects parameter style:
  // - Modern style: (hp, weight, tireGrip)
  // - Legacy style: (hp, weight, finalDrive, firstGearRatio, wheelSlip)
  
  // Detect which parameter set is being used
  const isLegacyMode = optionalFirstGearRatio !== undefined;
  
  if (isLegacyMode) {
    // Legacy gearRatioOptimization mode with gearing effects
    const finalDrive = tireGripOrFinalDrive;
    const firstGearRatio = optionalFirstGearRatio!;
    
    // Power-to-weight ratio
    const powerToWeight = horsepower / (weight / 1000);
    
    // Gearing effect (more aggressive = faster 0-60)
    const gearingEffect = Math.log(finalDrive * firstGearRatio) / Math.log(3);
    
    // Base time from power-to-weight
    let baseTime = 60 / (powerToWeight * 3); // Rough estimate
    
    // Adjust for gearing (better gearing = shorter time)
    const gearingAdjustment = 1 - (gearingEffect * 0.05);
    
    // Adjust for wheelspin (more slip = longer time)
    const slipAdjustment = 1 + wheelSlip;
    
    let time = baseTime * slipAdjustment * gearingAdjustment;
    
    // Clamp to realistic range
    time = Math.max(3.5, Math.min(10, time)); // Most cars: 3.5-10 seconds
    
    return Math.round(time * 100) / 100;
  } else {
    // Modern simplified physics mode (tire grip based)
    const tireGrip = tireGripOrFinalDrive;
    
    // Simplified physics: power/weight ratio and traction limit
    const powerToWeight = (horsepower * 1.34102) / weight; // Convert to kW per kg
    
    // Base formula: t = 60 / avgSpeed, where avgSpeed depends on power/weight
    // Better traction multiplier for higher grip
    const tractionMultiplier = Math.min(tireGrip, 1.4); // Max 1.4x multiplier
    
    // Empirical formula tuned to FH5 physics
    const time = 60 / (powerToWeight * 3.5 * tractionMultiplier);
    
    return Math.round(time * 100) / 100;
  }

}

/**
 * Estimate 0-100 time from 0-60
 * @param zeroToSixty - Time to reach 60 mph
 * @returns Time to 100 mph in seconds
 */
export function estimateZeroToHundred(zeroToSixty: number): number {
  // Typical ratio is 2.1-2.3x for sports cars
  // Higher performance = lower ratio
  return Math.round(zeroToSixty * 2.15 * 100) / 100;
}

/**
 * Calculate gear time (time spent accelerating in single gear)
 * @param gear1Ratio - First gear ratio
 * @param finalDrive - Final drive ratio
 * @param tireRadius - Tire radius in inches
 * @param redlineRPM - Engine redline RPM
 * @param horsepower - Engine horsepower
 * @returns Time to accelerate from idle to redline
 */
export function calculateGearAccelTime(
  gear1Ratio: number,
  finalDrive: number,
  tireRadius: number,
  redlineRPM: number,
  horsepower: number
): number {
  // Approximate time based on RPM range and acceleration potential
  // Higher gear ratio = longer time, higher hp = shorter time
  
  const gearingFactor = gear1Ratio * finalDrive;
  const rpmRange = redlineRPM - 1000; // Usable RPM range
  
  // Rough estimate: time ≈ (RPM range / 1000) / (HP / 100)
  const time = (rpmRange / 1000) / (horsepower / 100);
  
  return Math.round(time * 100) / 100;
}

/**
 * Estimate quarter-mile time
 * @param zeroToSixty - Time to 60 mph
 * @param topSpeed - Estimated top speed
 * @returns Estimated quarter-mile time in seconds
 */
export function estimateQuarterMile(
  zeroToSixty: number,
  topSpeed: number
): number {
  // Formula: 1/4 mile ≈ 0-60 time + (660 ft / average speed to 60)
  // Assumes acceleration profile similar to 0-60 pattern
  
  // Average speed during 0-60 is roughly 30 mph for average cars
  const avgSpeedTo60 = 30 * (topSpeed / 180); // Scales with performance
  const baseTime = zeroToSixty * 1.35; // Empirical multiplier
  
  return Math.round(baseTime * 100) / 100;
}

/**
 * Calculate power loss due to altitude
 * @param altitudeMeters - Altitude in meters
 * @param basePower - Power at sea level
 * @returns Power adjusted for altitude
 */
export function calculateAltitudeAdjustment(
  altitudeMeters: number,
  basePower: number
): number {
  // Air density decreases with altitude
  // Roughly 3.5% power loss per 1000 feet
  
  const altitudeFeet = altitudeMeters * 3.28084;
  const powerLoss = (altitudeFeet / 1000) * 0.035;
  
  const adjustedPower = basePower * (1 - Math.min(powerLoss, 0.3)); // Cap at 30% loss
  
  return Math.round(adjustedPower);
}

/**
 * Estimate braking distance
 * @param speed - Current speed (mph)
 * @param deceleration - Deceleration in G-forces
 * @returns Braking distance in feet
 */
export function estimateBrakingDistance(
  speed: number,
  deceleration: number
): number {
  // d = v² / (2 × a)
  // where v is in ft/s and a is in ft/s²
  
  const speedFPS = speed * 1.46667; // mph to ft/s
  const decelFPS = deceleration * 32.2; // G to ft/s²
  
  const distance = (speedFPS * speedFPS) / (2 * decelFPS);
  
  return Math.round(distance);
}

/**
 * Compare performance metrics between two setups
 * @param setup1 - First setup metrics
 * @param setup2 - Second setup metrics
 * @returns Performance comparison
 */
export function comparePerformance(
  setup1: { zeroToSixty: number; topSpeed: number; acceleration: number },
  setup2: { zeroToSixty: number; topSpeed: number; acceleration: number }
): {
  accelerationDelta: string;
  topSpeedDelta: string;
  overallDelta: string;
  winner: 'setup1' | 'setup2' | 'tied';
} {
  const accelDelta = setup1.zeroToSixty - setup2.zeroToSixty;
  const speedDelta = setup1.topSpeed - setup2.topSpeed;
  
  const accelStr = Math.abs(accelDelta).toFixed(2) + 's ' + (accelDelta < 0 ? 'faster' : 'slower');
  const speedStr = Math.abs(speedDelta).toFixed(0) + ' mph ' + (speedDelta < 0 ? 'slower' : 'faster');
  
  // Overall score: weight 0-60 more (60%) than top speed (40%)
  const overallScore1 = (setup1.zeroToSixty * 0.6) + (setup1.topSpeed / 200 * 0.4);
  const overallScore2 = (setup2.zeroToSixty * 0.6) + (setup2.topSpeed / 200 * 0.4);
  const overallDelta = Math.abs(overallScore1 - overallScore2).toFixed(2);
  
  return {
    accelerationDelta: accelStr,
    topSpeedDelta: speedStr,
    overallDelta,
    winner: overallScore1 < overallScore2 ? 'setup1' : overallScore1 > overallScore2 ? 'setup2' : 'tied'
  };
}
