/**
 * FH5-Specific Physics Calculations
 * Based on Forza Horizon 5's actual game mechanics, not real-world physics
 */

import { TuneSettings, CarSpecs } from './tuningCalculator';

export interface AccelerationPoint {
  gear: number;
  speed: number; // mph
  time: number; // seconds from 0
  acceleration: number; // mph/s
}

export interface PerformancePrediction {
  zeroToSixty: number; // seconds
  zeroToHundred: number; // seconds
  topSpeed: number; // mph
  accelerationCurve: AccelerationPoint[];
  corneringG: number; // lateral G force at 60mph
  brakeDistance: number; // feet from 60mph
  handling: number; // -100 to 100 (oversteer to understeer)
  tireGrip: number; // 0-100 percentage
  weightTransfer: number; // 0-100 percentage (affects stability)
  turboResonance: number; // 0-100 (turbo lag impact)
}

export interface TireBehavior {
  grip: number; // 0-100
  temperature: string; // cold, warm, hot, overheating
  gripByPressure: Record<string, number>;
  optimalPressure: number;
}

export interface HandlingCharacteristics {
  understeerTendency: number; // -100 to 100 (positive = oversteer)
  responsiveness: number; // 0-100
  turnInSpeed: number; // 0-100 (how quickly car responds to input)
  midCornerStability: number; // 0-100
  exitTraction: number; // 0-100
  recoveryTime: number; // seconds to recover from opposite lock
}

/**
 * FH5 Power Band Model
 * Most FH5 cars hit peak power around 6500-8000 RPM
 */
function getPowerMultiplierByGear(gearNumber: number, totalGears: number): number {
  // First gear is inefficient due to high torque loading
  // Power transfers more efficiently in mid-range gears
  const gearEfficiency: Record<number, number> = {
    1: 0.75, // Turbo lag + gear shock
    2: 0.88,
    3: 0.92,
    4: 0.95,
    5: 0.96,
    6: 0.94, // Highway gear, less acceleration
  };

  return gearEfficiency[gearNumber] || 0.9;
}

/**
 * Calculate 0-60 time based on FH5 mechanics
 * Factors: power, weight, drivetrain, diff lock, traction control
 */
export function calculateZeroToSixty(specs: CarSpecs, tune: TuneSettings): number {
  if (!specs.horsepower || !specs.weight) return 0;

  // Base acceleration factor
  const powerToWeight = specs.horsepower / (specs.weight / 1000); // hp per 1000 lbs
  const baseAccel = 0.5 + (powerToWeight * 0.08);

  // Drivetrain traction multiplier
  const driveTrainMult: Record<string, number> = {
    RWD: Math.max(0.7, (tune.diffAccelRear / 100) * 0.95), // Wheelspin risk
    AWD: 0.95 + (tune.diffAccelRear / 100) * 0.04, // More grip
    FWD: 0.85 + (tune.diffAccelFront / 100) * 0.10, // Torque steer effect
  };

  const tractionMult = driveTrainMult[specs.driveType || 'RWD'] || 0.85;

  // Tire pressure affects launch grip (FH5 uses tire deformation physics)
  const tirePressureGrip = Math.max(0.8, Math.min(1.2, tune.tirePressureFront / 30));

  // Spring stiffness helps with weight transfer in launch
  const springRating = (tune.springsFront + tune.springsRear) / 40;
  const springMult = Math.max(0.7, Math.min(1.15, springRating));

  // Calculate 0-60 time
  const adjustedAccel = baseAccel * tractionMult * tirePressureGrip * springMult;
  const zeroToSixty = Math.max(2.0, 12 / adjustedAccel);

  return parseFloat(zeroToSixty.toFixed(2));
}

/**
 * Calculate 0-100 time (longer acceleration, smoother power delivery)
 */
export function calculateZeroToHundred(specs: CarSpecs, tune: TuneSettings): number {
  if (!specs.horsepower || !specs.weight) return 0;

  const zeroToSixty = calculateZeroToSixty(specs, tune);
  const powerToWeight = specs.horsepower / (specs.weight / 1000);

  // After initial launch, higher gears have better efficiency
  const highGearMultiplier = Math.max(0.5, 1 - (powerToWeight / 100));
  const zeroToHundred = zeroToSixty + (20 * highGearMultiplier);

  return parseFloat(zeroToHundred.toFixed(2));
}

/**
 * Calculate top speed based on FH5's power and gearing
 * FH5 doesn't use air resistance curves like real cars
 */
