/**
 * Advanced Environmental Modeling for Forza Horizon 5 Tuning
 * Simulates weather, temperature, track conditions, and their effects on performance
 * Provides sophisticated predictions for different racing scenarios
 */

export interface EnvironmentalConditions {
  weather: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow';
  temperature: number; // Celsius
  humidity: number; // 0-100%
  windSpeed: number; // km/h
  windDirection: number; // degrees (0 = headwind, 180 = tailwind)
  trackTemperature: number; // Celsius (surface temperature)
  trackCondition: 'dry' | 'damp' | 'wet' | 'flooded' | 'icy';
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
  altitude: number; // meters above sea level
  airPressure: number; // hPa (hectopascals)
}

export interface EnvironmentalEffects {
  tireGripMultiplier: number; // 0.0 - 2.0 (multiplier on baseline grip)
  brakePerformanceMultiplier: number; // 0.0 - 1.5
  aeroEfficiencyMultiplier: number; // 0.8 - 1.2
  enginePowerMultiplier: number; // 0.85 - 1.15
  coolingEfficiencyMultiplier: number; // 0.7 - 1.3
  tireWearRateMultiplier: number; // 0.5 - 3.0
  fuelConsumptionMultiplier: number; // 0.9 - 1.4
  handlingStabilityMultiplier: number; // 0.8 - 1.1
  predictedLapTimeAdjustment: number; // seconds added/subtracted from dry lap time
}

export interface TrackCharacteristics {
  id: string;
  name: string;
  length: number; // meters
  corners: number;
  elevationChange: number; // meters
  surfaceType: 'asphalt' | 'concrete' | 'gravel' | 'dirt' | 'snow' | 'ice';
  averageCornerSpeed: number; // km/h
  maxStraightSpeed: number; // km/h
  tireWearZones: Array<{
    start: number; // percentage of track
    end: number;
    wearMultiplier: number;
  }>;
  environmentalSensitivity: {
    weather: number; // 0-1, how much weather affects this track
    temperature: number; // 0-1, how much temperature affects this track
    wind: number; // 0-1, how much wind affects this track
  };
}

export class AdvancedEnvironmentalModeling {
  private trackDatabase: Map<string, TrackCharacteristics> = new Map();

  constructor() {
    this.initializeTrackDatabase();
  }

  /**
   * Calculate environmental effects on vehicle performance
   */
  public calculateEnvironmentalEffects(
    conditions: EnvironmentalConditions,
    trackId?: string
  ): EnvironmentalEffects {
    const track = trackId ? this.trackDatabase.get(trackId) : null;

    // Base multipliers (clear, 20°C, dry track)
    const baseEffects: EnvironmentalEffects = {
      tireGripMultiplier: 1.0,
      brakePerformanceMultiplier: 1.0,
      aeroEfficiencyMultiplier: 1.0,
      enginePowerMultiplier: 1.0,
      coolingEfficiencyMultiplier: 1.0,
      tireWearRateMultiplier: 1.0,
      fuelConsumptionMultiplier: 1.0,
      handlingStabilityMultiplier: 1.0,
      predictedLapTimeAdjustment: 0
    };

    // Apply weather effects
    const weatherEffects = this.calculateWeatherEffects(conditions.weather, conditions.humidity);
    this.applyEffects(baseEffects, weatherEffects);

    // Apply temperature effects
    const temperatureEffects = this.calculateTemperatureEffects(conditions.temperature, conditions.trackTemperature);
    this.applyEffects(baseEffects, temperatureEffects);

    // Apply wind effects
    const windEffects = this.calculateWindEffects(conditions.windSpeed, conditions.windDirection);
    this.applyEffects(baseEffects, windEffects);

    // Apply altitude/air pressure effects
    const altitudeEffects = this.calculateAltitudeEffects(conditions.altitude, conditions.airPressure);
    this.applyEffects(baseEffects, altitudeEffects);

    // Apply time of day effects
    const timeEffects = this.calculateTimeOfDayEffects(conditions.timeOfDay);
    this.applyEffects(baseEffects, timeEffects);

    // Apply track-specific effects
    if (track) {
      const trackEffects = this.calculateTrackSpecificEffects(conditions, track);
      this.applyEffects(baseEffects, trackEffects);
    }

    // Calculate overall lap time adjustment
    baseEffects.predictedLapTimeAdjustment = this.calculateLapTimeAdjustment(baseEffects);

    return baseEffects;
  }

