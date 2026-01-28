
export interface FH5Car {
  id: string;
  make: string;
  model: string;
  year: number;
  // Performance & Physics
  weight: number; // in lbs
  weightDistribution: number; // front percentage
  horsepower?: number; // HP
  torque?: number; // lb-ft
  displacement?: number; // Liters
  driveType: 'RWD' | 'FWD' | 'AWD';
  defaultPI: number;
  piClass?: string; // D, C, B, A, S1, S2, X
  // Tires & Gears
  frontTireWidth?: number; // mm
  rearTireWidth?: number; // mm
  stockGearCount?: number; // 4-10
  // Engine Details
  engineType?: string; // I4, V6, V8, etc.
  cylinders?: number;
  aspiration?: 'Naturally Aspirated' | 'Turbo' | 'Twin Turbo' | 'Supercharger' | 'Centrifugal Supercharger';
  enginePlacement?: 'Front' | 'Mid' | 'Rear';
  engineConfig?: string;
  // Meta
  category: 'retro' | 'modern' | 'super' | 'hyper' | 'muscle' | 'jdm' | 'euro' | 'offroad' | 'truck' | 'classic' | 'rally' | 'formula' | 'drift' | 'hot-hatch' | 'gt' | 'suv' | 'van' | 'buggy' | 'track' | 'ute' | 'limo' | 'special';
  carType?: string; // "Modern Sports Cars", "Retro Supercars", etc.
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Forza Edition';
  value?: number; // Credits
  boost?: string; // "Drift Skills", etc.
  nickname?: string;
  fh5Id?: number;
  region?: string;
  country?: string;
  modelFamily?: string;
  openTop?: boolean;
  links?: string[];
  shub?: {
    yearMakeModel?: string;
    nickname?: string;
    ordinal?: number;
    votes?: number;
    topic?: string;
    tags?: string;
    link?: string;
    specialAccess?: string;
    dlcPack?: string;
    spec?: string;
    doors?: string;
    steering?: string;
    wheels?: string;
    fh5Debut?: string;
    forzaDebut?: string;
    newToForza?: string;
    appearances?: {
      fh5?: string;
      fh4?: string;
      fm7?: string;
      fh3?: string;
      fm6?: string;
      fh2?: string;
      fm5?: string;
      fh1?: string;
      fm4?: string;
      fm3?: string;
      fm2?: string;
      fm1?: string;
      titlesCount?: number;
    };
  };
  // Stats (0-10)
  stats?: {
    speed: number;
    handling: number;
    acceleration: number;
    launch: number;
    braking: number;
    offroad: number;
  };
}
