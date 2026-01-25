/**
 * Advanced Tire Modeling for Forza Horizon 5 Tuning
 * Sophisticated tire physics, thermal dynamics, and performance prediction
 * Provides detailed tire analysis for optimal setup and racing strategy
 */

export interface TireCompound {
  id: string;
  name: string;
  category: 'street' | 'sport' | 'semi-slick' | 'slick' | 'rally' | 'offroad' | 'drag';
  optimalTempRange: { min: number; max: number }; // Celsius
  thermalMass: number; // Heat capacity factor
  gripCurve: {
    coldGrip: number; // Grip multiplier when cold
    optimalGrip: number; // Peak grip at optimal temp
    overheatedGrip: number; // Grip loss when hot
    transitionTemp: number; // Temp where performance peaks
  };
  wearResistance: number; // 0-1, higher = more resistant to wear
  rollingResistance: number; // 0-1, higher = more resistance
  aquaplaningResistance: number; // 0-1, higher = better in wet
  costFactor: number; // Relative cost multiplier
}

export interface TirePressure {
  front: number; // PSI
  rear: number; // PSI
  targetFront: number; // Optimal PSI for conditions
  targetRear: number; // Optimal PSI for conditions
  thermalAdjustment: { front: number; rear: number }; // PSI change from heating
}

export interface TireTemperature {
  inner: number; // Celsius
  middle: number; // Celsius
  outer: number; // Celsius
  average: number; // Celsius
  distribution: 'balanced' | 'inner-hot' | 'outer-hot' | 'middle-hot';
  stability: 'stable' | 'heating' | 'cooling' | 'critical';
}

export interface TireWear {
  frontLeft: number; // 0-100%
  frontRight: number; // 0-100%
  rearLeft: number; // 0-100%
  rearRight: number; // 0-100%
  average: number; // 0-100%
  distribution: 'even' | 'front-heavy' | 'rear-heavy' | 'diagonal';
  remainingLife: number; // laps until 80% wear
}

export interface TireAnalysis {
  compound: TireCompound;
  pressures: TirePressure;
  temperatures: {
    frontLeft: TireTemperature;
    frontRight: TireTemperature;
    rearLeft: TireTemperature;
    rearRight: TireTemperature;
  };
  wear: TireWear;
  gripLevels: {
    frontAxle: number; // 0-1 grip multiplier
    rearAxle: number; // 0-1 grip multiplier
    balance: number; // -1 (understeer) to 1 (oversteer)
  };
  recommendations: {
    pressureAdjustments: { front: number; rear: number };
    setupChanges: string[];
    riskFactors: string[];
    predictedPerformance: number; // 0-100% of optimal
  };
}

export interface RacingConditions {
  ambientTemp: number; // Celsius
  trackTemp: number; // Celsius
  humidity: number; // 0-100%
  weather: 'dry' | 'damp' | 'wet' | 'flooded';
  trackType: 'asphalt' | 'concrete' | 'gravel' | 'dirt';
  sessionType: 'practice' | 'qualifying' | 'race';
  fuelLoad: number; // 0-1, affects weight distribution
}

export class AdvancedTireModeling {
  private compounds: Map<string, TireCompound> = new Map();

  constructor() {
    this.initializeTireCompounds();
  }

