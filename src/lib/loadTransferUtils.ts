/**
 * Load Transfer Utility Functions
 * Consolidates weight transfer calculations from multiple files
 * Single source of truth for load transfer physics
 */

/**
 * Calculate longitudinal (fore-aft) weight transfer during acceleration/braking
 * @param weight - Vehicle weight (lbs)
 * @param cgHeight - Center of gravity height (inches)
 * @param wheelBase - Wheelbase length (inches)
 * @param acceleration - Acceleration factor (-1.0 to +1.0, negative = braking)
 * @param grade - Road grade/slope (degrees)
 * @returns Weight transfer as percentage of total weight
 */
export function calculateLongitudinalTransfer(
  weight: number,
  cgHeight: number,
  wheelBase: number,
  acceleration: number,
  grade: number = 0
): number {
  // Load transfer = (Accel × CG Height / Wheelbase) × 100
  // Higher CG and shorter wheelbase = more transfer
  
  const baseTransfer = (acceleration * cgHeight / wheelBase) * 100;
  
  // Grade effect: gravity component adds to acceleration
  const gradeAccel = Math.sin((grade * Math.PI) / 180) * 32.2;
  const totalAccel = acceleration * 32.2 + gradeAccel;
  const gradeTransfer = (totalAccel / 32.2) * cgHeight / wheelBase * 100;
  
  return Math.max(-100, Math.min(100, gradeTransfer));
}

/**
 * Calculate lateral (side-to-side) weight transfer during cornering
 * @param weight - Vehicle weight (lbs)
 * @param cgHeight - Center of gravity height (inches)
 * @param trackWidth - Track width (inches)
 * @param corneringForce - Cornering G-force (0-2.0)
 * @returns Weight transfer percentage
 */
export function calculateLateralTransfer(
  weight: number,
  cgHeight: number,
  trackWidth: number,
  corneringForce: number
): number {
  // Load transfer = (Cornering G × CG Height / Track Width) × 100
  // Higher CG and narrower track = more transfer
  
  const transfer = (corneringForce * cgHeight / trackWidth) * 100;
  return Math.max(0, Math.min(100, transfer));
}

/**
 * Calculate front and rear axle load percentages given load transfer
 * @param baseFrontPercent - Static front weight percentage (0-100)
 * @param longitudinalTransfer - Longitudinal weight transfer (-100 to +100)
 * @param lateralTransfer - Lateral weight transfer (0-100)
 * @returns Object with front and rear percentages
 */
export function calculateAxleLoads(
  baseFrontPercent: number,
  longitudinalTransfer: number,
  lateralTransfer: number = 0
): {
  frontAxleLoad: number;
  rearAxleLoad: number;
  leftLoad: number;
  rightLoad: number;
} {
  // Longitudinal transfer: positive = to rear (more weight on rear)
  // Lateral transfer: affects left-right distribution
  
  const frontLoadAdjusted = baseFrontPercent - (longitudinalTransfer / 2);
  const rearLoadAdjusted = 100 - frontLoadAdjusted;
  
  // Apply lateral transfer (simplified - affects both axles equally)
  const leftLoad = 50 - (lateralTransfer / 2);
  const rightLoad = 50 + (lateralTransfer / 2);
  
  return {
    frontAxleLoad: Math.max(0, Math.min(100, frontLoadAdjusted)),
    rearAxleLoad: Math.max(0, Math.min(100, rearLoadAdjusted)),
    leftLoad: Math.max(0, Math.min(100, leftLoad)),
    rightLoad: Math.max(0, Math.min(100, rightLoad))
  };
}

/**
 * Calculate load on each wheel during combined acceleration + cornering
 * @param weight - Total vehicle weight (lbs)
 * @param frontPercent - Front weight distribution percentage
 * @param longitudinalTransfer - Longitudinal load transfer (-100 to +100)
 * @param lateralTransfer - Lateral load transfer (0-100)
 * @returns Object with load on each wheel
 */
export function calculateWheelLoads(
  weight: number,
  frontPercent: number,
  longitudinalTransfer: number,
  lateralTransfer: number
): {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
  description: string;
} {
  const axleLoads = calculateAxleLoads(frontPercent, longitudinalTransfer, lateralTransfer);
  
  const frontWeight = (weight * axleLoads.frontAxleLoad) / 100;
  const rearWeight = (weight * axleLoads.rearAxleLoad) / 100;
  
  const frontLeft = (frontWeight * axleLoads.leftLoad) / 100;
  const frontRight = (frontWeight * axleLoads.rightLoad) / 100;
  const rearLeft = (rearWeight * axleLoads.leftLoad) / 100;
  const rearRight = (rearWeight * axleLoads.rightLoad) / 100;
  
  let description = 'Load balanced';
  if (Math.abs(frontLeft - frontRight) > weight * 0.15) {
    description = 'Heavy lateral load transfer';
  }
  if (Math.abs(longitudinalTransfer) > 40) {
    description = 'Heavy longitudinal load transfer';
  }
  
  return {
    frontLeft: Math.round(frontLeft),
    frontRight: Math.round(frontRight),
    rearLeft: Math.round(rearLeft),
    rearRight: Math.round(rearRight),
    description
  };
}

/**
 * Analyze load transfer effects on grip
 * @param transfer - Load transfer percentage (-100 to +100)
 * @param baseGrip - Base tire grip multiplier
 * @returns Grip multiplier after load transfer effect
 */
export function analyzeLoadTransferGripEffect(
  transfer: number,
  baseGrip: number = 1.0
): number {
  // Load transfer reduces grip on unloaded wheels, increases on loaded wheels
  // Extreme transfers (>60%) significantly reduce total grip
  
  const transferFactor = 1 - (Math.abs(transfer) / 200); // Max grip reduction at 100% transfer
  const gripReduction = Math.max(0.7, transferFactor); // Never below 70% grip
  
  return baseGrip * gripReduction;
}

/**
 * Get suspension adjustment recommendation based on load transfer
 * @param longitudinalTransfer - Longitudinal load transfer value
 * @param lateralTransfer - Lateral load transfer value
 * @returns Array of tuning recommendations
 */
export function getLoadTransferAdjustments(
  longitudinalTransfer: number,
  lateralTransfer: number
): string[] {
  const recommendations: string[] = [];
  
  // Longitudinal transfer recommendations
  if (longitudinalTransfer > 30) {
    recommendations.push('High load transfer to rear: Increase rear spring rate or ARB');
  }
  if (longitudinalTransfer < -30) {
    recommendations.push('High load transfer to front: Increase front spring rate or ARB');
  }
  
  // Lateral transfer recommendations
  if (lateralTransfer > 50) {
    recommendations.push('Extreme lateral load transfer: Reduce ride height or increase track width');
  }
  if (lateralTransfer > 30) {
    recommendations.push('High lateral load transfer: Increase anti-roll bar stiffness');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Load transfer balanced - suspension well-tuned');
  }
  
  return recommendations;
}
