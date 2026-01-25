/**
 * PI Class Constants for Forza Horizon 5
 * Unified PI class thresholds and performance tiers
 * Eliminates hardcoded PI checks throughout codebase
 */

export enum PIClass {
  S2 = 'S2',
  S1 = 'S1',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E'
}

export interface PIClassThreshold {
  class: PIClass;
  minPI: number;
  maxPI: number;
  maxPower: number; // hp
  maxWeight: number; // lbs
  description: string;
  characteristics: string[];
}

/**
 * PI Class definitions for Forza Horizon 5
 * Each class has different tuning priorities and constraints
 */
export const PI_CLASS_THRESHOLDS: Record<PIClass, PIClassThreshold> = {
  [PIClass.S2]: {
    class: PIClass.S2,
    minPI: 900,
    maxPI: 999,
    maxPower: 999,
    maxWeight: 5000,
    description: 'Extreme hypercars and prototype racers',
    characteristics: [
      'Nearly unlimited tuning options',
      'Maximum power and performance allowed',
      'Typically 950+ hp',
      'Fastest circuit and drag cars'
    ]
  },

  [PIClass.S1]: {
    class: PIClass.S1,
    minPI: 800,
    maxPI: 899,
    maxPower: 899,
    maxWeight: 5000,
    description: 'Elite supercars and race-tuned machines',
    characteristics: [
      'Very high performance machines',
      'Typically 700-850 hp',
      'Dominant on most tracks',
      'Requires precision tuning'
    ]
  },

  [PIClass.A]: {
    class: PIClass.A,
    minPI: 600,
    maxPI: 799,
    maxPower: 799,
    maxWeight: 5000,
    description: 'High-performance sports cars',
    characteristics: [
      'Balanced power and handling',
      'Typically 500-700 hp',
      'Good all-around performers',
      'Accessible high-end cars'
    ]
  },

  [PIClass.B]: {
    class: PIClass.B,
    minPI: 400,
    maxPI: 599,
    maxPower: 599,
    maxWeight: 5000,
    description: 'Sports and muscle cars',
    characteristics: [
      'Strong power delivery',
      'Typically 350-500 hp',
      'Competitive on most tracks',
      'Good upgrade potential'
    ]
  },

  [PIClass.C]: {
    class: PIClass.C,
    minPI: 200,
    maxPI: 399,
    maxPower: 399,
    maxWeight: 5000,
    description: 'Hot hatches and entry-level sports cars',
    characteristics: [
      'Moderate performance',
      'Typically 200-350 hp',
      'Common and accessible',
      'Sensitive to tuning'
    ]
  },

  [PIClass.D]: {
    class: PIClass.D,
    minPI: 100,
    maxPI: 199,
    maxPower: 199,
    maxWeight: 5000,
    description: 'Economy and compact cars',
    characteristics: [
      'Light and nimble',
      'Typically 100-180 hp',
      'Best on technical circuits',
      'Vulnerable to power'
    ]
  },

  [PIClass.E]: {
    class: PIClass.E,
    minPI: 0,
    maxPI: 99,
    maxPower: 99,
    maxWeight: 5000,
    description: 'Stock and lightly tuned classics',
    characteristics: [
      'Minimal power upgrades',
      'Under 100 hp',
      'Vintage and heritage focus',
      'Grassroots racing'
    ]
  }
};

/**
 * Get PI class for a given PI rating
 */
export function getPIClass(pi: number): PIClass {
  if (pi >= 900) return PIClass.S2;
  if (pi >= 800) return PIClass.S1;
  if (pi >= 600) return PIClass.A;
  if (pi >= 400) return PIClass.B;
  if (pi >= 200) return PIClass.C;
  if (pi >= 100) return PIClass.D;
  return PIClass.E;
}

/**
 * Check if a PI value is within a specific class
 */
export function isInPIClass(pi: number, piClass: PIClass): boolean {
  const threshold = PI_CLASS_THRESHOLDS[piClass];
  return pi >= threshold.minPI && pi <= threshold.maxPI;
}

/**
 * Get PI class threshold information
 */
export function getPIClassInfo(piClass: PIClass): PIClassThreshold {
  return PI_CLASS_THRESHOLDS[piClass];
}

/**
 * Get all PI classes ordered from highest to lowest
 */
export function getAllPIClassesOrdered(): PIClass[] {
  return [PIClass.S2, PIClass.S1, PIClass.A, PIClass.B, PIClass.C, PIClass.D, PIClass.E];
}

/**
 * Get performance multiplier for a PI class (1.0 = baseline)
 */
export function getPIClassPerformanceMultiplier(piClass: PIClass): number {
  const multipliers: Record<PIClass, number> = {
    [PIClass.S2]: 1.95,
    [PIClass.S1]: 1.75,
    [PIClass.A]: 1.45,
    [PIClass.B]: 1.15,
    [PIClass.C]: 0.85,
    [PIClass.D]: 0.55,
    [PIClass.E]: 0.35
  };
  return multipliers[piClass];
}
