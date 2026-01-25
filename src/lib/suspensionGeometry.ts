/**
 * Suspension Geometry Effects for Forza Horizon 5
 * Camber, toe, and caster impacts on handling and tire wear
 * Physics-based geometry calculations
 */

import { OPTIMAL_CAMBER, CAMBER_GRIP_IMPROVEMENT_PER_DEGREE, POSITIVE_CAMBER_GRIP_PENALTY_PER_DEGREE, MAX_CAMBER_GRIP, CAMBER_WEAR_FACTOR, TOE_IN_RESPONSE_FACTOR, CASTER_SELF_CENTER_FACTOR } from './physicsConstants';
import { calculateRollAngle } from './suspensionPhysics';

export interface GeometrySetup {
  camberFront: number; // degrees (-5.0 to +0.5)
  camberRear: number; // degrees (-5.0 to +0.5)
  toeFront: number; // degrees (-2.0 to +5.0)
  toeRear: number; // degrees (-2.0 to +5.0)
  caster: number; // degrees (4.0 to 7.0)
  wheelBaseLength: number; // inches
  trackWidthFront: number; // inches
}

export interface GeometryAnalysis {
  turnInResponse: 'slow' | 'medium' | 'fast';
  turnInSharpness: number; // 0-10 scale
  midCornerStability: 'loose' | 'neutral' | 'stable';
  exitTraction: number; // 0-10 scale
  tireWearProfile: {
    innerFront: string; // 'heavy' | 'normal' | 'light'
    outerFront: string;
    innerRear: string;
    outerRear: string;
  };
  description: string;
  recommendations: string[];
}

/**
 * Calculate camber effects on grip and tire wear
 * Negative camber (wheels tilted inward) increases grip during cornering
 * but increases straight-line tire wear
 */
export function analyzeCamberEffect(
  camber: number, // degrees (negative = inward tilt)
  cornering: boolean = true
): {
  corneringGrip: number; // 0-2.0 multiplier
  straightLineWear: number; // 0-1.0 (higher = more wear)
  description: string;
} {
  // Camber effect: optimal is around -2.0 to -3.5 degrees for grip
  // Each degree of camber beyond optimal reduces straight-line grip by ~1.5%
  
  const optimalCamber = -2.5;
  const camberDelta = camber - optimalCamber;
  
  // Cornering grip improves with negative camber up to -3.5°, then diminishes
  let corneringGrip = 1.0;
  if (camber <= -0.5) {
    // Negative camber improves cornering
    corneringGrip = 1.0 + (Math.abs(camber) * 0.15); // 15% per degree
    corneringGrip = Math.min(1.52, corneringGrip); // Cap at -3.5° optimal
  } else if (camber > 0) {
    // Positive camber reduces cornering grip significantly
    corneringGrip = 1.0 - (camber * 0.25); // 25% per degree penalty
  }
  
  // Straight-line wear increases with negative camber
  // -1.0°: 0.1x wear (light)
  // -2.5°: 0.3x wear (normal)
  // -5.0°: 0.7x wear (heavy)
  const wearFactor = (Math.abs(camber) - 1.0) / 4.0;
  const straightLineWear = Math.max(0, Math.min(1.0, wearFactor));
  
  let description = '';
  if (camber >= 0) {
    description = `Positive camber (${camber}°) - Reduces grip, for very high-speed stability only`;
  } else if (camber >= -1.0) {
    description = `Slight negative camber (${camber}°) - Light tire wear, good for street use`;
  } else if (camber >= -2.5) {
    description = `Moderate negative camber (${camber}°) - Balanced grip and wear`;
  } else if (camber >= -3.5) {
    description = `Aggressive negative camber (${camber}°) - Maximum cornering grip, increased wear`;
  } else {
    description = `Extreme negative camber (${camber}°) - Sacrifices straight-line for pure grip`;
  }
  
  return {
    corneringGrip: Math.round(corneringGrip * 100) / 100,
    straightLineWear: Math.round(straightLineWear * 100) / 100,
    description
  };
}

/**
 * Calculate toe effects on turn-in and stability
 * Positive toe (toes out) = faster turn-in, less stability
 * Negative toe (toes in) = slower turn-in, more stability
 */
