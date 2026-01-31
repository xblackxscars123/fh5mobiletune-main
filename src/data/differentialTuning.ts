// Differential tuning system for Forza Horizon 5
// Provides baseline percentages and scaling functions for different drive types and driving styles

export type DriveType = 'AWD' | 'RWD' | 'FWD';
export type DrivingStyle = 'Stable' | 'Balanced' | 'Aggressive';
export type TuneType = 'street' | 'race' | 'drift' | 'drag' | 'offroad' | 'rally';

export interface DifferentialSettings {
  // AWD specific
  centerBalance?: number; // % torque to rear (50 = 50/50 split)
  frontAccel?: number;    // % locking under acceleration
  frontDecel?: number;    // % locking under deceleration
  rearAccel?: number;     // % locking under acceleration
  rearDecel?: number;     // % locking under deceleration
  
  // RWD/FWD specific (use different property names to avoid conflicts)
  rwdAccel?: number;       // % locking under acceleration (RWD)
  rwdDecel?: number;       // % locking under deceleration (RWD)
  fwdAccel?: number;       // % locking under acceleration (FWD)
  fwdDecel?: number;       // % locking under deceleration (FWD)
}

export interface DifferentialBaseline {
  driveType: DriveType;
  tuneType: TuneType;
  settings: DifferentialSettings;
  description: string;
  pros: string[];
  cons: string[];
}

// Baseline differential settings for different drive types and tune types
export const differentialBaselines: DifferentialBaseline[] = [
  // AWD - Street
  {
    driveType: 'AWD',
    tuneType: 'street',
    settings: {
      centerBalance: 55,    // Slight rear bias for better rotation
      frontAccel: 25,       // Moderate front locking
      frontDecel: 15,       // Low front decel for stability
      rearAccel: 35,        // Higher rear accel for traction
      rearDecel: 25         // Moderate rear decel
    },
    description: "Balanced street setup with good traction and stability",
    pros: ["Good all-around traction", "Stable under braking", "Predictable handling"],
    cons: ["Less rotation than race setup", "Moderate tire wear"]
  },
  
  // AWD - Race
  {
    driveType: 'AWD',
    tuneType: 'race',
    settings: {
      centerBalance: 60,    // More rear bias for rotation
      frontAccel: 30,       // Higher front accel for corner exit
      frontDecel: 10,       // Very low front decel for turn-in
      rearAccel: 45,        // High rear accel for maximum traction
      rearDecel: 20         // Lower rear decel for stability
    },
    description: "Aggressive race setup focused on maximum performance",
    pros: ["Excellent corner exit traction", "Good rotation", "Fast lap times"],
    cons: ["Less stable under braking", "Higher tire wear", "Requires more skill"]
  },

  // AWD - Drift
  {
    driveType: 'AWD',
    tuneType: 'drift',
    settings: {
      centerBalance: 70,    // Strong rear bias for oversteer
      frontAccel: 15,       // Low front accel to allow slip
      frontDecel: 5,        // Very low front decel
      rearAccel: 25,        // Moderate rear accel for control
      rearDecel: 15         // Low rear decel for smooth transitions
    },
    description: "Drift-focused setup for controlled oversteer",
    pros: ["Easy to initiate drifts", "Smooth angle transitions", "Good control"],
    cons: ["Poor straight-line traction", "Unstable in normal driving"]
  },

  // RWD - Street
  {
    driveType: 'RWD',
    tuneType: 'street',
    settings: {
      rwdAccel: 45,            // Moderate accel for traction
      rwdDecel: 25             // Moderate decel for stability
    },
    description: "Balanced street setup for predictable handling",
    pros: ["Good traction", "Stable under braking", "Easy to drive"],
    cons: ["Less aggressive than race setup", "Moderate rotation"]
  },

  // RWD - Race
  {
    driveType: 'RWD',
    tuneType: 'race',
    settings: {
      rwdAccel: 65,            // High accel for maximum traction
      rwdDecel: 15             // Low decel for better turn-in
    },
    description: "Performance-focused race setup",
    pros: ["Maximum corner exit traction", "Good rotation", "Fast lap times"],
    cons: ["Can be unstable under braking", "Requires precise throttle control"]
  },

  // RWD - Drift
  {
    driveType: 'RWD',
    tuneType: 'drift',
    settings: {
      rwdAccel: 20,            // Very low accel for easy wheel spin
      rwdDecel: 10             // Very low decel for smooth transitions
    },
    description: "Drift setup for controlled oversteer",
    pros: ["Easy to maintain drift angle", "Smooth transitions", "Good control"],
    cons: ["Poor traction", "Unstable in normal driving"]
  },

  // FWD - Street
  {
    driveType: 'FWD',
    tuneType: 'street',
    settings: {
      fwdAccel: 35,            // Moderate accel for traction
      fwdDecel: 20             // Moderate decel for stability
    },
    description: "Balanced street setup for FWD cars",
    pros: ["Good traction", "Stable", "Predictable"],
    cons: ["Understeer tendency", "Less rotation"]
  },

  // FWD - Race
  {
    driveType: 'FWD',
    tuneType: 'race',
    settings: {
      fwdAccel: 50,            // Higher accel for better traction
      fwdDecel: 15             // Lower decel for better turn-in
    },
    description: "Performance race setup for FWD cars",
    pros: ["Better corner exit traction", "Reduced understeer", "Faster lap times"],
    cons: ["More wheel spin", "Requires throttle control"]
  }
];

