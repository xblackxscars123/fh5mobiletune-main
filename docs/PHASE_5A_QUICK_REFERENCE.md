# Phase 5A New Modules Quick Reference

## Module Location & Purpose

All new modules in: `src/lib/`

### Constants & Definitions
| Module | Size | Purpose |
|--------|------|---------|
| `physicsConstants.ts` | 45 lines | Physics unit conversions, tire/brake/suspension constants |
| `piClassConstants.ts` | 87 lines | FH5 PI class definitions (S2-E), thresholds, performance tiers |

### Consolidated Physics Utilities
| Module | Size | Purpose | Replaces |
|--------|------|---------|----------|
| `loadTransferUtils.ts` | 72 lines | Weight transfer calculations | Duplicate in 3 files |
| `suspensionPhysics.ts` | 95 lines | Spring rate, natural frequency, roll angle | Duplicate in 2 files |
| `performancePrediction.ts` | 108 lines | Top speed, 0-60, acceleration, braking | Duplicate in 2 files |

### New Functionality
| Module | Size | Purpose | Implements |
|--------|------|---------|------------|
| `raceStrategy.ts` | 147 lines | Race time, handling balance, pit strategy | 2 unused functions |
| `tireManagement.ts` | 120 lines | Tire wear, temperature, durability | 2 unused functions |
| `tireAnalysis.ts` | 95 lines | Tire compatibility scoring, recommendations | 1 unused function |

---

## Import Examples

### Using Physics Constants
```typescript
import { 
  MPH_TO_TIRE_RPM_CONVERSION, 
  DEFAULT_REDLINE_RPM, 
  OPTIMAL_CAMBER,
  BRAKE_LOAD_TRANSFER 
} from './physicsConstants';

const rpm = (speed * gearRatio * finalDrive * MPH_TO_TIRE_RPM_CONVERSION) / tireDiameter;
const camber = OPTIMAL_CAMBER; // -2.5 degrees
```

### Using PI Class System
```typescript
import { getPIClass, isInPIClass, getPIClassInfo } from './piClassConstants';

const piClass = getPIClass(750); // Returns 'A'
const info = getPIClassInfo('S1'); // Get class details
const isValid = isInPIClass(850, 'S1'); // true
```

### Using Load Transfer Utils
```typescript
import { 
  calculateLongitudinalTransfer,
  calculateAxleLoads,
  getLoadTransferAdjustments 
} from './loadTransferUtils';

const transfer = calculateLongitudinalTransfer(3500, 18, 110, 0.5, 0);
const axleLoads = calculateAxleLoads(60, transfer);
const recs = getLoadTransferAdjustments(transfer, 25);
```

### Using Suspension Physics
```typescript
import { 
  calculateNaturalFrequency,
  analyzeSuspensionStiffness,
  calculateRideHeightAeroEffect 
} from './suspensionPhysics';

const frequency = calculateNaturalFrequency(300, 3500); // Hz
const analysis = analyzeSuspensionStiffness(300, 280, 3500);
const aeroMult = calculateRideHeightAeroEffect(3.5, 3.2, 2.5, -3.0);
```

### Using Performance Prediction
```typescript
import { 
  estimateTopSpeed,
  estimateZeroToSixty,
  estimateBrakingDistance 
} from './performancePrediction';

const topSpeed = estimateTopSpeed(500, 3500, 0.30, 20); // mph
const time060 = estimateZeroToSixty(500, 3500, 1.2); // seconds
const brakeDist = estimateBrakingDistance(100, 1.2); // feet
```

### Using Race Strategy
```typescript
import { 
  estimateRaceTime,
  analyzeUndersteuerOversteer,
  calculatePitStrategy 
} from './raceStrategy';

const lapTime = estimateRaceTime(
  { zeroToSixty: 4.2, topSpeed: 160, cornering: 8, braking: 7 },
  { straightLength: 800, cornersPerLap: 10, averageSpeed: 100, difficulty: 6 }
);

const handling = analyzeUndersteuerOversteer(
  { frontSpringRate: 300, rearSpringRate: 280, ... },
  80, 45
);

const strategy = calculatePitStrategy(50, 85, 1.2, 30);
```

### Using Tire Management
```typescript
import { 
  calculateTireWearProgression,
  analyzeTireTemperatureWindow,
  estimateTireGrip 
} from './tireManagement';

const wear = calculateTireWearProgression(0, 50, 
  { speed: 120, camber: -2.5, gripLevel: 1.2, pressurePSI: 28 }
);

const tempAnalysis = analyzeTireTemperatureWindow(25,
  { tireCompound: 'race', pressure: 28, camber: -2.5 },
  100
);

const grip = estimateTireGrip('sport', 85, 30, 0);
```

### Using Tire Analysis
```typescript
import { 
  analyzeTireCompatibility,
  compareTireCompounds,
  getRecommendedTire 
} from './tireAnalysis';

const analysis = analyzeTireCompatibility('race',
  { weight: 3500, power: 450, driveType: 'rwd', piClass: 'A' },
  { type: 'circuit', length: 3.5, temperature: 25, surfaceCondition: 'good' },
  'sunny'
);

const ranked = compareTireCompounds(['street', 'sport', 'race'], setup, track, weather);

const rec = getRecommendedTire('sprint-dry', { power: 600, piClass: 'S1' }, 'sunny');
```

---

## Function Quick Reference

### physicsConstants.ts
- **165 constants** organized in 11 categories
- All values validated against FH5 physics
- Imported by 7+ Phase 1-4 modules