export function analyzeToeEffect(
  toe: number, // degrees
  axle: 'front' | 'rear'
): {
  turnInResponse: 'slow' | 'medium' | 'fast';
  stability: 'loose' | 'neutral' | 'stable';
  tireWear: number; // 0-1.0
  description: string;
} {
  // Front toe affects turn-in
  // Positive toe: faster turn-in, loose feel
  // Negative toe: slower turn-in, stable feel
  
  const optimalToe = 0.1; // Slight toe-out for turn-in
  const toeDelta = toe - optimalToe;
  
  let turnInResponse: 'slow' | 'medium' | 'fast' = 'medium';
  let stability: 'loose' | 'neutral' | 'stable' = 'neutral';
  let tireWear = 0.3; // Base tire wear from toe
  
  if (axle === 'front') {
    if (toe > 1.5) {
      turnInResponse = 'fast';
      stability = 'loose';
      tireWear = 0.6; // Heavy wear from toe-out
    } else if (toe > 0.5) {
      turnInResponse = 'fast';
      stability = 'neutral';
      tireWear = 0.4;
    } else if (toe > -0.5) {
      turnInResponse = 'medium';
      stability = 'neutral';
      tireWear = 0.3;
    } else if (toe <= -1.5) {
      turnInResponse = 'slow';
      stability = 'stable';
      tireWear = 0.5; // Toe-in also causes wear
    } else {
      turnInResponse = 'slow';
      stability = 'stable';
      tireWear = 0.4;
    }
  } else {
    // Rear toe affects stability in corners and exits
    if (toe > 1.5) {
      stability = 'loose'; // Oversteer tendency
      tireWear = 0.6;
    } else if (toe > 0.5) {
      stability = 'loose';
      tireWear = 0.4;
    } else if (toe > -0.5) {
      stability = 'neutral';
      tireWear = 0.3;
    } else if (toe <= -1.5) {
      stability = 'stable'; // Understeer tendency
      tireWear = 0.5;
    } else {
      stability = 'stable';
      tireWear = 0.4;
    }
  }
  
  const description = axle === 'front'
    ? `Front toe ${toe}° - ${turnInResponse} turn-in response`
    : `Rear toe ${toe}° - ${stability} mid-corner stability`;
  
  return {
    turnInResponse,
    stability,
    tireWear: Math.round(tireWear * 100) / 100,
    description
  };
}

/**
 * Calculate caster effects on straight-line stability and self-centering
 * Higher caster = better high-speed stability but heavier steering
 */
export function analyzeCasterEffect(
  caster: number // degrees (4.0 to 7.0)
): {
  straightLineStability: number; // 0-10
  steeringFeel: 'light' | 'medium' | 'heavy';
  selfCentering: 'weak' | 'moderate' | 'strong';
  description: string;
} {
  // Caster range: 4.0° to 7.0°
  // 4.0°: light steering, poor stability
  // 5.5°: balanced
  // 7.0°: heavy steering, excellent stability
  
  let straightLineStability = (caster - 4.0) * 2; // 0-6 scale
  let steeringFeel: 'light' | 'medium' | 'heavy' = 'medium';
  let selfCentering: 'weak' | 'moderate' | 'strong' = 'moderate';
  
  if (caster < 4.5) {
    steeringFeel = 'light';
    selfCentering = 'weak';
    straightLineStability = Math.max(0, straightLineStability);
  } else if (caster < 6.0) {
    steeringFeel = 'medium';
    selfCentering = 'moderate';
    straightLineStability = Math.min(10, straightLineStability + 2);
  } else {
    steeringFeel = 'heavy';
    selfCentering = 'strong';
    straightLineStability = Math.min(10, straightLineStability + 4);
  }
  
  const description = `Caster ${caster}° - ${steeringFeel} steering feel, ${selfCentering} self-centering`;
  
  return {
    straightLineStability: Math.round(straightLineStability * 10) / 10,
    steeringFeel,
    selfCentering,
    description
  };
}

/**
 * Comprehensive geometry analysis
 */
export function analyzeGeometry(setup: GeometrySetup): GeometryAnalysis {
  // Analyze each component
  const camberFrontAnalysis = analyzeCamberEffect(setup.camberFront, true);
  const camberRearAnalysis = analyzeCamberEffect(setup.camberRear, true);
  const toeFrontAnalysis = analyzeToeEffect(setup.toeFront, 'front');
  const toeRearAnalysis = analyzeToeEffect(setup.toeRear, 'rear');
  const casterAnalysis = analyzeCasterEffect(setup.caster);
  
  // Combine into overall picture
  const turnInSharpness = (
    (toeFrontAnalysis.turnInResponse === 'fast' ? 8 : 
     toeFrontAnalysis.turnInResponse === 'medium' ? 5 : 3) +
    (casterAnalysis.straightLineStability / 2)
  ) / 2;
  
  // Turn-in response (front toe + caster)
  const turnInResponse = toeFrontAnalysis.turnInResponse;
  
  // Mid-corner stability (camber + rear toe)
  const midCornerStability = toeRearAnalysis.stability;
  
  // Exit traction (camber + rear toe)
  const exitTraction = (camberRearAnalysis.corneringGrip * 10) * 
                       (toeRearAnalysis.stability === 'loose' ? 1.1 : 
                        toeRearAnalysis.stability === 'stable' ? 0.9 : 1.0);
  
  // Tire wear profiles based on geometry
  const tireWearProfile = {
    innerFront: camberFrontAnalysis.straightLineWear > 0.5 ? 'heavy' : 
                camberFrontAnalysis.straightLineWear > 0.3 ? 'normal' : 'light',
    outerFront: toeFrontAnalysis.tireWear > 0.5 ? 'heavy' :
                toeFrontAnalysis.tireWear > 0.3 ? 'normal' : 'light',
    innerRear: camberRearAnalysis.straightLineWear > 0.5 ? 'heavy' :
               camberRearAnalysis.straightLineWear > 0.3 ? 'normal' : 'light',
    outerRear: toeRearAnalysis.tireWear > 0.5 ? 'heavy' :
               toeRearAnalysis.tireWear > 0.3 ? 'normal' : 'light'
  };
  
  // Generate description
  const description = `Turn-in: ${turnInResponse} | Stability: ${midCornerStability} | Exit: ${exitTraction.toFixed(1)}/10`;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (camberFrontAnalysis.corneringGrip < 1.2) {
    recommendations.push('Increase front camber for better cornering grip');
  }
  
  if (toeFrontAnalysis.turnInResponse === 'slow') {
    recommendations.push('Add front toe-out for sharper turn-in');
  } else if (toeFrontAnalysis.turnInResponse === 'fast' && toeFrontAnalysis.stability === 'loose') {
    recommendations.push('Reduce front toe-out if car feels too loose');
  }
  
  if (toeRearAnalysis.stability === 'loose') {
    recommendations.push('Add rear toe-in for mid-corner stability');
  }
  
  if (casterAnalysis.steeringFeel === 'light' && camberFrontAnalysis.corneringGrip > 1.3) {
    recommendations.push('Consider increasing caster for better high-speed stability');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Geometry is well-balanced. No adjustments needed.');
  }
  
  return {
    turnInResponse,
    turnInSharpness: Math.round(turnInSharpness * 10) / 10,
    midCornerStability,
    exitTraction: Math.round(exitTraction),
    tireWearProfile,
    description,
    recommendations
  };
}