// Scaling factors for different driving styles
export const drivingStyleMultipliers = {
  Stable: {
    acceleration: 0.8,    // Reduce accel locking for stability
    deceleration: 1.3,    // Increase decel locking for stability
    centerBalance: -5     // Move balance toward front for stability
  },
  Balanced: {
    acceleration: 1.0,    // No change
    deceleration: 1.0,    // No change
    centerBalance: 0      // No change
  },
  Aggressive: {
    acceleration: 1.3,    // Increase accel locking for traction
    deceleration: 0.7,    // Reduce decel locking for rotation
    centerBalance: 5      // Move balance toward rear for rotation
  }
};

export function getBaselineDifferential(driveType: DriveType, tuneType: TuneType): DifferentialBaseline | null {
  return differentialBaselines.find(baseline => 
    baseline.driveType === driveType && baseline.tuneType === tuneType
  ) || null;
}

export function scaleDifferentialForDrivingStyle(
  baseline: DifferentialSettings,
  driveType: DriveType,
  style: DrivingStyle
): DifferentialSettings {
  const multipliers = drivingStyleMultipliers[style];
  const scaled = { ...baseline };

  if (driveType === 'AWD') {
    // Scale AWD settings
    if (scaled.frontAccel) {
      scaled.frontAccel = Math.round(Math.min(90, Math.max(0, scaled.frontAccel * multipliers.acceleration)));
    }
    if (scaled.frontDecel) {
      scaled.frontDecel = Math.round(Math.min(90, Math.max(0, scaled.frontDecel * multipliers.deceleration)));
    }
    if (scaled.rearAccel) {
      scaled.rearAccel = Math.round(Math.min(90, Math.max(0, scaled.rearAccel * multipliers.acceleration)));
    }
    if (scaled.rearDecel) {
      scaled.rearDecel = Math.round(Math.min(90, Math.max(0, scaled.rearDecel * multipliers.deceleration)));
    }
    if (scaled.centerBalance !== undefined) {
      scaled.centerBalance = Math.round(Math.min(75, Math.max(25, scaled.centerBalance + multipliers.centerBalance)));
    }
  } else {
    // Scale RWD/FWD settings
    if (scaled.rwdAccel) {
      scaled.rwdAccel = Math.round(Math.min(90, Math.max(0, scaled.rwdAccel * multipliers.acceleration)));
    }
    if (scaled.rwdDecel) {
      scaled.rwdDecel = Math.round(Math.min(90, Math.max(0, scaled.rwdDecel * multipliers.deceleration)));
    }
    if (scaled.fwdAccel) {
      scaled.fwdAccel = Math.round(Math.min(90, Math.max(0, scaled.fwdAccel * multipliers.acceleration)));
    }
    if (scaled.fwdDecel) {
      scaled.fwdDecel = Math.round(Math.min(90, Math.max(0, scaled.fwdDecel * multipliers.deceleration)));
    }
  }

  return scaled;
}

export function calculateDifferential(
  driveType: DriveType,
  tuneType: TuneType,
  drivingStyle: DrivingStyle = 'Balanced'
): DifferentialSettings | null {
  const baseline = getBaselineDifferential(driveType, tuneType);
  if (!baseline) return null;

  return scaleDifferentialForDrivingStyle(baseline.settings, driveType, drivingStyle);
}

