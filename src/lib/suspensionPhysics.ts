/**
 * Suspension Physics Utility Functions
 * Consolidates spring rate and suspension calculations
 * Eliminates duplicate formulas from multiple files
 */

/**
 * Calculate spring rate effect on suspension stiffness
 * @param springRate - Spring rate (lbs/in)
 * @param weight - Vehicle weight (lbs)
 * @returns Natural frequency in Hz
 */
export function calculateNaturalFrequency(
  springRate: number,
  weight: number
): number {
  // f = (1 / 2π) × √(k / m)
  // where k = spring rate, m = unsprung mass
  
  const massLbs = weight / 32.2; // Convert weight to mass (slugs)
  const frequency = (1 / (2 * Math.PI)) * Math.sqrt((springRate * 32.2) / massLbs);
  
  return Math.round(frequency * 100) / 100;
}

/**
 * Calculate spring rate needed for target natural frequency
 * @param targetFrequency - Desired frequency in Hz (0.8-1.5 typical)
 * @param weight - Vehicle weight (lbs)
 * @returns Required spring rate (lbs/in)
 */
export function calculateSpringRateForFrequency(
  targetFrequency: number,
  weight: number
): number {
  // Rearranged from natural frequency formula
  // k = (2πf)² × m / g
  
  const massSlug = weight / 32.2;
  const omega = 2 * Math.PI * targetFrequency;
  const springRate = (omega * omega * massSlug) / 32.2;
  
  return Math.round(springRate);
}

/**
 * Analyze suspension response stiffness
 * @param frontSpringRate - Front spring rate (lbs/in)
 * @param rearSpringRate - Rear spring rate (lbs/in)
 * @param weight - Vehicle weight (lbs)
 * @returns Stiffness analysis with recommendations
 */
export function analyzeSuspensionStiffness(
  frontSpringRate: number,
  rearSpringRate: number,
  weight: number
): {
  frontFrequency: number;
  rearFrequency: number;
  balance: 'front-stiff' | 'balanced' | 'rear-stiff';
  description: string;
  recommendations: string[];
} {
  // Assume 60/40 weight distribution for typical car
  const frontWeight = (weight * 0.6);
  const rearWeight = (weight * 0.4);
  
  const frontFreq = calculateNaturalFrequency(frontSpringRate, frontWeight);
  const rearFreq = calculateNaturalFrequency(rearSpringRate, rearWeight);
  
  let balance: 'front-stiff' | 'balanced' | 'rear-stiff' = 'balanced';
  if (frontFreq > rearFreq + 0.15) balance = 'front-stiff';
  if (rearFreq > frontFreq + 0.15) balance = 'rear-stiff';
  
  const recommendations: string[] = [];
  
  if (frontFreq < 0.8) recommendations.push('Front springs too soft - increase rate for better response');
  if (frontFreq > 1.3) recommendations.push('Front springs too stiff - may cause harshness');
  if (rearFreq < 0.8) recommendations.push('Rear springs too soft - increase rate for stability');
  if (rearFreq > 1.3) recommendations.push('Rear springs too stiff - may cause instability');
  
  if (balance === 'front-stiff') {
    recommendations.push('Front-biased stiffness: May cause understeer on entry');
  }
  if (balance === 'rear-stiff') {
    recommendations.push('Rear-biased stiffness: May cause oversteer on exit');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Suspension stiffness well-balanced');
  }
  
  return {
    frontFrequency: frontFreq,
    rearFrequency: rearFreq,
    balance,
    description: `Front: ${frontFreq}Hz, Rear: ${rearFreq}Hz (${balance})`,
    recommendations
  };
}

/**
 * Calculate ride height effect on aerodynamics
 * @param rideHeightFront - Front ride height (inches)
 * @param rideHeightRear - Rear ride height (inches)
 * @param minRideHeight - Minimum allowed (inches)
 * @param rideHeightImpact - Aero impact per inch (negative number)
 * @returns Downforce multiplier
 */