  /**
   * Analyze tire performance and provide comprehensive recommendations
   */
  public analyzeTirePerformance(
    compoundId: string,
    pressures: TirePressure,
    conditions: RacingConditions,
    carData: {
      weight: number;
      weightDistribution: number; // 0-100 front %
      speed: number; // km/h
      lateralG: number; // g-forces
      driveType: 'FWD' | 'RWD' | 'AWD';
      aeroDownforce: number; // N
    },
    sessionProgress?: {
      lapNumber: number;
      totalLaps: number;
      currentTemps: { fl: number; fr: number; rl: number; rr: number };
      currentWear: { fl: number; fr: number; rl: number; rr: number };
    }
  ): TireAnalysis {
    const compound = this.compounds.get(compoundId);
    if (!compound) {
      throw new Error(`Unknown tire compound: ${compoundId}`);
    }

    // Calculate temperatures based on conditions and usage
    const temperatures = this.calculateTireTemperatures(
      compound,
      pressures,
      conditions,
      carData,
      sessionProgress?.currentTemps
    );

    // Calculate wear patterns
    const wear = this.calculateTireWear(
      compound,
      temperatures,
      conditions,
      carData,
      sessionProgress?.currentWear
    );

    // Calculate grip levels
    const gripLevels = this.calculateGripLevels(compound, temperatures, wear, conditions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      compound,
      pressures,
      temperatures,
      wear,
      conditions,
      sessionProgress
    );

    return {
      compound,
      pressures,
      temperatures,
      wear,
      gripLevels,
      recommendations
    };
  }

  /**
   * Calculate optimal tire pressures for given conditions
   */
  public calculateOptimalPressures(
    compoundId: string,
    conditions: RacingConditions,
    carData: {
      weight: number;
      weightDistribution: number;
      targetBalance: 'neutral' | 'understeer' | 'oversteer';
    }
  ): TirePressure {
    const compound = this.compounds.get(compoundId);
    if (!compound) {
      throw new Error(`Unknown tire compound: ${compoundId}`);
    }

    // Base pressures by compound and conditions
    let baseFront = 30; // PSI
    let baseRear = 28; // PSI

    // Adjust for compound characteristics
    switch (compound.category) {
      case 'street':
        baseFront = 32; baseRear = 30; break;
      case 'sport':
        baseFront = 30; baseRear = 28; break;
      case 'semi-slick':
        baseFront = 28; baseRear = 26; break;
      case 'slick':
        baseFront = 26; baseRear = 24; break;
      case 'rally':
        baseFront = 25; baseRear = 23; break;
      case 'offroad':
        baseFront = 18; baseRear = 16; break;
      case 'drag':
        baseFront = 55; baseRear = 15; break;
    }

    // Adjust for temperature (colder = higher pressure)
    const tempAdjustment = Math.max(-4, Math.min(4, (20 - conditions.ambientTemp) * 0.2));
    baseFront += tempAdjustment;
    baseRear += tempAdjustment;

    // Adjust for track conditions
    switch (conditions.weather) {
      case 'damp':
        baseFront += 2; baseRear += 2; break;
      case 'wet':
        baseFront += 4; baseRear += 4; break;
      case 'flooded':
        baseFront += 6; baseRear += 6; break;
    }

    // Adjust for weight distribution
    const weightBias = (carData.weightDistribution - 50) * 0.1;
    baseFront += weightBias;
    baseRear -= weightBias;

    // Adjust for target balance
    switch (carData.targetBalance) {
      case 'understeer':
        baseFront += 1; baseRear -= 1; break;
      case 'oversteer':
        baseFront -= 1; baseRear += 1; break;
    }

    // Clamp to reasonable ranges
    baseFront = Math.max(14, Math.min(60, baseFront));
    baseRear = Math.max(14, Math.min(60, baseRear));

    return {
      front: Math.round(baseFront * 10) / 10,
      rear: Math.round(baseRear * 10) / 10,
      targetFront: Math.round(baseFront * 10) / 10,
      targetRear: Math.round(baseRear * 10) / 10,
      thermalAdjustment: { front: 0, rear: 0 } // Will be calculated during analysis
    };
  }

