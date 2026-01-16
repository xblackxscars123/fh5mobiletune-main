// Verified specifications for popular Forza Horizon 5 cars
// These specs are research-verified and take priority over generated estimates

export interface VerifiedCarSpec {
  weight: number; // lbs
  weightDistribution: number; // front %
  driveType: 'RWD' | 'FWD' | 'AWD';
  defaultPI: number;
  notes?: string;
}

// Key format: "year make model" (lowercase, spaces replaced with -)
// Example: "1999-nissan-skyline-gt-r-v-spec"
export const verifiedSpecs: Record<string, VerifiedCarSpec> = {
  // ===== JDM LEGENDS =====
  '1999-nissan-skyline-gt-r-v-spec': {
    weight: 3450,
    weightDistribution: 55,
    driveType: 'AWD',
    defaultPI: 717,
    notes: 'R34 GT-R - Iconic JDM legend',
  },
  '2002-nissan-skyline-gt-r-v-spec-ii': {
    weight: 3484,
    weightDistribution: 55,
    driveType: 'AWD',
    defaultPI: 728,
    notes: 'R34 V-Spec II - Slightly heavier, better aero',
  },
  '1998-toyota-supra-rz': {
    weight: 3417,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 686,
    notes: 'A80 Supra - 2JZ-GTE, 320hp stock',
  },
  '1997-mazda-rx-7': {
    weight: 2789,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 664,
    notes: 'FD3S RX-7 - Twin-turbo 13B rotary',
  },
  '1992-mazda-rx-7-spirit-r-type-a': {
    weight: 2844,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 665,
    notes: 'Spirit R - Final edition FD',
  },
  '2005-honda-nsx-r': {
    weight: 2712,
    weightDistribution: 42,
    driveType: 'RWD',
    defaultPI: 698,
    notes: 'NA2 NSX-R - Mid-engine, VTEC',
  },
  '1994-honda-nsx-r': {
    weight: 2800,
    weightDistribution: 42,
    driveType: 'RWD',
    defaultPI: 643,
    notes: 'NA1 NSX-R - Lighter than standard NSX',
  },
  '2009-honda-s2000-cr': {
    weight: 2755,
    weightDistribution: 50,
    driveType: 'RWD',
    defaultPI: 602,
    notes: 'AP2 CR - Club Racer spec',
  },
  '1985-toyota-sprinter-trueno-gt-apex': {
    weight: 2093,
    weightDistribution: 57,
    driveType: 'RWD',
    defaultPI: 418,
    notes: 'AE86 - Tofu delivery legend',
  },
  '2000-nissan-silvia-spec-r': {
    weight: 2712,
    weightDistribution: 54,
    driveType: 'RWD',
    defaultPI: 585,
    notes: 'S15 Silvia - SR20DET, drift favorite',
  },
  '1994-nissan-silvia-k': {
    weight: 2624,
    weightDistribution: 54,
    driveType: 'RWD',
    defaultPI: 553,
    notes: 'S14 Silvia - Zenki model',
  },
  '1992-nissan-silvia-club-k-s': {
    weight: 2525,
    weightDistribution: 53,
    driveType: 'RWD',
    defaultPI: 518,
    notes: 'S13 Club K\'s - CA18DET',
  },
  '1993-nissan-skyline-gt-r-v-spec': {
    weight: 3241,
    weightDistribution: 56,
    driveType: 'AWD',
    defaultPI: 702,
    notes: 'R32 GT-R V-Spec - Godzilla',
  },
  '1995-nissan-skyline-gt-r-v-spec': {
    weight: 3329,
    weightDistribution: 56,
    driveType: 'AWD',
    defaultPI: 706,
    notes: 'R33 GT-R V-Spec - Balanced chassis',
  },
  '2008-mitsubishi-lancer-evolution-x-gsr': {
    weight: 3516,
    weightDistribution: 59,
    driveType: 'AWD',
    defaultPI: 681,
    notes: 'Evo X - Final Evolution',
  },
  '1999-mitsubishi-lancer-evolution-vi-gsr': {
    weight: 3009,
    weightDistribution: 58,
    driveType: 'AWD',
    defaultPI: 666,
    notes: 'Evo VI - Makinen edition base',
  },
  '2004-subaru-impreza-wrx-sti': {
    weight: 3263,
    weightDistribution: 60,
    driveType: 'AWD',
    defaultPI: 685,
    notes: 'GDB STI - Blobeye era',
  },
  '1998-subaru-impreza-22b-sti-version': {
    weight: 2877,
    weightDistribution: 59,
    driveType: 'AWD',
    defaultPI: 694,
    notes: '22B - Rare homologation special',
  },
  '2003-nissan-fairlady-z': {
    weight: 3201,
    weightDistribution: 53,
    driveType: 'RWD',
    defaultPI: 647,
    notes: '350Z - VQ35DE',
  },
  '1994-toyota-celica-gt-four-st205': {
    weight: 3153,
    weightDistribution: 60,
    driveType: 'AWD',
    defaultPI: 628,
    notes: 'ST205 Celica - WRC homologation',
  },
  '1992-toyota-mr2-gt': {
    weight: 2700,
    weightDistribution: 42,
    driveType: 'RWD',
    defaultPI: 548,
    notes: 'SW20 MR2 - Mid-engine turbo',
  },

  // ===== EUROPEAN LEGENDS =====
  '2005-bmw-m3': {
    weight: 3571,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 685,
    notes: 'E46 M3 - S54 inline-6',
  },
  '1991-bmw-m3': {
    weight: 2908,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 546,
    notes: 'E30 M3 - Homologation legend',
  },
  '1997-bmw-m3': {
    weight: 3175,
    weightDistribution: 50,
    driveType: 'RWD',
    defaultPI: 600,
    notes: 'E36 M3 - Smooth inline-6',
  },
  '2008-bmw-m3': {
    weight: 3704,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 717,
    notes: 'E92 M3 - V8 era',
  },
  '2019-porsche-911-gt3-rs': {
    weight: 3153,
    weightDistribution: 38,
    driveType: 'RWD',
    defaultPI: 882,
    notes: '991.2 GT3 RS - Track focused',
  },
  '1995-porsche-911-gt2': {
    weight: 2844,
    weightDistribution: 37,
    driveType: 'RWD',
    defaultPI: 757,
    notes: '993 GT2 - Widow maker',
  },
  '2018-porsche-911-gt2-rs': {
    weight: 3241,
    weightDistribution: 38,
    driveType: 'RWD',
    defaultPI: 958,
    notes: '991.2 GT2 RS - 700hp monster',
  },
  '1987-ferrari-f40': {
    weight: 2403,
    weightDistribution: 41,
    driveType: 'RWD',
    defaultPI: 823,
    notes: 'F40 - Enzo\'s final project',
  },
  '2003-ferrari-enzo-ferrari': {
    weight: 2976,
    weightDistribution: 42,
    driveType: 'RWD',
    defaultPI: 921,
    notes: 'Enzo - V12 hypercar',
  },
  '2013-mclaren-p1': {
    weight: 3303,
    weightDistribution: 42,
    driveType: 'RWD',
    defaultPI: 974,
    notes: 'P1 - Hybrid hypercar',
  },
  '2015-ferrari-laferrari': {
    weight: 3495,
    weightDistribution: 41,
    driveType: 'RWD',
    defaultPI: 981,
    notes: 'LaFerrari - Hybrid V12',
  },
  '2018-lamborghini-huracan-performante': {
    weight: 3046,
    weightDistribution: 43,
    driveType: 'AWD',
    defaultPI: 926,
    notes: 'Performante - ALA aero system',
  },
  '2016-lamborghini-aventador-sv': {
    weight: 3472,
    weightDistribution: 44,
    driveType: 'AWD',
    defaultPI: 928,
    notes: 'Aventador SV - Super Veloce',
  },

  // ===== AMERICAN MUSCLE =====
  '2020-ford-mustang-shelby-gt500': {
    weight: 4171,
    weightDistribution: 55,
    driveType: 'RWD',
    defaultPI: 851,
    notes: 'GT500 - 760hp supercharged',
  },
  '1969-ford-mustang-boss-302': {
    weight: 3400,
    weightDistribution: 55,
    driveType: 'RWD',
    defaultPI: 528,
    notes: 'Boss 302 - Trans-Am racer',
  },
  '2018-dodge-challenger-srt-demon': {
    weight: 4280,
    weightDistribution: 54,
    driveType: 'RWD',
    defaultPI: 831,
    notes: 'Demon - 840hp drag car',
  },
  '1970-dodge-challenger-r-t': {
    weight: 3785,
    weightDistribution: 55,
    driveType: 'RWD',
    defaultPI: 566,
    notes: 'Challenger R/T - 440 Six Pack',
  },
  '2019-chevrolet-corvette-zr1': {
    weight: 3560,
    weightDistribution: 49,
    driveType: 'RWD',
    defaultPI: 891,
    notes: 'C7 ZR1 - LT5 supercharged',
  },
  '2020-chevrolet-corvette-stingray': {
    weight: 3535,
    weightDistribution: 41,
    driveType: 'RWD',
    defaultPI: 826,
    notes: 'C8 Stingray - Mid-engine revolution',
  },
  '1967-chevrolet-corvette-stingray-427': {
    weight: 3120,
    weightDistribution: 51,
    driveType: 'RWD',
    defaultPI: 569,
    notes: 'C2 427 - L88 available',
  },

  // ===== RALLY & OFFROAD =====
  '1983-audi-sport-quattro': {
    weight: 2877,
    weightDistribution: 55,
    driveType: 'AWD',
    defaultPI: 631,
    notes: 'Sport quattro - Group B legend',
  },
  '1992-lancia-delta-hf-integrale-evo': {
    weight: 2866,
    weightDistribution: 61,
    driveType: 'AWD',
    defaultPI: 633,
    notes: 'Delta Integrale - WRC champion',
  },
  '1986-ford-rs200-evolution': {
    weight: 2513,
    weightDistribution: 42,
    driveType: 'AWD',
    defaultPI: 720,
    notes: 'RS200 Evo - Mid-engine Group B',
  },
  '2017-ford-fiesta-m-sport': {
    weight: 2645,
    weightDistribution: 63,
    driveType: 'AWD',
    defaultPI: 793,
    notes: 'WRC Fiesta - Modern rally car',
  },
  '2021-ford-bronco': {
    weight: 4700,
    weightDistribution: 53,
    driveType: 'AWD',
    defaultPI: 672,
    notes: 'New Bronco - Off-road focused',
  },
  '2017-ford-f-150-raptor': {
    weight: 5525,
    weightDistribution: 55,
    driveType: 'AWD',
    defaultPI: 702,
    notes: 'Raptor - Desert prerunner',
  },
};

/**
 * Get verified specs for a car if available
 */
export function getVerifiedSpecs(year: number, make: string, model: string): VerifiedCarSpec | null {
  // Normalize the lookup key
  const key = `${year}-${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Try exact match first
  if (verifiedSpecs[key]) {
    return verifiedSpecs[key];
  }
  
  // Try partial matches for common variations
  for (const [specKey, spec] of Object.entries(verifiedSpecs)) {
    // Check if the key contains all major parts
    const normalizedMake = make.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (specKey.includes(String(year)) && 
        specKey.includes(normalizedMake) && 
        (specKey.includes(normalizedModel.slice(0, 10)) || normalizedModel.includes(specKey.split('-').slice(2).join('')))) {
      return spec;
    }
  }
  
  return null;
}

/**
 * Check if a car has verified specs
 */
export function hasVerifiedSpecs(year: number, make: string, model: string): boolean {
  return getVerifiedSpecs(year, make, model) !== null;
}