export function calculateRideHeightAeroEffect(
  rideHeightFront: number,
  rideHeightRear: number,
  minRideHeight: number,
  rideHeightImpact: number
): {
  frontDownforceMultiplier: number;
  rearDownforceMultiplier: number;
  avgMultiplier: number;
  balance: number; // percentage front
} {
  // Lower ride height = more downforce (up to minimum)
  // Impact is negative, so subtraction increases with lower height
  
  const frontDrop = Math.max(0, minRideHeight - rideHeightFront);
  const rearDrop = Math.max(0, minRideHeight - rideHeightRear);
  
  // Multiplier = 1 + (drop × impact)
  // Since impact is negative, lower height increases multiplier
  const frontMult = 1 + (frontDrop * rideHeightImpact);
  const rearMult = 1 + (rearDrop * rideHeightImpact);
  
  const avgMult = (frontMult + rearMult) / 2;
  const balance = frontMult > 0 ? (frontMult / (frontMult + rearMult)) * 100 : 50;
  
  return {
    frontDownforceMultiplier: Math.max(0.5, frontMult),
    rearDownforceMultiplier: Math.max(0.5, rearMult),
    avgMultiplier: Math.max(0.5, avgMult),
    balance: Math.round(balance)
  };
}

/**
 * Calculate anti-roll bar (ARB) stiffness effect
 * @param arbStiffness - ARB stiffness (1-65 scale)
 * @returns Roll resistance multiplier (1.0 = stock)
 */
export function calculateARBEffect(arbStiffness: number): number {
  // ARB stiffness scales from 1 (soft) to 65 (maximum)
  // Effect is roughly exponential in upper range
  
  const normalized = arbStiffness / 65;
  
  // Quadratic curve for realistic feel
  const multiplier = 0.5 + (normalized * normalized) * 3.5;
  
  return Math.round(multiplier * 100) / 100;
}

/**
 * Get suspension tuning recommendations based on setup
 * @param frontSpringRate - Front spring rate
 * @param rearSpringRate - Rear spring rate
 * @param frontARB - Front anti-roll bar
 * @param rearARB - Rear anti-roll bar
 * @returns Array of recommendations
 */
export function getSuspensionRecommendations(
  frontSpringRate: number,
  rearSpringRate: number,
  frontARB: number,
  rearARB: number
): string[] {
  const recommendations: string[] = [];
  
  const springRatioDiff = Math.abs(frontSpringRate - rearSpringRate);
  if (springRatioDiff > 200) {
    recommendations.push('Spring rates very unbalanced - may cause instability');
  }
  
  const arbRatioDiff = Math.abs(frontARB - rearARB);
  if (arbRatioDiff > 25) {
    recommendations.push('Anti-roll bars very unbalanced - may affect cornering balance');
  }
  
  if (frontARB > rearARB + 15) {
    recommendations.push('Front ARB stiffer - reduces understeer');
  }
  
  if (rearARB > frontARB + 15) {
    recommendations.push('Rear ARB stiffer - reduces oversteer');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Suspension setup appears well-balanced');
  }
  
  return recommendations;
}

/**
 * Calculate roll angle during cornering
 * @param lateralAcceleration - Lateral G-force
 * @param cgHeight - Center of gravity height (inches)
 * @param trackWidth - Track width (inches)
 * @param springRate - Combined spring rate (lbs/in)
 * @returns Roll angle in degrees
 */
export function calculateRollAngle(
  lateralAcceleration: number,
  cgHeight: number,
  trackWidth: number,
  springRate: number
): number {
  // Roll angle = (Lateral Accel × CG Height / Track Width) × (180 / π)
  // Simplified physics model
  
  const moment = lateralAcceleration * cgHeight;
  const rollResistance = (springRate * trackWidth) / 1000; // Normalized
  const rollAngle = (moment / rollResistance) * (180 / Math.PI);
  
  return Math.round(rollAngle * 10) / 10;
}