export function calculateTopSpeed(specs: CarSpecs, tune: TuneSettings): number {
  if (!specs.horsepower) return 0;

  // Base top speed from power alone (~1.8 mph per hp for typical cars)
  const baseTopSpeed = specs.horsepower * 1.8;

  // Final drive affects top speed significantly
  // Lower ratio = higher top speed but slower acceleration
  // FH5 final drive ranges from ~2.0 (high speed) to ~5.0 (low speed)
  const finalDriveImpact = (5.5 - tune.finalDrive) * 8; // Each 0.1 change = ~0.8mph

  // Power delivery through gears
  // AWD has slight top speed penalty due to drivetrain losses
  const driveTypePenalty: Record<string, number> = {
    RWD: 0,
    AWD: -3,
    FWD: -2,
  };

  const penalty = driveTypePenalty[specs.driveType || 'RWD'] || 0;

  // Tire pressure affects rolling resistance in FH5
  const tireLoss = Math.abs(tune.tirePressureRear - 32) * 0.3;

  const topSpeed = baseTopSpeed + finalDriveImpact + penalty - tireLoss;
  return Math.max(50, parseFloat(topSpeed.toFixed(1)));
}

/**
 * Generate acceleration curve through gears
 * Shows power delivery at each speed point
 */
export function calculateAccelerationCurve(specs: CarSpecs, tune: TuneSettings): AccelerationPoint[] {
  if (!specs.horsepower || !specs.weight) return [];

  const points: AccelerationPoint[] = [];
  const topSpeed = calculateTopSpeed(specs, tune);
  const zeroToSixty = calculateZeroToSixty(specs, tune);

  let currentTime = 0;
  let currentSpeed = 0;
  const timeStep = 0.1; // seconds

  // Simulate acceleration through speed ranges
  for (let speed = 0; speed <= topSpeed; speed += 5) {
    // Determine which gear based on speed and final drive
    const gearSpeedRange = topSpeed / 6; // Rough gear split
    const gear = Math.min(6, Math.floor(speed / gearSpeedRange) + 1);

    // Calculate acceleration at this speed
    const powerMultiplier = getPowerMultiplierByGear(gear, 6);
    const weightKg = specs.weight || 3000;
    const powerValue = specs.horsepower || 300;

    // FH5 specific: acceleration decreases as speed increases (power curve flattens)
    const speedFactor = Math.max(0.2, 1 - (speed / topSpeed) * 0.8);
    const basAcceleration = (powerValue * powerMultiplier * speedFactor) / (weightKg / 1000);

    // Apply tune modifiers
    const tireGrip = Math.max(0.7, Math.min(1.2, tune.tirePressureFront / 30));
    const tractionLoss = specs.driveType === 'RWD' ? (1 - tune.diffAccelRear / 100) * 0.3 : 0;

    const adjustedAccel = (basAcceleration * tireGrip - tractionLoss) * 2.237; // Convert to mph/s

    // Interpolate time to reach this speed
    if (speed === 0) {
      currentTime = 0;
    } else {
      const previousSpeed = Math.max(0, speed - 5);
      const avgAccel = adjustedAccel / 2;
      currentTime += (5 / avgAccel) / timeStep;
    }

    points.push({
      gear,
      speed: Math.round(speed),
      time: parseFloat(currentTime.toFixed(2)),
      acceleration: parseFloat(adjustedAccel.toFixed(2)),
    });
  }

  return points;
}

/**
 * Calculate tire grip based on FH5's tire physics
 * FH5 uses tire deformation model - pressure affects contact patch
 */
export function calculateTireGrip(tune: TuneSettings): TireBehavior {
  // FH5 optimal tire pressure is around 31-32 PSI for most compounds
  const optimalPressure = 31.5;
  const frontPressure = tune.tirePressureFront;
  const rearPressure = tune.tirePressureRear;

  // Calculate grip loss/gain from pressure deviation
  const frontDeviation = Math.abs(frontPressure - optimalPressure);
  const rearDeviation = Math.abs(rearPressure - optimalPressure);

  // FH5: Each PSI away from optimal = ~1.5% grip loss (non-linear)
  const frontGrip = Math.max(30, 100 - (frontDeviation * frontDeviation * 1.5));
  const rearGrip = Math.max(30, 100 - (rearDeviation * rearDeviation * 1.5));
  const avgGrip = (frontGrip + rearGrip) / 2;

  // Temperature affects grip in FH5 (simplified model)
  let temperature: string;
  const avgPressure = (frontPressure + rearPressure) / 2;

  if (avgPressure < 28) temperature = 'cold';
  else if (avgPressure < 30) temperature = 'warm';
  else if (avgPressure < 34) temperature = 'hot';
  else temperature = 'overheating';

  return {
    grip: Math.round(avgGrip),
    temperature,
    gripByPressure: {
      '27': 60,
      '28': 75,
      '29': 88,
      '30': 95,
      '31': 100,
      '32': 100,
      '33': 98,
      '34': 92,
      '35': 80,
      '36': 60,
    },
    optimalPressure,
  };
}

