/**
 * Tire Analysis and Compatibility Scoring
 * Comprehensive tire selection and performance analysis
 * Implements previously unused tire analysis functionality
 */

export interface TireAnalysisResult {
  compound: string;
  compatibilityScore: number; // 0-100
  performanceScore: number; // 0-100
  durabilityScore: number; // 0-100
  temperatureMatch: number; // 0-100
  overallScore: number; // 0-100
  recommendation: 'excellent' | 'good' | 'fair' | 'poor';
  detailedAnalysis: {
    strengths: string[];
    weaknesses: string[];
    bestUseCases: string[];
    improvements: string[];
  };
}

/**
 * Analyze tire compound compatibility with vehicle setup
 * @param tireCompound - Tire type to analyze
 * @param vehicleSetup - Vehicle characteristics
 * @param trackProfile - Track requirements
 * @param weatherCondition - Current weather
 * @returns Detailed tire analysis
 */
export function analyzeTireCompatibility(
  tireCompound: 'street' | 'sport' | 'race' | 'slick',
  vehicleSetup: {
    weight: number; // lbs
    power: number; // hp
    driveType: 'fwd' | 'rwd' | 'awd';
    piClass: string; // S2, S1, A, B, etc
  },
  trackProfile: {
    type: 'circuit' | 'street' | 'offroad' | 'drag';
    length: number; // miles
    temperature: number; // °C ambient
    surfaceCondition: 'pristine' | 'good' | 'fair' | 'poor';
  },
  weatherCondition: 'sunny' | 'rainy' | 'snowy' | 'overcast'
): TireAnalysisResult {
  // Calculate individual scores
  
  // Performance score based on compound and track
  let performanceScore = 50;
  
  if (tireCompound === 'street') {
    performanceScore = 60;
    if (trackProfile.type === 'circuit') performanceScore += 15;
    if (trackProfile.type === 'street') performanceScore += 25;
    if (weatherCondition === 'rainy') performanceScore += 10;
  } else if (tireCompound === 'sport') {
    performanceScore = 75;
    if (trackProfile.type === 'circuit') performanceScore += 15;
    if (weatherCondition === 'sunny') performanceScore += 5;
  } else if (tireCompound === 'race') {
    performanceScore = 85;
    if (trackProfile.type === 'circuit') performanceScore += 10;
    if (vehicleSetup.piClass === 'S2' || vehicleSetup.piClass === 'S1') performanceScore += 10;
  } else if (tireCompound === 'slick') {
    performanceScore = 90;
    if (trackProfile.type === 'circuit') performanceScore += 5;
    if (weatherCondition === 'sunny') performanceScore += 5;
  }
  
  // Durability score
  let durabilityScore = 70;
  
  if (tireCompound === 'street') {
    durabilityScore = 85;
    if (trackProfile.length > 3) durabilityScore += 10;
  } else if (tireCompound === 'sport') {
    durabilityScore = 75;
  } else if (tireCompound === 'race') {
    durabilityScore = 55;
    if (trackProfile.length > 5) durabilityScore -= 15;
  } else if (tireCompound === 'slick') {
    durabilityScore = 40;
    if (vehicleSetup.weight > 3500) durabilityScore -= 10;
  }
  
  // Compatibility score - how well tire matches vehicle
  let compatibilityScore = 60;
  
  // Weight effect
  if (vehicleSetup.weight < 2500) {
    if (tireCompound === 'slick') compatibilityScore += 10;
    if (tireCompound === 'race') compatibilityScore += 5;
  } else if (vehicleSetup.weight > 4000) {
    if (tireCompound === 'street') compatibilityScore += 10;
    if (tireCompound === 'sport') compatibilityScore += 5;
  }
  
  // Power effect
  if (vehicleSetup.power > 600) {
    if (tireCompound === 'slick') compatibilityScore += 15;
    if (tireCompound === 'race') compatibilityScore += 10;
  } else if (vehicleSetup.power < 200) {
    if (tireCompound === 'street') compatibilityScore += 10;
  }
  
  // Drive type effect (RWD needs better grip tires)
  if (vehicleSetup.driveType === 'rwd') {
    if (tireCompound === 'race' || tireCompound === 'slick') compatibilityScore += 10;
  }
  
  // Temperature match
  const optimalTemps: Record<string, number> = {
    'street': 75,
    'sport': 85,
    'race': 95,
    'slick': 105
  };
  
  const optimalTemp = optimalTemps[tireCompound];
  const tempDifference = Math.abs(trackProfile.temperature - optimalTemp);
  let temperatureMatch = Math.max(20, 100 - (tempDifference * 2));
  
  // Weather consideration
  if (weatherCondition === 'rainy') {
    if (tireCompound === 'slick') temperatureMatch -= 40;
    if (tireCompound === 'street') temperatureMatch += 10;
  } else if (weatherCondition === 'snowy') {
    if (tireCompound === 'slick') temperatureMatch -= 50;
    if (tireCompound === 'street') temperatureMatch += 5;
  }
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (performanceScore * 0.35) +
    (compatibilityScore * 0.25) +
    (durabilityScore * 0.20) +
    (temperatureMatch * 0.20)
  );
  
  // Determine recommendation
  let recommendation: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
  if (overallScore >= 85) recommendation = 'excellent';
  else if (overallScore >= 70) recommendation = 'good';
  else if (overallScore >= 50) recommendation = 'fair';
  else recommendation = 'poor';
  
  // Generate detailed analysis
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const bestUseCases: string[] = [];
  const improvements: string[] = [];
  
  // Identify characteristics
  if (tireCompound === 'street') {
    strengths.push('Excellent durability for long races');
    strengths.push('Good wet weather performance');
    if (vehicleSetup.weight > 3500) strengths.push('Suitable for heavier vehicles');
    
    weaknesses.push('Lower peak grip than performance tires');
    if (vehicleSetup.power > 400) weaknesses.push('May struggle with high power');
    
    bestUseCases.push('Street circuits and long races');
    bestUseCases.push('Variable weather conditions');
    bestUseCases.push('Endurance events');
  } else if (tireCompound === 'sport') {
    strengths.push('Balanced performance and durability');
    strengths.push('Good grip in various conditions');
    strengths.push('Versatile across different track types');
    
    weaknesses.push('Not optimal for maximum performance');
    if (weatherCondition === 'snowy') weaknesses.push('Reduced traction in snow');
    
    bestUseCases.push('Balanced racing');
    bestUseCases.push('Mixed weather events');
    bestUseCases.push('A and B class racing');
  } else if (tireCompound === 'race') {
    strengths.push('High grip potential');
    strengths.push('Excellent circuit performance');
    strengths.push('Good temperature responsiveness');
    if (vehicleSetup.piClass === 'S1' || vehicleSetup.piClass === 'S2') strengths.push('Matched to high-performance vehicles');
    
    weaknesses.push('Limited tire life - requires pit stops');
    if (trackProfile.length > 5) weaknesses.push('Not suitable for very long races');
    weaknesses.push('Requires warm-up period');
    
    bestUseCases.push('Sprint races');
    bestUseCases.push('High-performance circuit racing');
    bestUseCases.push('S1 and S2 class events');
    
    if (durabilityScore < 50) {
      improvements.push('Consider reducing track length or adding pit stops');
      improvements.push('Monitor tire temperature closely');
    }
  } else if (tireCompound === 'slick') {
    strengths.push('Maximum dry grip');
    strengths.push('Best circuit performance');
    if (weatherCondition === 'sunny') strengths.push('Optimal conditions for these tires');
    
    weaknesses.push('Extremely short tire life');
    weaknesses.push('Dangerous in wet conditions');
    weaknesses.push('Requires precise setup');
    if (vehicleSetup.power < 400) weaknesses.push('May overstress on moderate power cars');
    
    bestUseCases.push('Dry sprint races');
    bestUseCases.push('High-powered circuit racing');
    bestUseCases.push('S2 class competitive events');
    
    if (weatherCondition !== 'sunny') {
      improvements.push('CAUTION: Only use in dry conditions');
    }
    if (trackProfile.length > 3) {
      improvements.push('Track too long for slick tires - plan multiple pit stops');
    }
  }
  
  return {
    compound: tireCompound,
    compatibilityScore: Math.min(100, Math.max(0, compatibilityScore)),
    performanceScore: Math.min(100, Math.max(0, performanceScore)),
    durabilityScore: Math.min(100, Math.max(0, durabilityScore)),
    temperatureMatch: Math.min(100, Math.max(0, temperatureMatch)),
    overallScore: Math.min(100, Math.max(0, overallScore)),
    recommendation,
    detailedAnalysis: {
      strengths,
      weaknesses,
      bestUseCases,
      improvements
    }
  };
}

