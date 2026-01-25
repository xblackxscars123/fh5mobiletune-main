/**
 * Tire Selection Logic for Forza Horizon 5
 * Intelligently recommend tire compounds based on conditions and preferences
 */

import { TireCompound, TIRE_COMPOUNDS, getTiresByPI, getTiresByTuneType, getTiresByTrack } from '../data/tireCompounds';
import { Track } from '../data/trackDatabase';
import { compareTireCompounds, getRecommendedTire } from './tireAnalysis';
import { analyzeTireTemperatureWindow, estimateTireGrip } from './tireManagement';

export interface TireSelectionCriteria {
  piClass: number;
  trackId?: string;
  tuneType: string;
  weatherCondition: 'dry' | 'wet' | 'mixed';
  drivingStyle: 'casual' | 'balanced' | 'aggressive';
  priority: 'grip' | 'speed' | 'durability' | 'balanced';
}

export interface TireRecommendation {
  primary: TireCompound;
  alternatives: TireCompound[];
  score: number; // 0-100
  reasoning: string[];
  pressureRecommendation: {
    cold: number;
    warm: number;
  };
}

/**
 * Calculate a score for a tire based on selection criteria
 * Higher score = better match (0-100)
 */
function calculateTireScore(
  tire: TireCompound,
  criteria: TireSelectionCriteria
): number {
  let score = 50; // Baseline
  
  // ==========================================
  // PI CLASS COMPATIBILITY (±30 points)
  // ==========================================
  
  if (criteria.piClass >= tire.recommendedPI.min && 
      criteria.piClass <= tire.recommendedPI.max) {
    score += 25; // Perfect fit
  } else if (criteria.piClass > tire.recommendedPI.max) {
    // Too low-PI for this tire
    const deficit = tire.recommendedPI.max - criteria.piClass;
    score -= Math.abs(deficit) / 20; // Penalty for low power use
  } else {
    // Too high-PI for this tire
    const excess = criteria.piClass - tire.recommendedPI.min;
    score -= Math.abs(excess) / 30; // Less penalty, can still work
  }
  
  // ==========================================
  // TUNE TYPE COMPATIBILITY (±20 points)
  // ==========================================
  
  if (tire.recommendedTuneTypes.includes(criteria.tuneType)) {
    score += 20;
  } else {
    // Check if tire is close to desired type
    if (criteria.tuneType === 'grip' && 
        (tire.recommendedTuneTypes.includes('racing') || tire.recommendedTuneTypes.includes('slick'))) {
      score += 10;
    }
    if (criteria.tuneType === 'street' && tire.recommendedTuneTypes.includes('sport')) {
      score += 8;
    }
  }
  
  // ==========================================
  // WEATHER COMPATIBILITY (±15 points)
  // ==========================================
  
  if (criteria.weatherCondition === 'dry') {
    score += tire.dryGrip * 10;
  } else if (criteria.weatherCondition === 'wet') {
    score += tire.wetGrip * 12; // Wet grip weighted more heavily
  } else if (criteria.weatherCondition === 'mixed') {
    const avgGrip = (tire.dryGrip + tire.wetGrip) / 2;
    score += avgGrip * 8;
  }
  
  // ==========================================
  // PRIORITY ALIGNMENT (±20 points)
  // ==========================================
  
  if (criteria.priority === 'grip') {
    score += tire.baseGrip * 15;
  } else if (criteria.priority === 'speed') {
    // Speed is inverse of drag - lower drag score is better
    // Since we don't have drag data, use base grip as proxy
    score += (2.0 - tire.baseGrip) * 8; // Penalize high-grip low-speed tires
  } else if (criteria.priority === 'durability') {
    score += (tire.wearRate / 200) * 10; // Higher wear rate = longer lasting
  } else if (criteria.priority === 'balanced') {
    score += 10; // Small bonus for using balanced priority
  }
  
  // ==========================================
  // DRIVING STYLE COMPATIBILITY (±10 points)
  // ==========================================
  
  if (criteria.drivingStyle === 'casual' && tire.baseGrip <= 1.0) {
    score += 8;
  } else if (criteria.drivingStyle === 'aggressive' && tire.baseGrip >= 1.15) {
    score += 10;
  } else if (criteria.drivingStyle === 'balanced' && Math.abs(tire.baseGrip - 1.0) < 0.2) {
    score += 7;
  }
  
  // Track-specific bonus
  if (criteria.trackId && tire.idealTracks.includes(criteria.trackId)) {
    score += 15;
  }
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get tire recommendation based on criteria
 */
export function recommendTire(criteria: TireSelectionCriteria): TireRecommendation {
  const allTires = Object.values(TIRE_COMPOUNDS);
  
  // Score all tires
  const scoredTires = allTires.map(tire => ({
    tire,
    score: calculateTireScore(tire, criteria)
  }));
  
  // Sort by score (highest first)
  scoredTires.sort((a, b) => b.score - a.score);
  
  const primaryTire = scoredTires[0].tire;
  const primaryScore = scoredTires[0].score;
  
  // Get alternatives (2nd and 3rd best)
  const alternatives = scoredTires
    .slice(1, 4)
    .filter(st => st.score > primaryScore * 0.7) // Only show alternatives within 70% of primary
    .map(st => st.tire);
  
  // Generate reasoning
  const reasoning: string[] = [];
  
  if (criteria.trackId) {
    if (primaryTire.idealTracks.includes(criteria.trackId)) {
      reasoning.push(`${primaryTire.name} recommended for this track`);
    }
  }
  
  if (primaryTire.recommendedTuneTypes.includes(criteria.tuneType)) {
    reasoning.push(`Excellent for ${criteria.tuneType} tuning`);
  }
  
  if (criteria.piClass >= primaryTire.recommendedPI.min && 
      criteria.piClass <= primaryTire.recommendedPI.max) {
    reasoning.push(`Perfect PI class match (${criteria.piClass})`);
  }
  
  if (criteria.priority === 'grip' && primaryTire.baseGrip > 1.15) {
    reasoning.push('Maximum grip for competitive racing');
  }
  
  if (criteria.priority === 'speed') {
    reasoning.push('Optimized for top speed and acceleration');
  }
  
  if (criteria.weatherCondition !== 'dry' && primaryTire.wetGrip > 0.8) {
    reasoning.push('Good wet weather performance');
  }
  
  return {
    primary: primaryTire,
    alternatives,
    score: Math.round(primaryScore),
    reasoning: reasoning.length > 0 ? reasoning : ['Good all-around choice'],
    pressureRecommendation: {
      cold: primaryTire.coldPressureTarget,
      warm: primaryTire.warmPressureTarget
    }
  };
}

/**
 * Compare multiple tire options
 */
export function compareTires(tires: string[], criteria: TireSelectionCriteria): Array<{
  tire: TireCompound;
  score: number;
  pros: string[];
  cons: string[];
}> {
  return tires
    .map(tireId => TIRE_COMPOUNDS[tireId])
    .filter(Boolean)
    .map(tire => ({
      tire,
      score: calculateTireScore(tire, criteria),
      pros: [
        ...(tire.recommendedTuneTypes.includes(criteria.tuneType) ? [`Ideal for ${criteria.tuneType}`] : []),
        ...(tire.baseGrip > 1.2 ? ['Excellent grip'] : []),
        ...(tire.wearRate > 120 ? ['Long lasting'] : []),
        ...(criteria.trackId && tire.idealTracks.includes(criteria.trackId) ? ['Track optimized'] : [])
      ],
      cons: [
        ...(tire.baseGrip < 0.9 ? ['Lower grip'] : []),
        ...(tire.wearRate < 80 ? ['Fast wear'] : []),
        ...(criteria.piClass > tire.recommendedPI.max ? ['Better for higher PI'] : []),
        ...(criteria.piClass < tire.recommendedPI.min ? ['Better for lower PI'] : [])
      ]
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get quick recommendation for common scenarios
 */
export function getQuickRecommendation(
  scenario: 'street-casual' | 'circuit-racing' | 'offroad' | 'drag-racing' | 'mixed-weather'
): TireCompound {
  switch (scenario) {
    case 'street-casual':
      return TIRE_COMPOUNDS['sport'];
    case 'circuit-racing':
      return TIRE_COMPOUNDS['racing'];
    case 'offroad':
      return TIRE_COMPOUNDS['offroad'];
    case 'drag-racing':
      return TIRE_COMPOUNDS['drag'];
    case 'mixed-weather':
      return TIRE_COMPOUNDS['rally'];
    default:
      return TIRE_COMPOUNDS['sport'];
  }
}

/**
 * Get all available tire options with brief descriptions
 */
export function getTireOptions(): Array<{
  id: string;
  name: string;
  grip: number;
  bestFor: string;
}> {
  return Object.values(TIRE_COMPOUNDS).map(tire => ({
    id: tire.id,
    name: tire.name,
    grip: tire.baseGrip,
    bestFor: tire.recommendedTuneTypes.join(', ')
  }));
}

/**
 * Adjust tire pressure based on conditions
 */
export function calculateOptimalPressure(
  tire: TireCompound,
  conditions: {
    temperature: 'cold' | 'hot';
    trackIntensity: 'light' | 'moderate' | 'intense';
    drivingStyle: 'smooth' | 'aggressive';
  }
): number {
  let pressure = tire.coldPressureTarget;
  
  // Temperature adjustment
  if (conditions.temperature === 'hot') {
    pressure += tire.pressureAdjustments.hotClimate || 0;
  }
  
  // Track intensity
  if (conditions.trackIntensity === 'intense') {
    pressure += 0.5; // Slightly higher for sustained heat
  }
  
  // Driving style
  if (conditions.drivingStyle === 'aggressive') {
    pressure += 0.3; // Slightly higher for aggressive driving
  }
  
  // Clamp to game limits (14-55 PSI)
  return Math.max(14, Math.min(55, Math.round(pressure * 10) / 10));
}

export default {
  calculateTireScore,
  recommendTire,
  compareTires,
  getQuickRecommendation,
  getTireOptions,
  calculateOptimalPressure
};