/**
 * Calculate cornering capability (lateral G force at 60mph)
 * FH5 uses suspension geometry and tire grip
 */
export function calculateCorneringCapability(specs: CarSpecs, tune: TuneSettings): number {
  // Base grip from tire model
  const tireGrip = calculateTireGrip(tune).grip / 100;

  // Camber affects cornering grip significantly
  // FH5: -2° camber is ideal, each degree away costs grip
  const camberEffect = (Math.abs(tune.camberFront) - 2) * -0.08;
  const camberMult = Math.max(0.6, 1 + camberEffect);

  // ARB affects understeer/oversteer balance, not grip directly
  const arbBalance = Math.abs(tune.arbFront - tune.arbRear) / 100;
  const arbStiffness = (tune.arbFront + tune.arbRear) / 200;

  // Weight distribution affects grip (heavier side has less grip)
  const weightDist = specs.weightDistribution || 50;
  const weightBalance = Math.max(0.9, Math.min(1.1, 50 / weightDist));

  // Ride height affects aero and grip
  const rideHeightAvg = (tune.rideHeightFront + tune.rideHeightRear) / 2;
  const rideHeightEffect = Math.max(0.8, Math.min(1.1, 1.2 / rideHeightAvg));

  // Calculate lateral G at 60 mph
  const baseCorneringG = 0.95; // FH5 baseline for stock cars
  const speedFactor = 1.0; // At 60mph (baseline speed)

  const cornering = baseCorneringG * tireGrip * camberMult * arbStiffness * weightBalance * rideHeightEffect * speedFactor;

  return parseFloat(cornering.toFixed(2));
}

/**
 * Calculate braking distance from 60mph
 * FH5 brake modulation is important
 */
export function calculateBrakingDistance(specs: CarSpecs, tune: TuneSettings): number {
  // FH5: Brake power is affected by brake pressure and mass
  const brakeForceBase = (tune.brakePressure / 100) * 1.3; // Max ~1.3g deceleration

  // Weight affects braking distance
  const weightFactor = (specs.weight || 3000) / 3000;

  // Tire grip affects brake grip
  const tireGrip = calculateTireGrip(tune).grip / 100;

  // ABS prevents lock-up but slightly reduces peak deceleration
  const absLoss = 0.95; // 5% loss with ABS active

  // Brake balance affects weight transfer during braking
  // Optimal is near 50%, further away causes instability and lock-up
  const brakeBalance = tune.brakeBalance || 50;
  const brakeBias = Math.max(0.8, Math.min(1.0, 1 - Math.abs(brakeBalance - 50) / 100));

  const brakeDeceleration = brakeForceBase * tireGrip * absLoss * brakeBias / weightFactor;

  // Braking distance = v² / (2 * a)
  // 60 mph = 88 ft/s
  const speedFtPerSec = 60 * 1.467;
  const brakingDistanceFt = (speedFtPerSec * speedFtPerSec) / (2 * brakeDeceleration * 32.174);

  return parseFloat(brakingDistanceFt.toFixed(1));
}

/**
 * Analyze handling characteristics from tuning setup
 */