export function getDifferentialRecommendation(
  driveType: DriveType,
  tuneType: TuneType,
  drivingStyle: DrivingStyle = 'Balanced'
): {
  settings: DifferentialSettings;
  baseline: DifferentialBaseline;
  explanation: string;
  tips: string[];
} | null {
  const baseline = getBaselineDifferential(driveType, tuneType);
  if (!baseline) return null;

  const settings = scaleDifferentialForDrivingStyle(baseline.settings, driveType, drivingStyle);
  const multipliers = drivingStyleMultipliers[drivingStyle];

  const explanation = `Based on ${drivingStyle.toLowerCase()} driving style, this ${driveType} ${tuneType} setup ${
    drivingStyle === 'Stable' ? 'prioritizes stability and predictability' :
    drivingStyle === 'Aggressive' ? 'maximizes performance and rotation' :
    'provides a balanced approach'
  }.`;

  const tips = [
    drivingStyle === 'Stable' ? 'Focus on smooth inputs and consistent lines' :
    drivingStyle === 'Aggressive' ? 'Be prepared for more responsive handling' :
    'Adjust based on track conditions and personal preference',
    `Monitor tire temperatures to optimize the differential settings`,
    `Consider weather conditions - wet weather may require more stable settings`
  ];

  if (driveType === 'AWD') {
    tips.push(
      'Center balance affects overall handling characteristics',
      'Front differential primarily affects turn-in',
      'Rear differential primarily affects corner exit'
    );
  } else if (driveType === 'RWD') {
    tips.push(
      'Acceleration setting affects traction on corner exit',
      'Deceleration setting affects stability under braking',
      'Higher accel settings can cause inside wheel spin'
    );
  } else {
    tips.push(
      'FWD cars benefit from moderate accel settings for traction',
      'Too much accel can cause excessive wheel spin',
      'Decel settings help reduce understeer'
    );
  }

  return {
    settings,
    baseline,
    explanation,
    tips
  };
}

export function validateDifferentialSettings(settings: DifferentialSettings, driveType: DriveType): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (driveType === 'AWD') {
    // Validate AWD settings
    if (settings.centerBalance !== undefined) {
      if (settings.centerBalance < 25 || settings.centerBalance > 75) {
        errors.push('Center balance must be between 25% and 75%');
      } else if (settings.centerBalance < 35 || settings.centerBalance > 65) {
        warnings.push('Extreme center balance may cause unpredictable handling');
      }
    }

    if (settings.frontAccel !== undefined) {
      if (settings.frontAccel < 0 || settings.frontAccel > 90) {
        errors.push('Front acceleration must be between 0% and 90%');
      } else if (settings.frontAccel > 70) {
        warnings.push('Very high front acceleration may cause understeer');
      }
    }

    if (settings.rearAccel !== undefined) {
      if (settings.rearAccel < 0 || settings.rearAccel > 90) {
        errors.push('Rear acceleration must be between 0% and 90%');
      } else if (settings.rearAccel > 75) {
        warnings.push('Very high rear acceleration may reduce rotation');
      }
    }
  } else {
    // Validate RWD/FWD settings
    if (settings.rwdAccel !== undefined) {
      if (settings.rwdAccel < 0 || settings.rwdAccel > 90) {
        errors.push('Acceleration must be between 0% and 90%');
      } else if (settings.rwdAccel > 75) {
        warnings.push('Very high acceleration may cause wheel spin');
      }
    }

    if (settings.rwdDecel !== undefined) {
      if (settings.rwdDecel < 0 || settings.rwdDecel > 90) {
        errors.push('Deceleration must be between 0% and 90%');
      } else if (settings.rwdDecel > 60) {
        warnings.push('Very high deceleration may cause instability');
      }
    }

    if (settings.fwdAccel !== undefined) {
      if (settings.fwdAccel < 0 || settings.fwdAccel > 90) {
        errors.push('Acceleration must be between 0% and 90%');
      } else if (settings.fwdAccel > 75) {
        warnings.push('Very high acceleration may cause wheel spin');
      }
    }

    if (settings.fwdDecel !== undefined) {
      if (settings.fwdDecel < 0 || settings.fwdDecel > 90) {
        errors.push('Deceleration must be between 0% and 90%');
      } else if (settings.fwdDecel > 60) {
        warnings.push('Very high deceleration may cause instability');
      }
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

// Utility function to format differential settings for display
export function formatDifferentialSettings(settings: DifferentialSettings, driveType: DriveType): string[] {
  const lines: string[] = [];

  if (driveType === 'AWD') {
    lines.push(`Center Balance: ${settings.centerBalance || 50}% Rear`);
    lines.push(`Front Accel: ${settings.frontAccel || 0}%`);
    lines.push(`Front Decel: ${settings.frontDecel || 0}%`);
    lines.push(`Rear Accel: ${settings.rearAccel || 0}%`);
    lines.push(`Rear Decel: ${settings.rearDecel || 0}%`);
  } else {
    // Format RWD/FWD settings
    const accel = driveType === 'RWD' ? settings.rwdAccel : settings.fwdAccel;
    const decel = driveType === 'RWD' ? settings.rwdDecel : settings.fwdDecel;
    
    lines.push(`Acceleration: ${accel || 0}%`);
    lines.push(`Deceleration: ${decel || 0}%`);
  }

  return lines;
}
