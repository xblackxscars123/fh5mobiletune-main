import { CarSpecs, TuneType, TuneSettings } from './tuningCalculator';

export interface TuningSetting {
  key: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  affectsPI: boolean;
}

export interface PerformanceImpact {
  handling: number; // -100 to +100
  grip: number;
  stability: number;
  responsiveness: number;
  estimatedPI: number;
  warnings: string[];
  improvements: string[];
}

export interface TuningSuggestion {
  setting: string;
  value: number;
  reason: string;
  impact: PerformanceImpact;
  confidence: number; // 0-100
}

export interface TuneProfile {
  id: string;
  name: string;
  carName: string;
  tuneType: TuneType;
  settings: TuneSettings;
  performance: PerformanceImpact;
  createdAt: Date;
  notes: string;
}

export interface TuneComparison {
  differences: Array<{
    setting: string;
    profile1: number;
    profile2: number;
    delta: number;
  }>;
  performanceDelta: {
    handling: number;
    grip: number;
    stability: number;
    responsiveness: number;
  };
}

// Setting limits and constraints
const SETTING_LIMITS: Record<string, TuningSetting> = {
  arbFront: { key: 'arbFront', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  arbRear: { key: 'arbRear', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  tirePressureFront: { key: 'tirePressureFront', value: 0, min: 25, max: 50, unit: 'PSI', affectsPI: false },
  tirePressureRear: { key: 'tirePressureRear', value: 0, min: 25, max: 50, unit: 'PSI', affectsPI: false },
  springsFront: { key: 'springsFront', value: 0, min: 1, max: 50, unit: 'kgf/cm', affectsPI: true },
  springsRear: { key: 'springsRear', value: 0, min: 1, max: 50, unit: 'kgf/cm', affectsPI: true },
  camberFront: { key: 'camberFront', value: 0, min: -3, max: 0, unit: '°', affectsPI: false },
  camberRear: { key: 'camberRear', value: 0, min: -3, max: 0, unit: '°', affectsPI: false },
  toeFront: { key: 'toeFront', value: 0, min: -0.5, max: 0.5, unit: '°', affectsPI: false },
  toeRear: { key: 'toeRear', value: 0, min: -0.5, max: 0.5, unit: '°', affectsPI: false },
  caster: { key: 'caster', value: 0, min: 3, max: 7, unit: '°', affectsPI: false },
  rideHeightFront: { key: 'rideHeightFront', value: 0, min: 0.5, max: 2, unit: 'in', affectsPI: false },
  rideHeightRear: { key: 'rideHeightRear', value: 0, min: 0.5, max: 2, unit: 'in', affectsPI: false },
  brakePressure: { key: 'brakePressure', value: 0, min: 50, max: 100, unit: '%', affectsPI: false },
  brakeBalance: { key: 'brakeBalance', value: 0, min: 30, max: 70, unit: '%', affectsPI: false },
  diffAccelRear: { key: 'diffAccelRear', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  diffDecelRear: { key: 'diffDecelRear', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  diffAccelFront: { key: 'diffAccelFront', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  diffDecelFront: { key: 'diffDecelFront', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  centerBalance: { key: 'centerBalance', value: 0, min: 0, max: 100, unit: '%', affectsPI: false },
  reboundFront: { key: 'reboundFront', value: 0, min: 1, max: 10, unit: '', affectsPI: false },
  reboundRear: { key: 'reboundRear', value: 0, min: 1, max: 10, unit: '', affectsPI: false },
  bumpFront: { key: 'bumpFront', value: 0, min: 1, max: 10, unit: '', affectsPI: false },
  bumpRear: { key: 'bumpRear', value: 0, min: 1, max: 10, unit: '', affectsPI: false },
  finalDrive: { key: 'finalDrive', value: 0, min: 1, max: 5, unit: 'ratio', affectsPI: false },
};

export function validateTuningSetting(
  setting: string,
  value: number,
  carSpecs?: CarSpecs
): { valid: boolean; error?: string; clamped?: number } {
  const limits = SETTING_LIMITS[setting];
  if (!limits) return { valid: false, error: `Unknown setting: ${setting}` };

  if (isNaN(value)) {
    return { valid: false, error: `Invalid value for ${setting}` };
  }

  if (value < limits.min || value > limits.max) {
    const clamped = Math.max(limits.min, Math.min(limits.max, value));
    return {
      valid: false,
      error: `${setting} must be between ${limits.min} and ${limits.max} ${limits.unit}`,
      clamped,
    };
  }

  return { valid: true };
}

function getDefaultTune(): Partial<TuneSettings> {
  return {
    tirePressureFront: 30,
    tirePressureRear: 30,
    camberFront: -1.5,
    camberRear: -1,
    toeFront: 0,
    toeRear: 0,
    caster: 5.5,
    arbFront: 30,
    arbRear: 30,
    springsFront: 20,
    springsRear: 20,
    rideHeightFront: 1,
    rideHeightRear: 1,
    reboundFront: 5,
    reboundRear: 5,
    bumpFront: 5,
    bumpRear: 5,
    diffAccelRear: 50,
    diffDecelRear: 15,
    diffAccelFront: 50,
    diffDecelFront: 50,
    centerBalance: 50,
    brakePressure: 90,
    brakeBalance: 50,
    finalDrive: 3.5,
  };
}

export function calculateTuneImpact(
  tune: TuneSettings,
  baseline: TuneSettings,
  carSpecs: CarSpecs
): PerformanceImpact {
  const warnings: string[] = [];
  const improvements: string[] = [];
  let handling = 0;
  let grip = 0;
  let stability = 0;
  let responsiveness = 0;

  // ARB changes affect handling responsiveness
  const arbFrontDiff = tune.arbFront - baseline.arbFront;
  const arbRearDiff = tune.arbRear - baseline.arbRear;
  responsiveness += arbFrontDiff * 0.3;

  if (tune.arbFront > 80) {
    warnings.push('Front ARB very stiff - may cause understeer');
  } else if (tune.arbFront < 20) {
    warnings.push('Front ARB too soft - may cause oversteer');
  } else {
    improvements.push('Front ARB balanced');
  }

  if (tune.arbRear > 80) {
    warnings.push('Rear ARB very stiff - may cause oversteer');
  } else if (tune.arbRear < 20) {
    warnings.push('Rear ARB too soft - poor rear stability');
  } else {
    improvements.push('Rear ARB balanced');
  }

  // Tire pressure affects grip significantly
  const optimalTirePressure = 32;
  const tpFrontDiff = Math.abs(tune.tirePressureFront - optimalTirePressure);
  const tpRearDiff = Math.abs(tune.tirePressureRear - optimalTirePressure);
  grip -= (tpFrontDiff + tpRearDiff) * 2;

  if (tune.tirePressureFront > 45) {
    warnings.push('Front tires overinflated - reduced grip');
  } else if (tune.tirePressureFront < 28) {
    warnings.push('Front tires underinflated - slower response');
  } else {
    improvements.push('Front tire pressure optimal');
  }

  if (tune.tirePressureRear > 45) {
    warnings.push('Rear tires overinflated - traction loss');
  } else if (tune.tirePressureRear < 28) {
    warnings.push('Rear tires underinflated - poor acceleration');
  } else {
    improvements.push('Rear tire pressure optimal');
  }

  // Springs affect stability and response
  const springDiff = (tune.springsFront - baseline.springsFront) + (tune.springsRear - baseline.springsRear);
  stability += Math.min(springDiff * 1.5, 50);

  if (tune.springsFront > 40) {
    warnings.push('Front springs very stiff - harsh ride');
  } else if (tune.springsFront < 10) {
    warnings.push('Front springs too soft - poor weight transfer');
  }

  // Camber affects cornering grip significantly
  if (Math.abs(tune.camberFront) > 2.5) {
    warnings.push('Front camber very negative - reduced straight-line grip');
  } else if (Math.abs(tune.camberFront) < 0.5) {
    warnings.push('Front camber too shallow - poor cornering grip');
  } else {
    improvements.push('Front camber optimal for grip');
  }

  grip += Math.min((Math.abs(tune.camberFront) - 1) * 12, 35);

  // Brake balance
  if (tune.brakeBalance < 40 || tune.brakeBalance > 60) {
    warnings.push(`Brake bias ${tune.brakeBalance}% - may cause lockup`);
  } else {
    improvements.push('Brake balance centered');
  }

  // Differential settings
  if (tune.diffAccelRear > 90 && carSpecs?.driveType === 'RWD') {
    warnings.push('Rear diff accel very high - increased oversteer risk');
  } else if (tune.diffAccelRear < 30) {
    warnings.push('Rear diff accel too low - traction loss');
  }

  // Final drive affects acceleration vs top speed
  if (tune.finalDrive > 4.5) {
    improvements.push('Final drive favors acceleration');
  } else if (tune.finalDrive < 2.5) {
    improvements.push('Final drive favors top speed');
  }

  // Calculate estimated PI impact
  const springPIImpact = (tune.springsFront + tune.springsRear) * 1.5;
  const camberPIImpact = (Math.abs(tune.camberFront) + Math.abs(tune.camberRear)) * 3;
  const basePI = carSpecs?.piClass?.charCodeAt(0) || 500;
  const estimatedPI = Math.round(basePI + springPIImpact + camberPIImpact);

  return {
    handling: Math.max(-100, Math.min(100, handling + responsiveness + (arbFrontDiff + arbRearDiff) * 0.5)),
    grip: Math.max(-100, Math.min(100, grip)),
    stability: Math.max(0, Math.min(100, 50 + stability)),
    responsiveness: Math.max(-100, Math.min(100, responsiveness)),
    estimatedPI,
    warnings,
    improvements,
  };
}

export function extractReasonFromContext(content: string, setting: string): string {
  // Look for explanation in AI response around the setting mention
  const lines = content.split('\n');
  const relevantLines = lines.filter((line) => line.toLowerCase().includes(setting.toLowerCase()));
  
  if (relevantLines.length > 0) {
    return relevantLines[0].substring(0, 120).replace(/^[-•*]\s*/, '').trim();
  }

  return 'Recommended adjustment';
}

export function calculateConfidence(content: string, setting: string): number {
  // High confidence if AI used specific physics terms
  const physicsTerms = ['grip', 'oversteer', 'understeer', 'balance', 'stability', 'responsiveness', 'traction', 'handling'];
  const settingPattern = new RegExp(`${setting}`, 'i');

  let score = 30; // Base confidence

  // Check for physics term mentions
  physicsTerms.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, 'i').test(content)) {
      if (settingPattern.test(content)) score += 15;
    }
  });

  // Check for specific value suggestions (not generic advice)
  if (/\d+\s*(?:PSI|%|°|kgf)/.test(content)) {
    score += 20;
  }

  // Check for explanation markers
  if (/because|reason|due to|since|therefore/i.test(content)) {
    score += 10;
  }

  return Math.min(100, score);
}

export function parseSuggestionsWithImpact(
  content: string,
  carSpecs: CarSpecs | undefined,
  currentTune: TuneSettings
): TuningSuggestion[] {
  const suggestions: TuningSuggestion[] = [];

  // Match patterns like "set ARB Front to 28" or "tire pressure rear 30"
  const patterns = [
    /(?:set|try\s+setting|adjust|change|lower|increase|reduce|raise)\s+(?:the\s+)?(?:your\s+)?([A-Za-z\s]+?)\s+to\s+(\d+(?:\.\d+)?)/gi,
    /([A-Za-z\s]+?)\s+(?:to|at|of)\s+(\d+(?:\.\d+)?)\s*(?:PSI|%|°|degrees|kgf)?/gi,
  ];

  const settingMap: Record<string, string> = {
    'arb front': 'arbFront',
    'arb rear': 'arbRear',
    'anti-roll bar front': 'arbFront',
    'anti-roll bar rear': 'arbRear',
    'tire pressure front': 'tirePressureFront',
    'tire pressure rear': 'tirePressureRear',
    'front tire pressure': 'tirePressureFront',
    'rear tire pressure': 'tirePressureRear',
    'springs front': 'springsFront',
    'springs rear': 'springsRear',
    'front springs': 'springsFront',
    'rear springs': 'springsRear',
    'camber front': 'camberFront',
    'camber rear': 'camberRear',
    'front camber': 'camberFront',
    'rear camber': 'camberRear',
    'toe front': 'toeFront',
    'toe rear': 'toeRear',
    'front toe': 'toeFront',
    'rear toe': 'toeRear',
    'caster': 'caster',
    'rebound front': 'reboundFront',
    'rebound rear': 'reboundRear',
    'bump front': 'bumpFront',
    'bump rear': 'bumpRear',
    'brake pressure': 'brakePressure',
    'brake balance': 'brakeBalance',
    'diff accel': 'diffAccelRear',
    'diff decel': 'diffDecelRear',
    'differential accel': 'diffAccelRear',
    'final drive': 'finalDrive',
    'ride height front': 'rideHeightFront',
    'ride height rear': 'rideHeightRear',
  };

  const processedSettings = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const settingText = match[1].toLowerCase().trim();
      let value = parseFloat(match[2]);

      const settingKey = settingMap[settingText];
      if (!settingKey || isNaN(value) || processedSettings.has(settingKey)) continue;

      processedSettings.add(settingKey);

      // Validate and clamp if needed
      const validation = validateTuningSetting(settingKey, value, carSpecs);
      if (!validation.valid && validation.clamped !== undefined) {
        value = validation.clamped;
      } else if (!validation.valid) {
        continue;
      }

      // Create modified tune
      const modifiedTune = { ...currentTune, [settingKey]: value };

      // Calculate impact
      const impact = calculateTuneImpact(modifiedTune, currentTune, carSpecs || ({} as CarSpecs));
      const confidence = calculateConfidence(content, settingKey);
      const reason = extractReasonFromContext(content, settingKey);

      suggestions.push({
        setting: settingKey,
        value,
        reason,
        impact,
        confidence,
      });
    }
  }

  return suggestions;
}