  /**
   * Predict tire performance over race distance
   */
  public predictRacePerformance(
    compoundId: string,
    initialPressures: TirePressure,
    conditions: RacingConditions,
    carData: any,
    raceDistance: number // km
  ): {
    temperatureProgression: TireTemperature[][];
    wearProgression: number[][];
    gripProgression: number[][];
    pitStopRecommendation: {
      recommended: boolean;
      distance: number;
      reason: string;
      pressureAdjustments: { front: number; rear: number };
    };
  } {
    const compound = this.compounds.get(compoundId);
    if (!compound) {
      throw new Error(`Unknown tire compound: ${compoundId}`);
    }

    const intervals = Math.ceil(raceDistance / 5); // Every 5km
    const temperatureProgression: TireTemperature[][] = [];
    const wearProgression: number[][] = [];
    const gripProgression: number[][] = [];

    let currentTemps = { fl: conditions.ambientTemp + 10, fr: conditions.ambientTemp + 10,
                        rl: conditions.ambientTemp + 8, rr: conditions.ambientTemp + 8 };
    let currentWear = { fl: 0, fr: 0, rl: 0, rr: 0 };

    for (let i = 0; i <= intervals; i++) {
      // Update temperatures and wear
      const temps = this.calculateTireTemperatures(compound, initialPressures, conditions, carData, currentTemps);
      const wear = this.calculateTireWear(compound, temps, conditions, carData, currentWear);
      const grip = this.calculateGripLevels(compound, temps, {
        frontLeft: wear.frontLeft, frontRight: wear.frontRight, rearLeft: wear.rearLeft, rearRight: wear.rearRight,
        average: (wear.frontLeft + wear.frontRight + wear.rearLeft + wear.rearRight) / 4,
        distribution: 'even',
        remainingLife: 100
      }, conditions);

      temperatureProgression.push([
        temps.frontLeft, temps.frontRight, temps.rearLeft, temps.rearRight
      ]);
      wearProgression.push([wear.fl, wear.fr, wear.rl, wear.rr]);
      gripProgression.push([grip.frontAxle, grip.rearAxle]);

      // Update for next interval
      currentTemps = {
        fl: temps.frontLeft.average,
        fr: temps.frontRight.average,
        rl: temps.rearLeft.average,
        rr: temps.rearRight.average
      };
      currentWear = wear;
    }

    // Determine pit stop recommendation
    const maxWear = Math.max(...wearProgression[wearProgression.length - 1]);
    const pitStopRecommendation = {
      recommended: maxWear > 70,
      distance: wearProgression.findIndex(wears => Math.max(...wears) > 70) * 5,
      reason: maxWear > 70 ? 'Tire wear exceeding 70% - significant grip loss' : 'Tires in good condition',
      pressureAdjustments: { front: 0, rear: 0 }
    };

    return {
      temperatureProgression,
      wearProgression,
      gripProgression,
      pitStopRecommendation
    };
  }

