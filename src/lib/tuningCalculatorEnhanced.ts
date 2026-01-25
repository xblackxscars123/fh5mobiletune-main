/**
 * Integrated Tuning Calculator - Enhanced Edition
 * Combines all Phase 1-4 systems into one comprehensive calculator
 * Generates complete, optimized FH5 tunes with all advanced features
 */

import { calculateTune, type TuneSettings, type CarSpecs, type TuneModifiers } from './tuningCalculator';
import { calculateTrackAdjustments, type TrackSpecificAdjustments } from './trackSpecificTuning';
import { recommendTire, type TireSelectionCriteria } from './tireSelectionLogic';
import { calculateDownforceDistribution, analyzeAerodynamics, type AerodynamicsSetup } from './aerodynamicsCalculations';
import { calculateCombinedLoadTransfer } from './loadTransfer';
import { analyzeGeometry, optimizeGeometryFor, type GeometrySetup } from './suspensionGeometry';
import { analyzeBrakeSetup, optimizeBrakesFor, type BrakeSetup } from './advancedBraking';
import { analyzeDifferential, optimizeDifferentialFor, type DifferentialSetup } from './differentialOptimization';
import { analyzeGearing, optimizeGearingFor, type GearSetup } from './gearRatioOptimization';
import { getAeroProfile, type CarAerodynamicsProfile } from '../data/carAerodynamics';
import { getTrackByName, type Track } from '../data/trackDatabase';
import { analyzeRacePace, analyzeUndersteuerOversteer, calculatePitStrategy } from './raceStrategy';
import { calculateTireWearProgression, analyzeTireTemperatureWindow } from './tireManagement';
import { analyzeTireCompatibility } from './tireAnalysis';

export interface EnhancedTuneRequest {
  // Car info
  carName: string;
  carWeight: number; // lbs
  carPower: number; // hp
  carDrivetrain: 'FWD' | 'RWD' | 'AWD';
  carWeightDistribution: number; // % front
  carPI?: number; // Performance Index (100-999)
  
  // Track/Condition
  trackId?: string;
  tuneType: 'grip' | 'drift' | 'drag' | 'rally' | 'offroad' | 'street';
  weatherCondition?: 'dry' | 'wet' | 'mixed';
  drivingStyle?: 'casual' | 'balanced' | 'aggressive';
  
  // Preferences
  prioritizeSmoothness?: boolean;
  allowExtremeSettings?: boolean;
  targetTopSpeed?: number;
}

export interface EnhancedTune {
  // Meta
  carName: string;
  trackName: string;
  tuneType: string;
  createdAt: string;
  
  // Suspension
  suspension: {
    frontSpring: number;
    rearSpring: number;
    frontARB: number;
    rearARB: number;
    frontRideHeight: number;
    rearRideHeight: number;
    frontReboundDamping: number;
    rearReboundDamping: number;
    frontBumpDamping: number;
    rearBumpDamping: number;
  };
  
  // Geometry
  geometry: GeometrySetup;
  
  // Tires
  tires: {
    compound: string;
    pressureFront: number;
    pressureRear: number;
  };
  
  // Aerodynamics
  aerodynamics: {
    frontWingAngle: number;
    rearWingAngle: number;
    rideHeightFront: number;
    rideHeightRear: number;
  };
  
  // Brakes
  brakes: BrakeSetup;
  
  // Differential
  differential: DifferentialSetup;
  
  // Gearing
  gearing: GearSetup;
  
  // Performance Summary
  performance: {
    expectedZeroToSixty: number;
    expectedTopSpeed: number;
    corneringGrip: string;
    brakingStability: string;
    driveabilityRating: number;
  };
  
  // Analysis
  trackSuitability: number; // 0-10 how suitable for selected track
  balanceCharacter: string;
  recommendations: string[];
}

/**
 * Generate complete enhanced tune
 */
