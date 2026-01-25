/**
 * Tire Management and Wear Analysis
 * Tire wear progression, temperature windows, and durability analysis
 * Implements previously unused tire management functions
 */

/**
 * Calculate tire wear progression over distance/time
 * @param initialWear - Starting wear percentage (0-100)
 * @param distance - Distance traveled (miles)
 * @param setup - Vehicle setup affecting tire wear
 * @param trackCondition - Track surface condition
 * @returns Wear analysis
 */
export function calculateTireWearProgression(
  initialWear: number,
  distance: number,
  setup: {
    speed: number; // mph
    camber: number; // degrees
    gripLevel: number; // 0-2.0
    pressurePSI: number;
  },
  trackCondition: 'smooth' | 'medium' | 'rough' = 'medium'
): {
  finalWear: number; // percentage (0-100)
  wearRate: number; // % per 10 miles
  estimatedLife: number; // miles until fully worn
  wearPattern: 'even' | 'inner-heavy' | 'outer-heavy';
  recommendations: string[];
} {
  // Base wear rate varies by track condition
  const baseWearRate = trackCondition === 'smooth' ? 0.8 : trackCondition === 'rough' ? 2.0 : 1.3;
  
  // Speed effect on wear (quadratic)
  const speedWearFactor = (setup.speed / 150) ** 2;
  
  // Camber effect on wear (outer edge wear with negative camber)
  const camberWearFactor = Math.abs(setup.camber) * 0.15 + 1.0;
  
  // Pressure effect (too low or too high increases wear)
  const optimalPressure = 28;
  const pressureDifference = Math.abs(setup.pressurePSI - optimalPressure);
  const pressureWearFactor = 1.0 + (pressureDifference * 0.02);
  
  // Combined wear rate
  const wearRate = baseWearRate * speedWearFactor * camberWearFactor * pressureWearFactor;
  
  // Calculate wear over distance
  const wearPerMile = wearRate / 10;
  const finalWear = Math.min(100, initialWear + (distance * wearPerMile));
  
  // Estimate life
  const remainingWearCapacity = 100 - initialWear;
  const estimatedLife = remainingWearCapacity / wearPerMile;
  
  // Wear pattern
  let wearPattern: 'even' | 'inner-heavy' | 'outer-heavy' = 'even';
  if (setup.camber < -2.5) {
    wearPattern = 'outer-heavy';
  } else if (setup.camber > -1.0) {
    wearPattern = 'inner-heavy';
  }
  
  const recommendations: string[] = [];
  if (wearRate > 2.0) {
    recommendations.push('High tire wear rate - consider reducing speed or adjusting pressure');
  }
  if (wearPattern === 'outer-heavy') {
    recommendations.push('Outer edge wear - reduce negative camber');
  }
  if (wearPattern === 'inner-heavy') {
    recommendations.push('Inner edge wear - increase negative camber');
  }
  if (estimatedLife < 100) {
    recommendations.push('Tire life short - may need to plan pit stops');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Tire wear within acceptable range');
  }
  
  return {
    finalWear: Math.round(finalWear * 10) / 10,
    wearRate: Math.round(wearRate * 100) / 100,
    estimatedLife: Math.round(estimatedLife),
    wearPattern,
    recommendations
  };
}

/**
 * Analyze tire temperature window and optimal operating range
 * @param ambientTemp - Ambient temperature (°C)
 * @param setup - Setup parameters affecting temperature
 * @param speed - Current speed (mph)
 * @returns Temperature analysis
 */