  /**
   * Calculate tire temperatures based on conditions and usage
   */
  private calculateTireTemperatures(
    compound: TireCompound,
    pressures: TirePressure,
    conditions: RacingConditions,
    carData: any,
    currentTemps?: { fl: number; fr: number; rl: number; rr: number }
  ): {
    frontLeft: TireTemperature;
    frontRight: TireTemperature;
    rearLeft: TireTemperature;
    rearRight: TireTemperature;
  } {
    const baseTemp = conditions.trackTemp;
    const ambientTemp = conditions.ambientTemp;

    // Calculate heat generation based on car data
    const speedFactor = Math.min(1, carData.speed / 200); // Normalize speed effect
    const gForceFactor = Math.abs(carData.lateralG) * 0.5; // G-forces generate heat
    const weightFactor = carData.weight / 3000; // Heavier cars generate more heat

    const heatGeneration = (speedFactor + gForceFactor) * weightFactor * 20; // Base heat increase

    // Calculate temperatures for each tire
    const calculateTireTemp = (position: 'fl' | 'fr' | 'rl' | 'rr', loadFactor: number) => {
      const currentTemp = currentTemps?.[position] ?? baseTemp;
      const pressure = position.startsWith('f') ? pressures.front : pressures.rear;

      // Pressure affects heat dissipation (higher pressure = better cooling)
      const pressureFactor = 1 - (pressure - 25) * 0.01;

      // Position-specific factors
      let positionFactor = 1.0;
      if (position === 'fl') positionFactor = carData.driveType === 'FWD' ? 1.2 : 1.0;
      if (position === 'fr') positionFactor = carData.driveType === 'FWD' ? 1.2 : 1.0;
      if (position === 'rl') positionFactor = carData.driveType === 'RWD' ? 1.3 : 1.0;
      if (position === 'rr') positionFactor = carData.driveType === 'RWD' ? 1.3 : 1.0;

      // Aero cooling effect
      const aeroCooling = carData.aeroDownforce * 0.0001;

      // Calculate new temperature
      const newTemp = currentTemp + (heatGeneration * loadFactor * positionFactor * pressureFactor) - aeroCooling;

      // Compound-specific thermal behavior
      const thermalEfficiency = compound.thermalMass;
      const stabilizedTemp = ambientTemp + (newTemp - ambientTemp) * (1 - thermalEfficiency * 0.1);

      // Temperature distribution (simplified)
      const inner = stabilizedTemp - 5 + Math.random() * 10;
      const outer = stabilizedTemp - 5 + Math.random() * 10;
      const middle = (inner + outer) / 2 + Math.random() * 5;

      const average = (inner + middle + outer) / 3;

      // Determine distribution
      const diff = Math.max(inner, outer) - Math.min(inner, outer);
      let distribution: TireTemperature['distribution'] = 'balanced';
      if (diff > 15) {
        distribution = inner > outer ? 'inner-hot' : 'outer-hot';
      }

      // Stability assessment
      let stability: TireTemperature['stability'] = 'stable';
      if (Math.abs(newTemp - currentTemp) > 10) {
        stability = newTemp > currentTemp ? 'heating' : 'cooling';
      } else if (average > compound.optimalTempRange.max + 20) {
        stability = 'critical';
      }

      return {
        inner: Math.round(inner),
        middle: Math.round(middle),
        outer: Math.round(outer),
        average: Math.round(average),
        distribution,
        stability
      };
    };

    return {
      frontLeft: calculateTireTemp('fl', carData.weightDistribution / 100 * 1.1),
      frontRight: calculateTireTemp('fr', carData.weightDistribution / 100 * 1.1),
      rearLeft: calculateTireTemp('rl', (100 - carData.weightDistribution) / 100 * 0.9),
      rearRight: calculateTireTemp('rr', (100 - carData.weightDistribution) / 100 * 0.9)
    };
  }

  /**
   * Calculate tire wear patterns
   */
  private calculateTireWear(
    compound: TireCompound,
    temperatures: any,
    conditions: RacingConditions,
    carData: any,
    currentWear?: { fl: number; fr: number; rl: number; rr: number }
  ): TireWear {
    const wearRate = (1 - compound.wearResistance) * 10; // Base wear rate
    const speedFactor = Math.min(1, carData.speed / 250); // Higher speed = more wear
    const gForceFactor = Math.abs(carData.lateralG) * 2; // Sliding wears tires faster

    const calculateWear = (temp: TireTemperature, position: string, current: number = 0) => {
      let wear = current;

      // Temperature effect (optimal temp range wears less)
      let tempWearFactor = 1.0;
      if (temp.average < compound.optimalTempRange.min) {
        tempWearFactor = 1.5; // Cold tires wear more
      } else if (temp.average > compound.optimalTempRange.max) {
        tempWearFactor = 1.3; // Hot tires wear more
      } else {
        tempWearFactor = 0.8; // Optimal range wears less
      }

      // Track condition effect
      let trackWearFactor = 1.0;
      switch (conditions.weather) {
        case 'wet': trackWearFactor = 1.5; break;
        case 'damp': trackWearFactor = 1.2; break;
        case 'flooded': trackWearFactor = 2.0; break;
      }

      // Add wear increment
      wear += wearRate * speedFactor * gForceFactor * tempWearFactor * trackWearFactor;

      return Math.min(100, wear);
    };

    const fl = calculateWear(temperatures.frontLeft, 'fl', currentWear?.fl);
    const fr = calculateWear(temperatures.frontRight, 'fr', currentWear?.fr);
    const rl = calculateWear(temperatures.rearLeft, 'rl', currentWear?.rl);
    const rr = calculateWear(temperatures.rearRight, 'rr', currentWear?.rr);

    const average = (fl + fr + rl + rr) / 4;

    // Determine wear distribution
    let distribution: TireWear['distribution'] = 'even';
    const frontAvg = (fl + fr) / 2;
    const rearAvg = (rl + rr) / 2;

    if (frontAvg > rearAvg + 20) distribution = 'front-heavy';
    else if (rearAvg > frontAvg + 20) distribution = 'rear-heavy';
    else if (Math.abs(fl - fr) > 30 || Math.abs(rl - rr) > 30) distribution = 'diagonal';

    // Estimate remaining life (laps until 80% wear)
    const remainingLife = Math.max(0, (80 - average) / (wearRate * 2)); // Rough estimate

    return {
      frontLeft: Math.round(fl * 10) / 10,
      frontRight: Math.round(fr * 10) / 10,
      rearLeft: Math.round(rl * 10) / 10,
      rearRight: Math.round(rr * 10) / 10,
      average: Math.round(average * 10) / 10,
      distribution,
      remainingLife: Math.round(remainingLife)
    };
  }

