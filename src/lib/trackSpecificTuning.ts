/**
 * Track-Specific Tuning Adjustments for Forza Horizon 5
 * Automatically adjust suspension, aero, and setup for optimal performance on each track
 */

import { Track, TRACKS } from '../data/trackDatabase';
import { TireCompound, TIRE_COMPOUNDS } from '../data/tireCompounds';
import { CarAerodynamicsProfile } from '../data/carAerodynamics';
import { analyzeTireCompatibility } from './tireAnalysis';
import { analyzeUndersteuerOversteer } from './raceStrategy';

export interface TrackSpecificAdjustments {
  suspension: {
    frontSpringRate: number; // Adjustment factor (0.8-1.2)
    rearSpringRate: number;
    frontARB: number; // Adjustment factor
    rearARB: number;
    frontRideHeight: number; // Adjustment in inches
    rearRideHeight: number;
  };
  
  aerodynamics: {
    frontWingAngle: number; // Degrees adjustment
    rearWingAngle: number;
    downforceTarget: 'low' | 'medium' | 'high';
  };
  
  tires: {
    recommendedCompound: string;
    pressureFront: number; // PSI adjustment
    pressureRear: number;
  };
  
  gearing: {
    finalDriveAdjustment: number; // 0.9-1.1
    ratioSpreadAdjustment: number; // 0.9-1.1
  };
  
  brakes: {
    pressureAdjustment: number; // 0.9-1.1
    balance: number; // % (adjust front/rear balance)
  };
  
  differential: {
    accelerationLockAdjustment: number; // 0.8-1.2
    brakingLockAdjustment: number;
  };
  
  reasoning: string[];
}

/**
 * Calculate track-specific adjustments based on track characteristics
 */