export function analyzeTireTemperatureWindow(
  ambientTemp: number,
  setup: {
    tireCompound: 'street' | 'sport' | 'race' | 'slick';
    pressure: number; // PSI
    camber: number; // degrees
  },
  speed: number
): {
  optimalTemp: number; // °C
  currentEstimate: number; // °C
  tempWindow: { min: number; max: number }; // °C range
  inWindow: boolean;
  pressureAdjustment: string;
  recommendations: string[];
} {
  // Optimal temperature by compound
  const optimalTemps: Record<string, number> = {
    'street': 75,
    'sport': 85,
    'race': 95,
    'slick': 105
  };
  
  const optimalTemp = optimalTemps[setup.tireCompound];
  
  // Temperature window ranges
  const tempWindows: Record<string, { min: number; max: number }> = {
    'street': { min: 70, max: 90 },
    'sport': { min: 80, max: 110 },
    'race': { min: 90, max: 120 },
    'slick': { min: 100, max: 130 }
  };
  
  const tempWindow = tempWindows[setup.tireCompound];
  
  // Current temperature estimate based on speed and ambient
  const speedFactor = (speed / 150) ** 1.5; // Heat generation with speed
  const currentEstimate = ambientTemp + (speedFactor * 40);
  
  const inWindow = currentEstimate >= tempWindow.min && currentEstimate <= tempWindow.max;
  
  // Pressure adjustment based on temperature
  let pressureAdjustment = 'Current pressure OK';
  if (currentEstimate > optimalTemp + 10) {
    pressureAdjustment = 'Temperature high - increase pressure slightly (0.2 PSI)';
  } else if (currentEstimate < optimalTemp - 10) {
    pressureAdjustment = 'Temperature low - decrease pressure slightly (0.2 PSI)';
  }
  
  const recommendations: string[] = [];
  if (!inWindow) {
    if (currentEstimate < tempWindow.min) {
      recommendations.push('Tires cold - increase speed gently to warm up');
      recommendations.push('Use lighter braking initially until temperatures rise');
    } else {
      recommendations.push('Tires overheating - reduce speed or increase pressure');
      recommendations.push('Monitor for grip loss and potential blowout');
    }
  } else {
    recommendations.push('Tire temperature optimal - maintain current speed/pressure');
  }
  
  if (setup.pressure < 26 || setup.pressure > 30) {
    recommendations.push(`Adjust pressure to 28 PSI for optimal heat management (currently ${setup.pressure} PSI)`);
  }
  
  return {
    optimalTemp: Math.round(optimalTemp),
    currentEstimate: Math.round(currentEstimate),
    tempWindow,
    inWindow,
    pressureAdjustment,
    recommendations
  };
}

/**
 * Estimate tire grip at given conditions
 * @param tireCompound - Tire type
 * @param temperature - Tire temperature (°C)
 * @param wear - Tire wear percentage (0-100)
 * @param wetness - Road wetness (0-100%, 0=dry)
 * @returns Grip multiplier (1.0 = baseline)
 */
export function estimateTireGrip(
  tireCompound: 'street' | 'sport' | 'race' | 'slick',
  temperature: number,
  wear: number,
  wetness: number = 0
): number {
  // Base grip by compound
  const baseGrips: Record<string, number> = {
    'street': 0.9,
    'sport': 1.0,
    'race': 1.15,
    'slick': 1.4
  };
  
  const baseGrip = baseGrips[tireCompound];
  
  // Temperature effect (peak at optimal temperature)
  const optimalTemps: Record<string, number> = {
    'street': 75,
    'sport': 85,
    'race': 95,
    'slick': 105
  };
  
  const optimalTemp = optimalTemps[tireCompound];
  const tempDiff = Math.abs(temperature - optimalTemp);
  const tempFactor = Math.max(0.7, 1.0 - (tempDiff / 100) * 0.5); // Grip drops as temp deviates
  
  // Wear effect
  const wearFactor = 1.0 - (wear / 100) * 0.4; // 40% grip loss when fully worn
  
  // Wet grip reduction
  const wetFactor = 1.0 - (wetness / 100) * 0.5; // 50% grip loss in heavy wet
  
  const totalGrip = baseGrip * tempFactor * wearFactor * wetFactor;
  
  return Math.round(totalGrip * 100) / 100;
}

/**
 * Get tire life estimate based on usage
 * @param tireCompound - Tire type
 * @param milesDriven - Miles already driven on tire
 * @param averageSpeed - Average speed (mph)
 * @returns Life estimate
 */