  /**
   * Calculate weather-based performance effects
   */
  private calculateWeatherEffects(weather: string, humidity: number): Partial<EnvironmentalEffects> {
    const effects: Partial<EnvironmentalEffects> = {};

    switch (weather) {
      case 'clear':
        // Baseline conditions - no modifiers
        effects.tireGripMultiplier = 1.0;
        effects.aeroEfficiencyMultiplier = 1.0;
        effects.tireWearRateMultiplier = 1.0;
        break;

      case 'cloudy':
        // Slightly cooler, less UV degradation
        effects.tireGripMultiplier = 0.98;
        effects.aeroEfficiencyMultiplier = 0.99;
        effects.tireWearRateMultiplier = 0.95;
        break;

      case 'rain':
        // Significant grip reduction, increased drag, faster tire wear
        effects.tireGripMultiplier = 0.65 - (humidity * 0.002); // Humidity affects water film
        effects.brakePerformanceMultiplier = 0.75;
        effects.aeroEfficiencyMultiplier = 1.05; // More drag from wet air
        effects.tireWearRateMultiplier = 1.8;
        effects.fuelConsumptionMultiplier = 1.1;
        effects.handlingStabilityMultiplier = 0.9;
        break;

      case 'storm':
        // Heavy rain with wind effects
        effects.tireGripMultiplier = 0.55 - (humidity * 0.003);
        effects.brakePerformanceMultiplier = 0.65;
        effects.aeroEfficiencyMultiplier = 1.15;
        effects.tireWearRateMultiplier = 2.5;
        effects.fuelConsumptionMultiplier = 1.2;
        effects.handlingStabilityMultiplier = 0.8;
        break;

      case 'snow':
        // Severe grip loss, very high tire wear
        effects.tireGripMultiplier = 0.35;
        effects.brakePerformanceMultiplier = 0.5;
        effects.aeroEfficiencyMultiplier = 1.1;
        effects.tireWearRateMultiplier = 3.0;
        effects.fuelConsumptionMultiplier = 1.3;
        effects.handlingStabilityMultiplier = 0.75;
        break;
    }

    // Humidity effects (independent of weather)
    if (humidity > 70) {
      effects.tireGripMultiplier = (effects.tireGripMultiplier || 1.0) * (1 - (humidity - 70) * 0.003);
      effects.brakePerformanceMultiplier = (effects.brakePerformanceMultiplier || 1.0) * (1 - (humidity - 70) * 0.002);
    }

    return effects;
  }

  /**
   * Calculate temperature-based performance effects
   */
  private calculateTemperatureEffects(airTemp: number, trackTemp: number): Partial<EnvironmentalEffects> {
    const effects: Partial<EnvironmentalEffects> = {};

    // Use track temperature for tire grip (more relevant than air temp)
    const effectiveTemp = trackTemp;

    // Optimal tire temperature range: 80-100°C for most compounds
    let tireTempFactor = 1.0;
    if (effectiveTemp < 70) {
      tireTempFactor = 0.7 + (effectiveTemp - 50) * 0.015; // Cold tires
    } else if (effectiveTemp > 110) {
      tireTempFactor = 1.0 - (effectiveTemp - 110) * 0.01; // Overheated tires
    } else if (effectiveTemp >= 80 && effectiveTemp <= 100) {
      tireTempFactor = 1.0; // Optimal range
    } else {
      tireTempFactor = 0.9 + (effectiveTemp - 70) * 0.025; // Warming up
    }

    effects.tireGripMultiplier = Math.max(0.5, tireTempFactor);

    // Air temperature effects on engine and aero
    if (airTemp < 0) {
      // Cold air: denser, more power but more drag
      effects.enginePowerMultiplier = 1.02 + (airTemp * 0.001); // Slight power increase
      effects.aeroEfficiencyMultiplier = 1.03; // More drag
      effects.coolingEfficiencyMultiplier = 0.85; // Harder to cool
    } else if (airTemp > 30) {
      // Hot air: less dense, less power, better cooling
      effects.enginePowerMultiplier = 0.98 - ((airTemp - 30) * 0.003);
      effects.aeroEfficiencyMultiplier = 0.97;
      effects.coolingEfficiencyMultiplier = 1.1;
      effects.fuelConsumptionMultiplier = 1.05;
    }

    // Brake temperature effects
    if (effectiveTemp < 50) {
      effects.brakePerformanceMultiplier = 0.9; // Cold brakes less effective
    } else if (effectiveTemp > 150) {
      effects.brakePerformanceMultiplier = 0.85; // Overheated brakes fade
    }

    return effects;
  }