  /**
   * Calculate grip levels based on temperatures and wear
   */
  private calculateGripLevels(
    compound: TireCompound,
    temperatures: any,
    wear: TireWear,
    conditions: RacingConditions
  ): TireAnalysis['gripLevels'] {
    const calculateGrip = (temp: TireTemperature, wearPct: number) => {
      // Base grip from temperature
      let grip = compound.gripCurve.coldGrip;

      if (temp.average < compound.optimalTempRange.min) {
        // Cold tires - reduced grip
        const coldFactor = (temp.average - compound.optimalTempRange.min + 20) / 20;
        grip = compound.gripCurve.coldGrip * Math.max(0.6, coldFactor);
      } else if (temp.average > compound.optimalTempRange.max) {
        // Hot tires - degraded grip
        const hotFactor = Math.max(0.7, 1 - (temp.average - compound.optimalTempRange.max) * 0.02);
        grip = compound.gripCurve.optimalGrip * hotFactor;
      } else {
        // Optimal temperature range
        grip = compound.gripCurve.optimalGrip;
      }

      // Wear effect (more worn = less grip)
      const wearFactor = Math.max(0.6, 1 - (wearPct / 100) * 0.4);
      grip *= wearFactor;

      // Weather effect
      switch (conditions.weather) {
        case 'damp': grip *= 0.85; break;
        case 'wet': grip *= 0.65; break;
        case 'flooded': grip *= 0.45; break;
      }

      return Math.max(0.3, Math.min(1.0, grip));
    };

    const frontLeftGrip = calculateGrip(temperatures.frontLeft, wear.frontLeft);
    const frontRightGrip = calculateGrip(temperatures.frontRight, wear.frontRight);
    const rearLeftGrip = calculateGrip(temperatures.rearLeft, wear.rearLeft);
    const rearRightGrip = calculateGrip(temperatures.rearRight, wear.rearRight);

    const frontAxle = (frontLeftGrip + frontRightGrip) / 2;
    const rearAxle = (rearLeftGrip + rearRightGrip) / 2;

    // Balance calculation (-1 = understeer, 0 = neutral, 1 = oversteer)
    const balance = Math.max(-1, Math.min(1, (rearAxle - frontAxle) * 2));

    return {
      frontAxle,
      rearAxle,
      balance
    };
  }

