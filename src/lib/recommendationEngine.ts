import { CarSpecs, TuneType, TuneSettings } from './tuningCalculator';

export interface Recommendation {
  id: string;
  type: 'optimization' | 'warning' | 'info' | 'suggestion';
  category: 'balance' | 'power' | 'suspension' | 'aerodynamics' | 'tires' | 'gearing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  impact: string;
  action?: {
    label: string;
    apply: (currentTune: TuneSettings) => Partial<TuneSettings>;
  };
}

export function generateRecommendations(
  specs: CarSpecs,
  currentTune: TuneSettings,
  tuneType: TuneType
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Power-to-weight analysis
  const powerToWeight = (specs.horsepower || 400) / (specs.weight / 1000);
  if (powerToWeight > 0.25) {
    recommendations.push({
      id: 'high-power-setup',
      type: 'optimization',
      category: 'suspension',
      priority: 'high',
      title: 'High-Performance Power Detected',
      message: 'Your car has exceptional power-to-weight ratio. Consider stiffer suspension to handle the acceleration forces.',
      impact: '+15-25% better stability under acceleration',
      action: {
        label: 'Apply Track Setup',
        apply: (tune) => ({
          springsFront: Math.round(tune.springsFront * 1.15),
          springsRear: Math.round(tune.springsRear * 1.15),
          arbFront: Math.min(65, Math.round(tune.arbFront * 1.1)),
          arbRear: Math.min(65, Math.round(tune.arbRear * 1.1))
        })
      }
    });
  }

  // Weight distribution analysis
  if (specs.weightDistribution < 45) {
    recommendations.push({
      id: 'extreme-front-bias',
      type: 'warning',
      category: 'balance',
      priority: 'high',
      title: 'Extreme Front Weight Bias',
      message: 'Very front-heavy distribution may cause significant understeer. Consider adjusting for better balance.',
      impact: 'Improved corner entry and reduced push',
      action: {
        label: 'Balance Setup',
        apply: (tune) => ({
          arbFront: Math.max(1, Math.round(tune.arbFront * 0.9)),
          arbRear: Math.min(65, Math.round(tune.arbRear * 1.1))
        })
      }
    });
  } else if (specs.weightDistribution > 55) {
    recommendations.push({
      id: 'extreme-rear-bias',
      type: 'warning',
      category: 'balance',
      priority: 'high',
      title: 'Extreme Rear Weight Bias',
      message: 'Very rear-heavy distribution may cause oversteer. Add front downforce or stiffen front suspension.',
      impact: 'Better stability and predictability',
      action: {
        label: 'Stabilize Front',
        apply: (tune) => ({
          arbFront: Math.min(65, Math.round(tune.arbFront * 1.15)),
          springsFront: Math.round(tune.springsFront * 1.08)
        })
      }
    });
  }

  // Aero recommendations
  if (!specs.hasAero && tuneType === 'grip') {
    recommendations.push({
      id: 'missing-aero-grip',
      type: 'suggestion',
      category: 'aerodynamics',
      priority: 'medium',
      title: 'Consider Aero for Circuit Racing',
      message: 'Aerodynamic downforce would significantly improve your lap times on technical circuits.',
      impact: '5-15% faster corner speeds',
      action: {
        label: 'Simulate Aero',
        apply: (tune) => ({
          aeroFront: Math.min(400, tune.aeroFront + 150),
          aeroRear: Math.min(400, tune.aeroRear + 150)
        })
      }
    });
  }

  // Tire compound optimization
  if (specs.tireCompound === 'street' && tuneType === 'grip') {
    recommendations.push({
      id: 'upgrade-tires-grip',
      type: 'optimization',
      category: 'tires',
      priority: 'medium',
      title: 'Tire Upgrade Available',
      message: 'Sport or semi-slick tires would provide better grip for circuit driving.',
      impact: '10-20% better traction in corners',
    });
  }

  // Gearing optimization
  const finalDriveRatio = currentTune.finalDrive;
  if (finalDriveRatio < 3.0 && specs.horsepower && specs.horsepower > 500) {
    recommendations.push({
      id: 'long-gearing-high-power',
      type: 'optimization',
      category: 'gearing',
      priority: 'medium',
      title: 'Consider Shorter Gearing',
      message: 'High-power cars benefit from shorter gearing to keep the engine in the powerband.',
      impact: 'Better acceleration and throttle response',
      action: {
        label: 'Optimize Gearing',
        apply: (tune) => ({
          finalDrive: Math.max(2.5, tune.finalDrive * 0.9)
        })
      }
    });
  }

  // Track-specific recommendations based on tune type
  switch (tuneType) {
    case 'drift':
      if (currentTune.diffAccelRear < 90) {
        recommendations.push({
          id: 'drift-diff-locks',
          type: 'optimization',
          category: 'balance',
          priority: 'high',
          title: 'Increase Diff Locks for Drifting',
          message: 'Higher differential lock percentages help maintain consistent slide angles.',
          impact: 'More predictable and controllable slides',
          action: {
            label: 'Apply Drift Setup',
            apply: (tune) => ({
              diffAccelRear: 95,
              diffDecelRear: 95,
              tirePressureFront: Math.max(14, tune.tirePressureFront + 5),
              tirePressureRear: Math.max(14, tune.tirePressureRear - 2)
            })
          }
        });
      }
      break;

    case 'drag':
      if (currentTune.diffAccelRear < 95) {
        recommendations.push({
          id: 'drag-diff-max',
          type: 'optimization',
          category: 'balance',
          priority: 'high',
          title: 'Maximize Diff Lock for Launch',
          message: '100% acceleration lock ensures maximum traction off the line.',
          impact: 'Better 60-foot times and consistency',
          action: {
            label: 'Apply Drag Setup',
            apply: (tune) => ({
              diffAccelRear: 100,
              tirePressureFront: Math.min(55, tune.tirePressureFront + 10),
              tirePressureRear: Math.max(14, tune.tirePressureRear - 5)
            })
          }
        });
      }
      break;

    case 'offroad':
      if (currentTune.rideHeightFront < 8 || currentTune.rideHeightRear < 8) {
        recommendations.push({
          id: 'offroad-ride-height',
          type: 'optimization',
          category: 'suspension',
          priority: 'high',
          title: 'Increase Ride Height',
          message: 'Higher ride height prevents bottoming and improves stability over rough terrain.',
          impact: 'Better ground clearance and suspension travel',
          action: {
            label: 'Apply Offroad Setup',
            apply: (tune) => ({
              rideHeightFront: Math.min(12, tune.rideHeightFront + 3),
              rideHeightRear: Math.min(12, tune.rideHeightRear + 3),
              diffAccelRear: Math.min(100, tune.diffAccelRear + 20)
            })
          }
        });
      }
      break;
  }

  // Sort by priority and return top recommendations
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 4); // Limit to top 4 recommendations
}

export function applyRecommendation(
  currentTune: TuneSettings,
  recommendation: Recommendation
): TuneSettings {
  if (!recommendation.action) return currentTune;

  const changes = recommendation.action.apply(currentTune);
  return { ...currentTune, ...changes };
}