export function calculateTrackAdjustments(
  track: Track,
  carWeight: number,
  horsepower: number,
  baseTuneType: string
): TrackSpecificAdjustments {
  const reasoning: string[] = [];
  
  // ==========================================
  // SUSPENSION ADJUSTMENTS
  // ==========================================
  
  let springFactor = 1.0;
  let arbFront = 1.0;
  let arbRear = 1.0;
  let rideHeightFront = 0;
  let rideHeightRear = 0;
  
  // Technical tracks need stiffer suspension for precision
  if (track.technicality > 6) {
    springFactor = 1.15;
    arbFront = 1.1;
    arbRear = 1.15;
    reasoning.push(`High technicality (${track.technicality}/10) - Stiffer suspension for precision`);
  } else if (track.technicality < 3) {
    springFactor = 0.9;
    arbFront = 0.85;
    arbRear = 0.85;
    reasoning.push('Low technicality - Softer suspension for flow and speed');
  }
  
  // Speed affects ride height preference
  if (track.speedProfile === 'high-speed') {
    rideHeightFront = -1.0; // Lower for downforce
    rideHeightRear = -0.8;
    reasoning.push('High-speed track - Lower ride height for better aerodynamics');
  } else if (track.speedProfile === 'technical') {
    rideHeightFront = 0.5;
    rideHeightRear = 0.5;
    reasoning.push('Technical track - Higher ride height for clearance');
  }
  
  // Elevation changes affect balance
  if (track.maxElevationGain > 1500) {
    springFactor *= 1.05;
    reasoning.push('High elevation changes - Slightly stiffer springs for consistency');
  }
  
  // ==========================================
  // AERODYNAMICS ADJUSTMENTS
  // ==========================================
  
  let downforceTarget: 'low' | 'medium' | 'high' = 'medium';
  let wingFrontAdj = 0;
  let wingRearAdj = 0;
  
  if (track.speedProfile === 'high-speed') {
    downforceTarget = 'low';
    wingFrontAdj = -15;
    wingRearAdj = -12;
    reasoning.push('High-speed track - Reduce wing angles to maximize top speed');
  } else if (track.speedProfile === 'technical') {
    downforceTarget = 'high';
    wingFrontAdj = 15;
    wingRearAdj = 20;
    reasoning.push('Technical track - Increase downforce for cornering stability');
  }
  
  // Long straights benefit from drag reduction
  if (track.straightawayLength > 2.0) {
    wingFrontAdj -= 5;
    wingRearAdj -= 5;
    reasoning.push('Long straights - Reduce downforce for acceleration');
  }
  
  // ==========================================
  // TIRE ADJUSTMENTS
  // ==========================================
  
  let tireCompound = 'sport'; // Default
  let pressureFrontAdj = 0;
  let pressureRearAdj = 0;
  
  // Choose tire based on track surface and type
  if (track.surfaceType === 'dirt' || track.surfaceType === 'gravel') {
    if (track.type === 'offroad') {
      tireCompound = 'offroad';
      pressureFrontAdj = -3.0;
      pressureRearAdj = -3.0;
    } else {
      tireCompound = 'rally';
      pressureFrontAdj = -1.5;
      pressureRearAdj = -1.5;
    }
    reasoning.push(`${track.surfaceType} surface - Using ${tireCompound} compound with lower pressures`);
  } else if (track.type === 'drag') {
    tireCompound = 'drag';
    pressureFrontAdj = 5.0;
    pressureRearAdj = 5.0;
    reasoning.push('Drag track - Maximum tire pressure for launch grip');
  } else if (track.speedProfile === 'high-speed') {
    tireCompound = 'racing';
    pressureFrontAdj = 0.5;
    pressureRearAdj = 0.5;
    reasoning.push('High-speed circuit - Racing compound with elevated pressure');
  }
  
  // ==========================================
  // GEARING ADJUSTMENTS
  // ==========================================
  
  let finalDriveAdj = 1.0;
  let ratioSpreadAdj = 1.0;
  
  if (track.speedProfile === 'high-speed') {
    // Longer gearing for top speed
    finalDriveAdj = 0.92; // Lower ratio = longer gears
    reasoning.push('High-speed track - Longer final drive for top speed');
  } else if (track.speedProfile === 'technical') {
    // Shorter gearing for acceleration out of corners
    finalDriveAdj = 1.08; // Higher ratio = shorter gears
    ratioSpreadAdj = 0.95; // Tighter spacing
    reasoning.push('Technical track - Shorter gearing for corner exit acceleration');
  }
  
  // Elevation affects power delivery
  if (track.maxElevationGain > 2000) {
    finalDriveAdj *= 1.02;
    reasoning.push('High elevation - Slightly shorter gearing for climbs');
  }
  
  // ==========================================
  // BRAKE ADJUSTMENTS
  // ==========================================
  
  let brakePressureAdj = 1.0;
  let brakeBalance = 50; // 50% = default
  
  // Technical/street tracks need more braking
  if (track.technicality > 6) {
    brakePressureAdj = 1.05;
    brakeBalance = 52; // Slightly more front bias for locking prevention
    reasoning.push('Technical track with tight corners - Slight front brake bias');
  }
  
  // High-speed tracks need balanced braking
  if (track.straightawayLength > 3.0) {
    brakeBalance = 51; // Nearly balanced
    reasoning.push('Long straights - Balanced brake setup');
  }
  
  // ==========================================
  // DIFFERENTIAL ADJUSTMENTS
  // ==========================================
  
  let accelLockAdj = 1.0;
  let brakeLockAdj = 1.0;
  
  if (track.speedProfile === 'technical') {
    accelLockAdj = 1.1; // More lock for corner exits
    reasoning.push('Technical track - Increased acceleration lock for traction');
  }
  
  if (track.surfaceType === 'mixed' || track.surfaceType === 'dirt') {
    accelLockAdj = 1.15;
    brakeLockAdj = 0.85; // Less lock under braking on loose surfaces
    reasoning.push('Mixed surface - Adjusted differential settings for traction');
  }
  
  return {
    suspension: {
      frontSpringRate: Math.round(springFactor * 100) / 100,
      rearSpringRate: Math.round(springFactor * 100) / 100,
      frontARB: Math.round(arbFront * 100) / 100,
      rearARB: Math.round(arbRear * 100) / 100,
      frontRideHeight: Math.round(rideHeightFront * 100) / 100,
      rearRideHeight: Math.round(rideHeightRear * 100) / 100
    },
    
    aerodynamics: {
      frontWingAngle: Math.round(wingFrontAdj * 10) / 10,
      rearWingAngle: Math.round(wingRearAdj * 10) / 10,
      downforceTarget
    },
    
    tires: {
      recommendedCompound: tireCompound,
      pressureFront: Math.round(pressureFrontAdj * 10) / 10,
      pressureRear: Math.round(pressureRearAdj * 10) / 10
    },
    
    gearing: {
      finalDriveAdjustment: Math.round(finalDriveAdj * 100) / 100,
      ratioSpreadAdjustment: Math.round(ratioSpreadAdj * 100) / 100
    },
    
    brakes: {
      pressureAdjustment: Math.round(brakePressureAdj * 100) / 100,
      balance: brakeBalance
    },
    
    differential: {
      accelerationLockAdjustment: Math.round(accelLockAdj * 100) / 100,
      brakingLockAdjustment: Math.round(brakeLockAdj * 100) / 100
    },
    
    reasoning
  };
}

/**
 * Get track by ID or name and calculate adjustments
 */
export function getTrackAdjustments(
  trackIdentifier: string,
  carWeight: number,
  horsepower: number,
  baseTuneType: string
): TrackSpecificAdjustments | null {
  // Find track
  let track = TRACKS[trackIdentifier];
  
  if (!track) {
    // Try case-insensitive name search
    const normalizedId = trackIdentifier.toLowerCase();
    for (const t of Object.values(TRACKS)) {
      if (t.name.toLowerCase() === normalizedId || 
          t.alias?.some(a => a.toLowerCase() === normalizedId)) {
        track = t;
        break;
      }
    }
  }
  
  if (!track) {
    return null;
  }
  
  return calculateTrackAdjustments(track, carWeight, horsepower, baseTuneType);
}

/**
 * Summarize track characteristics for quick understanding
 */
export function getTrackSummary(track: Track): string {
  const parts: string[] = [];
  
  parts.push(`${track.name} (${track.type})`);
  parts.push(`Length: ${track.length} miles`);
  parts.push(`Technicality: ${track.technicality}/10`);
  parts.push(`Profile: ${track.speedProfile}`);
  
  if (track.notes.length > 0) {
    parts.push(`Tips: ${track.notes.slice(0, 2).join(', ')}`);
  }
  
  return parts.join(' | ');
}

export default {
  calculateTrackAdjustments,
  getTrackAdjustments,
  getTrackSummary
};
