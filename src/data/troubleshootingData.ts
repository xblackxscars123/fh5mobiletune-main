// Troubleshooting data for common handling issues
// Maps problems to specific tuning adjustments with severity levels

export interface Adjustment {
  component: string;
  setting: string;
  currentValue: number;
  recommendedValue: number;
  adjustment: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TroubleshootingProblem {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  getAdjustments: (currentTune: any, driveType: string) => Adjustment[];
}

export const troubleshootingProblems: TroubleshootingProblem[] = [
  {
    id: 'oversteer-entry',
    title: 'Oversteer on Entry',
    description: 'Car becomes loose when turning into corners',
    symptoms: [
      'Rear slides out when braking into corners',
      'Car feels unstable on corner entry',
      'Need to correct steering immediately when turning'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Differential',
        setting: 'Rear Deceleration',
        currentValue: tune.diffDecelRear || 25,
        recommendedValue: Math.max(10, tune.diffDecelRear - 15),
        adjustment: `Reduce by 15% (from ${tune.diffDecelRear || 25}% to ${Math.max(10, tune.diffDecelRear - 15)}%)`,
        reason: 'Less rear decel lockup reduces sudden rear wheel braking effect',
        priority: 'high'
      },
      {
        component: 'Brakes',
        setting: 'Brake Balance',
        currentValue: tune.brakeBalance,
        recommendedValue: Math.min(60, tune.brakeBalance + 5),
        adjustment: `Move 5% forward (from ${tune.brakeBalance}% to ${Math.min(60, tune.brakeBalance + 5)}% front)`,
        reason: 'More front brake bias reduces rear wheel lockup under braking',
        priority: 'high'
      },
      {
        component: 'Springs',
        setting: 'Front Springs',
        currentValue: tune.springsFront,
        recommendedValue: Math.max(tune.springsFront * 0.9, tune.springsFront - 100),
        adjustment: `Soften by ~10% (from ${tune.springsFront} to ${Math.max(tune.springsFront * 0.9, tune.springsFront - 100)} lb)`,
        reason: 'Softer front springs allow more weight transfer to front tires',
        priority: 'medium'
      },
      {
        component: 'Damping',
        setting: 'Front Rebound',
        currentValue: tune.reboundFront,
        recommendedValue: Math.max(1, tune.reboundFront - 2),
        adjustment: `Reduce by 2 clicks (from ${tune.reboundFront} to ${Math.max(1, tune.reboundFront - 2)})`,
        reason: 'Less front rebound allows faster weight transfer to front',
        priority: 'medium'
      }
    ]
  },