  /**
   * Calculate wind effects on performance
   */
  private calculateWindEffects(windSpeed: number, windDirection: number): Partial<EnvironmentalEffects> {
    const effects: Partial<EnvironmentalEffects> = {};

    if (windSpeed < 5) return effects; // Negligible wind

    // Convert wind direction to angle effect (0 = headwind, 180 = tailwind)
    const angleRadians = (windDirection * Math.PI) / 180;
    const headwindComponent = Math.cos(angleRadians); // -1 to 1
    const crosswindComponent = Math.sin(angleRadians); // -1 to 1

    // Aerodynamic effects
    const aeroEffect = 1 + (headwindComponent * windSpeed * 0.002);
    effects.aeroEfficiencyMultiplier = Math.max(0.8, Math.min(1.2, aeroEffect));

    // Stability effects from crosswind
    const stabilityEffect = 1 - (Math.abs(crosswindComponent) * windSpeed * 0.001);
    effects.handlingStabilityMultiplier = Math.max(0.85, stabilityEffect);

    // Fuel consumption (fighting wind increases drag)
    if (headwindComponent > 0.3) {
      effects.fuelConsumptionMultiplier = 1 + (headwindComponent * windSpeed * 0.001);
    }

    return effects;
  }

  /**
   * Calculate altitude and air pressure effects
   */
  private calculateAltitudeEffects(altitude: number, pressure: number): Partial<EnvironmentalEffects> {
    const effects: Partial<EnvironmentalEffects> = {};

    // Standard atmospheric pressure decreases with altitude
    // Standard pressure at sea level: 1013.25 hPa
    const pressureRatio = pressure / 1013.25;

    // Engine power decreases with lower air density
    effects.enginePowerMultiplier = pressureRatio * 0.95 + 0.05; // 5% minimum

    // Aerodynamic efficiency changes with air density
    effects.aeroEfficiencyMultiplier = pressureRatio * 0.9 + 0.1;

    // Cooling efficiency (thinner air = better cooling)
    effects.coolingEfficiencyMultiplier = (1 / pressureRatio) * 0.8 + 0.2;

    // Fuel mixture may need adjustment
    effects.fuelConsumptionMultiplier = pressureRatio * 0.9 + 0.1;

    return effects;
  }

  /**
   * Calculate time of day effects
   */
  private calculateTimeOfDayEffects(timeOfDay: string): Partial<EnvironmentalEffects> {
    const effects: Partial<EnvironmentalEffects> = {};

    switch (timeOfDay) {
      case 'dawn':
      case 'dusk':
        // Low light, cooler temperatures
        effects.tireGripMultiplier = 0.98;
        effects.aeroEfficiencyMultiplier = 0.99;
        break;

      case 'night':
        // Cooler ambient temperatures, possibly different visibility
        effects.tireGripMultiplier = 0.96;
        effects.aeroEfficiencyMultiplier = 0.98;
        effects.coolingEfficiencyMultiplier = 0.9;
        break;

      case 'morning':
      case 'afternoon':
        // Standard conditions
        break;

      case 'noon':
        // Hottest part of day
        effects.tireGripMultiplier = 1.01;
        effects.coolingEfficiencyMultiplier = 1.05;
        break;
    }

    return effects;
  }

  /**
   * Calculate track-specific environmental effects
   */
  private calculateTrackSpecificEffects(
    conditions: EnvironmentalConditions,
    track: TrackCharacteristics
  ): Partial<EnvironmentalEffects> {
    const effects: Partial<EnvironmentalEffects> = {};

    // Weather sensitivity
    const weatherMultiplier = 1 + (track.environmentalSensitivity.weather *
      (conditions.weather === 'rain' || conditions.weather === 'storm' ? 0.3 :
       conditions.weather === 'snow' ? 0.5 : 0));

    effects.tireGripMultiplier = weatherMultiplier;
    effects.handlingStabilityMultiplier = 1 / weatherMultiplier;

    // Temperature sensitivity
    const tempMultiplier = 1 + (track.environmentalSensitivity.temperature *
      (Math.abs(conditions.temperature - 20) / 50)); // 20°C is baseline

    effects.tireWearRateMultiplier = tempMultiplier;

    // Wind sensitivity (affects aero-dependent tracks)
    const windMultiplier = 1 + (track.environmentalSensitivity.wind *
      (conditions.windSpeed / 50)); // 50 km/h baseline

    effects.aeroEfficiencyMultiplier = windMultiplier;

    return effects;
  }