export function estimateTireLife(
  tireCompound: 'street' | 'sport' | 'race' | 'slick',
  milesDriven: number,
  averageSpeed: number = 80
): {
  estimatedMiles: number;
  percentRemaining: number;
  warningThreshold: number;
  recommendations: string[];
} {
  // Base tire life in miles
  const baseLives: Record<string, number> = {
    'street': 30000,
    'sport': 25000,
    'race': 8000,
    'slick': 5000
  };
  
  const baseLive = baseLives[tireCompound];
  
  // Adjust for speed (higher speeds reduce life)
  const speedFactor = Math.max(0.5, 1.5 - (averageSpeed / 150));
  const adjustedLife = baseLive * speedFactor;
  
  const estimatedMiles = adjustedLife - milesDriven;
  const percentRemaining = (estimatedMiles / adjustedLife) * 100;
  const warningThreshold = adjustedLife * 0.2; // 20% remaining
  
  const recommendations: string[] = [];
  if (percentRemaining < 20) {
    recommendations.push('Tire life critically low - replacement needed soon');
  } else if (percentRemaining < 40) {
    recommendations.push('Tire life limited - plan replacement within next 500 miles');
  } else {
    recommendations.push('Tire life healthy - continue normal operation');
  }
  
  return {
    estimatedMiles: Math.round(estimatedMiles),
    percentRemaining: Math.round(percentRemaining),
    warningThreshold: Math.round(warningThreshold),
    recommendations
  };
}

/**
 * Analyze tire compatibility with vehicle and track
 * @param tireCompound - Tire type
 * @param trackType - Track surface type
 * @param weather - Current weather
 * @returns Compatibility score and analysis
 */
export function analyzeTireTrackCompatibility(
  tireCompound: 'street' | 'sport' | 'race' | 'slick',
  trackType: 'asphalt' | 'offroad' | 'snow' | 'mixed',
  weather: 'sunny' | 'rainy' | 'snowy'
): {
  compatibilityScore: number; // 0-100
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
} {
  let compatibilityScore = 50;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Track type compatibility
  if (trackType === 'asphalt') {
    if (tireCompound === 'street') { compatibilityScore += 25; strengths.push('Optimized for street driving'); }
    if (tireCompound === 'sport') { compatibilityScore += 35; strengths.push('Excellent asphalt grip'); }
    if (tireCompound === 'race') { compatibilityScore += 40; strengths.push('Maximum road grip'); }
    if (tireCompound === 'slick') { compatibilityScore += 45; strengths.push('Ultimate dry grip'); }
  } else if (trackType === 'offroad') {
    if (tireCompound === 'street') { compatibilityScore += 10; weaknesses.push('Poor offroad traction'); }
    if (tireCompound === 'sport') { compatibilityScore += 15; weaknesses.push('Limited offroad capability'); }
    if (tireCompound === 'race') { compatibilityScore += 25; }
    if (tireCompound === 'slick') { compatibilityScore += 5; weaknesses.push('Slicks unsuitable for offroad'); }
  }
  
  // Weather compatibility
  if (weather === 'sunny') {
    if (tireCompound === 'slick') { compatibilityScore += 20; strengths.push('Optimal conditions for slicks'); }
  } else if (weather === 'rainy') {
    if (tireCompound === 'street') { compatibilityScore += 15; strengths.push('Good wet grip'); }
    if (tireCompound === 'sport') { compatibilityScore += 10; }
    if (tireCompound === 'slick') { compatibilityScore -= 30; weaknesses.push('Slicks dangerous in wet'); }
  } else if (weather === 'snowy') {
    if (tireCompound === 'street') { compatibilityScore += 20; }
    if (tireCompound === 'slick') { compatibilityScore -= 40; weaknesses.push('Slicks unusable in snow'); }
  }
  
  let recommendation = 'Acceptable tire choice';
  if (compatibilityScore >= 80) recommendation = 'Excellent tire choice for these conditions';
  if (compatibilityScore <= 30) recommendation = 'Poor tire choice - consider alternatives';
  
  return {
    compatibilityScore: Math.min(100, Math.max(0, compatibilityScore)),
    recommendation,
    strengths,
    weaknesses
  };
}