  /**
   * Generate setup recommendations based on analysis
   */
  private generateRecommendations(
    compound: TireCompound,
    pressures: TirePressure,
    temperatures: any,
    wear: TireWear,
    conditions: RacingConditions,
    sessionProgress?: any
  ): TireAnalysis['recommendations'] {
    const recommendations: TireAnalysis['recommendations'] = {
      pressureAdjustments: { front: 0, rear: 0 },
      setupChanges: [],
      riskFactors: [],
      predictedPerformance: 100
    };

    // Pressure adjustments based on temperature
    const avgFrontTemp = (temperatures.frontLeft.average + temperatures.frontRight.average) / 2;
    const avgRearTemp = (temperatures.rearLeft.average + temperatures.rearRight.average) / 2;

    const optimalTemp = (compound.optimalTempRange.min + compound.optimalTempRange.max) / 2;

    if (avgFrontTemp < optimalTemp - 10) {
      recommendations.pressureAdjustments.front = -1;
      recommendations.setupChanges.push('Reduce front tire pressure by 1 PSI to increase working range');
    } else if (avgFrontTemp > optimalTemp + 10) {
      recommendations.pressureAdjustments.front = 1;
      recommendations.setupChanges.push('Increase front tire pressure by 1 PSI to reduce overheating');
    }

    if (avgRearTemp < optimalTemp - 10) {
      recommendations.pressureAdjustments.rear = -1;
      recommendations.setupChanges.push('Reduce rear tire pressure by 1 PSI to increase working range');
    } else if (avgRearTemp > optimalTemp + 10) {
      recommendations.pressureAdjustments.rear = 1;
      recommendations.setupChanges.push('Increase rear tire pressure by 1 PSI to reduce overheating');
    }

    // Temperature distribution issues
    Object.entries(temperatures).forEach(([position, temp]: [string, any]) => {
      if (temp.distribution === 'inner-hot') {
        recommendations.setupChanges.push(`Add negative camber to ${position} tires to even temperature distribution`);
      } else if (temp.distribution === 'outer-hot') {
        recommendations.setupChanges.push(`Reduce negative camber on ${position} tires`);
      }

      if (temp.stability === 'critical') {
        recommendations.riskFactors.push(`${position.toUpperCase()} tire critically overheated - reduce speed or adjust setup`);
      }
    });

    // Wear distribution issues
    if (wear.distribution === 'front-heavy') {
      recommendations.setupChanges.push('Soften front dampers or reduce front ride height to reduce front wear');
    } else if (wear.distribution === 'rear-heavy') {
      recommendations.setupChanges.push('Soften rear dampers or reduce rear ride height to reduce rear wear');
    }

    // Performance prediction
    const avgTempDeviation = Math.abs(avgFrontTemp - optimalTemp) + Math.abs(avgRearTemp - optimalTemp);
    recommendations.predictedPerformance = Math.max(60, 100 - (avgTempDeviation / 2) - (wear.average * 0.5));

    return recommendations;
  }