export function generateEnhancedTune(request: EnhancedTuneRequest): EnhancedTune {
  // Get track data if specified
  let track: Track | null = null;
  let trackName = 'Generic';
  
  if (request.trackId) {
    track = getTrackByName(request.trackId);
    if (track) {
      trackName = track.name;
    }
  }
  
  // Get car aero profile
  const aeroProfile = getAeroProfile(
    request.carDrivetrain === 'FWD' ? 'hot-hatch' :
    request.carDrivetrain === 'AWD' ? 'sports' : 'sports'
  );
  
  // ==========================================
  // STEP 1: Track-Specific Adjustments
  // ==========================================
  
  let trackAdjustments: TrackSpecificAdjustments | null = null;
  if (track) {
    trackAdjustments = calculateTrackAdjustments(track, request.carWeight, request.carPower, request.tuneType);
  }
  
  // ==========================================
  // STEP 2: Tire Selection
  // ==========================================
  
  const tireRec = recommendTire({
    piClass: request.carPI || 600,
    trackId: request.trackId,
    tuneType: request.tuneType,
    weatherCondition: request.weatherCondition || 'dry',
    drivingStyle: request.drivingStyle || 'balanced',
    priority: request.tuneType === 'grip' ? 'grip' :
             request.tuneType === 'drag' ? 'speed' :
             request.tuneType === 'street' ? 'balanced' : 'grip'
  });
  
  // ==========================================
  // STEP 3: Geometry Setup
  // ==========================================
  
  const geometryCondition = request.tuneType === 'drift' ? 'drift' :
                           request.tuneType === 'drag' ? 'drag' :
                           request.tuneType === 'offroad' ? 'offroad' :
                           request.tuneType === 'rally' ? 'offroad' :
                           'circuit';
  
  const baseGeometry = optimizeGeometryFor(geometryCondition);
  
  // Apply track-specific adjustments to geometry
  let geometry = { ...baseGeometry };
  if (trackAdjustments) {
    geometry.camberFront += trackAdjustments.suspension.frontRideHeight * 0.5;
    geometry.camberRear += trackAdjustments.suspension.rearRideHeight * 0.5;
  }
  
  // ==========================================
  // STEP 4: Aerodynamics Setup
  // ==========================================
  
  const baseAeroSetup: AerodynamicsSetup = {
    profile: aeroProfile,
    wingAngleFront: aeroProfile.defaultWingAngle,
    wingAngleRear: aeroProfile.defaultWingAngle + 5,
    rideHeightFront: (aeroProfile.minRideHeight + aeroProfile.maxRideHeight) / 2,
    rideHeightRear: (aeroProfile.minRideHeight + aeroProfile.maxRideHeight) / 2,
    weight: request.carWeight
  };
  
  // Apply track adjustments
  let aeroSetup = { ...baseAeroSetup };
  if (trackAdjustments) {
    aeroSetup.wingAngleFront += trackAdjustments.aerodynamics.frontWingAngle;
    aeroSetup.wingAngleRear += trackAdjustments.aerodynamics.rearWingAngle;
    aeroSetup.rideHeightFront += trackAdjustments.suspension.frontRideHeight;
    aeroSetup.rideHeightRear += trackAdjustments.suspension.rearRideHeight;
  }
  
  // ==========================================
  // STEP 5: Brake Setup
  // ==========================================
  
  const brakeCondition = request.tuneType === 'drag' ? 'drag' :
                        request.tuneType === 'grip' ? 'circuit' :
                        request.tuneType === 'street' ? 'street' : 'circuit';
  
  const brakes = optimizeBrakesFor(brakeCondition);
  
  // ==========================================
  // STEP 6: Differential Setup
  // ==========================================
  
  const diffCondition = request.tuneType === 'drift' ? 'drift' :
                       request.tuneType === 'drag' ? 'drag' :
                       request.tuneType === 'rally' ? 'rally' :
                       request.tuneType === 'offroad' ? 'offroad' : 'grip';
  
  const differential = optimizeDifferentialFor(diffCondition, request.carDrivetrain);
  
  // ==========================================
  // STEP 7: Gearing Setup
  // ==========================================
  
  const gearCondition = request.tuneType === 'drag' ? 'drag' :
                       request.tuneType === 'grip' ? 'balanced' :
                       request.tuneType === 'rally' ? 'technical' :
                       request.tuneType === 'street' ? 'balanced' : 'balanced';
  
  let gearing = optimizeGearingFor(gearCondition as any, request.carPower, request.carWeight);
  
  // Apply target top speed if specified
  if (request.targetTopSpeed) {
    // Adjust final drive to match target
    gearing.finalDrive = request.targetTopSpeed > 200 ? 3.2 : 3.7;
  }
  
  // ==========================================
  // STEP 8: Suspension Spring/ARB Tuning
  // ==========================================
  
  // Call the original calculator to get baseline tune
  const specs: CarSpecs = {
    piClass: String(Math.floor((request.carPI || 600) / 100)),
    weight: request.carWeight || 3000,
    weightDistribution: request.carWeightDistribution || 50,
    driveType: (request.carDrivetrain || 'AWD') as any,
    horsepower: request.carPower || 400,
    hasAero: true,
    tireCompound: 'sport',
  };

  const baseTune = calculateTune(specs, request.tuneType || 'grip');
  
  // Build suspension values from base tune + track adjustments
  let suspension = {
    frontSpring: baseTune.springsFront || 400,
    rearSpring: baseTune.springsRear || 400,
    frontARB: baseTune.arbFront || 30,
    rearARB: baseTune.arbRear || 30,
    frontRideHeight: baseTune.rideHeightFront || 3.0,
    rearRideHeight: baseTune.rideHeightRear || 3.0,
    frontReboundDamping: baseTune.reboundFront || 8.0,
    rearReboundDamping: baseTune.reboundRear || 8.0,
    frontBumpDamping: baseTune.bumpFront || 8.0,
    rearBumpDamping: baseTune.bumpRear || 8.0
  };
  
  // Apply track adjustments
  if (trackAdjustments) {
    suspension.frontSpring *= trackAdjustments.suspension.frontSpringRate;
    suspension.rearSpring *= trackAdjustments.suspension.rearSpringRate;
    suspension.frontARB *= trackAdjustments.suspension.frontARB;
    suspension.rearARB *= trackAdjustments.suspension.rearARB;
  }
  
  // ==========================================
  // STEP 9: Build Complete TuneSettings Output
  // ==========================================
  const geometryAnalysis = analyzeGeometry(geometry);
  const brakeAnalysis = analyzeBrakeSetup(brakes, 120, request.carWeight, request.carWeightDistribution, tireRec.primary.baseGrip);
  const differentialAnalysis = analyzeDifferential(differential, request.carDrivetrain, request.carPower, request.carWeight, 105, tireRec.primary.baseGrip);
  const aeroAnalysis = analyzeAerodynamics(aeroSetup, request.carPower);
  
  const recommendations: string[] = [];
  
  // Collect recommendations from all systems
  recommendations.push(...geometryAnalysis.recommendations.slice(0, 2));
  recommendations.push(...brakeAnalysis.recommendations.slice(0, 2));
  recommendations.push(...differentialAnalysis.recommendations.slice(0, 2));
  recommendations.push(...aeroAnalysis.recommendations.slice(0, 2));
  
  // Track suitability score
  let trackSuitability = 5;
  if (track) {
    if (track.recommendedTuneTypes.includes(request.tuneType)) {
      trackSuitability += 3;
    }
    if (track.speedProfile === 'balanced' && request.tuneType === 'grip') {
      trackSuitability += 1;
    }
  }
  
  const balanceCharacter = geometryAnalysis.midCornerStability === 'stable' ? 'Stable & Planted' :
                          geometryAnalysis.midCornerStability === 'loose' ? 'Responsive & Twitchy' :
                          'Neutral & Balanced';
  
  return {
    carName: request.carName,
    trackName: trackName,
    tuneType: request.tuneType,
    createdAt: new Date().toISOString(),
    
    suspension,
    geometry,
    
    tires: {
      compound: tireRec.primary.name,
      pressureFront: tireRec.pressureRecommendation?.cold || 32.0,
      pressureRear: tireRec.pressureRecommendation?.cold || 32.0
    },
    
    aerodynamics: {
      frontWingAngle: Math.round(aeroSetup.wingAngleFront * 10) / 10,
      rearWingAngle: Math.round(aeroSetup.wingAngleRear * 10) / 10,
      rideHeightFront: Math.round(aeroSetup.rideHeightFront * 100) / 100,
      rideHeightRear: Math.round(aeroSetup.rideHeightRear * 100) / 100
    },
    
    brakes,
    differential,
    gearing,
    
    performance: {
      expectedZeroToSixty: 3.5,
      expectedTopSpeed: aeroAnalysis?.topSpeed || 190,
      corneringGrip: geometryAnalysis.midCornerStability || 'neutral',
      brakingStability: brakeAnalysis?.brakingBalance || 'optimal',
      driveabilityRating: Math.round(differentialAnalysis?.drivabilityRating || 8.0)
    },
    
    trackSuitability,
    balanceCharacter,
    recommendations
  };
}

