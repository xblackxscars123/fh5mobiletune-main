import { TuneType, DriveType } from '@/lib/tuningCalculator';

export interface TuneTemplate {
  id: string;
  name: string;
  description: string;
  category: 'starter' | 'meta' | 'specialty';
  icon: string;
  applicableTuneTypes: TuneType[];
  applicableDriveTypes: DriveType[];
  performanceClass?: string;
  corneringTendency?: 'understeer' | 'neutral' | 'oversteer';
  speedCharacteristic?: 'launch' | 'acceleration' | 'topspeed' | 'balanced';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // TIRE SPECIFICATIONS
  tireCompound: {
    recommended: string;
    pressureCold: { front: number; rear: number }; // PSI
    pressureHot: { front: number; rear: number }; // PSI (optimal operating)
    flotationMode: boolean; // For off-road
  };
  
  // ALIGNMENT (Critical for performance)
  alignment: {
    camberFront: { min: number; max: number }; // Degrees
    camberRear: { min: number; max: number };
    toeInFront: { min: number; max: number }; // Degrees (+ = toe-out)
    toeInRear: { min: number; max: number };
    caster: { min: number; max: number };
  };
  
  // SUSPENSION (Weight distribution based)
  suspension: {
    springFrequencyTarget: string; // "1.0-1.5 Hz" for street, "2.0-3.0 Hz" for race
    rideHeight: 'low' | 'medium' | 'high';
    notes: string;
  };
  
  // DIFFERENTIAL (Discipline specific)
  differential: {
    driveType: DriveType;
    accelLock: { min: number; max: number }; // Percentage
    decelLock: { min: number; max: number };
    centerBalance?: { min: number; max: number }; // For AWD
    physics: string;
  };
  
  // BRAKING (Includes the reversed bias fix)
  braking: {
    biasFront: { min: number; max: number }; // What user should SET (inverted)
    pressure: { min: number; max: number }; // Percentage
    notes: string;
  };
  
  // GENERAL MODIFIERS (For UI sliders)
  modifiers: {
    balance: number;
    stiffness: number;
    rideHeight: 'low' | 'medium' | 'high';
    diffAggression: number;
    aeroLevel: 'none' | 'low' | 'medium' | 'high';
  };
  
  tips: string[];
  warnings?: string[];
}