export function compareTunes(profile1: TuneProfile, profile2: TuneProfile): TuneComparison {
  const differences = Object.entries(profile1.settings).map(([key, value]) => ({
    setting: key,
    profile1: value as number,
    profile2: profile2.settings[key as keyof TuneSettings] as number,
    delta: (value as number) - (profile2.settings[key as keyof TuneSettings] as number),
  })).filter(d => d.delta !== 0);

  return {
    differences,
    performanceDelta: {
      handling: profile1.performance.handling - profile2.performance.handling,
      grip: profile1.performance.grip - profile2.performance.grip,
      stability: profile1.performance.stability - profile2.performance.stability,
      responsiveness: profile1.performance.responsiveness - profile2.performance.responsiveness,
    },
  };
}

export function getTuneTypeRecommendations(tuneType: TuneType): Partial<TuneSettings> {
  const recommendations: Record<TuneType, Partial<TuneSettings>> = {
    grip: {
      tirePressureFront: 32,
      tirePressureRear: 34,
      camberFront: -2,
      camberRear: -1.5,
      arbFront: 40,
      arbRear: 50,
      springsFront: 25,
      springsRear: 30,
    },
    drift: {
      tirePressureFront: 35,
      tirePressureRear: 28,
      camberFront: -5,
      camberRear: 0,
      arbFront: 35,
      arbRear: 65,
      diffAccelRear: 100,
      diffDecelRear: 100,
    },
    drag: {
      tirePressureFront: 55,
      tirePressureRear: 15,
      springsFront: 35,
      springsRear: 25,
      diffAccelRear: 100,
      brakeBalance: 55,
    },
    rally: {
      tirePressureFront: 26,
      tirePressureRear: 27,
      springsFront: 15,
      springsRear: 18,
      rideHeightFront: 1.5,
      rideHeightRear: 1.5,
      arbFront: 20,
      arbRear: 20,
    },
    offroad: {
      tirePressureFront: 19,
      tirePressureRear: 20,
      springsFront: 12,
      springsRear: 14,
      rideHeightFront: 1.8,
      rideHeightRear: 1.8,
      diffAccelRear: 90,
    },
    street: {
      tirePressureFront: 30,
      tirePressureRear: 32,
      camberFront: -1.5,
      camberRear: -1,
      arbFront: 25,
      arbRear: 25,
      springsFront: 18,
      springsRear: 20,
    },
  };

  return recommendations[tuneType] || {};
}
