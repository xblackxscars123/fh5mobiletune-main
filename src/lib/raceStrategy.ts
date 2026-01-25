/**
 * Race Strategy Analysis Functions
 * Estimates lap times, race duration, pit strategy, and handling analysis
 * Implements previously unused but valuable functions
 */

/**
 * Estimate lap time on a given track
 * @param setupPerformance - Base performance metrics
 * @param trackProfile - Track difficulty and characteristics
 * @returns Estimated lap time in seconds
 */
export function estimateRaceTime(
  setupPerformance: {
    zeroToSixty: number;
    topSpeed: number;
    cornering: number; // 0-10 scale
    braking: number; // 0-10 scale
  },
  trackProfile: {
    straightLength: number; // meters
    cornersPerLap: number;
    averageSpeed: number; // mph
    difficulty: number; // 0-10 scale
  }
): {
  lapTime: number; // seconds
  sections: {
    acceleration: number;
    braking: number;
    cornering: number;
  };
  estimate: 'conservative' | 'realistic' | 'optimistic';
} {
  // Lap time = function of straight time + corner time + brake time
  
  // Straight section time (based on top speed and acceleration)
  const straightSpeedMPH = Math.min(setupPerformance.topSpeed, trackProfile.straightLength / 100);
  const straightTimeSeconds = (trackProfile.straightLength / 1609.34) / (straightSpeedMPH / 3600);
  
  // Cornering time (based on cornering ability and number of corners)
  // Higher cornering score = less time in corners
  const baseCornerTime = 3.5; // seconds per corner at base ability
  const corneringTimeSeconds = trackProfile.cornersPerLap * (baseCornerTime - (setupPerformance.cornering * 0.2));
  
  // Braking time (based on braking ability)
  const brakingTimeSeconds = trackProfile.cornersPerLap * (2 - (setupPerformance.braking * 0.1));
  
  // Total lap time with consistency factor
  const consistencyFactor = 1 + (trackProfile.difficulty * 0.05); // Higher difficulty = more mistakes
  const totalLapTime = (straightTimeSeconds + corneringTimeSeconds + brakingTimeSeconds) * consistencyFactor;
  
  return {
    lapTime: Math.round(totalLapTime * 100) / 100,
    sections: {
      acceleration: Math.round(straightTimeSeconds * 100) / 100,
      braking: Math.round(brakingTimeSeconds * 100) / 100,
      cornering: Math.round(corneringTimeSeconds * 100) / 100
    },
    estimate: 'realistic'
  };
}

/**
 * Analyze understeer/oversteer tendencies and provide corrections
 * @param setup - Vehicle setup parameters
 * @param speed - Current speed (mph)
 * @param corneringAngle - Steering input angle (degrees)
 * @returns Analysis with severity and correction recommendations
 */
export function analyzeUndersteuerOversteer(
  setup: {
    frontSpringRate: number;
    rearSpringRate: number;
    frontARB: number;
    rearARB: number;
    brakeBias: number; // % front
    driveTrain: 'fwd' | 'rwd' | 'awd';
    weight: number;
    cgHeight: number;
  },
  speed: number,
  corneringAngle: number = 45
): {
  tendency: 'understeer' | 'neutral' | 'oversteer';
  severity: number; // 0-10 scale
  lateralAcceleration: number; // G-forces
  recommendation: string;
  adjustments: string[];
} {
  // Calculate stiffness ratio: higher front stiffness = understeer
  const stiffnessRatio = (setup.frontSpringRate + setup.frontARB * 5) / 
                         (setup.rearSpringRate + setup.rearARB * 5);
  
  // Weight transfer effect
  const lateralAccel = (speed / 100) * 1.5 * (corneringAngle / 45);
  
  // Analyze based on multiple factors
  let tendency: 'understeer' | 'neutral' | 'oversteer' = 'neutral';
  let severity = 0;
  
  // Front-heavy stiffness causes understeer
  if (stiffnessRatio > 1.15) {
    tendency = 'understeer';
    severity = Math.min(10, (stiffnessRatio - 1) * 15);
  }
  // Rear-heavy stiffness causes oversteer
  else if (stiffnessRatio < 0.85) {
    tendency = 'oversteer';
    severity = Math.min(10, (1 - stiffnessRatio) * 15);
  }
  
  // Brake bias effect
  if (setup.brakeBias > 60) {
    if (tendency === 'neutral') {
      tendency = 'understeer';
      severity = 3;
    } else {
      severity = Math.min(10, severity + 2);
    }
  }
  
  // Drivetrain effect on corner exit
  if (setup.driveTrain === 'rwd') {
    if (tendency === 'neutral') {
      tendency = 'oversteer';
      severity = 2;
    }
  }
  
  const adjustments: string[] = [];
  const recommendation = tendency === 'understeer' 
    ? 'Car pushes wide at corner entry. Increase rear stiffness or decrease front for more grip.'
    : tendency === 'oversteer'
    ? 'Car loses rear grip. Increase front stiffness or decrease rear for stability.'
    : 'Handling balanced. Monitor for consistency across track sections.';
  
  // Generate specific adjustments
  if (severity > 5) {
    if (tendency === 'understeer') {
      adjustments.push('Reduce front spring rate by 25-50 lbs/in');
      adjustments.push('Increase rear spring rate by 25-50 lbs/in');
      adjustments.push('Reduce front anti-roll bar by 3-5 points');
    } else {
      adjustments.push('Increase front spring rate by 25-50 lbs/in');
      adjustments.push('Reduce rear spring rate by 25-50 lbs/in');
      adjustments.push('Increase front anti-roll bar by 3-5 points');
    }
  } else if (severity > 3) {
    if (tendency === 'understeer') {
      adjustments.push('Slightly increase rear stiffness');
    } else {
      adjustments.push('Slightly increase front stiffness');
    }
  }
  
  return {
    tendency,
    severity: Math.round(severity * 10) / 10,
    lateralAcceleration: Math.round(lateralAccel * 100) / 100,
    recommendation,
    adjustments
  };
}