export function analyzeHandling(specs: CarSpecs, tune: TuneSettings): HandlingCharacteristics {
  // Understeer/Oversteer tendency based on ARB balance
  // FH5: Higher front ARB = understeer, higher rear ARB = oversteer
  const arbDifference = tune.arbRear - tune.arbFront;
  const baseUndersteer = (specs.weightDistribution || 50) > 50 ? 10 : -10; // FWD/RWD bias
  const understeerTendency = baseUndersteer + (arbDifference * 0.5);

  // Responsiveness from spring rates and ARB
  const springStiffness = (tune.springsFront + tune.springsRear) / 40;
  const arbStiffness = (tune.arbFront + tune.arbRear) / 200;
  const responsiveness = Math.min(100, (springStiffness + arbStiffness) * 50);

  // Turn-in speed from camber and caster
  const camberEffect = (Math.abs(tune.camberFront) - 1.5) * 10;
  const casterEffect = (tune.caster - 5) * 5;
  const turnInSpeed = Math.max(0, Math.min(100, 50 + camberEffect + casterEffect));

  // Mid-corner stability from suspension compliance and ARB
  const rebound = (tune.reboundFront + tune.reboundRear) / 20;
  const bump = (tune.bumpFront + tune.bumpRear) / 20;
  const midCornerStability = Math.min(100, (rebound + bump) * 25);

  // Exit traction from diff settings
  const tractionControl = specs.driveType === 'RWD' 
    ? (tune.diffAccelRear / 100) * 80 + 20
    : (tune.diffAccelRear / 100) * 90 + 10;
  const exitTraction = Math.min(100, tractionControl);

  // Recovery time from lockup (inverse of stability)
  const damping = (tune.reboundFront + tune.reboundRear) / 2;
  const recoveryTime = Math.max(0.2, 2 - (damping / 10));

  return {
    understeerTendency: Math.round(understeerTendency),
    responsiveness: Math.round(responsiveness),
    turnInSpeed: Math.round(turnInSpeed),
    midCornerStability: Math.round(midCornerStability),
    exitTraction: Math.round(exitTraction),
    recoveryTime: parseFloat(recoveryTime.toFixed(2)),
  };
}

/**
 * Calculate weight transfer during acceleration
 * Affects traction and stability
 */
export function calculateWeightTransfer(specs: CarSpecs, tune: TuneSettings): number {
  if (!specs.weight) return 50;

  // Spring rate affects weight transfer stiffness
  const rearSpringStiffness = tune.springsRear / 50;
  const wheelbase = 120; // Inches (typical car)

  // Weight transfer formula for FH5:
  // Higher springs = sharper weight transfer = better traction but more unstable
  const cg_height = 18; // Center of gravity height in inches

  const weightTransfer = Math.max(30, Math.min(100, 50 + (rearSpringStiffness * 15)));

  return Math.round(weightTransfer);
}

/**
 * Complete performance prediction
 */
export function calculateFullPerformance(specs: CarSpecs, tune: TuneSettings): PerformancePrediction {
  return {
    zeroToSixty: calculateZeroToSixty(specs, tune),
    zeroToHundred: calculateZeroToHundred(specs, tune),
    topSpeed: calculateTopSpeed(specs, tune),
    accelerationCurve: calculateAccelerationCurve(specs, tune),
    corneringG: calculateCorneringCapability(specs, tune),
    brakeDistance: calculateBrakingDistance(specs, tune),
    handling: analyzeHandling(specs, tune).understeerTendency,
    tireGrip: calculateTireGrip(tune).grip,
    weightTransfer: calculateWeightTransfer(specs, tune),
    turboResonance: specs.horsepower ? Math.min(100, (specs.horsepower / 800) * 100) : 0,
  };
}

/**
 * Compare two tuning setups
 */
export function comparePerformance(
  specs: CarSpecs,
  tune1: TuneSettings,
  tune2: TuneSettings
): Record<string, { before: number; after: number; change: number; percent: number }> {
  const perf1 = calculateFullPerformance(specs, tune1);
  const perf2 = calculateFullPerformance(specs, tune2);

  return {
    zeroToSixty: {
      before: perf1.zeroToSixty,
      after: perf2.zeroToSixty,
      change: perf2.zeroToSixty - perf1.zeroToSixty,
      percent: ((perf2.zeroToSixty - perf1.zeroToSixty) / perf1.zeroToSixty) * 100,
    },
    topSpeed: {
      before: perf1.topSpeed,
      after: perf2.topSpeed,
      change: perf2.topSpeed - perf1.topSpeed,
      percent: ((perf2.topSpeed - perf1.topSpeed) / perf1.topSpeed) * 100,
    },
    corneringG: {
      before: perf1.corneringG,
      after: perf2.corneringG,
      change: perf2.corneringG - perf1.corneringG,
      percent: ((perf2.corneringG - perf1.corneringG) / perf1.corneringG) * 100,
    },
    brakeDistance: {
      before: perf1.brakeDistance,
      after: perf2.brakeDistance,
      change: perf2.brakeDistance - perf1.brakeDistance,
      percent: ((perf2.brakeDistance - perf1.brakeDistance) / perf1.brakeDistance) * 100,
    },
    tireGrip: {
      before: perf1.tireGrip,
      after: perf2.tireGrip,
      change: perf2.tireGrip - perf1.tireGrip,
      percent: ((perf2.tireGrip - perf1.tireGrip) / perf1.tireGrip) * 100,
    },
  };
}