/**
 * Compare multiple tire compounds and rank them
 * @param tireCompounds - Array of tire types to compare
 * @param vehicleSetup - Vehicle setup
 * @param trackProfile - Track requirements
 * @param weatherCondition - Current weather
 * @returns Sorted array of tire analysis results
 */
export function compareTireCompounds(
  tireCompounds: Array<'street' | 'sport' | 'race' | 'slick'>,
  vehicleSetup: any,
  trackProfile: any,
  weatherCondition: any
): TireAnalysisResult[] {
  const results = tireCompounds.map(compound =>
    analyzeTireCompatibility(compound, vehicleSetup, trackProfile, weatherCondition)
  );
  
  // Sort by overall score descending
  return results.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Get recommended tire for specific scenario
 * @param scenario - Racing scenario type
 * @param vehicleSetup - Vehicle characteristics
 * @param weather - Current weather
 * @returns Recommended tire compound
 */
export function getRecommendedTire(
  scenario: 'sprint-dry' | 'sprint-wet' | 'endurance' | 'street' | 'offroad',
  vehicleSetup: { power: number; piClass: string },
  weather: 'sunny' | 'rainy' | 'snowy'
): {
  primary: 'street' | 'sport' | 'race' | 'slick';
  alternatives: Array<'street' | 'sport' | 'race' | 'slick'>;
  rationale: string;
} {
  let primary: 'street' | 'sport' | 'race' | 'slick' = 'sport';
  let alternatives: Array<'street' | 'sport' | 'race' | 'slick'> = [];
  let rationale = '';
  
  if (scenario === 'sprint-dry') {
    if (vehicleSetup.piClass === 'S2' || vehicleSetup.piClass === 'S1') {
      primary = 'slick';
      alternatives = ['race', 'sport'];
      rationale = 'Slicks provide maximum grip for high-performance sprint';
    } else if (vehicleSetup.piClass === 'A') {
      primary = 'race';
      alternatives = ['sport', 'slick'];
      rationale = 'Race tires balance performance and safety';
    } else {
      primary = 'sport';
      alternatives = ['race', 'street'];
      rationale = 'Sport tires provide good dry grip';
    }
  } else if (scenario === 'sprint-wet') {
    primary = 'street';
    alternatives = ['sport', 'race'];
    rationale = 'Street tires best for wet conditions';
  } else if (scenario === 'endurance') {
    primary = 'street';
    alternatives = ['sport'];
    rationale = 'Street tires provide durability for long races';
  } else if (scenario === 'street') {
    primary = 'street';
    alternatives = ['sport'];
    rationale = 'Street tires designed for street driving';
  } else if (scenario === 'offroad') {
    primary = 'sport';
    alternatives = ['street'];
    rationale = 'Sport tires best available for offroad';
  }
  
  return {
    primary,
    alternatives,
    rationale
  };
}