  /**
   * Initialize tire compound database
   */
  private initializeTireCompounds(): void {
    const compounds: TireCompound[] = [
      {
        id: 'street',
        name: 'Street',
        category: 'street',
        optimalTempRange: { min: 70, max: 90 },
        thermalMass: 1.2,
        gripCurve: {
          coldGrip: 0.75,
          optimalGrip: 0.85,
          overheatedGrip: 0.7,
          transitionTemp: 80
        },
        wearResistance: 0.9,
        rollingResistance: 1.0,
        aquaplaningResistance: 0.6,
        costFactor: 1.0
      },
      {
        id: 'sport',
        name: 'Sport',
        category: 'sport',
        optimalTempRange: { min: 75, max: 95 },
        thermalMass: 1.0,
        gripCurve: {
          coldGrip: 0.8,
          optimalGrip: 0.92,
          overheatedGrip: 0.75,
          transitionTemp: 85
        },
        wearResistance: 0.7,
        rollingResistance: 0.9,
        aquaplaningResistance: 0.7,
        costFactor: 1.5
      },
      {
        id: 'semi-slick',
        name: 'Semi-Slick',
        category: 'semi-slick',
        optimalTempRange: { min: 80, max: 105 },
        thermalMass: 0.8,
        gripCurve: {
          coldGrip: 0.7,
          optimalGrip: 0.98,
          overheatedGrip: 0.8,
          transitionTemp: 95
        },
        wearResistance: 0.4,
        rollingResistance: 0.7,
        aquaplaningResistance: 0.5,
        costFactor: 2.5
      },
      {
        id: 'slick',
        name: 'Slick/Race',
        category: 'slick',
        optimalTempRange: { min: 85, max: 110 },
        thermalMass: 0.6,
        gripCurve: {
          coldGrip: 0.65,
          optimalGrip: 1.0,
          overheatedGrip: 0.82,
          transitionTemp: 100
        },
        wearResistance: 0.2,
        rollingResistance: 0.6,
        aquaplaningResistance: 0.3,
        costFactor: 4.0
      },
      {
        id: 'rally',
        name: 'Rally',
        category: 'rally',
        optimalTempRange: { min: 65, max: 85 },
        thermalMass: 1.4,
        gripCurve: {
          coldGrip: 0.78,
          optimalGrip: 0.88,
          overheatedGrip: 0.72,
          transitionTemp: 75
        },
        wearResistance: 0.8,
        rollingResistance: 0.95,
        aquaplaningResistance: 0.8,
        costFactor: 2.0
      },
      {
        id: 'offroad',
        name: 'Off-Road',
        category: 'offroad',
        optimalTempRange: { min: 60, max: 80 },
        thermalMass: 1.6,
        gripCurve: {
          coldGrip: 0.82,
          optimalGrip: 0.9,
          overheatedGrip: 0.75,
          transitionTemp: 70
        },
        wearResistance: 1.0,
        rollingResistance: 1.1,
        aquaplaningResistance: 0.9,
        costFactor: 1.8
      },
      {
        id: 'drag',
        name: 'Drag',
        category: 'drag',
        optimalTempRange: { min: 90, max: 120 },
        thermalMass: 0.4,
        gripCurve: {
          coldGrip: 0.6,
          optimalGrip: 0.95,
          overheatedGrip: 0.85,
          transitionTemp: 105
        },
        wearResistance: 0.1,
        rollingResistance: 0.8,
        aquaplaningResistance: 0.2,
        costFactor: 3.0
      }
    ];

    compounds.forEach(compound => this.compounds.set(compound.id, compound));
  }

  /**
   * Get all available tire compounds
   */
  public getAvailableCompounds(): TireCompound[] {
    return Array.from(this.compounds.values());
  }

  /**
   * Get compound by ID
   */
  public getCompound(compoundId: string): TireCompound | undefined {
    return this.compounds.get(compoundId);
  }

  /**
   * Compare tire compounds for given conditions
   */
  public compareCompounds(
    compoundIds: string[],
    conditions: RacingConditions,
    carData: any
  ): Array<{
    compound: TireCompound;
    predictedPerformance: number;
    wearRate: number;
    costEfficiency: number;
    recommendation: string;
  }> {
    return compoundIds.map(id => {
      const compound = this.compounds.get(id);
      if (!compound) return null;

      const analysis = this.analyzeTirePerformance(id, {
        front: 30, rear: 28, targetFront: 30, targetRear: 28, thermalAdjustment: { front: 0, rear: 0 }
      }, conditions, carData);

      const predictedPerformance = analysis.recommendations.predictedPerformance;
      const wearRate = (1 - compound.wearResistance) * 10;
      const costEfficiency = predictedPerformance / compound.costFactor;

      let recommendation = 'Suitable for ';
      switch (compound.category) {
        case 'street': recommendation += 'street and track day use'; break;
        case 'sport': recommendation += 'circuit racing with moderate wear'; break;
        case 'semi-slick': recommendation += 'professional circuit racing'; break;
        case 'slick': recommendation += 'maximum grip racing (high wear)'; break;
        case 'rally': recommendation += 'mixed surface rallying'; break;
        case 'offroad': recommendation += 'off-road and cross-country'; break;
        case 'drag': recommendation += 'drag strip launches'; break;
      }

      return {
        compound,
        predictedPerformance,
        wearRate,
        costEfficiency,
        recommendation
      };
    }).filter(Boolean) as any[];
  }
}

export default AdvancedTireModeling;