  /**
   * Calculate overall lap time adjustment from all effects
   */
  private calculateLapTimeAdjustment(effects: EnvironmentalEffects): number {
    // Simplified lap time calculation based on performance multipliers
    // In a real implementation, this would be more sophisticated

    const gripEffect = (effects.tireGripMultiplier - 1) * 3; // Grip affects cornering speed
    const aeroEffect = (effects.aeroEfficiencyMultiplier - 1) * 2; // Aero affects straight-line speed
    const powerEffect = (effects.enginePowerMultiplier - 1) * 1.5; // Power affects acceleration
    const brakeEffect = (effects.brakePerformanceMultiplier - 1) * 1; // Braking affects corner entry

    return -(gripEffect + aeroEffect + powerEffect + brakeEffect); // Negative = faster
  }

  /**
   * Apply effects by multiplying existing values
   */
  private applyEffects(target: EnvironmentalEffects, source: Partial<EnvironmentalEffects>): void {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key as keyof EnvironmentalEffects];
      if (sourceValue !== undefined) {
        const targetKey = key as keyof EnvironmentalEffects;
        const currentValue = target[targetKey] || 1.0;
        (target as any)[targetKey] = currentValue * sourceValue;
      }
    });
  }

  /**
   * Predict performance degradation over race distance
   */
  public predictRaceDegradation(
    conditions: EnvironmentalConditions,
    raceDistance: number, // km
    tireCompound: string
  ): {
    tireWear: number[]; // wear percentage at each 10km interval
    performanceDrop: number[]; // performance multiplier at each interval
    pitStopRecommendation: {
      recommended: boolean;
      distance: number; // km into race
      reason: string;
    };
  } {
    const intervals = Math.ceil(raceDistance / 10); // Every 10km
    const tireWear: number[] = [];
    const performanceDrop: number[] = [];

    let currentWear = 0;
    const wearRate = this.calculateWearRate(conditions, tireCompound);

    for (let i = 0; i <= intervals; i++) {
      const distance = i * 10;
      currentWear = Math.min(100, currentWear + (wearRate * 10));

      tireWear.push(currentWear);

      // Performance drops as tires wear
      const wearMultiplier = 1 - (currentWear / 100) * 0.4; // 40% performance loss at 100% wear
      performanceDrop.push(wearMultiplier);
    }

    // Recommend pit stop if wear exceeds 70%
    const pitStopRecommendation = {
      recommended: tireWear.some(wear => wear > 70),
      distance: tireWear.findIndex(wear => wear > 70) * 10,
      reason: 'Tire wear exceeding 70% - performance degradation significant'
    };

    return {
      tireWear,
      performanceDrop,
      pitStopRecommendation
    };
  }

  /**
   * Calculate tire wear rate based on conditions
   */
  private calculateWearRate(conditions: EnvironmentalConditions, tireCompound: string): number {
    let baseWear = 1.0;

    // Weather effects on wear
    switch (conditions.weather) {
      case 'rain':
      case 'storm': baseWear *= 2.0; break;
      case 'snow': baseWear *= 3.0; break;
      case 'clear': baseWear *= 1.0; break;
      case 'cloudy': baseWear *= 0.9; break;
    }

    // Temperature effects
    if (conditions.trackTemperature > 100) baseWear *= 1.5;
    else if (conditions.trackTemperature < 60) baseWear *= 0.7;

    // Compound-specific wear rates
    const compoundMultipliers: Record<string, number> = {
      'street': 1.5,
      'sport': 1.2,
      'semi-slick': 1.0,
      'slick': 0.8,
      'rally': 0.9,
      'offroad': 0.7,
      'drag': 2.0
    };

    baseWear *= compoundMultipliers[tireCompound] || 1.0;

    return baseWear;
  }

  /**
   * Get track characteristics
   */
  public getTrack(trackId: string): TrackCharacteristics | undefined {
    return this.trackDatabase.get(trackId);
  }

  /**
   * Add or update track data
   */
  public updateTrack(track: TrackCharacteristics): void {
    this.trackDatabase.set(track.id, track);
  }

  /**
   * Initialize track database with Forza Horizon 5 tracks
   */
  private initializeTrackDatabase(): void {
    const tracks: TrackCharacteristics[] = [
      {
        id: 'goliath',
        name: 'Goliath - Festival Arena',
        length: 1800,
        corners: 8,
        elevationChange: 15,
        surfaceType: 'asphalt',
        averageCornerSpeed: 85,
        maxStraightSpeed: 180,
        tireWearZones: [
          { start: 0.2, end: 0.4, wearMultiplier: 1.5 },
          { start: 0.6, end: 0.8, wearMultiplier: 1.3 }
        ],
        environmentalSensitivity: { weather: 0.8, temperature: 0.9, wind: 0.6 }
      },
      {
        id: 'mountain-circuit',
        name: 'Mountain Circuit',
        length: 4200,
        corners: 15,
        elevationChange: 120,
        surfaceType: 'asphalt',
        averageCornerSpeed: 75,
        maxStraightSpeed: 160,
        tireWearZones: [
          { start: 0.1, end: 0.3, wearMultiplier: 1.4 },
          { start: 0.5, end: 0.7, wearMultiplier: 1.6 }
        ],
        environmentalSensitivity: { weather: 0.9, temperature: 0.8, wind: 0.8 }
      },
      {
        id: 'rally-stage',
        name: 'Rally Stage',
        length: 8500,
        corners: 25,
        elevationChange: 200,
        surfaceType: 'gravel',
        averageCornerSpeed: 65,
        maxStraightSpeed: 140,
        tireWearZones: [
          { start: 0, end: 1, wearMultiplier: 2.5 } // High wear throughout
        ],
        environmentalSensitivity: { weather: 0.95, temperature: 0.85, wind: 0.7 }
      }
    ];

    tracks.forEach(track => this.trackDatabase.set(track.id, track));
  }

  /**
   * Generate weather forecast predictions
   */
  public generateWeatherForecast(
    currentConditions: EnvironmentalConditions,
    hoursAhead: number
  ): EnvironmentalConditions[] {
    const forecast: EnvironmentalConditions[] = [];

    for (let hour = 1; hour <= hoursAhead; hour++) {
      const predicted: EnvironmentalConditions = { ...currentConditions };

      // Simple weather progression (in real implementation, use weather API)
      predicted.temperature += (Math.random() - 0.5) * 4; // ±2°C variation
      predicted.humidity += (Math.random() - 0.5) * 20; // ±10% variation
      predicted.windSpeed += (Math.random() - 0.5) * 10; // ±5 km/h variation

      // Clamp values to realistic ranges
      predicted.temperature = Math.max(-10, Math.min(45, predicted.temperature));
      predicted.humidity = Math.max(10, Math.min(100, predicted.humidity));
      predicted.windSpeed = Math.max(0, predicted.windSpeed);

      // Update track temperature based on air temp and time
      predicted.trackTemperature = predicted.temperature + 10 + (Math.random() * 10);

      forecast.push(predicted);
    }

    return forecast;
  }

  /**
   * Optimize setup for specific environmental conditions
   */
  public optimizeForConditions(
    baseSetup: any, // Would be TuneSettings in real implementation
    conditions: EnvironmentalConditions,
    trackId?: string
  ): {
    recommendedAdjustments: Record<string, number>;
    reasoning: string[];
    expectedImprovement: number;
  } {
    const effects = this.calculateEnvironmentalEffects(conditions, trackId);
    const recommendations: Record<string, number> = {};
    const reasoning: string[] = [];

    // Tire pressure adjustments based on temperature
    if (effects.tireGripMultiplier < 0.9) {
      recommendations.tirePressureFront = -1; // Reduce pressure for more contact
      recommendations.tirePressureRear = -1;
      reasoning.push('Reduce tire pressures to increase contact patch in poor conditions');
    } else if (effects.tireGripMultiplier > 1.1) {
      recommendations.tirePressureFront = 1; // Increase pressure for stability
      recommendations.tirePressureRear = 1;
      reasoning.push('Increase tire pressures to reduce rolling resistance in optimal conditions');
    }

    // Aero adjustments for wind
    if (effects.aeroEfficiencyMultiplier > 1.1) {
      recommendations.aeroFront = -2; // Reduce downforce to combat drag
      reasoning.push('Reduce front wing angle to decrease drag in windy conditions');
    } else if (effects.aeroEfficiencyMultiplier < 0.9) {
      recommendations.aeroFront = 2; // Increase downforce
      reasoning.push('Increase front wing angle for better stability in calm conditions');
    }

    // Gear ratio adjustments for power changes
    if (effects.enginePowerMultiplier < 0.95) {
      recommendations.finalDrive = -0.05; // Shorter gearing for acceleration
      reasoning.push('Shorten final drive to compensate for power loss');
    }

    const expectedImprovement = Math.abs(Object.keys(recommendations).length * 0.5); // Rough estimate

    return {
      recommendedAdjustments: recommendations,
      reasoning,
      expectedImprovement
    };
  }
}

export default AdvancedEnvironmentalModeling;