/**
 * Optimize geometry for a specific driving condition
 */
export function optimizeGeometryFor(
  condition: 'street' | 'circuit' | 'drift' | 'drag' | 'offroad'
): GeometrySetup {
  switch (condition) {
    case 'street':
      return {
        camberFront: -1.0,
        camberRear: -0.8,
        toeFront: 0.0,
        toeRear: -0.2,
        caster: 5.5,
        wheelBaseLength: 105,
        trackWidthFront: 60
      };
    
    case 'circuit':
      return {
        camberFront: -3.0,
        camberRear: -2.5,
        toeFront: 0.3,
        toeRear: -0.5,
        caster: 6.5,
        wheelBaseLength: 105,
        trackWidthFront: 60
      };
    
    case 'drift':
      return {
        camberFront: -3.5,
        camberRear: -3.0,
        toeFront: 0.8,
        toeRear: 0.2,
        caster: 5.0,
        wheelBaseLength: 105,
        trackWidthFront: 60
      };
    
    case 'drag':
      return {
        camberFront: -0.5,
        camberRear: 0.0,
        toeFront: -0.2,
        toeRear: 0.0,
        caster: 4.5,
        wheelBaseLength: 105,
        trackWidthFront: 60
      };
    
    case 'offroad':
      return {
        camberFront: -1.5,
        camberRear: -1.0,
        toeFront: 0.0,
        toeRear: 0.0,
        caster: 5.0,
        wheelBaseLength: 105,
        trackWidthFront: 60
      };
    
    default:
      return {
        camberFront: -2.0,
        camberRear: -1.5,
        toeFront: 0.1,
        toeRear: -0.2,
        caster: 5.5,
        wheelBaseLength: 105,
        trackWidthFront: 60
      };
  }
}

/**
 * Get geometry recommendations based on current setup
 */
export function getGeometryRecommendations(
  setup: GeometrySetup,
  targetCharacter: 'responsive' | 'stable' | 'balanced'
): Partial<GeometrySetup> {
  const recommendations: Partial<GeometrySetup> = {};
  
  if (targetCharacter === 'responsive') {
    if (setup.toeFront < 0.3) recommendations.toeFront = 0.3;
    if (setup.caster < 5.5) recommendations.caster = 5.5;
    if (setup.camberFront > -2.5) recommendations.camberFront = -2.5;
  } else if (targetCharacter === 'stable') {
    if (setup.toeFront > 0) recommendations.toeFront = 0;
    if (setup.toeRear < -0.5) recommendations.toeRear = -0.5;
    if (setup.caster < 6.5) recommendations.caster = 6.5;
    if (setup.camberFront < -2.5) recommendations.camberFront = -2.5;
  } else {
    // Balanced
    if (setup.toeFront < 0.1 || setup.toeFront > 0.2) recommendations.toeFront = 0.15;
    if (setup.caster < 5.8 || setup.caster > 6.2) recommendations.caster = 6.0;
    if (setup.camberFront < -2.8 || setup.camberFront > -2.2) recommendations.camberFront = -2.5;
  }
  
  return recommendations;
}

export default {
  analyzeCamberEffect,
  analyzeToeEffect,
  analyzeCasterEffect,
  analyzeGeometry,
  optimizeGeometryFor,
  getGeometryRecommendations
};