/**
 * Estimate pit stop strategy for endurance race
 * @param raceLength - Race distance in miles
 * @param fuelCapacity - Fuel tank capacity (liters)
 * @param fuelConsumption - Fuel consumption (liters per mile)
 * @param pitStopTime - Time for pit stop (seconds)
 * @returns Pit strategy recommendations
 */
export function calculatePitStrategy(
  raceLength: number,
  fuelCapacity: number,
  fuelConsumption: number,
  pitStopTime: number = 30
): {
  pitStops: number;
  fuelPerStop: number;
  distanceBetweenStops: number;
  recommendations: string[];
} {
  // Calculate fuel range on full tank
  const fuelRange = fuelCapacity / fuelConsumption;
  
  // Determine optimal pit stops
  const pitStops = Math.ceil(raceLength / fuelRange) - 1;
  
  // Distance between stops
  const distanceBetweenStops = raceLength / (pitStops + 1);
  
  // Fuel per stop
  const fuelPerStop = fuelCapacity * 0.95; // Don't top off completely
  
  const recommendations: string[] = [];
  
  if (pitStops === 0) {
    recommendations.push('No pit stops needed - fuel for entire race');
  } else if (pitStops === 1) {
    recommendations.push('One pit stop approximately at ' + Math.round(distanceBetweenStops) + ' miles');
  } else {
    recommendations.push(`${pitStops} pit stops needed`);
    recommendations.push(`Stop approximately every ${Math.round(distanceBetweenStops)} miles`);
  }
  
  // Time loss per pit stop
  const timePerStop = pitStopTime / 3600; // Convert to hours
  const totalTimeInPits = timePerStop * pitStops;
  recommendations.push(`Total pit time: ${Math.round(totalTimeInPits * 60)} minutes`);
  
  return {
    pitStops,
    fuelPerStop: Math.round(fuelPerStop * 10) / 10,
    distanceBetweenStops: Math.round(distanceBetweenStops),
    recommendations
  };
}

/**
 * Get race pace analysis
 * @param lapTime - Estimated lap time (seconds)
 * @param raceLength - Total race distance (miles)
 * @param competitorLapTime - Competitor's estimated lap time (seconds)
 * @returns Race pace analysis
 */
export function analyzeRacePace(
  lapTime: number,
  raceLength: number,
  competitorLapTime: number = 0
): {
  lapsInRace: number;
  totalRaceTime: number; // seconds
  avgSpeed: number; // mph
  timePerLap: string;
  competitivePosition: string;
  paceAnalysis: string;
} {
  // Estimate laps based on typical track layout (~3.5 miles average)
  const estimatedLapDistance = 3.5;
  const lapsInRace = Math.round(raceLength / estimatedLapDistance);
  const totalRaceTime = lapTime * lapsInRace;
  
  // Average speed during race
  const totalDistance = lapsInRace * estimatedLapDistance;
  const raceHours = totalRaceTime / 3600;
  const avgSpeed = totalDistance / raceHours;
  
  // Format lap time
  const minutes = Math.floor(lapTime / 60);
  const seconds = lapTime % 60;
  const timePerLap = `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  
  // Competitive analysis vs competitor
  let competitivePosition = 'N/A';
  let paceAnalysis = '';
  
  if (competitorLapTime > 0) {
    const timeDifference = lapTime - competitorLapTime;
    if (timeDifference < -0.5) {
      competitivePosition = 'Ahead - strong pace';
      paceAnalysis = `${Math.abs(timeDifference).toFixed(2)}s faster per lap`;
    } else if (timeDifference > 0.5) {
      competitivePosition = 'Behind - need improvement';
      paceAnalysis = `${Math.abs(timeDifference).toFixed(2)}s slower per lap`;
    } else {
      competitivePosition = 'Matched - close racing';
      paceAnalysis = 'Very close pace - race will be competitive';
    }
  } else {
    paceAnalysis = `Estimated pace: ${avgSpeed.toFixed(0)} mph average`;
  }
  
  return {
    lapsInRace,
    totalRaceTime: Math.round(totalRaceTime),
    avgSpeed: Math.round(avgSpeed),
    timePerLap,
    competitivePosition,
    paceAnalysis
  };
}