/**
 * Format tune for display/export
 */
export function formatTuneForDisplay(tune: EnhancedTune): string {
  const lines: string[] = [
    `═══════════════════════════════════════════`,
    `FH5 ENHANCED TUNE`,
    `═══════════════════════════════════════════`,
    `Car: ${tune.carName}`,
    `Track: ${tune.trackName}`,
    `Type: ${tune.tuneType.toUpperCase()}`,
    `Created: ${new Date(tune.createdAt).toLocaleDateString()}`,
    ``,
    `PERFORMANCE SUMMARY`,
    `───────────────────────────────────────────`,
    `0-60: ${tune.performance.expectedZeroToSixty}s`,
    `Top Speed: ${tune.performance.expectedTopSpeed} mph`,
    `Handling: ${tune.balanceCharacter}`,
    `Driveability: ${tune.performance.driveabilityRating}/10`,
    `Track Fit: ${tune.trackSuitability}/10`,
    ``,
    `SUSPENSION`,
    `───────────────────────────────────────────`,
    `Front Spring: ${tune.suspension.frontSpring} LB/IN`,
    `Rear Spring: ${tune.suspension.rearSpring} LB/IN`,
    `Front ARB: ${tune.suspension.frontARB}`,
    `Rear ARB: ${tune.suspension.rearARB}`,
    `Ride Height F/R: ${tune.suspension.frontRideHeight}" / ${tune.suspension.rearRideHeight}"`,
    ``,
    `GEOMETRY`,
    `───────────────────────────────────────────`,
    `Camber F/R: ${tune.geometry.camberFront}° / ${tune.geometry.camberRear}°`,
    `Toe F/R: ${tune.geometry.toeFront}° / ${tune.geometry.toeRear}°`,
    `Caster: ${tune.geometry.caster}°`,
    ``,
    `TIRES`,
    `───────────────────────────────────────────`,
    `Compound: ${tune.tires.compound}`,
    `Pressure F/R: ${tune.tires.pressureFront} / ${tune.tires.pressureRear} PSI`,
    ``,
    `AERODYNAMICS`,
    `───────────────────────────────────────────`,
    `Front Wing: ${tune.aerodynamics.frontWingAngle}°`,
    `Rear Wing: ${tune.aerodynamics.rearWingAngle}°`,
    `Ride Height F/R: ${tune.aerodynamics.rideHeightFront}" / ${tune.aerodynamics.rideHeightRear}"`,
    ``,
    `BRAKES`,
    `───────────────────────────────────────────`,
    `Pressure: ${tune.brakes.brakePressure}`,
    `Bias: ${tune.brakes.brakeBias}% front`,
    `Pads: ${tune.brakes.frontPadType.toUpperCase()}`,
    ``,
    `DIFFERENTIAL`,
    `───────────────────────────────────────────`,
    `Accel Lock: ${tune.differential.accelLock}%`,
    `Braking Lock: ${tune.differential.brakingLock}%`,
    `Decel Lock: ${tune.differential.decelLock}%`,
    ``,
    `GEARING`,
    `───────────────────────────────────────────`,
    `Final Drive: ${tune.gearing.finalDrive.toFixed(2)}`,
    `Gears: ${tune.gearing.gears.map(g => g.toFixed(2)).join(' - ')}`,
    ``,
    `RECOMMENDATIONS`,
    `───────────────────────────────────────────`,
    ...tune.recommendations.slice(0, 5).map(r => `• ${r}`),
    ``,
    `═══════════════════════════════════════════`
  ];
  
  return lines.join('\n');
}

export default {
  generateEnhancedTune,
  formatTuneForDisplay
};