  {
    id: 'oversteer-exit',
    title: 'Oversteer on Exit',
    description: 'Car breaks loose when accelerating out of corners',
    symptoms: [
      'Rear wheels spin when applying throttle',
      'Car wants to rotate when exiting corners',
      'Difficult to apply full power on corner exit'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Differential',
        setting: driveType === 'RWD' ? 'Rear Acceleration' : 
                  driveType === 'FWD' ? 'Front Acceleration' : 'Rear Acceleration',
        currentValue: driveType === 'RWD' ? tune.diffAccelRear : 
                      driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear,
        recommendedValue: Math.min(90, (driveType === 'RWD' ? tune.diffAccelRear : 
                                       driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear) + 10),
        adjustment: `Increase by 10% (from ${driveType === 'RWD' ? tune.diffAccelRear : 
                                           driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear}% to ${Math.min(90, (driveType === 'RWD' ? tune.diffAccelRear : 
                                                                                                                                 driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear) + 10)}%)`,
        reason: 'More accel lockup provides better power delivery to both wheels',
        priority: 'high'
      },
      {
        component: 'Springs',
        setting: 'Rear Springs',
        currentValue: tune.springsRear,
        recommendedValue: Math.min(tune.springsRear * 1.1, tune.springsRear + 100),
        adjustment: `Stiffen by ~10% (from ${tune.springsRear} to ${Math.min(tune.springsRear * 1.1, tune.springsRear + 100)} lb)`,
        reason: 'Stiffer rear springs reduce rear squat under acceleration',
        priority: 'medium'
      },
      {
        component: 'Aero',
        setting: 'Rear Aero',
        currentValue: tune.aeroRear,
        recommendedValue: Math.min(300, tune.aeroRear + 25),
        adjustment: `Add 25 lbs (from ${tune.aeroRear} to ${Math.min(300, tune.aeroRear + 25)} lb)`,
        reason: 'More rear downforce improves traction on exit',
        priority: 'medium'
      }
    ]
  },

  {
    id: 'understeer-entry',
    title: 'Understeer on Entry',
    description: 'Car doesn\'t turn in enough, pushes wide through corners',
    symptoms: [
      'Car runs wide when entering corners',
      'Need to slow down more than expected for corners',
      'Front tires lose grip and slide'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Anti-Roll Bars',
        setting: 'Front ARB',
        currentValue: tune.arbFront,
        recommendedValue: Math.max(1, tune.arbFront - 3),
        adjustment: `Reduce by 3 settings (from ${tune.arbFront} to ${Math.max(1, tune.arbFront - 3)})`,
        reason: 'Softer front ARB allows more front tire grip',
        priority: 'high'
      },
      {
        component: 'Springs',
        setting: 'Front Springs',
        currentValue: tune.springsFront,
        recommendedValue: Math.max(tune.springsFront * 0.9, tune.springsFront - 100),
        adjustment: `Soften by ~10% (from ${tune.springsFront} to ${Math.max(tune.springsFront * 0.9, tune.springsFront - 100)} lb)`,
        reason: 'Softer front springs improve mechanical grip',
        priority: 'high'
      },
      {
        component: 'Alignment',
        setting: 'Front Camber',
        currentValue: tune.camberFront,
        recommendedValue: Math.min(-3.5, tune.camberFront - 0.3),
        adjustment: `Add negative camber (from ${tune.camberFront}° to ${Math.min(-3.5, tune.camberFront - 0.3)}°)`,
        reason: 'More negative camber increases front tire contact patch',
        priority: 'medium'
      },
      {
        component: 'Brakes',
        setting: 'Brake Balance',
        currentValue: tune.brakeBalance,
        recommendedValue: Math.max(45, tune.brakeBalance - 3),
        adjustment: `Move 3% rearward (from ${tune.brakeBalance}% to ${Math.max(45, tune.brakeBalance - 3)}% front)`,
        reason: 'More rear brake bias helps rotate the car into corners',
        priority: 'medium'
      }
    ]
  },

  {
    id: 'understeer-exit',
    title: 'Understeer on Exit',
    description: 'Car pushes wide when accelerating out of corners',
    symptoms: [
      'Car continues straight when applying throttle',
      'Front tires lose grip on corner exit',
      'Cannot use full power until car is straight'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Differential',
        setting: driveType === 'RWD' ? 'Rear Acceleration' : 
                  driveType === 'FWD' ? 'Front Acceleration' : 'Rear Acceleration',
        currentValue: driveType === 'RWD' ? tune.diffAccelRear : 
                      driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear,
        recommendedValue: Math.max(20, (driveType === 'RWD' ? tune.diffAccelRear : 
                                       driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear) - 10),
        adjustment: `Reduce by 10% (from ${driveType === 'RWD' ? tune.diffAccelRear : 
                                           driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear}% to ${Math.max(20, (driveType === 'RWD' ? tune.diffAccelRear : 
                                                                                                                                 driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear) - 10)}%)`,
        reason: 'Less accel lockup allows inside wheel to spin more, helping rotation',
        priority: 'high'
      },
      {
        component: 'Anti-Roll Bars',
        setting: 'Rear ARB',
        currentValue: tune.arbRear,
        recommendedValue: Math.max(1, tune.arbRear - 2),
        adjustment: `Reduce by 2 settings (from ${tune.arbRear} to ${Math.max(1, tune.arbRear - 2)})`,
        reason: 'Softer rear ARB allows more rear grip for better rotation',
        priority: 'medium'
      },
      {
        component: 'Aero',
        setting: 'Front Aero',
        currentValue: tune.aeroFront,
        recommendedValue: Math.min(200, tune.aeroFront + 15),
        adjustment: `Add 15 lbs (from ${tune.aeroFront} to ${Math.min(200, tune.aeroFront + 15)} lb)`,
        reason: 'More front downforce improves front grip on exit',
        priority: 'medium'
      }
    ]
  },

  {
    id: 'mid-corner-loose',
    title: 'Loose in Mid-Corner',
    description: 'Car feels unstable and slides in the middle of corners',
    symptoms: [
      'Car suddenly breaks loose mid-corner',
      'Difficult to maintain consistent line',
      'Requires constant steering corrections'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Damping',
        setting: 'Rear Rebound',
        currentValue: tune.reboundRear,
        recommendedValue: Math.max(1, tune.reboundRear - 2),
        adjustment: `Reduce by 2 clicks (from ${tune.reboundRear} to ${Math.max(1, tune.reboundRear - 2)})`,
        reason: 'Less rear rebound allows faster weight transfer stabilization',
        priority: 'high'
      },
      {
        component: 'Anti-Roll Bars',
        setting: 'Front ARB',
        currentValue: tune.arbFront,
        recommendedValue: Math.min(40, tune.arbFront + 2),
        adjustment: `Increase by 2 settings (from ${tune.arbFront} to ${Math.min(40, tune.arbFront + 2)})`,
        reason: 'Stiffer front ARB reduces body roll and improves stability',
        priority: 'medium'
      },
      {
        component: 'Springs',
        setting: 'Rear Springs',
        currentValue: tune.springsRear,
        recommendedValue: Math.max(tune.springsRear * 0.95, tune.springsRear - 50),
        adjustment: `Soften slightly (from ${tune.springsRear} to ${Math.max(tune.springsRear * 0.95, tune.springsRear - 50)} lb)`,
        reason: 'Slightly softer rear springs improve compliance',
        priority: 'low'
      }
    ]
  },

  {
    id: 'mid-corner-tight',
    title: 'Tight/Push in Mid-Corner',
    description: 'Car feels stuck and won\'t turn in the middle of corners',
    symptoms: [
      'Car gets stuck in understeer mid-corner',
      'Cannot maintain tight racing line',
      'Front tires lose grip progressively'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Anti-Roll Bars',
        setting: 'Rear ARB',
        currentValue: tune.arbRear,
        recommendedValue: Math.max(1, tune.arbRear - 2),
        adjustment: `Reduce by 2 settings (from ${tune.arbRear} to ${Math.max(1, tune.arbRear - 2)})`,
        reason: 'Softer rear ARB allows more rear grip to help rotate car',
        priority: 'high'
      },
      {
        component: 'Alignment',
        setting: 'Front Toe',
        currentValue: tune.toeFront,
        recommendedValue: Math.max(0.1, tune.toeFront - 0.1),
        adjustment: `Reduce toe-out (from ${tune.toeFront}° to ${Math.max(0.1, tune.toeFront - 0.1)}°)`,
        reason: 'Less toe-out reduces scrub and improves mid-corner grip',
        priority: 'medium'
      },
      {
        component: 'Damping',
        setting: 'Front Bump',
        currentValue: tune.bumpFront,
        recommendedValue: Math.max(1, tune.bumpFront - 1),
        adjustment: `Reduce by 1 click (from ${tune.bumpFront} to ${Math.max(1, tune.bumpFront - 1)})`,
        reason: 'Softer front bump allows better tire compliance',
        priority: 'low'
      }
    ]
  },

  {
    id: 'brake-instability',
    title: 'Brake Instability',
    description: 'Car becomes unstable under heavy braking',
    symptoms: [
      'Car wants to spin when braking hard',
      'Difficult to brake late for corners',
      'Car wanders under braking'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Brakes',
        setting: 'Brake Balance',
        currentValue: tune.brakeBalance,
        recommendedValue: Math.min(60, tune.brakeBalance + 5),
        adjustment: `Move 5% forward (from ${tune.brakeBalance}% to ${Math.min(60, tune.brakeBalance + 5)}% front)`,
        reason: 'More front bias reduces rear wheel lockup',
        priority: 'high'
      },
      {
        component: 'Differential',
        setting: 'Rear Deceleration',
        currentValue: tune.diffDecelRear || 25,
        recommendedValue: Math.max(10, (tune.diffDecelRear || 25) - 10),
        adjustment: `Reduce by 10% (from ${tune.diffDecelRear || 25}% to ${Math.max(10, (tune.diffDecelRear || 25) - 10)}%)`,
        reason: 'Less rear decel lockup improves stability under braking',
        priority: 'high'
      },
      {
        component: 'Damping',
        setting: 'Front Rebound',
        currentValue: tune.reboundFront,
        recommendedValue: Math.max(1, tune.reboundFront - 1),
        adjustment: `Reduce by 1 click (from ${tune.reboundFront} to ${Math.max(1, tune.reboundFront - 1)})`,
        reason: 'Less front rebound improves weight transfer under braking',
        priority: 'medium'
      }
    ]
  },

  {
    id: 'bumpy-understeer',
    title: 'Understeer on Bumpy Surfaces',
    description: 'Car pushes wide on uneven or bumpy track sections',
    symptoms: [
      'Car loses front grip over bumps',
      'Cannot maintain line through bumpy corners',
      'Front tires skip over imperfections'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Damping',
        setting: 'Front Bump',
        currentValue: tune.bumpFront,
        recommendedValue: Math.max(1, tune.bumpFront - 2),
        adjustment: `Reduce by 2 clicks (from ${tune.bumpFront} to ${Math.max(1, tune.bumpFront - 2)})`,
        reason: 'Softer front bump allows tires to follow bumps better',
        priority: 'high'
      },
      {
        component: 'Damping',
        setting: 'Front Rebound',
        currentValue: tune.reboundFront,
        recommendedValue: Math.max(1, tune.reboundFront - 2),
        adjustment: `Reduce by 2 clicks (from ${tune.reboundFront} to ${Math.max(1, tune.reboundFront - 2)})`,
        reason: 'Softer front rebound improves tire compliance',
        priority: 'high'
      },
      {
        component: 'Springs',
        setting: 'Front Springs',
        currentValue: tune.springsFront,
        recommendedValue: Math.max(tune.springsFront * 0.9, tune.springsFront - 80),
        adjustment: `Soften by ~10% (from ${tune.springsFront} to ${Math.max(tune.springsFront * 0.9, tune.springsFront - 80)} lb)`,
        reason: 'Softer front springs absorb bumps better',
        priority: 'medium'
      },
      {
        component: 'Tires',
        setting: 'Front Tire Pressure',
        currentValue: tune.tirePressureFront,
        recommendedValue: Math.max(26, tune.tirePressureFront - 2),
        adjustment: `Reduce by 2 PSI (from ${tune.tirePressureFront} to ${Math.max(26, tune.tirePressureFront - 2)} PSI)`,
        reason: 'Lower pressure improves tire compliance on bumpy surfaces',
        priority: 'medium'
      }
    ]
  },

  {
    id: 'high-speed-instability',
    title: 'High Speed Instability',
    description: 'Car feels nervous and unstable at high speeds',
    symptoms: [
      'Car wanders on straights',
      'Difficult to control in fast corners',
      'Feels like it\'s "floating" at speed'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Damping',
        setting: 'Rear Rebound',
        currentValue: tune.reboundRear,
        recommendedValue: Math.min(20, tune.reboundRear + 2),
        adjustment: `Increase by 2 clicks (from ${tune.reboundRear} to ${Math.min(20, tune.reboundRear + 2)})`,
        reason: 'More rear rebound improves high-speed stability',
        priority: 'high'
      },
      {
        component: 'Anti-Roll Bars',
        setting: 'Rear ARB',
        currentValue: tune.arbRear,
        recommendedValue: Math.min(40, tune.arbRear + 2),
        adjustment: `Increase by 2 settings (from ${tune.arbRear} to ${Math.min(40, tune.arbRear + 2)})`,
        reason: 'Stiffer rear ARB reduces body roll at high speed',
        priority: 'medium'
      },
      {
        component: 'Aero',
        setting: 'Rear Aero',
        currentValue: tune.aeroRear,
        recommendedValue: Math.min(300, tune.aeroRear + 30),
        adjustment: `Add 30 lbs (from ${tune.aeroRear} to ${Math.min(300, tune.aeroRear + 30)} lb)`,
        reason: 'More rear downforce improves high-speed stability',
        priority: 'medium'
      },
      {
        component: 'Ride Height',
        setting: 'Rear Ride Height',
        currentValue: tune.rideHeightRear,
        recommendedValue: Math.max(3.5, tune.rideHeightRear - 0.2),
        adjustment: `Lower by 0.2" (from ${tune.rideHeightRear} to ${Math.max(3.5, tune.rideHeightRear - 0.2)})`,
        reason: 'Lower rear reduces aerodynamic lift',
        priority: 'low'
      }
    ]
  },

  {
    id: 'traction-issues',
    title: 'Poor Traction',
    description: 'Wheels spin easily and struggle to put power down',
    symptoms: [
      'Wheels spin on acceleration',
      'Poor launch from standstill',
      'Difficult to apply power smoothly'
    ],
    getAdjustments: (tune, driveType) => [
      {
        component: 'Differential',
        setting: driveType === 'RWD' ? 'Rear Acceleration' : 
                  driveType === 'FWD' ? 'Front Acceleration' : 'Rear Acceleration',
        currentValue: driveType === 'RWD' ? tune.diffAccelRear : 
                      driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear,
        recommendedValue: Math.min(85, (driveType === 'RWD' ? tune.diffAccelRear : 
                                       driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear) + 15),
        adjustment: `Increase by 15% (from ${driveType === 'RWD' ? tune.diffAccelRear : 
                                           driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear}% to ${Math.min(85, (driveType === 'RWD' ? tune.diffAccelRear : 
                                                                                                                                 driveType === 'FWD' ? tune.diffAccelFront : tune.diffAccelRear) + 15)}%)`,
        reason: 'More accel lockup improves power distribution to both wheels',
        priority: 'high'
      },
      {
        component: 'Springs',
        setting: driveType === 'RWD' ? 'Rear Springs' : 'Front Springs',
        currentValue: driveType === 'RWD' ? tune.springsRear : tune.springsFront,
        recommendedValue: Math.min((driveType === 'RWD' ? tune.springsRear : tune.springsFront) * 1.15, 
                                  (driveType === 'RWD' ? tune.springsRear : tune.springsFront) + 150),
        adjustment: `Stiffen drive axle springs by ~15% (from ${driveType === 'RWD' ? tune.springsRear : tune.springsFront} to ${Math.min((driveType === 'RWD' ? tune.springsRear : tune.springsFront) * 1.15, (driveType === 'RWD' ? tune.springsRear : tune.springsFront) + 150)} lb)`,
        reason: 'Stiffer drive springs reduce wheel squat under acceleration',
        priority: 'high'
      },
      {
        component: 'Tires',
        setting: driveType === 'RWD' ? 'Rear Tire Pressure' : 'Front Tire Pressure',
        currentValue: driveType === 'RWD' ? tune.tirePressureRear : tune.tirePressureFront,
        recommendedValue: Math.min(35, (driveType === 'RWD' ? tune.tirePressureRear : tune.tirePressureFront) + 2),
        adjustment: `Increase drive axle pressure by 2 PSI (from ${driveType === 'RWD' ? tune.tirePressureRear : tune.tirePressureFront} to ${Math.min(35, (driveType === 'RWD' ? tune.tirePressureRear : tune.tirePressureFront) + 2)} PSI)`,
        reason: 'Higher pressure reduces tire deformation under load',
        priority: 'medium'
      },
      {
        component: 'Aero',
        setting: driveType === 'RWD' ? 'Rear Aero' : 'Front Aero',
        currentValue: driveType === 'RWD' ? tune.aeroRear : tune.aeroFront,
        recommendedValue: Math.min(driveType === 'RWD' ? 300 : 200, (driveType === 'RWD' ? tune.aeroRear : tune.aeroFront) + 20),
        adjustment: `Add 20 lbs to drive axle aero (from ${driveType === 'RWD' ? tune.aeroRear : tune.aeroFront} to ${Math.min(driveType === 'RWD' ? 300 : 200, (driveType === 'RWD' ? tune.aeroRear : tune.aeroFront) + 20)} lb)`,
        reason: 'More downforce on drive wheels improves traction',
        priority: 'medium'
      }
    ]
  }
];

export function getTroubleshootingProblem(id: string): TroubleshootingProblem | undefined {
  return troubleshootingProblems.find(problem => problem.id === id);
}

export function getAllTroubleshootingProblems(): TroubleshootingProblem[] {
  return troubleshootingProblems;
}