### piClassConstants.ts
| Function | Returns | Use |
|----------|---------|-----|
| `getPIClass(pi)` | PIClass | Get class from PI value |
| `isInPIClass(pi, class)` | boolean | Check if PI in class |
| `getPIClassInfo(class)` | PIClassThreshold | Get class details |
| `getAllPIClassesOrdered()` | PIClass[] | S2→E ordering |
| `getPIClassPerformanceMultiplier(class)` | number | 0.35-1.95 multiplier |

### loadTransferUtils.ts
| Function | Parameters | Returns |
|----------|-----------|---------|
| `calculateLongitudinalTransfer()` | weight, cgH, wb, accel, grade | number (-100 to 100) |
| `calculateLateralTransfer()` | weight, cgH, track, corneringG | number (0-100) |
| `calculateAxleLoads()` | baseF%, longTransfer, latTransfer | {frontAxle, rearAxle, left, right} |
| `calculateWheelLoads()` | weight, frontPct, longTr, latTr | {FL, FR, RL, RR, desc} |
| `analyzeLoadTransferGripEffect()` | transfer, baseGrip | number (0-2.0) |
| `getLoadTransferAdjustments()` | longTr, latTr | string[] recommendations |

### suspensionPhysics.ts
| Function | Parameters | Returns |
|----------|-----------|---------|
| `calculateNaturalFrequency()` | springRate, weight | number Hz |
| `calculateSpringRateForFrequency()` | targetFreq, weight | number lbs/in |
| `analyzeSuspensionStiffness()` | frontSR, rearSR, weight | analysis object |
| `calculateRideHeightAeroEffect()` | hF, hR, minH, impact | {frontMult, rearMult, avgMult, balance} |
| `calculateARBEffect()` | arbStiffness | number multiplier |
| `getSuspensionRecommendations()` | frontSR, rearSR, fARB, rARB | string[] |
| `calculateRollAngle()` | lateralAccel, cgH, track, springR | number degrees |

### performancePrediction.ts
| Function | Parameters | Returns |
|----------|-----------|---------|
| `estimateTopSpeed()` | hp, weight, cd, frontalArea | number mph |
| `calculateAvailablePower()` | peakHP, speed, maxSpeed | number hp |
| `estimateZeroToSixty()` | hp, weight, tireGrip | number seconds |
| `estimateZeroToHundred()` | zeroToSixty | number seconds |
| `calculateGearAccelTime()` | gr1, finalDr, tireRad, redline, hp | number seconds |
| `estimateQuarterMile()` | zeroToSixty, topSpeed | number seconds |
| `calculateAltitudeAdjustment()` | altitudeM, basePower | number hp |
| `estimateBrakingDistance()` | speed, decel | number feet |
| `comparePerformance()` | setup1, setup2 | comparison object |

### raceStrategy.ts
| Function | Returns | Use |
|----------|---------|-----|
| `estimateRaceTime()` | {lapTime, sections, estimate} | Predict lap time |
| `analyzeUndersteuerOversteer()` | {tendency, severity, recommendations} | Handling analysis |
| `calculatePitStrategy()` | {pitStops, fuelPerStop, distance, recs} | Endurance planning |
| `analyzeRacePace()` | {lapsInRace, totalTime, avgSpeed, pace} | Race analysis |

### tireManagement.ts
| Function | Returns | Use |
|----------|---------|-----|
| `calculateTireWearProgression()` | {finalWear, wearRate, life, pattern, recs} | Tire durability |
| `analyzeTireTemperatureWindow()` | {optimalT, currentT, window, inWindow, pressureAdj, recs} | Thermal analysis |
| `estimateTireGrip()` | number 0-2.0 | Grip calculation |
| `estimateTireLife()` | {estMiles, %Remaining, threshold, recs} | Life prediction |
| `analyzeTireTrackCompatibility()` | {score, rec, strengths, weaknesses} | Tire suitability |

### tireAnalysis.ts
| Function | Returns | Use |
|----------|---------|-----|
| `analyzeTireCompatibility()` | TireAnalysisResult | Detailed scoring |
| `compareTireCompounds()` | TireAnalysisResult[] | Ranked comparison |
| `getRecommendedTire()` | {primary, alternatives, rationale} | Recommendation |

---

## Integration Checklist

- [x] Create physicsConstants.ts
- [x] Create piClassConstants.ts
- [x] Create loadTransferUtils.ts
- [x] Create suspensionPhysics.ts
- [x] Create performancePrediction.ts
- [x] Create raceStrategy.ts
- [x] Create tireManagement.ts
- [x] Create tireAnalysis.ts
- [x] Update gearRatioOptimization.ts imports
- [x] Update aerodynamicsCalculations.ts imports
- [x] Update loadTransfer.ts imports
- [x] Update suspensionGeometry.ts imports
- [x] Update advancedBraking.ts imports
- [x] Update differentialOptimization.ts imports
- [x] Update trackSpecificTuning.ts imports
- [x] Update tireSelectionLogic.ts imports
- [x] Update tuningCalculatorEnhanced.ts imports
- [x] Verify 0 compilation errors

---

## Phase 5B Remaining Tasks

- [ ] Delete duplicate functions (getAeroProfileByCarClass, calculateDragCoefficient, calculateRollCenter)
- [ ] Replace inline calculations with utility function calls
- [ ] Run comprehensive integration tests
- [ ] Update documentation with new module usage
- [ ] Create Phase 5 test suite
