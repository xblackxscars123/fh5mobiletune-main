import { TuneType, DriveType } from '@/lib/tuningCalculator';

export interface TuneTemplate {
  id: string;
  name: string;
  description: string;
  category: 'starter' | 'meta' | 'specialty';
  icon: string;
  applicableTuneTypes: TuneType[];
  applicableDriveTypes: DriveType[];
  modifiers: {
    balance: number; // -100 (understeer) to +100 (oversteer)
    stiffness: number; // 0 (soft) to 100 (stiff)
    rideHeight: 'low' | 'medium' | 'high';
    diffAggression: number; // 0 to 1
    aeroLevel: 'none' | 'low' | 'medium' | 'high';
  };
  tips: string[];
}

export const tuneTemplates: TuneTemplate[] = [
  // STARTER TEMPLATES
  {
    id: 'track-day-special',
    name: 'Track Day Special',
    description: 'Stiff, low, maximum grip for circuit racing. Precision handling for hot laps.',
    category: 'starter',
    icon: '🏁',
    applicableTuneTypes: ['grip'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    modifiers: {
      balance: 0,
      stiffness: 80,
      rideHeight: 'low',
      diffAggression: 0.7,
      aeroLevel: 'high',
    },
    tips: [
      'Lower ride height reduces center of gravity',
      'Stiff springs prevent body roll in corners',
      'High aero adds grip at speed but increases drag',
    ],
  },
  {
    id: 'highway-cruiser',
    name: 'Highway Cruiser',
    description: 'Comfortable street tune with excellent stability. Great for cruise events.',
    category: 'starter',
    icon: '🛣️',
    applicableTuneTypes: ['street'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    modifiers: {
      balance: -20,
      stiffness: 30,
      rideHeight: 'medium',
      diffAggression: 0.3,
      aeroLevel: 'low',
    },
    tips: [
      'Softer suspension absorbs bumps better',
      'Slight understeer bias increases stability',
      'Lower diff aggression prevents wheel spin',
    ],
  },
  {
    id: 'drift-machine',
    name: 'Drift Machine',
    description: 'Max angle, controlled slides. Tuned for style points and linking corners.',
    category: 'starter',
    icon: '🌀',
    applicableTuneTypes: ['drift'],
    applicableDriveTypes: ['RWD', 'AWD'],
    modifiers: {
      balance: 60,
      stiffness: 45,
      rideHeight: 'medium',
      diffAggression: 1.0,
      aeroLevel: 'none',
    },
    tips: [
      'Oversteer bias initiates slides easily',
      'Locked diff maintains consistent angle',
      'No aero allows the rear to break loose',
    ],
  },
  {
    id: 'rally-ready',
    name: 'Rally Ready',
    description: 'Soft suspension, high travel. Built for gravel, dirt, and mixed surfaces.',
    category: 'starter',
    icon: '🌲',
    applicableTuneTypes: ['rally', 'offroad'],
    applicableDriveTypes: ['AWD', 'RWD'],
    modifiers: {
      balance: 10,
      stiffness: 25,
      rideHeight: 'high',
      diffAggression: 0.5,
      aeroLevel: 'none',
    },
    tips: [
      'Soft springs absorb terrain impacts',
      'Higher ride height clears obstacles',
      'Moderate diff allows corner rotation',
    ],
  },
  {
    id: 'drag-strip-king',
    name: 'Drag Strip King',
    description: 'Maximum straight-line speed. Optimized for 1/4 and 1/2 mile sprints.',
    category: 'starter',
    icon: '🚀',
    applicableTuneTypes: ['drag'],
    applicableDriveTypes: ['RWD', 'AWD'],
    modifiers: {
      balance: -30,
      stiffness: 70,
      rideHeight: 'low',
      diffAggression: 1.0,
      aeroLevel: 'none',
    },
    tips: [
      'Understeer bias keeps you straight',
      'Locked diff maximizes launch traction',
      'No aero reduces drag for top speed',
    ],
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    description: 'Balanced for mixed use. Great for Horizon Open and varied events.',
    category: 'starter',
    icon: '⚖️',
    applicableTuneTypes: ['grip', 'street'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    modifiers: {
      balance: 0,
      stiffness: 50,
      rideHeight: 'medium',
      diffAggression: 0.5,
      aeroLevel: 'medium',
    },
    tips: [
      'Neutral balance adapts to any situation',
      'Medium settings work everywhere',
      'Good starting point for fine-tuning',
    ],
  },

  // META TEMPLATES (Competitive)
  {
    id: 's2-road-meta',
    name: 'S2 Road Racing Meta',
    description: 'Competitive S2 class setup. Used by top rivals players.',
    category: 'meta',
    icon: '🏆',
    applicableTuneTypes: ['grip'],
    applicableDriveTypes: ['AWD', 'RWD'],
    modifiers: {
      balance: 5,
      stiffness: 85,
      rideHeight: 'low',
      diffAggression: 0.8,
      aeroLevel: 'high',
    },
    tips: [
      'Slight oversteer for quick rotation',
      'Very stiff for S2 power levels',
      'Max aero for high-speed corners',
    ],
  },
  {
    id: 'a-class-rivals',
    name: 'A-Class Rivals Setup',
    description: 'Optimized A-class handling. The sweet spot of power and grip.',
    category: 'meta',
    icon: '🎯',
    applicableTuneTypes: ['grip'],
    applicableDriveTypes: ['RWD', 'AWD', 'FWD'],
    modifiers: {
      balance: -5,
      stiffness: 65,
      rideHeight: 'low',
      diffAggression: 0.6,
      aeroLevel: 'medium',
    },
    tips: [
      'Slight understeer for consistency',
      'Moderate stiffness suits A-class power',
      'FWD benefits from this template',
    ],
  },
  {
    id: 'x-class-drag',
    name: 'X-Class Drag Build',
    description: 'Maximum power launch setup. For 1500+ HP monsters.',
    category: 'meta',
    icon: '⚡',
    applicableTuneTypes: ['drag'],
    applicableDriveTypes: ['AWD'],
    modifiers: {
      balance: -40,
      stiffness: 90,
      rideHeight: 'low',
      diffAggression: 1.0,
      aeroLevel: 'none',
    },
    tips: [
      'Strong understeer prevents wheelies',
      'Very stiff to handle massive power',
      'AWD essential for launching X-class',
    ],
  },

  // SPECIALTY TEMPLATES
  {
    id: 'tandem-drift',
    name: 'Tandem Drift Pro',
    description: 'Responsive setup for following or leading in tandem drift.',
    category: 'specialty',
    icon: '👯',
    applicableTuneTypes: ['drift'],
    applicableDriveTypes: ['RWD'],
    modifiers: {
      balance: 50,
      stiffness: 50,
      rideHeight: 'medium',
      diffAggression: 0.95,
      aeroLevel: 'none',
    },
    tips: [
      'Quick transitions for following',
      'Slightly softer for adjustability',
      'Near-locked diff for consistency',
    ],
  },
  {
    id: 'cross-country',
    name: 'Cross Country Beast',
    description: 'High-speed off-road racing. Jumps, bumps, and everything between.',
    category: 'specialty',
    icon: '🦌',
    applicableTuneTypes: ['offroad'],
    applicableDriveTypes: ['AWD'],
    modifiers: {
      balance: 0,
      stiffness: 35,
      rideHeight: 'high',
      diffAggression: 0.7,
      aeroLevel: 'none',
    },
    tips: [
      'Neutral for landing stability',
      'Soft enough to absorb big jumps',
      'High diff keeps power down on bumps',
    ],
  },
  {
    id: 'wet-weather',
    name: 'Wet Weather Warrior',
    description: 'Optimized for rain and low-grip conditions.',
    category: 'specialty',
    icon: '🌧️',
    applicableTuneTypes: ['grip', 'street'],
    applicableDriveTypes: ['AWD', 'FWD'],
    modifiers: {
      balance: -25,
      stiffness: 40,
      rideHeight: 'medium',
      diffAggression: 0.4,
      aeroLevel: 'medium',
    },
    tips: [
      'Understeer bias prevents snap oversteer',
      'Softer setup loads tires gently',
      'Lower diff prevents wheelspin',
    ],
  },
];

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
