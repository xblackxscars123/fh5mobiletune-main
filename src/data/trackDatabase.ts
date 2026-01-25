/**
 * Forza Horizon 5 Track Database
 * Comprehensive track profiles with tuning recommendations
 * Data based on actual FH5 tracks and community measurements
 */

export type TrackType = 'road' | 'street' | 'offroad' | 'drag' | 'circuit' | 'sprint';
export type SpeedProfile = 'balanced' | 'high-speed' | 'technical' | 'mixed';

export interface Track {
  id: string;
  name: string;
  alias?: string[]; // Alternative names players use
  type: TrackType;
  length: number; // miles
  avgTurnRadius: number; // feet
  maxElevationGain: number; // feet
  straightawayLength: number; // miles (longest)
  technicality: number; // 1-10 (10 = very technical/tight)
  speedProfile: SpeedProfile;
  recommendedTuneTypes: string[];
  drivingSide: 'left' | 'right';
  surfaceType: 'asphalt' | 'mixed' | 'dirt' | 'gravel';
  wheelBaseRecommendation: 'long' | 'medium' | 'short'; // longer = better on highspeed
  notes: string[];
}

export const TRACKS: Record<string, Track> = {
  // ==========================================
  // ROAD CIRCUITS (Popular racing venues)
  // ==========================================
  
  'goliath': {
    id: 'goliath',
    name: 'Goliath Circuit',
    alias: ['Goliath', 'Long Circuit'],
    type: 'circuit',
    length: 50.4,
    avgTurnRadius: 200,
    maxElevationGain: 2800,
    straightawayLength: 8.5,
    technicality: 4,
    speedProfile: 'balanced',
    recommendedTuneTypes: ['grip', 'street', 'rally'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'long',
    notes: [
      'Longest circuit in FH5',
      'Mix of sweeping turns and technical sections',
      'Significant elevation changes',
      'Great for testing top speed and stamina',
      'Popular for S-class racing'
    ]
  },

  'espíritu-del-bosque': {
    id: 'espíritu-del-bosque',
    name: 'Espíritu del Bosque',
    alias: ['Spirit of the Forest', 'Forest Circuit'],
    type: 'circuit',
    length: 12.8,
    avgTurnRadius: 120,
    maxElevationGain: 800,
    straightawayLength: 2.1,
    technicality: 6,
    speedProfile: 'technical',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'short',
    notes: [
      'Technical forest circuit with many medium-speed turns',
      'Good for testing suspension and balance',
      'Requires precise line work',
      'Medium elevation changes'
    ]
  },

  'lago-azul': {
    id: 'lago-azul',
    name: 'Lago Azul Circuit',
    alias: ['Blue Lake', 'Lake Circuit'],
    type: 'circuit',
    length: 8.3,
    avgTurnRadius: 110,
    maxElevationGain: 400,
    straightawayLength: 1.8,
    technicality: 7,
    speedProfile: 'technical',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'short',
    notes: [
      'Very technical with constant turning',
      'Tight hairpins and chicanes',
      'Minimal elevation change',
      'Tests precision and car control'
    ]
  },

  'calafatá': {
    id: 'calafatá',
    name: 'Calafatá',
    alias: ['Calafata', 'South Circuit'],
    type: 'circuit',
    length: 6.7,
    avgTurnRadius: 130,
    maxElevationGain: 250,
    straightawayLength: 1.2,
    technicality: 5,
    speedProfile: 'balanced',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'medium',
    notes: [
      'Medium-length circuit',
      'Good mix of high-speed and technical sections',
      'Minimal elevation change'
    ]
  },

  // ==========================================
  // STREET CIRCUITS (Urban courses)
  // ==========================================

  'mexico-city': {
    id: 'mexico-city',
    name: 'Mexico City Street Circuit',
    alias: ['Mexico City', 'City Circuit', 'Street'],
    type: 'street',
    length: 3.2,
    avgTurnRadius: 80,
    maxElevationGain: 150,
    straightawayLength: 0.8,
    technicality: 8,
    speedProfile: 'technical',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'short',
    notes: [
      'Tight urban circuit with minimal runoff',
      'Requires precise braking and turn-in',
      'Wall hits are very punishing',
      'Low-speed corners dominate',
      'Perfect for tuning suspension geometry'
    ]
  },

  'alhambra-street': {
    id: 'alhambra-street',
    name: 'Alhambra Street Circuit',
    alias: ['Alhambra', 'Street Circuit'],
    type: 'street',
    length: 2.8,
    avgTurnRadius: 85,
    maxElevationGain: 200,
    straightawayLength: 0.6,
    technicality: 7,
    speedProfile: 'technical',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'short',
    notes: [
      'Urban circuit with elevation changes',
      'Tight corners with poor runoff',
      'Great for precision tuning'
    ]
  },

  // ==========================================
  // DRAG/SPRINT (Straight-line races)
  // ==========================================

  'drag-strip': {
    id: 'drag-strip',
    name: 'Drag Strip',
    alias: ['Drag', 'Quarter Mile'],
    type: 'drag',
    length: 0.25,
    avgTurnRadius: 9999, // N/A
    maxElevationGain: 0,
    straightawayLength: 0.25,
    technicality: 1,
    speedProfile: 'high-speed',
    recommendedTuneTypes: ['drag'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'long',
    notes: [
      'Pure straight-line acceleration',
      'All about launch control and top-end power',
      'Requires maximum differential lock and stiff setup',
      'Tire grip at launch is critical'
    ]
  },

  'el-mirador-sprint': {
    id: 'el-mirador-sprint',
    name: 'El Mirador Sprint',
    alias: ['El Mirador', 'Sprint'],
    type: 'sprint',
    length: 3.2,
    avgTurnRadius: 250,
    maxElevationGain: 400,
    straightawayLength: 2.0,
    technicality: 2,
    speedProfile: 'high-speed',
    recommendedTuneTypes: ['grip', 'street', 'drag'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'long',
    notes: [
      'High-speed point-to-point sprint',
      'Long straights with few corners',
      'Elevation favors powerful cars',
      'Top speed matters significantly'
    ]
  },

  'punto-final-sprint': {
    id: 'punto-final-sprint',
    name: 'Punto Final Sprint',
    alias: ['Punto Final', 'Mountain Sprint'],
    type: 'sprint',
    length: 2.5,
    avgTurnRadius: 180,
    maxElevationGain: 800,
    straightawayLength: 1.5,
    technicality: 3,
    speedProfile: 'high-speed',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'long',
    notes: [
      'Mountain sprint with elevation changes',
      'Fast and flowing sections',
      'Requires good brakes and downforce'
    ]
  },

  // ==========================================
  // OFFROAD CIRCUITS
  // ==========================================

  'mulegé-offroad': {
    id: 'mulegé-offroad',
    name: 'Mulegé Offroad Circuit',
    alias: ['Mulegé', 'Desert Circuit', 'Offroad'],
    type: 'offroad',
    length: 8.5,
    avgTurnRadius: 150,
    maxElevationGain: 600,
    straightawayLength: 1.8,
    technicality: 6,
    speedProfile: 'mixed',
    recommendedTuneTypes: ['offroad', 'rally'],
    drivingSide: 'right',
    surfaceType: 'mixed',
    wheelBaseRecommendation: 'short',
    notes: [
      'Mix of dirt and gravel surfaces',
      'Requires very soft suspension',
      'Uneven terrain and obstacles',
      'Differential lock critical for traction',
      'Requires rally or offroad tires'
    ]
  },

  'baja-offroad': {
    id: 'baja-offroad',
    name: 'Baja Offroad Circuit',
    alias: ['Baja', 'Desert Rally'],
    type: 'offroad',
    length: 12.3,
    avgTurnRadius: 200,
    maxElevationGain: 1200,
    straightawayLength: 3.2,
    technicality: 5,
    speedProfile: 'mixed',
    recommendedTuneTypes: ['offroad', 'rally'],
    drivingSide: 'right',
    surfaceType: 'mixed',
    wheelBaseRecommendation: 'medium',
    notes: [
      'Long offroad circuit through varied terrain',
      'Alternates between fast and technical sections',
      'High elevation changes affect handling',
      'Great for endurance testing'
    ]
  },

  'tres-cruces-offroad': {
    id: 'tres-cruces-offroad',
    name: 'Tres Cruces Offroad Circuit',
    alias: ['Tres Cruces', 'Three Crosses'],
    type: 'offroad',
    length: 5.6,
    avgTurnRadius: 120,
    maxElevationGain: 400,
    straightawayLength: 1.2,
    technicality: 7,
    speedProfile: 'technical',
    recommendedTuneTypes: ['offroad', 'rally'],
    drivingSide: 'right',
    surfaceType: 'dirt',
    wheelBaseRecommendation: 'short',
    notes: [
      'Technical dirt circuit with many tight corners',
      'Uneven surface requires precision',
      'Tests suspension geometry and damping',
      'Tight budget for car weight'
    ]
  },

  // ==========================================
  // RALLY COURSES (Mixed surface point-to-point)
  // ==========================================

  'mulege-to-baja': {
    id: 'mulege-to-baja',
    name: 'Mulegé to Baja',
    alias: ['Mulegé Sprint', 'Desert Sprint'],
    type: 'sprint',
    length: 4.2,
    avgTurnRadius: 180,
    maxElevationGain: 600,
    straightawayLength: 2.0,
    technicality: 4,
    speedProfile: 'mixed',
    recommendedTuneTypes: ['offroad', 'rally', 'street'],
    drivingSide: 'right',
    surfaceType: 'mixed',
    wheelBaseRecommendation: 'medium',
    notes: [
      'Mixed surface rally sprint',
      'Asphalt to dirt transition',
      'Varied elevation',
      'Tests all-around car capability'
    ]
  },

  // ==========================================
  // ROAD SPRINTS (Point-to-point high-speed)
  // ==========================================

  'highway-1-north': {
    id: 'highway-1-north',
    name: 'Highway 1 North',
    alias: ['Highway 1', 'Coastal Sprint', 'North'],
    type: 'sprint',
    length: 6.5,
    avgTurnRadius: 300,
    maxElevationGain: 800,
    straightawayLength: 3.2,
    technicality: 2,
    speedProfile: 'high-speed',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'long',
    notes: [
      'High-speed coastal highway',
      'Long straights with sweeping turns',
      'Beautiful scenery, fast pace',
      'Downforce helps stability'
    ]
  },

  'highway-1-south': {
    id: 'highway-1-south',
    name: 'Highway 1 South',
    alias: ['Highway South', 'Coastal Sprint South'],
    type: 'sprint',
    length: 5.8,
    avgTurnRadius: 280,
    maxElevationGain: 600,
    straightawayLength: 2.8,
    technicality: 2,
    speedProfile: 'high-speed',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'long',
    notes: [
      'Similar to Highway 1 North',
      'Slightly different elevation profile',
      'Good for testing stability'
    ]
  },

  'oasis-sprint': {
    id: 'oasis-sprint',
    name: 'Oasis Sprint',
    alias: ['Oasis', 'Desert Road Sprint'],
    type: 'sprint',
    length: 3.8,
    avgTurnRadius: 200,
    maxElevationGain: 500,
    straightawayLength: 1.8,
    technicality: 3,
    speedProfile: 'balanced',
    recommendedTuneTypes: ['grip', 'street'],
    drivingSide: 'right',
    surfaceType: 'asphalt',
    wheelBaseRecommendation: 'medium',
    notes: [
      'Mixed speed sprint through desert',
      'Good balance of acceleration and handling',
      'Medium elevation changes'
    ]
  },
};

/**
 * Find a track by name or alias
 * Case-insensitive matching
 */
export function getTrackByName(name: string): Track | null {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct ID match
  if (TRACKS[normalizedName]) {
    return TRACKS[normalizedName];
  }
  
  // Search through all tracks
  for (const track of Object.values(TRACKS)) {
    if (track.name.toLowerCase() === normalizedName) {
      return track;
    }
    
    // Check aliases
    if (track.alias?.some(alias => alias.toLowerCase() === normalizedName)) {
      return track;
    }
  }
  
  return null;
}

/**
 * Get all tracks of a specific type
 */
export function getTracksByType(type: TrackType): Track[] {
  return Object.values(TRACKS).filter(track => track.type === type);
}

/**
 * Get tracks recommended for a specific tune type
 */
export function getTracksByTuneType(tuneType: string): Track[] {
  return Object.values(TRACKS).filter(track =>
    track.recommendedTuneTypes.includes(tuneType.toLowerCase())
  );
}

/**
 * Get tracks by speed profile
 */
export function getTracksBySpeedProfile(profile: SpeedProfile): Track[] {
  return Object.values(TRACKS).filter(track => track.speedProfile === profile);
}

/**
 * Get all available track IDs
 */
export function getAllTrackIds(): string[] {
  return Object.keys(TRACKS);
}

/**
 * Get all available tracks with names
 */
export function getAllTracks(): Array<{ id: string; name: string }> {
  return Object.values(TRACKS).map(track => ({
    id: track.id,
    name: track.name
  }));
}

export default TRACKS;