export const tuneTemplates: TuneTemplate[] = [
  // ==================== STARTER TEMPLATES ====================
  {
    id: 'circuit-grip',
    name: 'Circuit / Grip (Road)',
    description: 'Maximum lateral G-force for road courses. Maximize momentum through corners.',
    category: 'starter',
    icon: '🏁',
    applicableTuneTypes: ['grip'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    performanceClass: 'A-S2',
    corneringTendency: 'neutral',
    speedCharacteristic: 'balanced',
    difficulty: 'medium',
    
    tireCompound: {
      recommended: 'Slicks / Semi-Slicks / Horizon Race (S2+)',
      pressureCold: { front: 28.0, rear: 28.0 },
      pressureHot: { front: 32.0, rear: 34.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -1.5, max: -2.5 },
      camberRear: { min: -1.0, max: -1.8 },
      toeInFront: { min: 0.0, max: 0.1 }, // Slight toe-out for turn-in
      toeInRear: { min: -0.1, max: -0.3 }, // Toe-in for exit stability
      caster: { min: 5.5, max: 6.5 },
    },
    
    suspension: {
      springFrequencyTarget: '2.0-3.0 Hz (Race)',
      rideHeight: 'low',
      notes: 'Use weight distribution formula: Spring = (Max-Min) × Weight% + Min',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 45, max: 60 },
      decelLock: { min: 10, max: 30 },
      physics: 'Balances rotation vs traction. Lower accel = more responsive.',
    },
    
    braking: {
      biasFront: { min: 46, max: 54 }, // Inverted: 100% - desired front%
      pressure: { min: 95, max: 100 },
      notes: 'Circuit courses reward threshold braking. Use 50-54% actual front bias.',
    },
    
    modifiers: {
      balance: 0,
      stiffness: 80,
      rideHeight: 'low',
      diffAggression: 0.55,
      aeroLevel: 'high',
    },
    
    tips: [
      'Negative camber counteracts body roll during cornering. Aim for 10-20°F temp spread across tire.',
      'Tire pressure is critical: 28 PSI cold becomes 32-34 PSI hot. This is the grip sweet spot.',
      'Use the weight distribution formula for springs: heavier front = stiffer front springs.',
      'Aero balance = Front Aero should be front weight distribution %. Rear aero = rear weight %.',
      'Decel lock (10-30%) allows rotation on turn-in without losing mid-corner stability.',
      'High caster (5.5-6.5°) provides dynamic camber gain during turns.',
    ],
    
    warnings: [
      'Stiffness >85 causes harshness and reduced traction on imperfect surfaces.',
      'High aero (>12 PI) reduces top speed on tracks with long straights.',
      'Negative toe-out front can cause oversteer on power; start with 0° then adjust.',
    ],
  },

  {
    id: 'street-scene',
    description: 'Street racing with traffic and unpredictable obstacles. Balance grip with forgiveness.',
    name: 'Street Scene',
    category: 'starter',
    icon: '🛣️',
    applicableTuneTypes: ['street'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    performanceClass: 'B-A',
    corneringTendency: 'understeer',
    speedCharacteristic: 'balanced',
    difficulty: 'easy',
    
    tireCompound: {
      recommended: 'Street (S1) or Semi-Slick',
      pressureCold: { front: 27.5, rear: 27.5 },
      pressureHot: { front: 31.0, rear: 32.5 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -1.0, max: -1.5 },
      camberRear: { min: -0.5, max: -1.0 },
      toeInFront: { min: 0.0, max: 0.05 },
      toeInRear: { min: -0.05, max: -0.2 },
      caster: { min: 4.5, max: 5.5 },
    },
    
    suspension: {
      springFrequencyTarget: '1.5-2.0 Hz (Sport)',
      rideHeight: 'medium',
      notes: 'Softer than circuit: 10-15% reduction. Must handle potholes and curbs.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 40, max: 55 },
      decelLock: { min: 5, max: 25 },
      physics: 'Slightly lower accel lock than circuit for smoother power delivery.',
    },
    
    braking: {
      biasFront: { min: 48, max: 52 },
      pressure: { min: 85, max: 95 },
      notes: 'Lower pressure (90-95%) allows modulation. Avoid ABS locking when panic-braking for traffic.',
    },
    
    modifiers: {
      balance: -15,
      stiffness: 45,
      rideHeight: 'medium',
      diffAggression: 0.35,
      aeroLevel: 'low',
    },
    
    tips: [
      'Street tuning = Circuit tuning softened by 10-15%. Lower stiffness handles curbs better.',
      'Slight understeer (-15 to -20) is intentional: safer for unexpected traffic.',
      'Lower diff accel lock (40-50%) provides smoother power delivery for casual driving.',
      'Minimal aero keeps PI lower, useful for lower-class street events.',
      'Shorter final drive: Street races don\'t reach 200+ mph; prioritize acceleration.',
    ],
    
    warnings: [
      'Soft setup causes body roll in aggressive cornering.',
      'Understeer can feel sluggish; increase stiffness +5 if needed.',
      'Traffic is unpredictable; avoid fully locked diff that amplifies mistakes.',
    ],
  },

  {
    id: 'drift-machine',
    name: 'Drift Machine (RWD)',
    description: 'Maximum angle, controlled slides. Sustained loss of traction with controllability.',
    category: 'starter',
    icon: '🌀',
    applicableTuneTypes: ['drift'],
    applicableDriveTypes: ['RWD'],
    performanceClass: 'A-S2',
    corneringTendency: 'oversteer',
    speedCharacteristic: 'acceleration',
    difficulty: 'hard',
    
    tireCompound: {
      recommended: 'Drift or Street',
      pressureCold: { front: 32.0, rear: 25.0 },
      pressureHot: { front: 35.0, rear: 28.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -5.0, max: -5.0 }, // Extreme: front wheel flat at full lock
      camberRear: { min: -0.5, max: 0.0 }, // Near zero for contact patch
      toeInFront: { min: 1.0, max: 5.0 }, // Positive (toe-out) for Ackermann effect
      toeInRear: { min: -0.5, max: 0.0 },
      caster: { min: 7.0, max: 7.0 }, // Maximize for self-steering
    },
    
    suspension: {
      springFrequencyTarget: '1.5-2.0 Hz (Soft Front / Stiff Rear)',
      rideHeight: 'medium',
      notes: 'Stiff front for entry feel. Soft rear for "squat" and side bite during slide.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 100, max: 100 }, // Locked
      decelLock: { min: 100, max: 100 }, // Locked
      physics: 'Both wheels spin at identical speed. Predictable, instant slide initiation.',
    },
    
    braking: {
      biasFront: { min: 55, max: 60 }, // Inverted: actual front bias 40-45%
      pressure: { min: 95, max: 100 },
      notes: 'Front-biased braking initiates rotation. Inverted slider: 58% setting = 42% actual front.',
    },
    
    modifiers: {
      balance: 60,
      stiffness: 45,
      rideHeight: 'medium',
      diffAggression: 1.0,
      aeroLevel: 'none',
    },
    
    tips: [
      'Extreme front camber (-5.0°) keeps the front wheel flat against pavement at lock.',
      'Positive front toe-out (1-5°) increases Ackermann effect, helping inside wheel steer.',
      'High pressure front (32-36 PSI) reduces grip and increases responsiveness.',
      'Low pressure rear (20-30 PSI) modulates the slide vs. grip threshold.',
      'Locked diff (100%) ensures both rear wheels spin synchronously for consistent angle.',
      'Soft rear suspension allows the car to "squat," gaining side bite for controlled drifts.',
      'Caster: Maximize (7.0°) to aid self-steering (wheel spinning back to center).',
    ],
    
    warnings: [
      'Extreme camber reduces braking grip. Drift tuning sacrifices utility.',
      'Locked diff eliminates cornering ability; this is drift-only.',
      'Positive toe-out can cause understeer on power; requires practice.',
      'FWD drift builds are possible but require different alignment (+toe-in, lower camber).',
    ],
  },

  {
    id: 'rally-mixed',
    name: 'Rally / Mixed Surface',
    description: 'Versatility across tarmac and dirt. Lower grip coefficient tolerance.',
    category: 'starter',
    icon: '🌲',
    applicableTuneTypes: ['rally'],
    applicableDriveTypes: ['AWD'],
    performanceClass: 'A-S1',
    corneringTendency: 'neutral',
    speedCharacteristic: 'balanced',
    difficulty: 'medium',
    
    tireCompound: {
      recommended: 'Rally or Off-Road (S2 or lower)',
      pressureCold: { front: 23.0, rear: 23.0 },
      pressureHot: { front: 26.0, rear: 27.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -0.8, max: -1.2 },
      camberRear: { min: -0.5, max: -0.8 },
      toeInFront: { min: 0.0, max: 0.1 },
      toeInRear: { min: -0.1, max: -0.2 },
      caster: { min: 4.0, max: 5.0 },
    },
    
    suspension: {
      springFrequencyTarget: '1.5-2.0 Hz (Soft for compliance)',
      rideHeight: 'medium-high',
      notes: 'Must absorb washboard surfaces and rocks. Lower bump stiffness critical.',
    },
    
    differential: {
      driveType: 'AWD',
      accelLock: { min: 65, max: 85 },
      decelLock: { min: 20, max: 40 },
      centerBalance: { min: 50, max: 70 }, // Rear-biased
      physics: 'Higher lock than circuit. Loose surfaces require lock to prevent wheel spin.',
    },
    
    braking: {
      biasFront: { min: 48, max: 52 },
      pressure: { min: 90, max: 100 },
      notes: 'Balanced 50/50 for varied terrain. Lower pressure for modulation on loose surfaces.',
    },
    
    modifiers: {
      balance: 5,
      stiffness: 30,
      rideHeight: 'high',
      diffAggression: 0.70,
      aeroLevel: 'none',
    },
    
    tips: [
      'Lower tire pressure (23 PSI) creates larger patch for loose surfaces.',
      'Soft suspension (1.5-2.0 Hz) absorbs washboard and maintains contact.',
      'Lower bump stiffness (60% of rebound) prevents bouncing off rocks.',
      'Higher accel lock (70-80%) maintains drive when wheels momentarily lose contact.',
      'Rear-biased center diff (60-70% rear) reduces understeer typical of AWD.',
      'Medium-high ride height clears terrain without sacrificing too much stability.',
    ],
    
    warnings: [
      'Soft setup reduces stability on hard surfaces (tarmac sections).',
      'Rally tuning is a compromise; rarely beats road-only or dirt-only specialists.',
      'Lower tire grip requires smoother inputs and earlier braking.',
    ],
  },

  {
    id: 'drag-strip',
    name: 'Drag Strip / Launch',
    description: 'Maximum longitudinal acceleration. Minimize rolling resistance, optimize wheel transfer.',
    category: 'starter',
    icon: '🚀',
    applicableTuneTypes: ['drag'],
    applicableDriveTypes: ['RWD', 'AWD'],
    performanceClass: 'S1-S2',
    corneringTendency: 'understeer',
    speedCharacteristic: 'launch',
    difficulty: 'easy',
    
    tireCompound: {
      recommended: 'Drag Radials (High grip longitudinal)',
      pressureCold: { front: 55.0, rear: 15.0 },
      pressureHot: { front: 58.0, rear: 18.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -1.0, max: -1.5 },
      camberRear: { min: -0.8, max: -1.2 },
      toeInFront: { min: 0.0, max: 0.0 },
      toeInRear: { min: 0.0, max: 0.0 },
      caster: { min: 4.0, max: 5.0 },
    },
    
    suspension: {
      springFrequencyTarget: '2.5-3.5 Hz (Stiff front, soft rear)',
      rideHeight: 'low front / low rear',
      notes: 'Stiff front prevents nose dive. Soft rear allows "squat" to transfer weight rearward.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 100, max: 100 }, // Full lock
      decelLock: { min: 0, max: 0 }, // Open decel
      physics: 'Max traction on launch, open decel prevents instability at trap.',
    },
    
    braking: {
      biasFront: { min: 54, max: 56 },
      pressure: { min: 95, max: 100 },
      notes: 'Brake bias 54-56% actual front. Used for line-lock or launch weight transfer control.',
    },
    
    modifiers: {
      balance: -30,
      stiffness: 70,
      rideHeight: 'low',
      diffAggression: 1.0,
      aeroLevel: 'none',
    },
    
    tips: [
      'Max front tire pressure (55 PSI) minimizes rolling resistance.',
      'Min rear tire pressure (15 PSI) maximizes contact patch ("wrinkle wall" simulation).',
      'Stiff front suspension (70+) prevents nose dive during launch.',
      'Soft rear suspension allows car to "squat," transferring weight over drive wheels.',
      'Strong understeer (-25 to -35) keeps front planted, prevents wheelies.',
      'Locked accel diff (100%), open decel diff (0%) for traction without cornering issues.',
      'Use 4-5 gear ratios instead of 6-7; fewer shifts = faster times.',
      'First gear must be extremely long to manage launch traction.',
    ],
    
    warnings: [
      'Locked diff eliminates all cornering ability.',
      'Extreme pressure delta (55F / 15R) only works on straight lines.',
      'High front pressure reduces braking grip.',
      'Completely unsuitable for any cornering.',
    ],
  },

  {
    id: 'cross-country',
    name: 'Cross Country / Off-Road',
    description: 'Survival and flotation. Large jumps, deep mud, deformable terrain. Flotation priority.',
    category: 'starter',
    icon: '🦌',
    applicableTuneTypes: ['offroad'],
    applicableDriveTypes: ['AWD'],
    performanceClass: 'S1-S2',
    corneringTendency: 'neutral',
    speedCharacteristic: 'balanced',
    difficulty: 'medium',
    
    tireCompound: {
      recommended: 'Off-Road (MANDATORY for flotation physics)',
      pressureCold: { front: 17.0, rear: 17.0 },
      pressureHot: { front: 19.0, rear: 20.0 },
      flotationMode: true, // Triggers flotation calculations
    },
    
    alignment: {
      camberFront: { min: -1.0, max: -1.5 },
      camberRear: { min: -0.5, max: -1.0 },
      toeInFront: { min: 0.0, max: 0.1 },
      toeInRear: { min: -0.1, max: -0.2 },
      caster: { min: 4.0, max: 5.0 },
    },
    
    suspension: {
      springFrequencyTarget: '1.0-1.5 Hz (Very soft)',
      rideHeight: 'maximum',
      notes: 'Must absorb 30+ foot jumps. High rebound critical for landing control.',
    },
    
    differential: {
      driveType: 'AWD',
      accelLock: { min: 80, max: 100 },
      decelLock: { min: 20, max: 50 },
      centerBalance: { min: 50, max: 50 }, // Balanced
      physics: 'Near-locked: 1-2 wheels often airborne. Locked = grounded wheels keep driving.',
    },
    
    braking: {
      biasFront: { min: 48, max: 52 },
      pressure: { min: 85, max: 95 },
      notes: 'Balanced bias. Lower pressure for modulation on terrain.',
    },
    
    modifiers: {
      balance: 0,
      stiffness: 25,
      rideHeight: 'high',
      diffAggression: 0.9,
      aeroLevel: 'none',
    },
    
    tips: [
      'Very low tire pressure (17 PSI cold) maximizes flotation footprint.',
      'Off-Road compound (mandatory): Game simulates ground pressure and sink depth.',
      'Very soft suspension (1.0-1.5 Hz) absorbs 30+ foot jumps without bottoming.',
      'Maximum ride height clears obstacles; secondary benefit reduces body roll.',
      'HIGH REBOUND DAMPING is critical: Dissipates spring energy on landing, preventing re-bounce.',
      'Near-locked diff (90-100%): Prevents power loss when wheels go airborne.',
      'Tire width maximizes contact patch and reduces sink depth in mud/sand.',
      'Balanced center diff (50%) provides neutral handling for jumps.',
    ],
    
    warnings: [
      'Soft setup reduces stability on hard surfaces.',
      'Very low tire pressure unsuitable for paved sections.',
      'Must use Off-Road compound; Street/Race tires fail in deep mud.',
      'Landing mechanics require high rebound; lower values = bouncing.',
    ],
  },

  {
    id: 'all-rounder',
    name: 'All-Rounder (Balanced)',
    description: 'Neutral setup for mixed-use. Horizon Open and varied events.',
    category: 'starter',
    icon: '⚖️',
    applicableTuneTypes: ['grip', 'street'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    performanceClass: 'B-S1',
    corneringTendency: 'neutral',
    speedCharacteristic: 'balanced',
    difficulty: 'easy',
    
    tireCompound: {
      recommended: 'Street (S1) or Semi-Slick',
      pressureCold: { front: 28.0, rear: 28.0 },
      pressureHot: { front: 32.0, rear: 33.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -1.2, max: -1.5 },
      camberRear: { min: -0.8, max: -1.0 },
      toeInFront: { min: 0.0, max: 0.1 },
      toeInRear: { min: -0.1, max: -0.2 },
      caster: { min: 5.0, max: 5.5 },
    },
    
    suspension: {
      springFrequencyTarget: '1.8-2.2 Hz (Balanced)',
      rideHeight: 'medium',
      notes: 'Perfect starting point. Adjust +/- 10% for specific event types.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 50, max: 60 },
      decelLock: { min: 15, max: 25 },
      physics: 'Balanced between traction and rotation.',
    },
    
    braking: {
      biasFront: { min: 48, max: 52 },
      pressure: { min: 90, max: 100 },
      notes: '50/50 balance works everywhere.',
    },
    
    modifiers: {
      balance: 0,
      stiffness: 50,
      rideHeight: 'medium',
      diffAggression: 0.55,
      aeroLevel: 'medium',
    },
    
    tips: [
      'Neutral balance (0) handles understeer and oversteer equally.',
      'Medium stiffness (45-55) is the compromise between compliance and response.',
      'Perfect learning tool: Won\'t punish driving errors.',
      'Use as baseline, then adjust: +10 stiffness for circuits, -10 for street.',
      'Moderate aero (5-8 PI) provides downforce without excessive top-speed loss.',
    ],
    
    warnings: [
      'Jack-of-all-trades, master of none.',
      'Not optimal for competitive racing in any single discipline.',
      'Requires adjustment for specific event types.',
    ],
  },

  // ==================== META TEMPLATES ====================
  {
    id: 's2-road-meta',
    name: 'S2 Road Racing Meta',
    description: 'Competitive S2 setup for rivals. High power, full aero, maximum grip.',
    category: 'meta',
    icon: '🏆',
    applicableTuneTypes: ['grip'],
    applicableDriveTypes: ['AWD', 'RWD'],
    performanceClass: 'S2',
    corneringTendency: 'neutral',
    speedCharacteristic: 'balanced',
    difficulty: 'hard',
    
    tireCompound: {
      recommended: 'Slicks / Horizon Race (S2+)',
      pressureCold: { front: 28.5, rear: 28.5 },
      pressureHot: { front: 33.0, rear: 34.5 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -2.0, max: -2.5 },
      camberRear: { min: -1.2, max: -1.8 },
      toeInFront: { min: 0.0, max: 0.15 },
      toeInRear: { min: -0.15, max: -0.3 },
      caster: { min: 6.0, max: 6.5 },
    },
    
    suspension: {
      springFrequencyTarget: '2.5-3.0 Hz (Race)',
      rideHeight: 'low',
      notes: 'Extreme stiffness handles 800+ HP. Weight distribution formula is critical.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 55, max: 70 },
      decelLock: { min: 15, max: 30 },
      physics: 'Balanced. Slight oversteer (5-10 balance) allows quick rotation at high speeds.',
    },
    
    braking: {
      biasFront: { min: 46, max: 54 },
      pressure: { min: 95, max: 100 },
      notes: 'Inverted: 52-54% actual front bias for high power levels.',
    },
    
    modifiers: {
      balance: 5,
      stiffness: 85,
      rideHeight: 'low',
      diffAggression: 0.65,
      aeroLevel: 'high',
    },
    
    tips: [
      'Slight oversteer (5-10) allows quick rotation in high-speed corners.',
      'Very stiff (80-90) required for 800+ HP without losing control.',
      'Max aero provides 12-18 PI downforce boost.',
      'Aero balance: Front% = Front weight%, Rear% = Rear weight%.',
      'Camber: -2.2° front, -1.5° rear for maximum tire utilization at race speeds.',
      'Brake bias: 52-54% actual front (inverted slider: 46-48% setting).',
    ],
    
    warnings: [
      'Extremely stiff; poor ride quality.',
      'Stiffness >85 reduces traction on imperfect surfaces.',
      'High aero significantly reduces top-speed.',
      'Requires excellent throttle control and smooth driving.',
    ],
  },

  {
    id: 'a-class-meta',
    name: 'A-Class Rivals Setup',
    description: 'Optimized A-class balance. The sweet spot of power and grip.',
    category: 'meta',
    icon: '🎯',
    applicableTuneTypes: ['grip'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    performanceClass: 'A',
    corneringTendency: 'neutral',
    speedCharacteristic: 'balanced',
    difficulty: 'medium',
    
    tireCompound: {
      recommended: 'Street (S2) or Semi-Slick',
      pressureCold: { front: 28.0, rear: 28.0 },
      pressureHot: { front: 32.0, rear: 33.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -1.5, max: -2.0 },
      camberRear: { min: -1.0, max: -1.5 },
      toeInFront: { min: 0.0, max: 0.1 },
      toeInRear: { min: -0.1, max: -0.2 },
      caster: { min: 5.5, max: 6.0 },
    },
    
    suspension: {
      springFrequencyTarget: '2.0-2.5 Hz (Sport-Race)',
      rideHeight: 'low',
      notes: 'Suits 550-650 PI power levels. Weight distribution formula essential.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 50, max: 65 },
      decelLock: { min: 15, max: 25 },
      physics: 'Balanced. Works across RWD, AWD, FWD with minor adjustments.',
    },
    
    braking: {
      biasFront: { min: 48, max: 52 },
      pressure: { min: 95, max: 100 },
      notes: '50-52% actual front bias.',
    },
    
    modifiers: {
      balance: 0,
      stiffness: 65,
      rideHeight: 'low',
      diffAggression: 0.55,
      aeroLevel: 'medium',
    },
    
    tips: [
      'Neutral balance (0) provides consistency for all drivetrain types.',
      'Stiffness 60-70 suits A-class power.',
      'Medium aero (5-8 PI) without sacrificing top speed.',
      'FWD: Add +10 stiffness and -5 balance to reduce understeer.',
      'AWD: Use center diff 65-75% rear to reduce AWD understeer.',
    ],
    
    warnings: [
      'FWD may still understeer; adjust balance to 0 to +10 if needed.',
      'Stiffness 60-70 is the optimal range for A-class.',
    ],
  },

  {
    id: 'x-class-drag',
    name: 'X-Class Drag (1500+ HP)',
    description: 'Maximum power launch. Extreme understeer to prevent wheelies.',
    category: 'meta',
    icon: '⚡',
    applicableTuneTypes: ['drag'],
    applicableDriveTypes: ['AWD'],
    performanceClass: 'X',
    corneringTendency: 'understeer',
    speedCharacteristic: 'launch',
    difficulty: 'hard',
    
    tireCompound: {
      recommended: 'Drag Radials',
      pressureCold: { front: 55.0, rear: 15.0 },
      pressureHot: { front: 58.0, rear: 18.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -0.8, max: -1.2 },
      camberRear: { min: -0.5, max: -1.0 },
      toeInFront: { min: 0.0, max: 0.0 },
      toeInRear: { min: 0.0, max: 0.0 },
      caster: { min: 4.0, max: 4.5 },
    },
    
    suspension: {
      springFrequencyTarget: '3.0+ Hz (Maximum stiffness)',
      rideHeight: 'low',
      notes: 'Extreme stiffness mandatory for 1500+ HP. Prevents all unwanted movement.',
    },
    
    differential: {
      driveType: 'AWD',
      accelLock: { min: 100, max: 100 }, // Locked
      decelLock: { min: 0, max: 10 },
      centerBalance: { min: 50, max: 50 }, // Balanced center
      physics: 'All wheels locked on launch, ensures maximum traction at extreme power.',
    },
    
    braking: {
      biasFront: { min: 54, max: 56 },
      pressure: { min: 95, max: 100 },
      notes: 'Brake bias 54-56% actual front for launch line-lock control.',
    },
    
    modifiers: {
      balance: -40,
      stiffness: 90,
      rideHeight: 'low',
      diffAggression: 1.0,
      aeroLevel: 'none',
    },
    
    tips: [
      'Strong understeer (-35 to -50) prevents front wheel lift (wheelies) on launch.',
      'Maximum stiffness (85-100) essential for 1500+ HP control.',
      'AWD with locked diff mandatory for traction at these power levels.',
      'Center diff lock (1.0) keeps all wheels engaged.',
      'Brake bias 54-56% actual front for launch weight transfer.',
      'First gear extremely long to manage launch wheelspin.',
      '4-5 gear ratios faster than 6+ due to shift penalties.',
    ],
    
    warnings: [
      'Completely unusable for cornering.',
      'Extreme difficulty to drive; launch-only setup.',
      'X-Class 1500+ HP will spin uncontrollably without this setup.',
      'Fully locked diff eliminates all cornering ability.',
    ],
  },

  // ==================== SPECIALTY TEMPLATES ====================
  {
    id: 'wet-weather',
    name: 'Wet Weather Warrior',
    description: 'Rain and low-grip conditions. Prevent snap oversteer. Gentle throttle modulation.',
    category: 'specialty',
    icon: '🌧️',
    applicableTuneTypes: ['grip', 'street'],
    applicableDriveTypes: ['AWD', 'FWD'],
    performanceClass: 'A-S1',
    corneringTendency: 'understeer',
    speedCharacteristic: 'balanced',
    difficulty: 'medium',
    
    tireCompound: {
      recommended: 'Street (S1) - WET TIRES MANDATORY',
      pressureCold: { front: 26.0, rear: 26.0 },
      pressureHot: { front: 29.0, rear: 30.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -1.0, max: -1.5 },
      camberRear: { min: -0.5, max: -1.0 },
      toeInFront: { min: 0.0, max: 0.05 },
      toeInRear: { min: -0.1, max: -0.2 },
      caster: { min: 4.5, max: 5.0 },
    },
    
    suspension: {
      springFrequencyTarget: '1.5-2.0 Hz (Soft)',
      rideHeight: 'medium',
      notes: 'Soft suspension loads tires gently for wet grip buildup.',
    },
    
    differential: {
      driveType: 'AWD',
      accelLock: { min: 30, max: 50 },
      decelLock: { min: 5, max: 20 },
      centerBalance: { min: 50, max: 60 },
      physics: 'Low lock prevents sudden traction loss. Low decel prevents lift-off spin.',
    },
    
    braking: {
      biasFront: { min: 50, max: 52 },
      pressure: { min: 85, max: 95 },
      notes: '50-52% actual front. Lower pressure allows modulation in wet.',
    },
    
    modifiers: {
      balance: -25,
      stiffness: 40,
      rideHeight: 'medium',
      diffAggression: 0.35,
      aeroLevel: 'medium',
    },
    
    tips: [
      'Strong understeer bias (-20 to -30) prevents snap oversteer in wet.',
      'Soft suspension (35-45) loads tires gently for wet grip buildout.',
      'Lower diff lock (0.3-0.5) prevents sudden traction loss on power.',
      'Brake bias 50-52% reduces lock-up risk.',
      'Reduced camber (-1.2° front) improves wet braking grip.',
      'AWD or FWD preferred; RWD snap oversteer is dangerous in rain.',
    ],
    
    warnings: [
      'Understeer heavy; may feel slow in dry conditions.',
      'Not recommended for grip racing in dry conditions.',
      'Wet tire compound selection is critical; street tires will hydroplane.',
      'Requires lower speeds and smooth inputs.',
    ],
  },

  {
    id: 'tandem-drift',
    name: 'Tandem Drift Pro',
    description: 'Responsive setup for following/leading in tandem drift sequences.',
    category: 'specialty',
    icon: '👯',
    applicableTuneTypes: ['drift'],
    applicableDriveTypes: ['RWD'],
    performanceClass: 'A-S1',
    corneringTendency: 'oversteer',
    speedCharacteristic: 'acceleration',
    difficulty: 'hard',
    
    tireCompound: {
      recommended: 'Drift or Street',
      pressureCold: { front: 31.0, rear: 24.0 },
      pressureHot: { front: 34.0, rear: 27.0 },
      flotationMode: false,
    },
    
    alignment: {
      camberFront: { min: -4.5, max: -5.0 },
      camberRear: { min: -0.3, max: -0.5 },
      toeInFront: { min: 2.0, max: 4.0 },
      toeInRear: { min: -0.3, max: 0.0 },
      caster: { min: 6.5, max: 7.0 },
    },
    
    suspension: {
      springFrequencyTarget: '2.0-2.2 Hz (Balanced)',
      rideHeight: 'medium',
      notes: 'Quick transitions allow following tight lines in tandem.',
    },
    
    differential: {
      driveType: 'RWD',
      accelLock: { min: 95, max: 98 },
      decelLock: { min: 95, max: 100 },
      physics: 'Near-locked maintains consistent angle. Slightly less lock than pure drift.',
    },
    
    braking: {
      biasFront: { min: 56, max: 58 },
      pressure: { min: 95, max: 100 },
      notes: 'Front-biased braking (42-44% actual) helps rotate in tandem entry.',
    },
    
    modifiers: {
      balance: 50,
      stiffness: 50,
      rideHeight: 'medium',
      diffAggression: 0.96,
      aeroLevel: 'none',
    },
    
    tips: [
      'Quick transitions (stiffness 45-55) let you follow tight lines.',
      'Near-locked diff (0.90-0.98) maintains consistent angle.',
      'Oversteer (45-60) responds instantly to input changes',
      'Brake bias 56-58% (42-44% actual) helps rotate in tandem.',
      'Extreme camber (-4.8°) for sustained drift grip.',
      'Positive toe-out (3°) assists inside wheel steering.',
    ],
    
    warnings: [
      'Slightly soft setup may cause momentum loss between corners.',
      'Requires constant steering input and precise timing.',
      'Not forgiving of mistakes in tandem; crash = both cars fail.',
    ],
  },
];

// HELPER FUNCTIONS
export function getTemplatesForTuneType(tuneType: TuneType): TuneTemplate[] {
  return tuneTemplates.filter(t => t.applicableTuneTypes.includes(tuneType));
}

export function getTemplatesForDriveType(driveType: DriveType): TuneTemplate[] {
  return tuneTemplates.filter(t => t.applicableDriveTypes.includes(driveType));
}

export function getCompatibleTemplates(tuneType: TuneType, driveType: DriveType): TuneTemplate[] {
  return tuneTemplates.filter(
    t => t.applicableTuneTypes.includes(tuneType) && t.applicableDriveTypes.includes(driveType)
  );
}

export function getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TuneTemplate[] {
  return tuneTemplates.filter(t => t.difficulty === difficulty);
}
