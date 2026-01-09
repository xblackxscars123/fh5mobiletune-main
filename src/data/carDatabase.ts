// Forza Horizon 5 Car Database
// Data compiled from community sources and in-game stats

export interface FH5Car {
  id: string;
  make: string;
  model: string;
  year: number;
  weight: number; // in lbs
  weightDistribution: number; // front percentage
  driveType: 'RWD' | 'FWD' | 'AWD';
  defaultPI: number;
  category: 'retro' | 'modern' | 'super' | 'hyper' | 'muscle' | 'jdm' | 'euro' | 'offroad' | 'truck' | 'classic' | 'rally' | 'formula';
}

export const fh5Cars: FH5Car[] = [
  // ACURA
  { id: 'acura-integra-2001', make: 'Acura', model: 'Integra Type-R', year: 2001, weight: 2639, weightDistribution: 61, driveType: 'FWD', defaultPI: 582, category: 'jdm' },
  { id: 'acura-nsx-2005', make: 'Acura', model: 'NSX', year: 2005, weight: 3153, weightDistribution: 43, driveType: 'RWD', defaultPI: 693, category: 'jdm' },
  { id: 'acura-nsx-2017', make: 'Acura', model: 'NSX', year: 2017, weight: 3803, weightDistribution: 42, driveType: 'AWD', defaultPI: 837, category: 'modern' },
  { id: 'acura-rsx-2002', make: 'Acura', model: 'RSX Type-S', year: 2002, weight: 2778, weightDistribution: 62, driveType: 'FWD', defaultPI: 516, category: 'jdm' },
  
  // ALFA ROMEO
  { id: 'alfa-8c-2007', make: 'Alfa Romeo', model: '8C Competizione', year: 2007, weight: 3594, weightDistribution: 49, driveType: 'RWD', defaultPI: 759, category: 'euro' },
  { id: 'alfa-33-1967', make: 'Alfa Romeo', model: '33 Stradale', year: 1967, weight: 1543, weightDistribution: 46, driveType: 'RWD', defaultPI: 556, category: 'classic' },
  { id: 'alfa-4c-2014', make: 'Alfa Romeo', model: '4C', year: 2014, weight: 2315, weightDistribution: 40, driveType: 'RWD', defaultPI: 696, category: 'euro' },
  { id: 'alfa-giulia-2017', make: 'Alfa Romeo', model: 'Giulia Quadrifoglio', year: 2017, weight: 3571, weightDistribution: 52, driveType: 'RWD', defaultPI: 788, category: 'modern' },
  { id: 'alfa-giulia-tz2-1965', make: 'Alfa Romeo', model: 'Giulia TZ2', year: 1965, weight: 1433, weightDistribution: 50, driveType: 'RWD', defaultPI: 497, category: 'classic' },
  { id: 'alfa-stelvio-2018', make: 'Alfa Romeo', model: 'Stelvio Quadrifoglio', year: 2018, weight: 4266, weightDistribution: 53, driveType: 'AWD', defaultPI: 761, category: 'modern' },
  
  // ALPINE
  { id: 'alpine-a110-1973', make: 'Alpine', model: 'A110 1600s', year: 1973, weight: 1609, weightDistribution: 41, driveType: 'RWD', defaultPI: 429, category: 'retro' },
  { id: 'alpine-a110-2017', make: 'Alpine', model: 'A110', year: 2017, weight: 2436, weightDistribution: 44, driveType: 'RWD', defaultPI: 698, category: 'modern' },
  
  // AMC
  { id: 'amc-javelin-1971', make: 'AMC', model: 'Javelin AMX', year: 1971, weight: 3340, weightDistribution: 54, driveType: 'RWD', defaultPI: 497, category: 'muscle' },
  { id: 'amc-rebel-1970', make: 'AMC', model: 'Rebel "The Machine"', year: 1970, weight: 3650, weightDistribution: 55, driveType: 'RWD', defaultPI: 489, category: 'muscle' },
  { id: 'amc-gremlin-1973', make: 'AMC', model: 'Gremlin X', year: 1973, weight: 2943, weightDistribution: 56, driveType: 'RWD', defaultPI: 339, category: 'retro' },
  { id: 'amc-pacer-1977', make: 'AMC', model: 'Pacer X', year: 1977, weight: 3195, weightDistribution: 57, driveType: 'RWD', defaultPI: 226, category: 'retro' },
  
  // AMG
  { id: 'amg-one-2021', make: 'Mercedes-AMG', model: 'ONE', year: 2021, weight: 3461, weightDistribution: 44, driveType: 'AWD', defaultPI: 998, category: 'hyper' },
  
  // APOLLO
  { id: 'apollo-ie-2018', make: 'Apollo', model: 'Intensa Emozione', year: 2018, weight: 2976, weightDistribution: 43, driveType: 'RWD', defaultPI: 963, category: 'hyper' },
  
  // ARIEL
  { id: 'ariel-atom-2016', make: 'Ariel', model: 'Atom 500 V8', year: 2016, weight: 1213, weightDistribution: 45, driveType: 'RWD', defaultPI: 853, category: 'super' },
  { id: 'ariel-nomad-2016', make: 'Ariel', model: 'Nomad', year: 2016, weight: 1477, weightDistribution: 48, driveType: 'RWD', defaultPI: 623, category: 'offroad' },
  
  // ASTON MARTIN
  { id: 'aston-db4-1960', make: 'Aston Martin', model: 'DB4 GT Zagato', year: 1960, weight: 2536, weightDistribution: 51, driveType: 'RWD', defaultPI: 512, category: 'classic' },
  { id: 'aston-db5-1964', make: 'Aston Martin', model: 'DB5', year: 1964, weight: 3252, weightDistribution: 51, driveType: 'RWD', defaultPI: 425, category: 'classic' },
  { id: 'aston-db11-2017', make: 'Aston Martin', model: 'DB11', year: 2017, weight: 3902, weightDistribution: 51, driveType: 'RWD', defaultPI: 805, category: 'modern' },
  { id: 'aston-dbs-2008', make: 'Aston Martin', model: 'DBS', year: 2008, weight: 3737, weightDistribution: 51, driveType: 'RWD', defaultPI: 760, category: 'super' },
  { id: 'aston-dbs-superleggera-2019', make: 'Aston Martin', model: 'DBS Superleggera', year: 2019, weight: 3855, weightDistribution: 51, driveType: 'RWD', defaultPI: 852, category: 'super' },
  { id: 'aston-one77-2010', make: 'Aston Martin', model: 'One-77', year: 2010, weight: 3594, weightDistribution: 49, driveType: 'RWD', defaultPI: 856, category: 'hyper' },
  { id: 'aston-valhalla-2020', make: 'Aston Martin', model: 'Valhalla Concept', year: 2020, weight: 3197, weightDistribution: 43, driveType: 'AWD', defaultPI: 933, category: 'hyper' },
  { id: 'aston-valkyrie-2019', make: 'Aston Martin', model: 'Valkyrie', year: 2019, weight: 2271, weightDistribution: 44, driveType: 'RWD', defaultPI: 998, category: 'hyper' },
  { id: 'aston-vantage-2019', make: 'Aston Martin', model: 'Vantage', year: 2019, weight: 3373, weightDistribution: 50, driveType: 'RWD', defaultPI: 787, category: 'modern' },
  { id: 'aston-vulcan-2016', make: 'Aston Martin', model: 'Vulcan', year: 2016, weight: 2976, weightDistribution: 47, driveType: 'RWD', defaultPI: 925, category: 'hyper' },
  { id: 'aston-vanquish-2012', make: 'Aston Martin', model: 'Vanquish', year: 2012, weight: 3924, weightDistribution: 51, driveType: 'RWD', defaultPI: 786, category: 'super' },
  
  // AUDI
  { id: 'audi-r8-2013', make: 'Audi', model: 'R8 Coupe V10 Plus', year: 2013, weight: 3439, weightDistribution: 44, driveType: 'AWD', defaultPI: 818, category: 'super' },
  { id: 'audi-r8-2019', make: 'Audi', model: 'R8 V10 Performance', year: 2019, weight: 3516, weightDistribution: 42, driveType: 'AWD', defaultPI: 868, category: 'super' },
  { id: 'audi-rs3-2018', make: 'Audi', model: 'RS 3 Sedan', year: 2018, weight: 3373, weightDistribution: 59, driveType: 'AWD', defaultPI: 709, category: 'modern' },
  { id: 'audi-rs4-2013', make: 'Audi', model: 'RS 4 Avant', year: 2013, weight: 3990, weightDistribution: 57, driveType: 'AWD', defaultPI: 722, category: 'modern' },
  { id: 'audi-rs5-2011', make: 'Audi', model: 'RS 5 Coupe', year: 2011, weight: 3814, weightDistribution: 55, driveType: 'AWD', defaultPI: 718, category: 'modern' },
  { id: 'audi-rs6-2003', make: 'Audi', model: 'RS 6', year: 2003, weight: 4145, weightDistribution: 60, driveType: 'AWD', defaultPI: 681, category: 'modern' },
  { id: 'audi-rs6-2020', make: 'Audi', model: 'RS 6 Avant', year: 2020, weight: 4542, weightDistribution: 56, driveType: 'AWD', defaultPI: 808, category: 'modern' },
  { id: 'audi-rs7-2021', make: 'Audi', model: 'RS 7 Sportback', year: 2021, weight: 4718, weightDistribution: 56, driveType: 'AWD', defaultPI: 819, category: 'modern' },
  { id: 'audi-tt-rs-2018', make: 'Audi', model: 'TT RS', year: 2018, weight: 3197, weightDistribution: 57, driveType: 'AWD', defaultPI: 742, category: 'modern' },
  { id: 'audi-s1-1985', make: 'Audi', model: 'Sport Quattro S1', year: 1985, weight: 2756, weightDistribution: 55, driveType: 'AWD', defaultPI: 743, category: 'rally' },
  { id: 'audi-quattro-1983', make: 'Audi', model: 'Quattro', year: 1983, weight: 2888, weightDistribution: 57, driveType: 'AWD', defaultPI: 519, category: 'rally' },
  { id: 'audi-s4-2001', make: 'Audi', model: 'S4', year: 2001, weight: 3373, weightDistribution: 59, driveType: 'AWD', defaultPI: 561, category: 'modern' },
  { id: 'audi-etron-gt-2021', make: 'Audi', model: 'RS e-tron GT', year: 2021, weight: 5148, weightDistribution: 48, driveType: 'AWD', defaultPI: 849, category: 'modern' },
  
  // BAC
  { id: 'bac-mono-2014', make: 'BAC', model: 'Mono', year: 2014, weight: 1278, weightDistribution: 47, driveType: 'RWD', defaultPI: 841, category: 'super' },
  
  // BENTLEY
  { id: 'bentley-continental-gt-2018', make: 'Bentley', model: 'Continental GT', year: 2018, weight: 4893, weightDistribution: 57, driveType: 'AWD', defaultPI: 756, category: 'modern' },
  { id: 'bentley-continental-gt-speed-2016', make: 'Bentley', model: 'Continental GT Speed', year: 2016, weight: 5049, weightDistribution: 57, driveType: 'AWD', defaultPI: 778, category: 'modern' },
  { id: 'bentley-continental-supersports-2018', make: 'Bentley', model: 'Continental Supersports', year: 2018, weight: 4827, weightDistribution: 57, driveType: 'AWD', defaultPI: 830, category: 'modern' },
  { id: 'bentley-4-5litre-1927', make: 'Bentley', model: '4-1/2 Litre Supercharged', year: 1927, weight: 3770, weightDistribution: 50, driveType: 'RWD', defaultPI: 251, category: 'classic' },
  { id: 'bentley-bentayga-2016', make: 'Bentley', model: 'Bentayga', year: 2016, weight: 5379, weightDistribution: 54, driveType: 'AWD', defaultPI: 703, category: 'modern' },
  
  // BMW
  { id: 'bmw-m1-1981', make: 'BMW', model: 'M1', year: 1981, weight: 2866, weightDistribution: 46, driveType: 'RWD', defaultPI: 570, category: 'retro' },
  { id: 'bmw-m2-2016', make: 'BMW', model: 'M2 Coupe', year: 2016, weight: 3395, weightDistribution: 52, driveType: 'RWD', defaultPI: 685, category: 'modern' },
  { id: 'bmw-m3-1991', make: 'BMW', model: 'M3 (E30)', year: 1991, weight: 2811, weightDistribution: 53, driveType: 'RWD', defaultPI: 558, category: 'retro' },
  { id: 'bmw-m3-1997', make: 'BMW', model: 'M3 (E36)', year: 1997, weight: 3153, weightDistribution: 51, driveType: 'RWD', defaultPI: 608, category: 'retro' },
  { id: 'bmw-m3-2005', make: 'BMW', model: 'M3 (E46)', year: 2005, weight: 3351, weightDistribution: 50, driveType: 'RWD', defaultPI: 654, category: 'modern' },
  { id: 'bmw-m3-2008', make: 'BMW', model: 'M3 (E92)', year: 2008, weight: 3571, weightDistribution: 50, driveType: 'RWD', defaultPI: 703, category: 'modern' },
  { id: 'bmw-m3-2021', make: 'BMW', model: 'M3 Competition', year: 2021, weight: 3770, weightDistribution: 54, driveType: 'RWD', defaultPI: 759, category: 'modern' },
  { id: 'bmw-m4-2014', make: 'BMW', model: 'M4 Coupe', year: 2014, weight: 3395, weightDistribution: 52, driveType: 'RWD', defaultPI: 720, category: 'modern' },
  { id: 'bmw-m4-gts-2016', make: 'BMW', model: 'M4 GTS', year: 2016, weight: 3285, weightDistribution: 53, driveType: 'RWD', defaultPI: 779, category: 'modern' },
  { id: 'bmw-m5-1988', make: 'BMW', model: 'M5 (E28)', year: 1988, weight: 3175, weightDistribution: 54, driveType: 'RWD', defaultPI: 508, category: 'retro' },
  { id: 'bmw-m5-1995', make: 'BMW', model: 'M5 (E34)', year: 1995, weight: 3857, weightDistribution: 53, driveType: 'RWD', defaultPI: 590, category: 'retro' },
  { id: 'bmw-m5-2003', make: 'BMW', model: 'M5 (E60)', year: 2003, weight: 3968, weightDistribution: 51, driveType: 'RWD', defaultPI: 713, category: 'modern' },
  { id: 'bmw-m5-2012', make: 'BMW', model: 'M5 (F10)', year: 2012, weight: 4100, weightDistribution: 54, driveType: 'RWD', defaultPI: 768, category: 'modern' },
  { id: 'bmw-m5-2018', make: 'BMW', model: 'M5', year: 2018, weight: 4145, weightDistribution: 54, driveType: 'AWD', defaultPI: 821, category: 'modern' },
  { id: 'bmw-m8-2020', make: 'BMW', model: 'M8 Competition', year: 2020, weight: 4145, weightDistribution: 52, driveType: 'AWD', defaultPI: 841, category: 'modern' },
  { id: 'bmw-z4-2019', make: 'BMW', model: 'Z4 M40i', year: 2019, weight: 3439, weightDistribution: 50, driveType: 'RWD', defaultPI: 680, category: 'modern' },
  { id: 'bmw-z8-2000', make: 'BMW', model: 'Z8', year: 2000, weight: 3494, weightDistribution: 50, driveType: 'RWD', defaultPI: 612, category: 'modern' },
  { id: 'bmw-i8-2015', make: 'BMW', model: 'i8', year: 2015, weight: 3455, weightDistribution: 47, driveType: 'AWD', defaultPI: 727, category: 'modern' },
  { id: 'bmw-x5m-2015', make: 'BMW', model: 'X5 M', year: 2015, weight: 5060, weightDistribution: 53, driveType: 'AWD', defaultPI: 723, category: 'modern' },
  { id: 'bmw-x6m-2015', make: 'BMW', model: 'X6 M', year: 2015, weight: 5148, weightDistribution: 55, driveType: 'AWD', defaultPI: 723, category: 'modern' },
  { id: 'bmw-2002-1973', make: 'BMW', model: '2002 Turbo', year: 1973, weight: 2392, weightDistribution: 53, driveType: 'RWD', defaultPI: 419, category: 'retro' },
  { id: 'bmw-507-1959', make: 'BMW', model: '507', year: 1959, weight: 2844, weightDistribution: 52, driveType: 'RWD', defaultPI: 322, category: 'classic' },
  { id: 'bmw-isetta-1957', make: 'BMW', model: 'Isetta 300 Export', year: 1957, weight: 794, weightDistribution: 43, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  { id: 'bmw-csl-1973', make: 'BMW', model: '3.0 CSL', year: 1973, weight: 2723, weightDistribution: 51, driveType: 'RWD', defaultPI: 508, category: 'retro' },
  
  // BUGATTI
  { id: 'bugatti-chiron-2018', make: 'Bugatti', model: 'Chiron', year: 2018, weight: 4398, weightDistribution: 44, driveType: 'AWD', defaultPI: 998, category: 'hyper' },
  { id: 'bugatti-divo-2019', make: 'Bugatti', model: 'Divo', year: 2019, weight: 4266, weightDistribution: 44, driveType: 'AWD', defaultPI: 998, category: 'hyper' },
  { id: 'bugatti-veyron-2011', make: 'Bugatti', model: 'Veyron Super Sport', year: 2011, weight: 4123, weightDistribution: 43, driveType: 'AWD', defaultPI: 956, category: 'hyper' },
  { id: 'bugatti-eb110-1992', make: 'Bugatti', model: 'EB110 Super Sport', year: 1992, weight: 3461, weightDistribution: 43, driveType: 'AWD', defaultPI: 821, category: 'super' },
  { id: 'bugatti-type35-1926', make: 'Bugatti', model: 'Type 35 C', year: 1926, weight: 1653, weightDistribution: 48, driveType: 'RWD', defaultPI: 250, category: 'classic' },
  
  // BUICK
  { id: 'buick-gnx-1987', make: 'Buick', model: 'Grand National GNX', year: 1987, weight: 3545, weightDistribution: 58, driveType: 'RWD', defaultPI: 614, category: 'muscle' },
  { id: 'buick-riviera-1971', make: 'Buick', model: 'Riviera GS', year: 1971, weight: 4321, weightDistribution: 56, driveType: 'RWD', defaultPI: 439, category: 'muscle' },
  { id: 'buick-gsx-1970', make: 'Buick', model: 'GSX', year: 1970, weight: 3825, weightDistribution: 55, driveType: 'RWD', defaultPI: 522, category: 'muscle' },
  
  // CADILLAC
  { id: 'cadillac-cts-v-2016', make: 'Cadillac', model: 'CTS-V Sedan', year: 2016, weight: 4145, weightDistribution: 53, driveType: 'RWD', defaultPI: 772, category: 'modern' },
  { id: 'cadillac-ats-v-2016', make: 'Cadillac', model: 'ATS-V', year: 2016, weight: 3649, weightDistribution: 53, driveType: 'RWD', defaultPI: 730, category: 'modern' },
  { id: 'cadillac-eldorado-1967', make: 'Cadillac', model: 'Eldorado', year: 1967, weight: 4895, weightDistribution: 58, driveType: 'FWD', defaultPI: 413, category: 'classic' },
  { id: 'cadillac-limo-1953', make: 'Cadillac', model: 'Series 62 Convertible', year: 1953, weight: 4651, weightDistribution: 55, driveType: 'RWD', defaultPI: 282, category: 'classic' },
  { id: 'cadillac-escalade-2012', make: 'Cadillac', model: 'Escalade ESV', year: 2012, weight: 5787, weightDistribution: 54, driveType: 'AWD', defaultPI: 481, category: 'truck' },
  
  // CATERHAM
  { id: 'caterham-seven-2016', make: 'Caterham', model: 'Seven 620 R', year: 2016, weight: 1168, weightDistribution: 51, driveType: 'RWD', defaultPI: 711, category: 'super' },
  { id: 'caterham-superlight-2015', make: 'Caterham', model: 'Superlight R500', year: 2015, weight: 1058, weightDistribution: 50, driveType: 'RWD', defaultPI: 678, category: 'super' },
  
  // CHEVROLET
  { id: 'chevy-bel-air-1957', make: 'Chevrolet', model: 'Bel Air', year: 1957, weight: 3318, weightDistribution: 53, driveType: 'RWD', defaultPI: 345, category: 'classic' },
  { id: 'chevy-camaro-z28-1969', make: 'Chevrolet', model: 'Camaro Z28', year: 1969, weight: 3373, weightDistribution: 52, driveType: 'RWD', defaultPI: 525, category: 'muscle' },
  { id: 'chevy-camaro-ss-1969', make: 'Chevrolet', model: 'Camaro SS Coupe', year: 1969, weight: 3571, weightDistribution: 53, driveType: 'RWD', defaultPI: 502, category: 'muscle' },
  { id: 'chevy-camaro-iroc-1990', make: 'Chevrolet', model: 'Camaro IROC-Z', year: 1990, weight: 3417, weightDistribution: 54, driveType: 'RWD', defaultPI: 527, category: 'muscle' },
  { id: 'chevy-camaro-ss-2010', make: 'Chevrolet', model: 'Camaro SS', year: 2010, weight: 3747, weightDistribution: 53, driveType: 'RWD', defaultPI: 615, category: 'muscle' },
  { id: 'chevy-camaro-zl1-2012', make: 'Chevrolet', model: 'Camaro ZL1', year: 2012, weight: 4067, weightDistribution: 54, driveType: 'RWD', defaultPI: 713, category: 'muscle' },
  { id: 'chevy-camaro-zl1-2017', make: 'Chevrolet', model: 'Camaro ZL1', year: 2017, weight: 3934, weightDistribution: 54, driveType: 'RWD', defaultPI: 768, category: 'muscle' },
  { id: 'chevy-camaro-zl1-1le-2018', make: 'Chevrolet', model: 'Camaro ZL1 1LE', year: 2018, weight: 3891, weightDistribution: 53, driveType: 'RWD', defaultPI: 821, category: 'muscle' },
  { id: 'chevy-chevelle-1970', make: 'Chevrolet', model: 'Chevelle SS 454', year: 1970, weight: 3924, weightDistribution: 55, driveType: 'RWD', defaultPI: 549, category: 'muscle' },
  { id: 'chevy-corvette-c1-1960', make: 'Chevrolet', model: 'Corvette', year: 1960, weight: 2954, weightDistribution: 53, driveType: 'RWD', defaultPI: 439, category: 'classic' },
  { id: 'chevy-corvette-c2-1967', make: 'Chevrolet', model: 'Corvette Stingray 427', year: 1967, weight: 3197, weightDistribution: 51, driveType: 'RWD', defaultPI: 561, category: 'muscle' },
  { id: 'chevy-corvette-c3-1970', make: 'Chevrolet', model: 'Corvette ZR-1', year: 1970, weight: 3197, weightDistribution: 51, driveType: 'RWD', defaultPI: 567, category: 'muscle' },
  { id: 'chevy-corvette-c4-1990', make: 'Chevrolet', model: 'Corvette ZR-1', year: 1990, weight: 3494, weightDistribution: 50, driveType: 'RWD', defaultPI: 693, category: 'retro' },
  { id: 'chevy-corvette-c5-2002', make: 'Chevrolet', model: 'Corvette Z06', year: 2002, weight: 3131, weightDistribution: 51, driveType: 'RWD', defaultPI: 694, category: 'modern' },
  { id: 'chevy-corvette-c6-2009', make: 'Chevrolet', model: 'Corvette ZR1', year: 2009, weight: 3324, weightDistribution: 51, driveType: 'RWD', defaultPI: 807, category: 'super' },
  { id: 'chevy-corvette-c7-2014', make: 'Chevrolet', model: 'Corvette Stingray', year: 2014, weight: 3298, weightDistribution: 50, driveType: 'RWD', defaultPI: 744, category: 'modern' },
  { id: 'chevy-corvette-c7-z06-2015', make: 'Chevrolet', model: 'Corvette Z06', year: 2015, weight: 3525, weightDistribution: 50, driveType: 'RWD', defaultPI: 844, category: 'super' },
  { id: 'chevy-corvette-c7-zr1-2019', make: 'Chevrolet', model: 'Corvette ZR1', year: 2019, weight: 3561, weightDistribution: 50, driveType: 'RWD', defaultPI: 893, category: 'super' },
  { id: 'chevy-corvette-c8-2020', make: 'Chevrolet', model: 'Corvette Stingray', year: 2020, weight: 3366, weightDistribution: 41, driveType: 'RWD', defaultPI: 801, category: 'super' },
  { id: 'chevy-el-camino-1959', make: 'Chevrolet', model: 'El Camino', year: 1959, weight: 3747, weightDistribution: 54, driveType: 'RWD', defaultPI: 298, category: 'truck' },
  { id: 'chevy-impala-1967', make: 'Chevrolet', model: 'Impala SS 427', year: 1967, weight: 3968, weightDistribution: 54, driveType: 'RWD', defaultPI: 478, category: 'muscle' },
  { id: 'chevy-monte-carlo-1970', make: 'Chevrolet', model: 'Monte Carlo SS 454', year: 1970, weight: 3880, weightDistribution: 55, driveType: 'RWD', defaultPI: 533, category: 'muscle' },
  { id: 'chevy-nova-1969', make: 'Chevrolet', model: 'Nova SS 396', year: 1969, weight: 3373, weightDistribution: 55, driveType: 'RWD', defaultPI: 495, category: 'muscle' },
  { id: 'chevy-colorado-2017', make: 'Chevrolet', model: 'Colorado ZR2', year: 2017, weight: 4982, weightDistribution: 53, driveType: 'AWD', defaultPI: 572, category: 'offroad' },
  { id: 'chevy-silverado-2017', make: 'Chevrolet', model: 'Silverado 1500 Derelict', year: 2017, weight: 5061, weightDistribution: 57, driveType: 'RWD', defaultPI: 477, category: 'truck' },
  
  // CHRYSLER
  { id: 'chrysler-300-2012', make: 'Chrysler', model: '300 SRT8', year: 2012, weight: 4398, weightDistribution: 55, driveType: 'RWD', defaultPI: 603, category: 'modern' },
  
  // DATSUN
  { id: 'datsun-510-1970', make: 'Datsun', model: '510', year: 1970, weight: 2094, weightDistribution: 53, driveType: 'RWD', defaultPI: 258, category: 'retro' },
  { id: 'datsun-240z-1971', make: 'Datsun', model: '240Z', year: 1971, weight: 2306, weightDistribution: 52, driveType: 'RWD', defaultPI: 396, category: 'retro' },
  { id: 'datsun-280z-1975', make: 'Nissan', model: 'Fairlady Z 432', year: 1969, weight: 2116, weightDistribution: 52, driveType: 'RWD', defaultPI: 394, category: 'retro' },
  
  // DODGE
  { id: 'dodge-challenger-1970', make: 'Dodge', model: 'Challenger R/T', year: 1970, weight: 3747, weightDistribution: 55, driveType: 'RWD', defaultPI: 533, category: 'muscle' },
  { id: 'dodge-challenger-2015', make: 'Dodge', model: 'Challenger SRT Hellcat', year: 2015, weight: 4449, weightDistribution: 57, driveType: 'RWD', defaultPI: 740, category: 'muscle' },
  { id: 'dodge-challenger-2018', make: 'Dodge', model: 'Challenger SRT Demon', year: 2018, weight: 4280, weightDistribution: 57, driveType: 'RWD', defaultPI: 810, category: 'muscle' },
  { id: 'dodge-charger-1968', make: 'Dodge', model: 'Charger R/T', year: 1968, weight: 3803, weightDistribution: 55, driveType: 'RWD', defaultPI: 541, category: 'muscle' },
  { id: 'dodge-charger-1969', make: 'Dodge', model: 'Charger Daytona Hemi', year: 1969, weight: 3792, weightDistribution: 56, driveType: 'RWD', defaultPI: 619, category: 'muscle' },
  { id: 'dodge-charger-2015', make: 'Dodge', model: 'Charger SRT Hellcat', year: 2015, weight: 4575, weightDistribution: 55, driveType: 'RWD', defaultPI: 739, category: 'muscle' },
  { id: 'dodge-charger-2020', make: 'Dodge', model: 'Charger SRT Hellcat Widebody', year: 2020, weight: 4542, weightDistribution: 55, driveType: 'RWD', defaultPI: 764, category: 'muscle' },
  { id: 'dodge-dart-1968', make: 'Dodge', model: 'Dart Hemi Super Stock', year: 1968, weight: 3153, weightDistribution: 57, driveType: 'RWD', defaultPI: 643, category: 'muscle' },
  { id: 'dodge-coronet-1970', make: 'Dodge', model: 'Coronet Super Bee', year: 1970, weight: 3682, weightDistribution: 56, driveType: 'RWD', defaultPI: 529, category: 'muscle' },
  { id: 'dodge-durango-2018', make: 'Dodge', model: 'Durango SRT', year: 2018, weight: 5366, weightDistribution: 54, driveType: 'AWD', defaultPI: 660, category: 'truck' },
  { id: 'dodge-viper-1999', make: 'Dodge', model: 'Viper GTS ACR', year: 1999, weight: 3395, weightDistribution: 49, driveType: 'RWD', defaultPI: 720, category: 'super' },
  { id: 'dodge-viper-2008', make: 'Dodge', model: 'Viper SRT10 ACR', year: 2008, weight: 3461, weightDistribution: 49, driveType: 'RWD', defaultPI: 808, category: 'super' },
  { id: 'dodge-viper-2016', make: 'Dodge', model: 'Viper ACR', year: 2016, weight: 3374, weightDistribution: 50, driveType: 'RWD', defaultPI: 867, category: 'super' },
  { id: 'dodge-ram-2017', make: 'Ram', model: 'Ram 1500 Rebel TRX', year: 2017, weight: 5579, weightDistribution: 57, driveType: 'AWD', defaultPI: 635, category: 'offroad' },
  
  // DONKERVOORT
  { id: 'donkervoort-d8-2013', make: 'Donkervoort', model: 'D8 GTO', year: 2013, weight: 1521, weightDistribution: 51, driveType: 'RWD', defaultPI: 783, category: 'super' },
  
  // FERRARI
  { id: 'ferrari-250-gto-1962', make: 'Ferrari', model: '250 GTO', year: 1962, weight: 2072, weightDistribution: 49, driveType: 'RWD', defaultPI: 629, category: 'classic' },
  { id: 'ferrari-250-gt-1957', make: 'Ferrari', model: '250 California', year: 1957, weight: 2447, weightDistribution: 50, driveType: 'RWD', defaultPI: 450, category: 'classic' },
  { id: 'ferrari-288-gto-1984', make: 'Ferrari', model: '288 GTO', year: 1984, weight: 2557, weightDistribution: 44, driveType: 'RWD', defaultPI: 768, category: 'retro' },
  { id: 'ferrari-308-gts-1984', make: 'Ferrari', model: '308 GTS QV', year: 1984, weight: 3131, weightDistribution: 47, driveType: 'RWD', defaultPI: 527, category: 'retro' },
  { id: 'ferrari-330-p4-1967', make: 'Ferrari', model: '330 P4', year: 1967, weight: 1764, weightDistribution: 46, driveType: 'RWD', defaultPI: 700, category: 'classic' },
  { id: 'ferrari-348-ts-1989', make: 'Ferrari', model: '348 TS', year: 1989, weight: 3131, weightDistribution: 42, driveType: 'RWD', defaultPI: 628, category: 'retro' },
  { id: 'ferrari-360-cs-2003', make: 'Ferrari', model: '360 Challenge Stradale', year: 2003, weight: 2822, weightDistribution: 44, driveType: 'RWD', defaultPI: 740, category: 'super' },
  { id: 'ferrari-458-2009', make: 'Ferrari', model: '458 Italia', year: 2009, weight: 3042, weightDistribution: 43, driveType: 'RWD', defaultPI: 826, category: 'super' },
  { id: 'ferrari-458-speciale-2014', make: 'Ferrari', model: '458 Speciale', year: 2014, weight: 2844, weightDistribution: 43, driveType: 'RWD', defaultPI: 883, category: 'super' },
  { id: 'ferrari-488-gtb-2015', make: 'Ferrari', model: '488 GTB', year: 2015, weight: 3252, weightDistribution: 43, driveType: 'RWD', defaultPI: 889, category: 'super' },
  { id: 'ferrari-488-pista-2019', make: 'Ferrari', model: '488 Pista', year: 2019, weight: 2822, weightDistribution: 43, driveType: 'RWD', defaultPI: 936, category: 'super' },
  { id: 'ferrari-512-tr-1992', make: 'Ferrari', model: '512 TR', year: 1992, weight: 3219, weightDistribution: 41, driveType: 'RWD', defaultPI: 694, category: 'retro' },
  { id: 'ferrari-599-gto-2011', make: 'Ferrari', model: '599 GTO', year: 2011, weight: 3395, weightDistribution: 48, driveType: 'RWD', defaultPI: 869, category: 'super' },
  { id: 'ferrari-599xx-evo-2012', make: 'Ferrari', model: '599XX Evolution', year: 2012, weight: 2712, weightDistribution: 47, driveType: 'RWD', defaultPI: 941, category: 'super' },
  { id: 'ferrari-812-superfast-2017', make: 'Ferrari', model: '812 Superfast', year: 2017, weight: 3494, weightDistribution: 47, driveType: 'RWD', defaultPI: 903, category: 'super' },
  { id: 'ferrari-dino-1969', make: 'Ferrari', model: 'Dino 246 GT', year: 1969, weight: 2381, weightDistribution: 44, driveType: 'RWD', defaultPI: 467, category: 'classic' },
  { id: 'ferrari-enzo-2002', make: 'Ferrari', model: 'Enzo Ferrari', year: 2002, weight: 2976, weightDistribution: 42, driveType: 'RWD', defaultPI: 898, category: 'hyper' },
  { id: 'ferrari-f12-2012', make: 'Ferrari', model: 'F12berlinetta', year: 2012, weight: 3461, weightDistribution: 47, driveType: 'RWD', defaultPI: 864, category: 'super' },
  { id: 'ferrari-f12tdf-2016', make: 'Ferrari', model: 'F12tdf', year: 2016, weight: 3263, weightDistribution: 47, driveType: 'RWD', defaultPI: 925, category: 'super' },
  { id: 'ferrari-f40-1987', make: 'Ferrari', model: 'F40', year: 1987, weight: 2425, weightDistribution: 42, driveType: 'RWD', defaultPI: 828, category: 'super' },
  { id: 'ferrari-f40-competizione-1989', make: 'Ferrari', model: 'F40 Competizione', year: 1989, weight: 2359, weightDistribution: 42, driveType: 'RWD', defaultPI: 886, category: 'super' },
  { id: 'ferrari-f50-1995', make: 'Ferrari', model: 'F50', year: 1995, weight: 2712, weightDistribution: 42, driveType: 'RWD', defaultPI: 836, category: 'super' },
  { id: 'ferrari-f8-tributo-2019', make: 'Ferrari', model: 'F8 Tributo', year: 2019, weight: 3164, weightDistribution: 43, driveType: 'RWD', defaultPI: 922, category: 'super' },
  { id: 'ferrari-fxx-2005', make: 'Ferrari', model: 'FXX', year: 2005, weight: 2557, weightDistribution: 42, driveType: 'RWD', defaultPI: 901, category: 'hyper' },
  { id: 'ferrari-fxxk-2014', make: 'Ferrari', model: 'FXX K', year: 2014, weight: 2778, weightDistribution: 43, driveType: 'RWD', defaultPI: 967, category: 'hyper' },
  { id: 'ferrari-gto-1984', make: 'Ferrari', model: 'GTO', year: 1984, weight: 2557, weightDistribution: 44, driveType: 'RWD', defaultPI: 768, category: 'retro' },
  { id: 'ferrari-laferrari-2013', make: 'Ferrari', model: 'LaFerrari', year: 2013, weight: 3064, weightDistribution: 41, driveType: 'RWD', defaultPI: 969, category: 'hyper' },
  { id: 'ferrari-portofino-2018', make: 'Ferrari', model: 'Portofino', year: 2018, weight: 3571, weightDistribution: 47, driveType: 'RWD', defaultPI: 797, category: 'super' },
  { id: 'ferrari-roma-2020', make: 'Ferrari', model: 'Roma', year: 2020, weight: 3461, weightDistribution: 49, driveType: 'RWD', defaultPI: 816, category: 'super' },
  { id: 'ferrari-sf90-2020', make: 'Ferrari', model: 'SF90 Stradale', year: 2020, weight: 3461, weightDistribution: 45, driveType: 'AWD', defaultPI: 978, category: 'hyper' },
  { id: 'ferrari-testarossa-1984', make: 'Ferrari', model: 'Testarossa', year: 1984, weight: 3208, weightDistribution: 40, driveType: 'RWD', defaultPI: 646, category: 'retro' },
  
  // FIAT
  { id: 'fiat-124-1980', make: 'Fiat', model: '124 Sport Spider', year: 1980, weight: 2271, weightDistribution: 54, driveType: 'RWD', defaultPI: 282, category: 'retro' },
  { id: 'fiat-131-1980', make: 'Fiat', model: '131 Abarth', year: 1980, weight: 2183, weightDistribution: 56, driveType: 'RWD', defaultPI: 498, category: 'rally' },
  { id: 'fiat-500-2009', make: 'Fiat', model: '500 Abarth', year: 2009, weight: 2557, weightDistribution: 63, driveType: 'FWD', defaultPI: 396, category: 'modern' },
  { id: 'fiat-500-1968', make: 'Fiat', model: '500', year: 1968, weight: 1124, weightDistribution: 47, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  { id: 'fiat-x1/9-1974', make: 'Fiat', model: 'X1/9', year: 1974, weight: 2050, weightDistribution: 46, driveType: 'RWD', defaultPI: 276, category: 'retro' },
  { id: 'fiat-dino-1969', make: 'Fiat', model: 'Dino 2.4 Coupe', year: 1969, weight: 2800, weightDistribution: 53, driveType: 'RWD', defaultPI: 438, category: 'classic' },
  
  // FORD
  { id: 'ford-bronco-2021', make: 'Ford', model: 'Bronco', year: 2021, weight: 4755, weightDistribution: 57, driveType: 'AWD', defaultPI: 578, category: 'offroad' },
  { id: 'ford-bronco-1975', make: 'Ford', model: 'Bronco', year: 1975, weight: 3968, weightDistribution: 57, driveType: 'AWD', defaultPI: 337, category: 'offroad' },
  { id: 'ford-escort-rs-1992', make: 'Ford', model: 'Escort RS Cosworth', year: 1992, weight: 2888, weightDistribution: 60, driveType: 'AWD', defaultPI: 647, category: 'rally' },
  { id: 'ford-escort-rs-1977', make: 'Ford', model: 'Escort RS1800', year: 1977, weight: 2028, weightDistribution: 57, driveType: 'RWD', defaultPI: 433, category: 'rally' },
  { id: 'ford-f-150-2011', make: 'Ford', model: 'F-150 SVT Raptor', year: 2011, weight: 5820, weightDistribution: 57, driveType: 'AWD', defaultPI: 537, category: 'offroad' },
  { id: 'ford-f-150-2017', make: 'Ford', model: 'F-150 Raptor', year: 2017, weight: 5622, weightDistribution: 56, driveType: 'AWD', defaultPI: 620, category: 'offroad' },
  { id: 'ford-f-150-2021', make: 'Ford', model: 'F-150 Raptor', year: 2021, weight: 5842, weightDistribution: 56, driveType: 'AWD', defaultPI: 683, category: 'offroad' },
  { id: 'ford-falcon-1972', make: 'Ford', model: 'Falcon XA GT-HO', year: 1972, weight: 3186, weightDistribution: 55, driveType: 'RWD', defaultPI: 531, category: 'muscle' },
  { id: 'ford-focus-rs-2009', make: 'Ford', model: 'Focus RS', year: 2009, weight: 3329, weightDistribution: 62, driveType: 'FWD', defaultPI: 618, category: 'modern' },
  { id: 'ford-focus-rs-2017', make: 'Ford', model: 'Focus RS', year: 2017, weight: 3434, weightDistribution: 60, driveType: 'AWD', defaultPI: 689, category: 'modern' },
  { id: 'ford-focus-st-2013', make: 'Ford', model: 'Focus ST', year: 2013, weight: 3223, weightDistribution: 62, driveType: 'FWD', defaultPI: 546, category: 'modern' },
  { id: 'ford-fiesta-st-2014', make: 'Ford', model: 'Fiesta ST', year: 2014, weight: 2720, weightDistribution: 62, driveType: 'FWD', defaultPI: 519, category: 'modern' },
  { id: 'ford-fiesta-st-2018', make: 'Ford', model: 'Fiesta ST', year: 2018, weight: 2844, weightDistribution: 61, driveType: 'FWD', defaultPI: 549, category: 'modern' },
  { id: 'ford-gt-1964', make: 'Ford', model: 'GT40 Mk I', year: 1964, weight: 2139, weightDistribution: 44, driveType: 'RWD', defaultPI: 668, category: 'classic' },
  { id: 'ford-gt-1966', make: 'Ford', model: 'GT40 Mk II', year: 1966, weight: 2337, weightDistribution: 44, driveType: 'RWD', defaultPI: 735, category: 'classic' },
  { id: 'ford-gt-2005', make: 'Ford', model: 'GT', year: 2005, weight: 3351, weightDistribution: 44, driveType: 'RWD', defaultPI: 804, category: 'super' },
  { id: 'ford-gt-2017', make: 'Ford', model: 'GT', year: 2017, weight: 3054, weightDistribution: 43, driveType: 'RWD', defaultPI: 918, category: 'super' },
  { id: 'ford-mustang-1965', make: 'Ford', model: 'Mustang GT Coupe', year: 1965, weight: 2932, weightDistribution: 55, driveType: 'RWD', defaultPI: 413, category: 'muscle' },
  { id: 'ford-mustang-boss-302-1969', make: 'Ford', model: 'Mustang Boss 302', year: 1969, weight: 3208, weightDistribution: 55, driveType: 'RWD', defaultPI: 536, category: 'muscle' },
  { id: 'ford-mustang-boss-429-1969', make: 'Ford', model: 'Mustang Boss 429', year: 1969, weight: 3638, weightDistribution: 57, driveType: 'RWD', defaultPI: 563, category: 'muscle' },
  { id: 'ford-mustang-mach1-1971', make: 'Ford', model: 'Mustang Mach 1', year: 1971, weight: 3483, weightDistribution: 56, driveType: 'RWD', defaultPI: 524, category: 'muscle' },
  { id: 'ford-mustang-fox-1993', make: 'Ford', model: 'Mustang SVT Cobra R', year: 1993, weight: 3225, weightDistribution: 56, driveType: 'RWD', defaultPI: 574, category: 'muscle' },
  { id: 'ford-mustang-cobra-r-2000', make: 'Ford', model: 'Mustang Cobra R', year: 2000, weight: 3579, weightDistribution: 55, driveType: 'RWD', defaultPI: 651, category: 'muscle' },
  { id: 'ford-mustang-gt-2005', make: 'Ford', model: 'Mustang GT', year: 2005, weight: 3450, weightDistribution: 54, driveType: 'RWD', defaultPI: 538, category: 'muscle' },
  { id: 'ford-mustang-shelby-2013', make: 'Ford', model: 'Mustang Shelby GT500', year: 2013, weight: 3845, weightDistribution: 55, driveType: 'RWD', defaultPI: 710, category: 'muscle' },
  { id: 'ford-mustang-gt-2015', make: 'Ford', model: 'Mustang GT', year: 2015, weight: 3705, weightDistribution: 52, driveType: 'RWD', defaultPI: 615, category: 'muscle' },
  { id: 'ford-mustang-gt350r-2016', make: 'Ford', model: 'Mustang Shelby GT350R', year: 2016, weight: 3655, weightDistribution: 54, driveType: 'RWD', defaultPI: 766, category: 'muscle' },
  { id: 'ford-mustang-rtr-2018', make: 'Ford', model: 'Mustang RTR Spec 5', year: 2018, weight: 3747, weightDistribution: 53, driveType: 'RWD', defaultPI: 753, category: 'muscle' },
  { id: 'ford-mustang-gt500-2020', make: 'Ford', model: 'Mustang Shelby GT500', year: 2020, weight: 4171, weightDistribution: 54, driveType: 'RWD', defaultPI: 852, category: 'muscle' },
  { id: 'ford-mustang-mach-e-2021', make: 'Ford', model: 'Mustang Mach-E 1400', year: 2021, weight: 4200, weightDistribution: 48, driveType: 'AWD', defaultPI: 918, category: 'modern' },
  { id: 'ford-puma-1999', make: 'Ford', model: 'Puma', year: 1999, weight: 2535, weightDistribution: 62, driveType: 'FWD', defaultPI: 393, category: 'euro' },
  { id: 'ford-rs200-1986', make: 'Ford', model: 'RS200 Evolution', year: 1986, weight: 2469, weightDistribution: 47, driveType: 'AWD', defaultPI: 751, category: 'rally' },
  { id: 'ford-sierra-1987', make: 'Ford', model: 'Sierra Cosworth RS500', year: 1987, weight: 2800, weightDistribution: 58, driveType: 'RWD', defaultPI: 599, category: 'retro' },
  { id: 'ford-supervan3-1994', make: 'Ford', model: 'Supervan 3', year: 1994, weight: 2425, weightDistribution: 43, driveType: 'RWD', defaultPI: 899, category: 'formula' },
  { id: 'ford-torino-1970', make: 'Ford', model: 'Torino Talladega', year: 1970, weight: 3934, weightDistribution: 55, driveType: 'RWD', defaultPI: 534, category: 'muscle' },
  { id: 'ford-transit-2011', make: 'Ford', model: 'Transit SuperSportVan', year: 2011, weight: 4585, weightDistribution: 55, driveType: 'RWD', defaultPI: 533, category: 'truck' },
  
  // GMC
  { id: 'gmc-syclone-1991', make: 'GMC', model: 'Syclone', year: 1991, weight: 3600, weightDistribution: 57, driveType: 'AWD', defaultPI: 548, category: 'truck' },
  { id: 'gmc-jimmy-1991', make: 'GMC', model: 'Jimmy', year: 1991, weight: 3670, weightDistribution: 54, driveType: 'AWD', defaultPI: 374, category: 'offroad' },
  { id: 'gmc-vandura-1983', make: 'GMC', model: 'Vandura G-1500', year: 1983, weight: 4299, weightDistribution: 55, driveType: 'RWD', defaultPI: 213, category: 'truck' },
  
  // HENNESSEY
  { id: 'hennessey-venom-2012', make: 'Hennessey', model: 'Venom GT', year: 2012, weight: 2685, weightDistribution: 42, driveType: 'RWD', defaultPI: 918, category: 'hyper' },
  
  // HOLDEN
  { id: 'holden-torana-1977', make: 'Holden', model: 'Torana A9X', year: 1977, weight: 2690, weightDistribution: 55, driveType: 'RWD', defaultPI: 487, category: 'muscle' },
  { id: 'holden-maloo-2014', make: 'Holden', model: 'Maloo GTS', year: 2014, weight: 3946, weightDistribution: 53, driveType: 'RWD', defaultPI: 677, category: 'truck' },
  
  // HONDA
  { id: 'honda-civic-1997', make: 'Honda', model: 'Civic Type R (EK)', year: 1997, weight: 2359, weightDistribution: 63, driveType: 'FWD', defaultPI: 509, category: 'jdm' },
  { id: 'honda-civic-2000', make: 'Honda', model: 'Civic Type R (EK)', year: 2000, weight: 2380, weightDistribution: 63, driveType: 'FWD', defaultPI: 512, category: 'jdm' },
  { id: 'honda-civic-2004', make: 'Honda', model: 'Civic Type R (EP3)', year: 2004, weight: 2755, weightDistribution: 61, driveType: 'FWD', defaultPI: 533, category: 'jdm' },
  { id: 'honda-civic-2007', make: 'Honda', model: 'Civic Type R (FD2)', year: 2007, weight: 2855, weightDistribution: 61, driveType: 'FWD', defaultPI: 556, category: 'jdm' },
  { id: 'honda-civic-2016', make: 'Honda', model: 'Civic Type R (FK2)', year: 2016, weight: 3042, weightDistribution: 62, driveType: 'FWD', defaultPI: 659, category: 'jdm' },
  { id: 'honda-civic-2018', make: 'Honda', model: 'Civic Type R (FK8)', year: 2018, weight: 3117, weightDistribution: 62, driveType: 'FWD', defaultPI: 713, category: 'jdm' },
  { id: 'honda-crx-1991', make: 'Honda', model: 'CR-X SiR', year: 1991, weight: 2028, weightDistribution: 59, driveType: 'FWD', defaultPI: 365, category: 'jdm' },
  { id: 'honda-nsx-r-1992', make: 'Honda', model: 'NSX-R', year: 1992, weight: 2712, weightDistribution: 42, driveType: 'RWD', defaultPI: 667, category: 'jdm' },
  { id: 'honda-nsx-r-2005', make: 'Honda', model: 'NSX-R', year: 2005, weight: 2800, weightDistribution: 43, driveType: 'RWD', defaultPI: 706, category: 'jdm' },
  { id: 'honda-nsx-2017', make: 'Honda', model: 'NSX', year: 2017, weight: 3803, weightDistribution: 42, driveType: 'AWD', defaultPI: 837, category: 'super' },
  { id: 'honda-prelude-1994', make: 'Honda', model: 'Prelude Si', year: 1994, weight: 2844, weightDistribution: 60, driveType: 'FWD', defaultPI: 448, category: 'jdm' },
  { id: 'honda-s2000-2009', make: 'Honda', model: 'S2000', year: 2009, weight: 2765, weightDistribution: 50, driveType: 'RWD', defaultPI: 609, category: 'jdm' },
  { id: 'honda-s800-1970', make: 'Honda', model: 'S800', year: 1970, weight: 1609, weightDistribution: 52, driveType: 'RWD', defaultPI: 282, category: 'classic' },
  
  // HOONIGAN
  { id: 'hoonigan-hoonicorn-2017', make: 'Hoonigan', model: 'Ford Mustang "Hoonicorn" V2', year: 2017, weight: 3153, weightDistribution: 52, driveType: 'AWD', defaultPI: 998, category: 'super' },
  { id: 'hoonigan-escort-1978', make: 'Hoonigan', model: 'Ford Escort RS1800', year: 1978, weight: 2359, weightDistribution: 55, driveType: 'RWD', defaultPI: 854, category: 'rally' },
  { id: 'hoonigan-gymkhana-2011', make: 'Hoonigan', model: 'Ford Fiesta ST', year: 2011, weight: 2888, weightDistribution: 54, driveType: 'AWD', defaultPI: 826, category: 'rally' },
  { id: 'hoonigan-focus-2016', make: 'Hoonigan', model: 'Ford Focus RS RX', year: 2016, weight: 2976, weightDistribution: 54, driveType: 'AWD', defaultPI: 893, category: 'rally' },
  { id: 'hoonigan-porsche-1991', make: 'Hoonigan', model: 'Porsche 911 Turbo "Rauh-Welt Begriff"', year: 1991, weight: 2888, weightDistribution: 40, driveType: 'RWD', defaultPI: 794, category: 'retro' },
  { id: 'hoonigan-bel-air-1955', make: 'Hoonigan', model: 'Chevrolet Bel Air', year: 1955, weight: 3395, weightDistribution: 55, driveType: 'RWD', defaultPI: 824, category: 'muscle' },
  { id: 'hoonigan-c10-1972', make: 'Hoonigan', model: 'Chevrolet "Napalm Nova"', year: 1972, weight: 3373, weightDistribution: 56, driveType: 'RWD', defaultPI: 795, category: 'muscle' },
  
  // HSV
  { id: 'hsv-gts-2014', make: 'HSV', model: 'Gen-F GTS', year: 2014, weight: 4101, weightDistribution: 53, driveType: 'RWD', defaultPI: 733, category: 'modern' },
  { id: 'hsv-gtsr-2017', make: 'HSV', model: 'GTSR Maloo', year: 2017, weight: 4024, weightDistribution: 52, driveType: 'RWD', defaultPI: 748, category: 'truck' },
  
  // HUMMER
  { id: 'hummer-h1-2006', make: 'Hummer', model: 'H1 Alpha', year: 2006, weight: 7847, weightDistribution: 55, driveType: 'AWD', defaultPI: 422, category: 'offroad' },
  
  // HYUNDAI
  { id: 'hyundai-veloster-n-2019', make: 'Hyundai', model: 'Veloster N', year: 2019, weight: 3064, weightDistribution: 61, driveType: 'FWD', defaultPI: 582, category: 'modern' },
  
  // INFINITI
  { id: 'infiniti-q60-2017', make: 'Infiniti', model: 'Q60 Red Sport 400', year: 2017, weight: 3819, weightDistribution: 54, driveType: 'RWD', defaultPI: 666, category: 'modern' },
  
  // JAGUAR
  { id: 'jaguar-e-type-1961', make: 'Jaguar', model: 'E-Type S1', year: 1961, weight: 2624, weightDistribution: 50, driveType: 'RWD', defaultPI: 466, category: 'classic' },
  { id: 'jaguar-d-type-1956', make: 'Jaguar', model: 'D-Type', year: 1956, weight: 1874, weightDistribution: 50, driveType: 'RWD', defaultPI: 559, category: 'classic' },
  { id: 'jaguar-c-type-1953', make: 'Jaguar', model: 'C-Type', year: 1953, weight: 2039, weightDistribution: 49, driveType: 'RWD', defaultPI: 479, category: 'classic' },
  { id: 'jaguar-f-type-r-2015', make: 'Jaguar', model: 'F-Type R Coupe', year: 2015, weight: 3671, weightDistribution: 51, driveType: 'RWD', defaultPI: 741, category: 'modern' },
  { id: 'jaguar-f-type-svr-2017', make: 'Jaguar', model: 'F-Type SVR', year: 2017, weight: 3814, weightDistribution: 51, driveType: 'AWD', defaultPI: 790, category: 'modern' },
  { id: 'jaguar-f-pace-2017', make: 'Jaguar', model: 'F-PACE S', year: 2017, weight: 4343, weightDistribution: 53, driveType: 'AWD', defaultPI: 621, category: 'modern' },
  { id: 'jaguar-xj220-1993', make: 'Jaguar', model: 'XJ220', year: 1993, weight: 3241, weightDistribution: 43, driveType: 'RWD', defaultPI: 790, category: 'super' },
  { id: 'jaguar-xj-s-1990', make: 'Jaguar', model: 'XJ-S', year: 1990, weight: 3858, weightDistribution: 52, driveType: 'RWD', defaultPI: 459, category: 'retro' },
  { id: 'jaguar-xe-sv-2018', make: 'Jaguar', model: 'XE-S Project 8', year: 2018, weight: 4000, weightDistribution: 51, driveType: 'AWD', defaultPI: 854, category: 'modern' },
  { id: 'jaguar-xk-rs-2015', make: 'Jaguar', model: 'XKR-S', year: 2015, weight: 3891, weightDistribution: 52, driveType: 'RWD', defaultPI: 741, category: 'modern' },
  { id: 'jaguar-xfr-s-2015', make: 'Jaguar', model: 'XFR-S', year: 2015, weight: 4024, weightDistribution: 54, driveType: 'RWD', defaultPI: 739, category: 'modern' },
  { id: 'jaguar-i-pace-2018', make: 'Jaguar', model: 'I-PACE', year: 2018, weight: 4760, weightDistribution: 50, driveType: 'AWD', defaultPI: 649, category: 'modern' },
  
  // JEEP
  { id: 'jeep-wrangler-2012', make: 'Jeep', model: 'Wrangler Rubicon', year: 2012, weight: 4222, weightDistribution: 56, driveType: 'AWD', defaultPI: 392, category: 'offroad' },
  { id: 'jeep-wrangler-2018', make: 'Jeep', model: 'Wrangler Rubicon', year: 2018, weight: 4475, weightDistribution: 57, driveType: 'AWD', defaultPI: 430, category: 'offroad' },
  { id: 'jeep-cj5-1976', make: 'Jeep', model: 'CJ5 Renegade', year: 1976, weight: 2756, weightDistribution: 55, driveType: 'AWD', defaultPI: 279, category: 'offroad' },
  { id: 'jeep-trailcat-2016', make: 'Jeep', model: 'Trailcat', year: 2016, weight: 5148, weightDistribution: 55, driveType: 'AWD', defaultPI: 610, category: 'offroad' },
  { id: 'jeep-grand-cherokee-2017', make: 'Jeep', model: 'Grand Cherokee SRT', year: 2017, weight: 5093, weightDistribution: 55, driveType: 'AWD', defaultPI: 667, category: 'truck' },
  { id: 'jeep-gladiator-2020', make: 'Jeep', model: 'Gladiator Rubicon', year: 2020, weight: 4899, weightDistribution: 58, driveType: 'AWD', defaultPI: 448, category: 'offroad' },
  
  // KOENIGSEGG
  { id: 'koenigsegg-agera-2011', make: 'Koenigsegg', model: 'Agera', year: 2011, weight: 3042, weightDistribution: 44, driveType: 'RWD', defaultPI: 939, category: 'hyper' },
  { id: 'koenigsegg-agera-rs-2017', make: 'Koenigsegg', model: 'Agera RS', year: 2017, weight: 3042, weightDistribution: 44, driveType: 'RWD', defaultPI: 978, category: 'hyper' },
  { id: 'koenigsegg-ccgt-2007', make: 'Koenigsegg', model: 'CCGT', year: 2007, weight: 2425, weightDistribution: 45, driveType: 'RWD', defaultPI: 933, category: 'hyper' },
  { id: 'koenigsegg-ccx-2006', make: 'Koenigsegg', model: 'CCX', year: 2006, weight: 2557, weightDistribution: 44, driveType: 'RWD', defaultPI: 898, category: 'hyper' },
  { id: 'koenigsegg-one1-2015', make: 'Koenigsegg', model: 'One:1', year: 2015, weight: 3042, weightDistribution: 44, driveType: 'RWD', defaultPI: 998, category: 'hyper' },
  { id: 'koenigsegg-regera-2016', make: 'Koenigsegg', model: 'Regera', year: 2016, weight: 3550, weightDistribution: 46, driveType: 'RWD', defaultPI: 998, category: 'hyper' },
  { id: 'koenigsegg-jesko-2020', make: 'Koenigsegg', model: 'Jesko', year: 2020, weight: 3042, weightDistribution: 44, driveType: 'RWD', defaultPI: 998, category: 'hyper' },
  { id: 'koenigsegg-gemera-2022', make: 'Koenigsegg', model: 'Gemera', year: 2022, weight: 4079, weightDistribution: 44, driveType: 'AWD', defaultPI: 997, category: 'hyper' },
  
  // KTM
  { id: 'ktm-x-bow-2013', make: 'KTM', model: 'X-Bow R', year: 2013, weight: 1808, weightDistribution: 42, driveType: 'RWD', defaultPI: 755, category: 'super' },
  { id: 'ktm-x-bow-gt4-2018', make: 'KTM', model: 'X-Bow GT4', year: 2018, weight: 2161, weightDistribution: 42, driveType: 'RWD', defaultPI: 802, category: 'super' },
  
  // LAMBORGHINI
  { id: 'lambo-aventador-2012', make: 'Lamborghini', model: 'Aventador LP700-4', year: 2012, weight: 3472, weightDistribution: 43, driveType: 'AWD', defaultPI: 882, category: 'super' },
  { id: 'lambo-aventador-sv-2015', make: 'Lamborghini', model: 'Aventador LP750-4 SV', year: 2015, weight: 3329, weightDistribution: 43, driveType: 'AWD', defaultPI: 925, category: 'super' },
  { id: 'lambo-aventador-svj-2019', make: 'Lamborghini', model: 'Aventador SVJ', year: 2019, weight: 3362, weightDistribution: 44, driveType: 'AWD', defaultPI: 972, category: 'hyper' },
  { id: 'lambo-centenario-2016', make: 'Lamborghini', model: 'Centenario LP 770-4', year: 2016, weight: 3472, weightDistribution: 43, driveType: 'AWD', defaultPI: 955, category: 'hyper' },
  { id: 'lambo-countach-1988', make: 'Lamborghini', model: 'Countach LP5000 QV', year: 1988, weight: 3042, weightDistribution: 42, driveType: 'RWD', defaultPI: 699, category: 'retro' },
  { id: 'lambo-countach-lpi-2021', make: 'Lamborghini', model: 'Countach LPI 800-4', year: 2021, weight: 3923, weightDistribution: 44, driveType: 'AWD', defaultPI: 929, category: 'hyper' },
  { id: 'lambo-diablo-1997', make: 'Lamborghini', model: 'Diablo SV', year: 1997, weight: 3329, weightDistribution: 41, driveType: 'RWD', defaultPI: 757, category: 'super' },
  { id: 'lambo-diablo-gtr-1999', make: 'Lamborghini', model: 'Diablo GTR', year: 1999, weight: 2888, weightDistribution: 42, driveType: 'RWD', defaultPI: 837, category: 'super' },
  { id: 'lambo-gallardo-2011', make: 'Lamborghini', model: 'Gallardo LP 570-4 Superleggera', year: 2011, weight: 3042, weightDistribution: 43, driveType: 'AWD', defaultPI: 823, category: 'super' },
  { id: 'lambo-huracan-2014', make: 'Lamborghini', model: 'Huracán LP 610-4', year: 2014, weight: 3135, weightDistribution: 43, driveType: 'AWD', defaultPI: 871, category: 'super' },
  { id: 'lambo-huracan-performante-2017', make: 'Lamborghini', model: 'Huracán Performante', year: 2017, weight: 3034, weightDistribution: 43, driveType: 'AWD', defaultPI: 920, category: 'super' },
  { id: 'lambo-huracan-evo-2019', make: 'Lamborghini', model: 'Huracán EVO', year: 2019, weight: 3135, weightDistribution: 43, driveType: 'AWD', defaultPI: 912, category: 'super' },
  { id: 'lambo-huracan-sto-2021', make: 'Lamborghini', model: 'Huracán STO', year: 2021, weight: 2954, weightDistribution: 43, driveType: 'RWD', defaultPI: 933, category: 'super' },
  { id: 'lambo-miura-1967', make: 'Lamborghini', model: 'Miura P400', year: 1967, weight: 2976, weightDistribution: 38, driveType: 'RWD', defaultPI: 584, category: 'classic' },
  { id: 'lambo-murcielago-2010', make: 'Lamborghini', model: 'Murciélago LP 670-4 SV', year: 2010, weight: 3527, weightDistribution: 42, driveType: 'AWD', defaultPI: 844, category: 'super' },
  { id: 'lambo-reventon-2008', make: 'Lamborghini', model: 'Reventón', year: 2008, weight: 3560, weightDistribution: 42, driveType: 'AWD', defaultPI: 840, category: 'super' },
  { id: 'lambo-sesto-elemento-2011', make: 'Lamborghini', model: 'Sesto Elemento', year: 2011, weight: 2202, weightDistribution: 43, driveType: 'AWD', defaultPI: 938, category: 'hyper' },
  { id: 'lambo-sian-2020', make: 'Lamborghini', model: 'Sián FKP 37', year: 2020, weight: 3494, weightDistribution: 44, driveType: 'AWD', defaultPI: 973, category: 'hyper' },
  { id: 'lambo-urus-2019', make: 'Lamborghini', model: 'Urus', year: 2019, weight: 4849, weightDistribution: 54, driveType: 'AWD', defaultPI: 731, category: 'truck' },
  { id: 'lambo-veneno-2014', make: 'Lamborghini', model: 'Veneno', year: 2014, weight: 3285, weightDistribution: 43, driveType: 'AWD', defaultPI: 957, category: 'hyper' },
  { id: 'lambo-espada-1968', make: 'Lamborghini', model: 'Espada S3', year: 1968, weight: 3461, weightDistribution: 47, driveType: 'RWD', defaultPI: 456, category: 'classic' },
  { id: 'lambo-lm002-1986', make: 'Lamborghini', model: 'LM 002', year: 1986, weight: 5952, weightDistribution: 49, driveType: 'AWD', defaultPI: 485, category: 'offroad' },
  
  // LANCIA
  { id: 'lancia-delta-1992', make: 'Lancia', model: 'Delta HF Integrale Evo', year: 1992, weight: 2888, weightDistribution: 59, driveType: 'AWD', defaultPI: 625, category: 'rally' },
  { id: 'lancia-stratos-1974', make: 'Lancia', model: 'Stratos HF Stradale', year: 1974, weight: 2161, weightDistribution: 42, driveType: 'RWD', defaultPI: 555, category: 'rally' },
  { id: 'lancia-037-1982', make: 'Lancia', model: '037 Stradale', year: 1982, weight: 2557, weightDistribution: 44, driveType: 'RWD', defaultPI: 626, category: 'rally' },
  { id: 'lancia-fulvia-1968', make: 'Lancia', model: 'Fulvia Coupe Rallye 1.6 HF', year: 1968, weight: 2050, weightDistribution: 58, driveType: 'FWD', defaultPI: 331, category: 'rally' },
  
  // LAND ROVER
  { id: 'land-rover-defender-1997', make: 'Land Rover', model: 'Defender 90', year: 1997, weight: 3968, weightDistribution: 53, driveType: 'AWD', defaultPI: 333, category: 'offroad' },
  { id: 'land-rover-defender-2020', make: 'Land Rover', model: 'Defender 110 X', year: 2020, weight: 5148, weightDistribution: 53, driveType: 'AWD', defaultPI: 577, category: 'offroad' },
  { id: 'land-rover-series3-1972', make: 'Land Rover', model: 'Series III', year: 1972, weight: 3351, weightDistribution: 51, driveType: 'AWD', defaultPI: 214, category: 'offroad' },
  { id: 'land-rover-range-rover-1973', make: 'Land Rover', model: 'Range Rover', year: 1973, weight: 4046, weightDistribution: 53, driveType: 'AWD', defaultPI: 295, category: 'offroad' },
  { id: 'land-rover-range-rover-2012', make: 'Land Rover', model: 'Range Rover Supercharged', year: 2012, weight: 5379, weightDistribution: 52, driveType: 'AWD', defaultPI: 599, category: 'truck' },
  { id: 'land-rover-range-rover-svr-2015', make: 'Land Rover', model: 'Range Rover Sport SVR', year: 2015, weight: 5060, weightDistribution: 53, driveType: 'AWD', defaultPI: 705, category: 'truck' },
  
  // LEXUS
  { id: 'lexus-gs-f-2016', make: 'Lexus', model: 'GS F', year: 2016, weight: 4034, weightDistribution: 54, driveType: 'RWD', defaultPI: 678, category: 'modern' },
  { id: 'lexus-is-f-2013', make: 'Lexus', model: 'IS F', year: 2013, weight: 3781, weightDistribution: 54, driveType: 'RWD', defaultPI: 639, category: 'modern' },
  { id: 'lexus-lc500-2018', make: 'Lexus', model: 'LC 500', year: 2018, weight: 4280, weightDistribution: 52, driveType: 'RWD', defaultPI: 677, category: 'modern' },
  { id: 'lexus-lfa-2010', make: 'Lexus', model: 'LFA', year: 2010, weight: 3263, weightDistribution: 48, driveType: 'RWD', defaultPI: 830, category: 'super' },
  { id: 'lexus-rc-f-2015', make: 'Lexus', model: 'RC F', year: 2015, weight: 3958, weightDistribution: 54, driveType: 'RWD', defaultPI: 679, category: 'modern' },
  { id: 'lexus-sc300-1997', make: 'Lexus', model: 'SC300', year: 1997, weight: 3461, weightDistribution: 53, driveType: 'RWD', defaultPI: 438, category: 'jdm' },
  { id: 'lexus-sc400-1995', make: 'Lexus', model: 'SC400', year: 1995, weight: 3638, weightDistribution: 53, driveType: 'RWD', defaultPI: 477, category: 'jdm' },
  
  // LOCAL MOTORS
  { id: 'local-motors-rally-2014', make: 'Local Motors', model: 'Rally Fighter', year: 2014, weight: 4123, weightDistribution: 54, driveType: 'RWD', defaultPI: 598, category: 'offroad' },
  
  // LOTUS
  { id: 'lotus-3-eleven-2016', make: 'Lotus', model: '3-Eleven', year: 2016, weight: 2050, weightDistribution: 44, driveType: 'RWD', defaultPI: 832, category: 'super' },
  { id: 'lotus-elise-1999', make: 'Lotus', model: 'Elise Series 1 Sport 190', year: 1999, weight: 1631, weightDistribution: 40, driveType: 'RWD', defaultPI: 543, category: 'super' },
  { id: 'lotus-elise-2005', make: 'Lotus', model: 'Elise 111S', year: 2005, weight: 1940, weightDistribution: 40, driveType: 'RWD', defaultPI: 574, category: 'super' },
  { id: 'lotus-evija-2020', make: 'Lotus', model: 'Evija', year: 2020, weight: 3704, weightDistribution: 46, driveType: 'AWD', defaultPI: 998, category: 'hyper' },
  { id: 'lotus-evora-2010', make: 'Lotus', model: 'Evora S', year: 2010, weight: 3086, weightDistribution: 41, driveType: 'RWD', defaultPI: 679, category: 'super' },
  { id: 'lotus-evora-gt430-2018', make: 'Lotus', model: 'Evora GT430', year: 2018, weight: 2866, weightDistribution: 41, driveType: 'RWD', defaultPI: 792, category: 'super' },
  { id: 'lotus-exige-2006', make: 'Lotus', model: 'Exige S', year: 2006, weight: 2028, weightDistribution: 40, driveType: 'RWD', defaultPI: 679, category: 'super' },
  { id: 'lotus-exige-s-2012', make: 'Lotus', model: 'Exige S', year: 2012, weight: 2447, weightDistribution: 39, driveType: 'RWD', defaultPI: 736, category: 'super' },
  { id: 'lotus-exige-360-2016', make: 'Lotus', model: 'Exige Sport 350', year: 2016, weight: 2337, weightDistribution: 40, driveType: 'RWD', defaultPI: 752, category: 'super' },
  { id: 'lotus-esprit-1981', make: 'Lotus', model: 'Esprit Turbo', year: 1981, weight: 2535, weightDistribution: 44, driveType: 'RWD', defaultPI: 501, category: 'retro' },
  { id: 'lotus-esprit-v8-1998', make: 'Lotus', model: 'Esprit V8', year: 1998, weight: 3042, weightDistribution: 43, driveType: 'RWD', defaultPI: 640, category: 'retro' },
  { id: 'lotus-elan-1962', make: 'Lotus', model: 'Elan Sprint', year: 1962, weight: 1609, weightDistribution: 48, driveType: 'RWD', defaultPI: 381, category: 'classic' },
  { id: 'lotus-elan-1998', make: 'Lotus', model: 'Elan M100', year: 1998, weight: 2249, weightDistribution: 58, driveType: 'FWD', defaultPI: 443, category: 'retro' },
  { id: 'lotus-europa-1971', make: 'Lotus', model: 'Europa S2', year: 1971, weight: 1477, weightDistribution: 44, driveType: 'RWD', defaultPI: 326, category: 'classic' },
  { id: 'lotus-emira-2022', make: 'Lotus', model: 'Emira', year: 2022, weight: 3097, weightDistribution: 42, driveType: 'RWD', defaultPI: 756, category: 'super' },
  
  // MASERATI
  { id: 'maserati-8ctf-1939', make: 'Maserati', model: '8CTF', year: 1939, weight: 1918, weightDistribution: 48, driveType: 'RWD', defaultPI: 546, category: 'formula' },
  { id: 'maserati-ghibli-2014', make: 'Maserati', model: 'Ghibli S Q4', year: 2014, weight: 4035, weightDistribution: 53, driveType: 'AWD', defaultPI: 670, category: 'modern' },
  { id: 'maserati-granturismo-2010', make: 'Maserati', model: 'GranTurismo S', year: 2010, weight: 4034, weightDistribution: 49, driveType: 'RWD', defaultPI: 649, category: 'modern' },
  { id: 'maserati-levante-2017', make: 'Maserati', model: 'Levante S', year: 2017, weight: 4629, weightDistribution: 51, driveType: 'AWD', defaultPI: 638, category: 'truck' },
  { id: 'maserati-mc12-2004', make: 'Maserati', model: 'MC12', year: 2004, weight: 2954, weightDistribution: 41, driveType: 'RWD', defaultPI: 883, category: 'hyper' },
  { id: 'maserati-mc12-fe-2008', make: 'Maserati', model: 'MC12 Versione Corsa', year: 2008, weight: 2425, weightDistribution: 41, driveType: 'RWD', defaultPI: 946, category: 'hyper' },
  
  // MAZDA
  { id: 'mazda-rx7-1985', make: 'Mazda', model: 'RX-7 GSL-SE', year: 1985, weight: 2513, weightDistribution: 51, driveType: 'RWD', defaultPI: 409, category: 'jdm' },
  { id: 'mazda-rx7-1990', make: 'Mazda', model: 'Savanna RX-7', year: 1990, weight: 2690, weightDistribution: 50, driveType: 'RWD', defaultPI: 500, category: 'jdm' },
  { id: 'mazda-rx7-1992', make: 'Mazda', model: 'RX-7', year: 1992, weight: 2712, weightDistribution: 51, driveType: 'RWD', defaultPI: 579, category: 'jdm' },
  { id: 'mazda-rx7-2002', make: 'Mazda', model: 'RX-7 Spirit R Type-A', year: 2002, weight: 2778, weightDistribution: 51, driveType: 'RWD', defaultPI: 621, category: 'jdm' },
  { id: 'mazda-rx8-2011', make: 'Mazda', model: 'RX-8 R3', year: 2011, weight: 3064, weightDistribution: 50, driveType: 'RWD', defaultPI: 525, category: 'jdm' },
  { id: 'mazda-mx5-1990', make: 'Mazda', model: 'MX-5 Miata', year: 1990, weight: 2182, weightDistribution: 51, driveType: 'RWD', defaultPI: 378, category: 'jdm' },
  { id: 'mazda-mx5-1994', make: 'Mazda', model: 'MX-5 Miata', year: 1994, weight: 2337, weightDistribution: 51, driveType: 'RWD', defaultPI: 404, category: 'jdm' },
  { id: 'mazda-mx5-2005', make: 'Mazda', model: 'MX-5', year: 2005, weight: 2381, weightDistribution: 51, driveType: 'RWD', defaultPI: 428, category: 'jdm' },
  { id: 'mazda-mx5-2016', make: 'Mazda', model: 'MX-5', year: 2016, weight: 2332, weightDistribution: 52, driveType: 'RWD', defaultPI: 463, category: 'jdm' },
  { id: 'mazda-cosmo-1972', make: 'Mazda', model: 'Cosmo 110S', year: 1972, weight: 2050, weightDistribution: 50, driveType: 'RWD', defaultPI: 323, category: 'retro' },
  { id: 'mazda-323-1988', make: 'Mazda', model: '#323 GT-R', year: 1988, weight: 2557, weightDistribution: 60, driveType: 'AWD', defaultPI: 432, category: 'rally' },
  { id: 'mazda-furai-2008', make: 'Mazda', model: 'Furai', year: 2008, weight: 1609, weightDistribution: 46, driveType: 'RWD', defaultPI: 803, category: 'formula' },
  { id: 'mazda-mx-5-rf-2019', make: 'Mazda', model: 'MX-5 RF', year: 2019, weight: 2381, weightDistribution: 52, driveType: 'RWD', defaultPI: 492, category: 'jdm' },
  { id: 'mazda-3-2019', make: 'Mazda', model: 'Mazda3', year: 2019, weight: 3111, weightDistribution: 61, driveType: 'FWD', defaultPI: 379, category: 'modern' },
  
  // MCLAREN
  { id: 'mclaren-senna-2018', make: 'McLaren', model: 'Senna', year: 2018, weight: 2641, weightDistribution: 43, driveType: 'RWD', defaultPI: 983, category: 'hyper' },
  { id: 'mclaren-720s-2017', make: 'McLaren', model: '720S', year: 2017, weight: 2828, weightDistribution: 43, driveType: 'RWD', defaultPI: 930, category: 'super' },
  { id: 'mclaren-765lt-2020', make: 'McLaren', model: '765LT', year: 2020, weight: 2952, weightDistribution: 43, driveType: 'RWD', defaultPI: 959, category: 'super' },
  { id: 'mclaren-600lt-2018', make: 'McLaren', model: '600LT', year: 2018, weight: 2749, weightDistribution: 43, driveType: 'RWD', defaultPI: 886, category: 'super' },
  { id: 'mclaren-620r-2020', make: 'McLaren', model: '620R', year: 2020, weight: 2828, weightDistribution: 43, driveType: 'RWD', defaultPI: 906, category: 'super' },
  { id: 'mclaren-570s-2015', make: 'McLaren', model: '570S', year: 2015, weight: 2895, weightDistribution: 43, driveType: 'RWD', defaultPI: 849, category: 'super' },
  { id: 'mclaren-650s-2014', make: 'McLaren', model: '650S Coupe', year: 2014, weight: 2844, weightDistribution: 43, driveType: 'RWD', defaultPI: 886, category: 'super' },
  { id: 'mclaren-675lt-2015', make: 'McLaren', model: '675LT', year: 2015, weight: 2712, weightDistribution: 43, driveType: 'RWD', defaultPI: 909, category: 'super' },
  { id: 'mclaren-f1-1993', make: 'McLaren', model: 'F1', year: 1993, weight: 2509, weightDistribution: 42, driveType: 'RWD', defaultPI: 893, category: 'hyper' },
  { id: 'mclaren-f1-gt-1997', make: 'McLaren', model: 'F1 GT', year: 1997, weight: 2381, weightDistribution: 42, driveType: 'RWD', defaultPI: 916, category: 'hyper' },
  { id: 'mclaren-mp4-12c-2011', make: 'McLaren', model: 'MP4-12C', year: 2011, weight: 2866, weightDistribution: 42, driveType: 'RWD', defaultPI: 855, category: 'super' },
  { id: 'mclaren-p1-2013', make: 'McLaren', model: 'P1', year: 2013, weight: 3197, weightDistribution: 44, driveType: 'RWD', defaultPI: 965, category: 'hyper' },
  { id: 'mclaren-speedtail-2019', make: 'McLaren', model: 'Speedtail', year: 2019, weight: 3649, weightDistribution: 44, driveType: 'RWD', defaultPI: 943, category: 'hyper' },
  { id: 'mclaren-gt-2020', make: 'McLaren', model: 'GT', year: 2020, weight: 3197, weightDistribution: 42, driveType: 'RWD', defaultPI: 838, category: 'super' },
  { id: 'mclaren-artura-2022', make: 'McLaren', model: 'Artura', year: 2022, weight: 3303, weightDistribution: 43, driveType: 'RWD', defaultPI: 883, category: 'super' },
  { id: 'mclaren-elva-2021', make: 'McLaren', model: 'Elva', year: 2021, weight: 2641, weightDistribution: 43, driveType: 'RWD', defaultPI: 955, category: 'hyper' },
  
  // MERCEDES-BENZ
  { id: 'mercedes-300-sl-1954', make: 'Mercedes-Benz', model: '300 SL Coupe', year: 1954, weight: 2888, weightDistribution: 51, driveType: 'RWD', defaultPI: 445, category: 'classic' },
  { id: 'mercedes-190e-1990', make: 'Mercedes-Benz', model: '190E 2.5-16 Evolution II', year: 1990, weight: 2778, weightDistribution: 55, driveType: 'RWD', defaultPI: 541, category: 'retro' },
  { id: 'mercedes-a45-2016', make: 'Mercedes-AMG', model: 'A 45 AMG', year: 2016, weight: 3351, weightDistribution: 59, driveType: 'AWD', defaultPI: 709, category: 'modern' },
  { id: 'mercedes-a45-s-2021', make: 'Mercedes-AMG', model: 'A 45 S', year: 2021, weight: 3549, weightDistribution: 58, driveType: 'AWD', defaultPI: 753, category: 'modern' },
  { id: 'mercedes-amg-gt-2015', make: 'Mercedes-AMG', model: 'GT S', year: 2015, weight: 3494, weightDistribution: 47, driveType: 'RWD', defaultPI: 797, category: 'super' },
  { id: 'mercedes-amg-gt-r-2017', make: 'Mercedes-AMG', model: 'GT R', year: 2017, weight: 3461, weightDistribution: 47, driveType: 'RWD', defaultPI: 862, category: 'super' },
  { id: 'mercedes-amg-gt-bs-2021', make: 'Mercedes-AMG', model: 'GT Black Series', year: 2021, weight: 3549, weightDistribution: 47, driveType: 'RWD', defaultPI: 933, category: 'super' },
  { id: 'mercedes-c63-2012', make: 'Mercedes-Benz', model: 'C 63 AMG Coupe Black Series', year: 2012, weight: 3748, weightDistribution: 55, driveType: 'RWD', defaultPI: 766, category: 'modern' },
  { id: 'mercedes-c63-2016', make: 'Mercedes-AMG', model: 'C 63 S Coupe', year: 2016, weight: 3814, weightDistribution: 54, driveType: 'RWD', defaultPI: 768, category: 'modern' },
  { id: 'mercedes-clk-gtr-1998', make: 'Mercedes-Benz', model: 'CLK GTR', year: 1998, weight: 2976, weightDistribution: 46, driveType: 'RWD', defaultPI: 881, category: 'hyper' },
  { id: 'mercedes-e63-2013', make: 'Mercedes-Benz', model: 'E 63 AMG', year: 2013, weight: 4024, weightDistribution: 55, driveType: 'RWD', defaultPI: 736, category: 'modern' },
  { id: 'mercedes-e63-s-2018', make: 'Mercedes-AMG', model: 'E 63 S', year: 2018, weight: 4277, weightDistribution: 55, driveType: 'AWD', defaultPI: 811, category: 'modern' },
  { id: 'mercedes-g63-2017', make: 'Mercedes-AMG', model: 'G 63 AMG', year: 2017, weight: 5655, weightDistribution: 55, driveType: 'AWD', defaultPI: 627, category: 'offroad' },
  { id: 'mercedes-g65-2017', make: 'Mercedes-AMG', model: 'G 65 AMG', year: 2017, weight: 5886, weightDistribution: 55, driveType: 'AWD', defaultPI: 656, category: 'offroad' },
  { id: 'mercedes-gle-2016', make: 'Mercedes-AMG', model: 'GLE 63 S Coupe', year: 2016, weight: 5280, weightDistribution: 54, driveType: 'AWD', defaultPI: 689, category: 'truck' },
  { id: 'mercedes-sl65-2013', make: 'Mercedes-Benz', model: 'SL 65 AMG Black Series', year: 2013, weight: 4013, weightDistribution: 51, driveType: 'RWD', defaultPI: 810, category: 'super' },
  { id: 'mercedes-sls-2011', make: 'Mercedes-Benz', model: 'SLS AMG', year: 2011, weight: 3571, weightDistribution: 47, driveType: 'RWD', defaultPI: 782, category: 'super' },
  { id: 'mercedes-slr-2005', make: 'Mercedes-Benz', model: 'SLR McLaren', year: 2005, weight: 3880, weightDistribution: 50, driveType: 'RWD', defaultPI: 805, category: 'super' },
  { id: 'mercedes-w154-1939', make: 'Mercedes-Benz', model: 'W154', year: 1939, weight: 2050, weightDistribution: 50, driveType: 'RWD', defaultPI: 642, category: 'formula' },
  { id: 'mercedes-ssk-1929', make: 'Mercedes-Benz', model: 'SSK', year: 1929, weight: 3086, weightDistribution: 53, driveType: 'RWD', defaultPI: 318, category: 'classic' },
  { id: 'mercedes-project-one-2021', make: 'Mercedes-AMG', model: 'ONE', year: 2021, weight: 3461, weightDistribution: 44, driveType: 'AWD', defaultPI: 998, category: 'hyper' },
  
  // MERCURY
  { id: 'mercury-cougar-1967', make: 'Mercury', model: 'Cougar XR-7 GT', year: 1967, weight: 3505, weightDistribution: 54, driveType: 'RWD', defaultPI: 455, category: 'muscle' },
  { id: 'mercury-coupe-1949', make: 'Mercury', model: 'Coupe', year: 1949, weight: 3373, weightDistribution: 56, driveType: 'RWD', defaultPI: 220, category: 'classic' },
  { id: 'mercury-cyclone-1970', make: 'Mercury', model: 'Cyclone Spoiler', year: 1970, weight: 3737, weightDistribution: 56, driveType: 'RWD', defaultPI: 523, category: 'muscle' },
  
  // MINI
  { id: 'mini-cooper-1965', make: 'MINI', model: 'Cooper S', year: 1965, weight: 1477, weightDistribution: 60, driveType: 'FWD', defaultPI: 337, category: 'retro' },
  { id: 'mini-countryman-2018', make: 'MINI', model: 'John Cooper Works Countryman', year: 2018, weight: 3616, weightDistribution: 60, driveType: 'AWD', defaultPI: 594, category: 'modern' },
  { id: 'mini-jcw-2009', make: 'MINI', model: 'John Cooper Works', year: 2009, weight: 2767, weightDistribution: 63, driveType: 'FWD', defaultPI: 555, category: 'modern' },
  { id: 'mini-jcw-2012', make: 'MINI', model: 'John Cooper Works GP', year: 2012, weight: 2712, weightDistribution: 63, driveType: 'FWD', defaultPI: 598, category: 'modern' },
  { id: 'mini-jcw-2020', make: 'MINI', model: 'John Cooper Works GP', year: 2020, weight: 2888, weightDistribution: 61, driveType: 'FWD', defaultPI: 675, category: 'modern' },
  
  // MITSUBISHI
  { id: 'mitsubishi-3000gt-1997', make: 'Mitsubishi', model: '3000GT VR-4', year: 1997, weight: 3858, weightDistribution: 58, driveType: 'AWD', defaultPI: 597, category: 'jdm' },
  { id: 'mitsubishi-eclipse-1995', make: 'Mitsubishi', model: 'Eclipse GSX', year: 1995, weight: 3164, weightDistribution: 60, driveType: 'AWD', defaultPI: 517, category: 'jdm' },
  { id: 'mitsubishi-eclipse-1999', make: 'Mitsubishi', model: 'Eclipse GS-T', year: 1999, weight: 3020, weightDistribution: 61, driveType: 'FWD', defaultPI: 494, category: 'jdm' },
  { id: 'mitsubishi-evo-5-1998', make: 'Mitsubishi', model: 'Lancer Evolution V', year: 1998, weight: 2888, weightDistribution: 58, driveType: 'AWD', defaultPI: 623, category: 'jdm' },
  { id: 'mitsubishi-evo-6-1999', make: 'Mitsubishi', model: 'Lancer Evolution VI GSR', year: 1999, weight: 2888, weightDistribution: 58, driveType: 'AWD', defaultPI: 637, category: 'jdm' },
  { id: 'mitsubishi-evo-6-tme-1999', make: 'Mitsubishi', model: 'Lancer Evolution VI TME', year: 1999, weight: 2910, weightDistribution: 58, driveType: 'AWD', defaultPI: 656, category: 'jdm' },
  { id: 'mitsubishi-evo-7-2002', make: 'Mitsubishi', model: 'Lancer Evolution VII', year: 2002, weight: 2932, weightDistribution: 58, driveType: 'AWD', defaultPI: 638, category: 'jdm' },
  { id: 'mitsubishi-evo-8-2004', make: 'Mitsubishi', model: 'Lancer Evolution VIII MR', year: 2004, weight: 3109, weightDistribution: 58, driveType: 'AWD', defaultPI: 674, category: 'jdm' },
  { id: 'mitsubishi-evo-9-2006', make: 'Mitsubishi', model: 'Lancer Evolution IX MR', year: 2006, weight: 3186, weightDistribution: 58, driveType: 'AWD', defaultPI: 684, category: 'jdm' },
  { id: 'mitsubishi-evo-10-2008', make: 'Mitsubishi', model: 'Lancer Evolution X GSR', year: 2008, weight: 3527, weightDistribution: 58, driveType: 'AWD', defaultPI: 707, category: 'jdm' },
  { id: 'mitsubishi-evo-final-2015', make: 'Mitsubishi', model: 'Lancer Evolution X Final Edition', year: 2015, weight: 3483, weightDistribution: 58, driveType: 'AWD', defaultPI: 716, category: 'jdm' },
  { id: 'mitsubishi-gto-1992', make: 'Mitsubishi', model: 'GTO', year: 1992, weight: 3791, weightDistribution: 58, driveType: 'AWD', defaultPI: 572, category: 'jdm' },
  { id: 'mitsubishi-starion-1988', make: 'Mitsubishi', model: 'Starion ESI-R', year: 1988, weight: 3042, weightDistribution: 54, driveType: 'RWD', defaultPI: 431, category: 'retro' },
  
  // NISSAN
  { id: 'nissan-240sx-1994', make: 'Nissan', model: '240SX SE', year: 1994, weight: 2690, weightDistribution: 52, driveType: 'RWD', defaultPI: 420, category: 'jdm' },
  { id: 'nissan-300zx-1990', make: 'Nissan', model: '300ZX Twin Turbo', year: 1990, weight: 3373, weightDistribution: 55, driveType: 'RWD', defaultPI: 571, category: 'jdm' },
  { id: 'nissan-350z-2003', make: 'Nissan', model: '350Z', year: 2003, weight: 3188, weightDistribution: 53, driveType: 'RWD', defaultPI: 552, category: 'jdm' },
  { id: 'nissan-370z-2012', make: 'Nissan', model: '370Z', year: 2012, weight: 3318, weightDistribution: 53, driveType: 'RWD', defaultPI: 597, category: 'jdm' },
  { id: 'nissan-z-2023', make: 'Nissan', model: 'Z', year: 2023, weight: 3505, weightDistribution: 55, driveType: 'RWD', defaultPI: 688, category: 'jdm' },
  { id: 'nissan-gtr-r32-1993', make: 'Nissan', model: 'Skyline GT-R V-Spec', year: 1993, weight: 3153, weightDistribution: 57, driveType: 'AWD', defaultPI: 644, category: 'jdm' },
  { id: 'nissan-gtr-r33-1995', make: 'Nissan', model: 'Skyline GT-R V-Spec', year: 1995, weight: 3329, weightDistribution: 56, driveType: 'AWD', defaultPI: 666, category: 'jdm' },
  { id: 'nissan-gtr-r34-1999', make: 'Nissan', model: 'Skyline GT-R V-Spec', year: 1999, weight: 3362, weightDistribution: 55, driveType: 'AWD', defaultPI: 695, category: 'jdm' },
  { id: 'nissan-gtr-r34-2000', make: 'Nissan', model: 'Skyline GT-R V-Spec II', year: 2000, weight: 3362, weightDistribution: 55, driveType: 'AWD', defaultPI: 702, category: 'jdm' },
  { id: 'nissan-gtr-r34-2002', make: 'Nissan', model: 'Skyline GT-R V-Spec II Nür', year: 2002, weight: 3461, weightDistribution: 55, driveType: 'AWD', defaultPI: 726, category: 'jdm' },
  { id: 'nissan-gtr-r35-2012', make: 'Nissan', model: 'GT-R Black Edition', year: 2012, weight: 3836, weightDistribution: 54, driveType: 'AWD', defaultPI: 824, category: 'super' },
  { id: 'nissan-gtr-r35-2017', make: 'Nissan', model: 'GT-R', year: 2017, weight: 3814, weightDistribution: 54, driveType: 'AWD', defaultPI: 851, category: 'super' },
  { id: 'nissan-gtr-r35-nismo-2020', make: 'Nissan', model: 'GT-R NISMO', year: 2020, weight: 3836, weightDistribution: 54, driveType: 'AWD', defaultPI: 883, category: 'super' },
  { id: 'nissan-silvia-1992', make: 'Nissan', model: 'Silvia K\'s', year: 1992, weight: 2535, weightDistribution: 53, driveType: 'RWD', defaultPI: 449, category: 'jdm' },
  { id: 'nissan-silvia-1994', make: 'Nissan', model: 'Silvia K\'s Aero', year: 1994, weight: 2557, weightDistribution: 53, driveType: 'RWD', defaultPI: 476, category: 'jdm' },
  { id: 'nissan-silvia-1998', make: 'Nissan', model: 'Silvia Spec-R', year: 1998, weight: 2778, weightDistribution: 54, driveType: 'RWD', defaultPI: 524, category: 'jdm' },
  { id: 'nissan-silvia-2000', make: 'Nissan', model: 'Silvia Spec-R Aero', year: 2000, weight: 2789, weightDistribution: 54, driveType: 'RWD', defaultPI: 537, category: 'jdm' },
  { id: 'nissan-pulsar-1991', make: 'Nissan', model: 'Pulsar GTI-R', year: 1991, weight: 2602, weightDistribution: 62, driveType: 'AWD', defaultPI: 520, category: 'jdm' },
  { id: 'nissan-sentra-2004', make: 'Nissan', model: 'Sentra SE-R Spec V', year: 2004, weight: 2954, weightDistribution: 62, driveType: 'FWD', defaultPI: 437, category: 'jdm' },
  { id: 'nissan-sentra-nismo-2018', make: 'Nissan', model: 'Sentra NISMO', year: 2018, weight: 3047, weightDistribution: 61, driveType: 'FWD', defaultPI: 485, category: 'jdm' },
  { id: 'nissan-titan-2016', make: 'Nissan', model: 'Titan Warrior Concept', year: 2016, weight: 6700, weightDistribution: 55, driveType: 'AWD', defaultPI: 555, category: 'offroad' },
  { id: 'nissan-patrol-1987', make: 'Nissan', model: 'Safari', year: 1987, weight: 4585, weightDistribution: 56, driveType: 'AWD', defaultPI: 331, category: 'offroad' },
  { id: 'nissan-juke-2016', make: 'Nissan', model: 'JUKE NISMO RS', year: 2016, weight: 3164, weightDistribution: 61, driveType: 'AWD', defaultPI: 547, category: 'modern' },
  { id: 'nissan-idxnismo-2014', make: 'Nissan', model: 'IDx NISMO', year: 2014, weight: 2888, weightDistribution: 52, driveType: 'RWD', defaultPI: 598, category: 'modern' },
  { id: 'nissan-skyline-r30-1981', make: 'Nissan', model: 'Skyline 2000 RS-X Turbo C', year: 1981, weight: 2557, weightDistribution: 54, driveType: 'RWD', defaultPI: 406, category: 'retro' },
  
  // OLDSMOBILE
  { id: 'olds-442-1970', make: 'Oldsmobile', model: '442 W-30', year: 1970, weight: 3836, weightDistribution: 55, driveType: 'RWD', defaultPI: 548, category: 'muscle' },
  { id: 'olds-442-1969', make: 'Oldsmobile', model: '442 Hurst/Olds', year: 1969, weight: 3847, weightDistribution: 55, driveType: 'RWD', defaultPI: 543, category: 'muscle' },
  { id: 'olds-cutlass-1966', make: 'Oldsmobile', model: 'Cutlass 442', year: 1966, weight: 3417, weightDistribution: 53, driveType: 'RWD', defaultPI: 453, category: 'muscle' },
  { id: 'olds-delta-1968', make: 'Oldsmobile', model: 'Toronado', year: 1968, weight: 4576, weightDistribution: 55, driveType: 'FWD', defaultPI: 422, category: 'classic' },
  
  // PAGANI
  { id: 'pagani-huayra-2012', make: 'Pagani', model: 'Huayra', year: 2012, weight: 2976, weightDistribution: 44, driveType: 'RWD', defaultPI: 920, category: 'hyper' },
  { id: 'pagani-huayra-bc-2017', make: 'Pagani', model: 'Huayra BC', year: 2017, weight: 2685, weightDistribution: 44, driveType: 'RWD', defaultPI: 953, category: 'hyper' },
  { id: 'pagani-zonda-c12-1999', make: 'Pagani', model: 'Zonda C12', year: 1999, weight: 2513, weightDistribution: 43, driveType: 'RWD', defaultPI: 793, category: 'hyper' },
  { id: 'pagani-zonda-cinque-2009', make: 'Pagani', model: 'Zonda Cinque Roadster', year: 2009, weight: 2513, weightDistribution: 43, driveType: 'RWD', defaultPI: 914, category: 'hyper' },
  { id: 'pagani-zonda-r-2010', make: 'Pagani', model: 'Zonda R', year: 2010, weight: 2381, weightDistribution: 44, driveType: 'RWD', defaultPI: 955, category: 'hyper' },
  { id: 'pagani-zonda-revolucion-2014', make: 'Pagani', model: 'Zonda Revolucion', year: 2014, weight: 2425, weightDistribution: 44, driveType: 'RWD', defaultPI: 977, category: 'hyper' },
  
  // PEEL
  { id: 'peel-p50-1964', make: 'Peel', model: 'P50', year: 1964, weight: 130, weightDistribution: 40, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  { id: 'peel-trident-1965', make: 'Peel', model: 'Trident', year: 1965, weight: 196, weightDistribution: 36, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  
  // PEUGEOT
  { id: 'peugeot-205-1984', make: 'Peugeot', model: '205 T16', year: 1984, weight: 2161, weightDistribution: 50, driveType: 'AWD', defaultPI: 625, category: 'rally' },
  { id: 'peugeot-205-gti-1984', make: 'Peugeot', model: '205 GTi', year: 1984, weight: 1962, weightDistribution: 60, driveType: 'FWD', defaultPI: 370, category: 'retro' },
  { id: 'peugeot-207-2011', make: 'Peugeot', model: '207 Super 2000', year: 2011, weight: 2646, weightDistribution: 60, driveType: 'FWD', defaultPI: 612, category: 'rally' },
  { id: 'peugeot-306-1993', make: 'Peugeot', model: '306 Maxi', year: 1993, weight: 2227, weightDistribution: 60, driveType: 'FWD', defaultPI: 559, category: 'rally' },
  
  // PLYMOUTH
  { id: 'plymouth-barracuda-1970', make: 'Plymouth', model: 'Cuda 426 Hemi', year: 1970, weight: 3572, weightDistribution: 56, driveType: 'RWD', defaultPI: 602, category: 'muscle' },
  { id: 'plymouth-road-runner-1968', make: 'Plymouth', model: 'Road Runner', year: 1968, weight: 3703, weightDistribution: 56, driveType: 'RWD', defaultPI: 549, category: 'muscle' },
  { id: 'plymouth-superbird-1970', make: 'Plymouth', model: 'Superbird', year: 1970, weight: 3785, weightDistribution: 56, driveType: 'RWD', defaultPI: 619, category: 'muscle' },
  { id: 'plymouth-fury-1958', make: 'Plymouth', model: 'Fury', year: 1958, weight: 3550, weightDistribution: 55, driveType: 'RWD', defaultPI: 357, category: 'classic' },
  { id: 'plymouth-gtx-1967', make: 'Plymouth', model: 'GTX', year: 1967, weight: 3714, weightDistribution: 56, driveType: 'RWD', defaultPI: 506, category: 'muscle' },
  
  // POLARIS
  { id: 'polaris-rzr-2017', make: 'Polaris', model: 'RZR XP 1000 EPS', year: 2017, weight: 1550, weightDistribution: 42, driveType: 'AWD', defaultPI: 532, category: 'offroad' },
  
  // PONTIAC
  { id: 'pontiac-firebird-1973', make: 'Pontiac', model: 'Firebird Trans Am SD-455', year: 1973, weight: 3737, weightDistribution: 55, driveType: 'RWD', defaultPI: 513, category: 'muscle' },
  { id: 'pontiac-firebird-1977', make: 'Pontiac', model: 'Firebird Trans Am', year: 1977, weight: 3649, weightDistribution: 55, driveType: 'RWD', defaultPI: 438, category: 'muscle' },
  { id: 'pontiac-firebird-1987', make: 'Pontiac', model: 'Firebird Trans Am GTA', year: 1987, weight: 3373, weightDistribution: 53, driveType: 'RWD', defaultPI: 498, category: 'muscle' },
  { id: 'pontiac-firebird-2002', make: 'Pontiac', model: 'Firebird Trans Am Ram Air', year: 2002, weight: 3483, weightDistribution: 54, driveType: 'RWD', defaultPI: 573, category: 'muscle' },
  { id: 'pontiac-gto-1965', make: 'Pontiac', model: 'GTO', year: 1965, weight: 3511, weightDistribution: 54, driveType: 'RWD', defaultPI: 494, category: 'muscle' },
  { id: 'pontiac-gto-1969', make: 'Pontiac', model: 'GTO "The Judge"', year: 1969, weight: 3649, weightDistribution: 54, driveType: 'RWD', defaultPI: 530, category: 'muscle' },
  { id: 'pontiac-gto-2005', make: 'Pontiac', model: 'GTO', year: 2005, weight: 3725, weightDistribution: 53, driveType: 'RWD', defaultPI: 571, category: 'muscle' },
  { id: 'pontiac-solstice-2009', make: 'Pontiac', model: 'Solstice GXP', year: 2009, weight: 2976, weightDistribution: 52, driveType: 'RWD', defaultPI: 523, category: 'modern' },
  { id: 'pontiac-fiero-1988', make: 'Pontiac', model: 'Fiero GT', year: 1988, weight: 2756, weightDistribution: 42, driveType: 'RWD', defaultPI: 374, category: 'retro' },
  { id: 'pontiac-catalina-1964', make: 'Pontiac', model: 'Catalina 2+2', year: 1964, weight: 3902, weightDistribution: 56, driveType: 'RWD', defaultPI: 487, category: 'muscle' },
  
  // PORSCHE
  { id: 'porsche-356-1964', make: 'Porsche', model: '356 C Cabriolet', year: 1964, weight: 1918, weightDistribution: 42, driveType: 'RWD', defaultPI: 320, category: 'classic' },
  { id: 'porsche-550-1955', make: 'Porsche', model: '550 Spyder', year: 1955, weight: 1213, weightDistribution: 44, driveType: 'RWD', defaultPI: 426, category: 'classic' },
  { id: 'porsche-911-1973', make: 'Porsche', model: '911 Carrera RS 2.7', year: 1973, weight: 2028, weightDistribution: 43, driveType: 'RWD', defaultPI: 556, category: 'retro' },
  { id: 'porsche-911-1982', make: 'Porsche', model: '911 Turbo 3.3', year: 1982, weight: 2767, weightDistribution: 40, driveType: 'RWD', defaultPI: 603, category: 'retro' },
  { id: 'porsche-911-turbo-1995', make: 'Porsche', model: '911 GT2', year: 1995, weight: 2866, weightDistribution: 40, driveType: 'RWD', defaultPI: 764, category: 'retro' },
  { id: 'porsche-911-gt2-2012', make: 'Porsche', model: '911 GT2 RS', year: 2012, weight: 3020, weightDistribution: 38, driveType: 'RWD', defaultPI: 870, category: 'super' },
  { id: 'porsche-911-gt2-2018', make: 'Porsche', model: '911 GT2 RS', year: 2018, weight: 3241, weightDistribution: 38, driveType: 'RWD', defaultPI: 935, category: 'super' },
  { id: 'porsche-911-gt3-2004', make: 'Porsche', model: '911 GT3', year: 2004, weight: 2976, weightDistribution: 38, driveType: 'RWD', defaultPI: 735, category: 'super' },
  { id: 'porsche-911-gt3-2016', make: 'Porsche', model: '911 GT3 RS', year: 2016, weight: 3153, weightDistribution: 38, driveType: 'RWD', defaultPI: 859, category: 'super' },
  { id: 'porsche-911-gt3-2019', make: 'Porsche', model: '911 GT3 RS', year: 2019, weight: 3153, weightDistribution: 38, driveType: 'RWD', defaultPI: 891, category: 'super' },
  { id: 'porsche-911-turbo-s-2021', make: 'Porsche', model: '911 Turbo S', year: 2021, weight: 3637, weightDistribution: 39, driveType: 'AWD', defaultPI: 919, category: 'super' },
  { id: 'porsche-911-gt3-2021', make: 'Porsche', model: '911 GT3', year: 2021, weight: 3164, weightDistribution: 39, driveType: 'RWD', defaultPI: 866, category: 'super' },
  { id: 'porsche-911-carrera-s-2012', make: 'Porsche', model: '911 Carrera S', year: 2012, weight: 3153, weightDistribution: 40, driveType: 'RWD', defaultPI: 756, category: 'modern' },
  { id: 'porsche-911-carrera-gts-2019', make: 'Porsche', model: '911 Carrera GTS', year: 2019, weight: 3329, weightDistribution: 39, driveType: 'RWD', defaultPI: 811, category: 'modern' },
  { id: 'porsche-911-1970', make: 'Porsche', model: '914/6', year: 1970, weight: 2050, weightDistribution: 46, driveType: 'RWD', defaultPI: 370, category: 'retro' },
  { id: 'porsche-918-2014', make: 'Porsche', model: '918 Spyder', year: 2014, weight: 3616, weightDistribution: 43, driveType: 'AWD', defaultPI: 966, category: 'hyper' },
  { id: 'porsche-917-1970', make: 'Porsche', model: '917 LH', year: 1970, weight: 1874, weightDistribution: 43, driveType: 'RWD', defaultPI: 778, category: 'formula' },
  { id: 'porsche-917-20-1971', make: 'Porsche', model: '917/20', year: 1971, weight: 1874, weightDistribution: 43, driveType: 'RWD', defaultPI: 800, category: 'formula' },
  { id: 'porsche-924-1989', make: 'Porsche', model: '944 Turbo', year: 1989, weight: 2844, weightDistribution: 49, driveType: 'RWD', defaultPI: 488, category: 'retro' },
  { id: 'porsche-928-1979', make: 'Porsche', model: '928', year: 1979, weight: 3351, weightDistribution: 50, driveType: 'RWD', defaultPI: 430, category: 'retro' },
  { id: 'porsche-959-1987', make: 'Porsche', model: '959', year: 1987, weight: 3197, weightDistribution: 42, driveType: 'AWD', defaultPI: 777, category: 'super' },
  { id: 'porsche-968-1993', make: 'Porsche', model: '968 Turbo S', year: 1993, weight: 3042, weightDistribution: 50, driveType: 'RWD', defaultPI: 521, category: 'retro' },
  { id: 'porsche-carrera-gt-2003', make: 'Porsche', model: 'Carrera GT', year: 2003, weight: 2976, weightDistribution: 44, driveType: 'RWD', defaultPI: 857, category: 'super' },
  { id: 'porsche-cayenne-2019', make: 'Porsche', model: 'Cayenne Turbo', year: 2019, weight: 4916, weightDistribution: 53, driveType: 'AWD', defaultPI: 730, category: 'truck' },
  { id: 'porsche-cayman-gts-2016', make: 'Porsche', model: 'Cayman GTS', year: 2016, weight: 2888, weightDistribution: 44, driveType: 'RWD', defaultPI: 727, category: 'modern' },
  { id: 'porsche-cayman-gt4-2016', make: 'Porsche', model: 'Cayman GT4', year: 2016, weight: 2866, weightDistribution: 44, driveType: 'RWD', defaultPI: 756, category: 'modern' },
  { id: 'porsche-panamera-2017', make: 'Porsche', model: 'Panamera Turbo', year: 2017, weight: 4398, weightDistribution: 54, driveType: 'AWD', defaultPI: 778, category: 'modern' },
  { id: 'porsche-macan-2019', make: 'Porsche', model: 'Macan Turbo', year: 2019, weight: 4266, weightDistribution: 55, driveType: 'AWD', defaultPI: 696, category: 'modern' },
  { id: 'porsche-taycan-2020', make: 'Porsche', model: 'Taycan Turbo S', year: 2020, weight: 5060, weightDistribution: 48, driveType: 'AWD', defaultPI: 849, category: 'modern' },
  
  // RADICAL
  { id: 'radical-rxc-2015', make: 'Radical', model: 'RXC Turbo', year: 2015, weight: 2094, weightDistribution: 47, driveType: 'RWD', defaultPI: 912, category: 'super' },
  
  // RELIANT
  { id: 'reliant-robin-1973', make: 'Reliant', model: 'Supervan III', year: 1973, weight: 1146, weightDistribution: 40, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  
  // RENAULT
  { id: 'renault-5-1983', make: 'Renault', model: '5 Turbo', year: 1983, weight: 2094, weightDistribution: 42, driveType: 'RWD', defaultPI: 532, category: 'rally' },
  { id: 'renault-alpine-1975', make: 'Renault', model: 'Alpine A110 1600s', year: 1975, weight: 1609, weightDistribution: 41, driveType: 'RWD', defaultPI: 429, category: 'retro' },
  { id: 'renault-clio-2003', make: 'Renault', model: 'Clio V6', year: 2003, weight: 2888, weightDistribution: 38, driveType: 'RWD', defaultPI: 607, category: 'euro' },
  { id: 'renault-clio-rs-2007', make: 'Renault', model: 'Clio RS 197', year: 2007, weight: 2657, weightDistribution: 63, driveType: 'FWD', defaultPI: 503, category: 'euro' },
  { id: 'renault-clio-rs-2013', make: 'Renault', model: 'Clio R.S. 200', year: 2013, weight: 2668, weightDistribution: 62, driveType: 'FWD', defaultPI: 517, category: 'euro' },
  { id: 'renault-megane-2010', make: 'Renault', model: 'Megane R.S. 250', year: 2010, weight: 3042, weightDistribution: 64, driveType: 'FWD', defaultPI: 594, category: 'euro' },
  { id: 'renault-megane-2018', make: 'Renault', model: 'Megane R.S.', year: 2018, weight: 3175, weightDistribution: 63, driveType: 'FWD', defaultPI: 622, category: 'euro' },
  
  // RIMAC
  { id: 'rimac-concept-two-2019', make: 'Rimac', model: 'Concept Two', year: 2019, weight: 4354, weightDistribution: 48, driveType: 'AWD', defaultPI: 991, category: 'hyper' },
  { id: 'rimac-nevera-2021', make: 'Rimac', model: 'Nevera', year: 2021, weight: 4695, weightDistribution: 48, driveType: 'AWD', defaultPI: 998, category: 'hyper' },
  
  // SALEEN
  { id: 'saleen-s7-2004', make: 'Saleen', model: 'S7', year: 2004, weight: 2866, weightDistribution: 41, driveType: 'RWD', defaultPI: 857, category: 'super' },
  { id: 'saleen-s7-tt-2006', make: 'Saleen', model: 'S7 Twin Turbo', year: 2006, weight: 2866, weightDistribution: 41, driveType: 'RWD', defaultPI: 918, category: 'super' },
  { id: 'saleen-s5s-2008', make: 'Saleen', model: 'S5S Raptor', year: 2008, weight: 2888, weightDistribution: 50, driveType: 'RWD', defaultPI: 771, category: 'super' },
  
  // SHELBY
  { id: 'shelby-cobra-1965', make: 'Shelby', model: 'Cobra 427 S/C', year: 1965, weight: 2381, weightDistribution: 49, driveType: 'RWD', defaultPI: 655, category: 'classic' },
  { id: 'shelby-cobra-daytona-1964', make: 'Shelby', model: 'Cobra Daytona Coupe', year: 1964, weight: 2337, weightDistribution: 46, driveType: 'RWD', defaultPI: 660, category: 'classic' },
  { id: 'shelby-super-snake-2017', make: 'Shelby', model: 'Super Snake', year: 2017, weight: 3990, weightDistribution: 54, driveType: 'RWD', defaultPI: 835, category: 'muscle' },
  
  // SUBARU
  { id: 'subaru-22b-1998', make: 'Subaru', model: 'Impreza 22B STi', year: 1998, weight: 2888, weightDistribution: 59, driveType: 'AWD', defaultPI: 662, category: 'rally' },
  { id: 'subaru-brz-2013', make: 'Subaru', model: 'BRZ', year: 2013, weight: 2762, weightDistribution: 53, driveType: 'RWD', defaultPI: 505, category: 'jdm' },
  { id: 'subaru-brz-2022', make: 'Subaru', model: 'BRZ', year: 2022, weight: 2835, weightDistribution: 53, driveType: 'RWD', defaultPI: 551, category: 'jdm' },
  { id: 'subaru-impreza-1995', make: 'Subaru', model: 'Impreza WRX STi', year: 1995, weight: 2844, weightDistribution: 59, driveType: 'AWD', defaultPI: 563, category: 'rally' },
  { id: 'subaru-impreza-1998', make: 'Subaru', model: 'Impreza WRX STi Version IV', year: 1998, weight: 2888, weightDistribution: 58, driveType: 'AWD', defaultPI: 614, category: 'rally' },
  { id: 'subaru-impreza-2004', make: 'Subaru', model: 'Impreza WRX STi', year: 2004, weight: 3219, weightDistribution: 58, driveType: 'AWD', defaultPI: 672, category: 'rally' },
  { id: 'subaru-impreza-2005', make: 'Subaru', model: 'Impreza WRX STi', year: 2005, weight: 3197, weightDistribution: 59, driveType: 'AWD', defaultPI: 676, category: 'rally' },
  { id: 'subaru-impreza-2008', make: 'Subaru', model: 'Impreza WRX STi', year: 2008, weight: 3362, weightDistribution: 59, driveType: 'AWD', defaultPI: 681, category: 'rally' },
  { id: 'subaru-impreza-2011', make: 'Subaru', model: 'WRX STi', year: 2011, weight: 3373, weightDistribution: 59, driveType: 'AWD', defaultPI: 690, category: 'rally' },
  { id: 'subaru-impreza-2015', make: 'Subaru', model: 'WRX STi', year: 2015, weight: 3483, weightDistribution: 58, driveType: 'AWD', defaultPI: 707, category: 'rally' },
  { id: 'subaru-wrx-s209-2019', make: 'Subaru', model: 'WRX STi S209', year: 2019, weight: 3549, weightDistribution: 58, driveType: 'AWD', defaultPI: 738, category: 'rally' },
  { id: 'subaru-legacy-1990', make: 'Subaru', model: 'Legacy RS', year: 1990, weight: 2888, weightDistribution: 59, driveType: 'AWD', defaultPI: 456, category: 'rally' },
  { id: 'subaru-svx-1992', make: 'Subaru', model: 'SVX', year: 1992, weight: 3550, weightDistribution: 58, driveType: 'AWD', defaultPI: 441, category: 'jdm' },
  { id: 'subaru-brat-1981', make: 'Subaru', model: 'BRAT', year: 1981, weight: 2249, weightDistribution: 60, driveType: 'AWD', defaultPI: 201, category: 'offroad' },
  
  // TOYOTA
  { id: 'toyota-2000gt-1967', make: 'Toyota', model: '2000GT', year: 1967, weight: 2480, weightDistribution: 50, driveType: 'RWD', defaultPI: 451, category: 'classic' },
  { id: 'toyota-ae86-1985', make: 'Toyota', model: 'Sprinter Trueno GT Apex', year: 1985, weight: 2050, weightDistribution: 54, driveType: 'RWD', defaultPI: 332, category: 'jdm' },
  { id: 'toyota-celica-gt-four-1992', make: 'Toyota', model: 'Celica GT-Four', year: 1992, weight: 3131, weightDistribution: 59, driveType: 'AWD', defaultPI: 567, category: 'rally' },
  { id: 'toyota-celica-gt-four-1994', make: 'Toyota', model: 'Celica GT-Four ST205', year: 1994, weight: 3197, weightDistribution: 59, driveType: 'AWD', defaultPI: 598, category: 'rally' },
  { id: 'toyota-celica-1972', make: 'Toyota', model: 'Celica 2000GT', year: 1972, weight: 2359, weightDistribution: 52, driveType: 'RWD', defaultPI: 325, category: 'retro' },
  { id: 'toyota-celica-2003', make: 'Toyota', model: 'Celica SS-I', year: 2003, weight: 2535, weightDistribution: 62, driveType: 'FWD', defaultPI: 419, category: 'jdm' },
  { id: 'toyota-gr-supra-2020', make: 'Toyota', model: 'GR Supra', year: 2020, weight: 3397, weightDistribution: 50, driveType: 'RWD', defaultPI: 731, category: 'jdm' },
  { id: 'toyota-gr-yaris-2020', make: 'Toyota', model: 'GR Yaris', year: 2020, weight: 2822, weightDistribution: 60, driveType: 'AWD', defaultPI: 680, category: 'rally' },
  { id: 'toyota-gr86-2022', make: 'Toyota', model: 'GR86', year: 2022, weight: 2811, weightDistribution: 53, driveType: 'RWD', defaultPI: 558, category: 'jdm' },
  { id: 'toyota-mr2-1989', make: 'Toyota', model: 'MR2 SC', year: 1989, weight: 2557, weightDistribution: 42, driveType: 'RWD', defaultPI: 416, category: 'jdm' },
  { id: 'toyota-mr2-1995', make: 'Toyota', model: 'MR2 GT', year: 1995, weight: 2734, weightDistribution: 42, driveType: 'RWD', defaultPI: 464, category: 'jdm' },
  { id: 'toyota-supra-1992', make: 'Toyota', model: 'Supra 2.0 GT', year: 1992, weight: 3208, weightDistribution: 52, driveType: 'RWD', defaultPI: 503, category: 'jdm' },
  { id: 'toyota-supra-1998', make: 'Toyota', model: 'Supra RZ', year: 1998, weight: 3318, weightDistribution: 52, driveType: 'RWD', defaultPI: 610, category: 'jdm' },
  { id: 'toyota-land-cruiser-1972', make: 'Toyota', model: 'Land Cruiser', year: 1972, weight: 3813, weightDistribution: 54, driveType: 'AWD', defaultPI: 232, category: 'offroad' },
  { id: 'toyota-fj-cruiser-2007', make: 'Toyota', model: 'FJ Cruiser', year: 2007, weight: 4255, weightDistribution: 53, driveType: 'AWD', defaultPI: 405, category: 'offroad' },
  { id: 'toyota-4runner-1995', make: 'Toyota', model: '4Runner', year: 1995, weight: 3924, weightDistribution: 55, driveType: 'AWD', defaultPI: 348, category: 'offroad' },
  { id: 'toyota-tacoma-2019', make: 'Toyota', model: 'Tacoma TRD Pro', year: 2019, weight: 4425, weightDistribution: 58, driveType: 'AWD', defaultPI: 456, category: 'offroad' },
  { id: 'toyota-tundra-2019', make: 'Toyota', model: 'Tundra TRD Pro', year: 2019, weight: 5610, weightDistribution: 57, driveType: 'AWD', defaultPI: 466, category: 'offroad' },
  
  // TVR
  { id: 'tvr-sagaris-2005', make: 'TVR', model: 'Sagaris', year: 2005, weight: 2535, weightDistribution: 48, driveType: 'RWD', defaultPI: 718, category: 'super' },
  { id: 'tvr-tuscan-2001', make: 'TVR', model: 'Tuscan Speed 6', year: 2001, weight: 2425, weightDistribution: 49, driveType: 'RWD', defaultPI: 646, category: 'super' },
  { id: 'tvr-cerb-2000', make: 'TVR', model: 'Cerbera Speed 12', year: 2000, weight: 2249, weightDistribution: 47, driveType: 'RWD', defaultPI: 823, category: 'super' },
  { id: 'tvr-griffith-1993', make: 'TVR', model: 'Griffith', year: 1993, weight: 2227, weightDistribution: 49, driveType: 'RWD', defaultPI: 560, category: 'super' },
  
  // VAUXHALL
  { id: 'vauxhall-corsa-2004', make: 'Vauxhall', model: 'Corsa VXR', year: 2004, weight: 2513, weightDistribution: 62, driveType: 'FWD', defaultPI: 427, category: 'euro' },
  { id: 'vauxhall-corsa-2016', make: 'Vauxhall', model: 'Corsa VXR', year: 2016, weight: 2679, weightDistribution: 63, driveType: 'FWD', defaultPI: 524, category: 'euro' },
  { id: 'vauxhall-vxr8-2013', make: 'Vauxhall', model: 'VXR8 GTS', year: 2013, weight: 4035, weightDistribution: 53, driveType: 'RWD', defaultPI: 692, category: 'modern' },
  { id: 'vauxhall-lotus-carlton-1990', make: 'Vauxhall', model: 'Lotus Carlton', year: 1990, weight: 3638, weightDistribution: 53, driveType: 'RWD', defaultPI: 591, category: 'retro' },
  { id: 'vauxhall-astra-2005', make: 'Vauxhall', model: 'Astra VXR', year: 2005, weight: 3086, weightDistribution: 62, driveType: 'FWD', defaultPI: 547, category: 'euro' },
  { id: 'vauxhall-monaro-2005', make: 'Vauxhall', model: 'Monaro VXR', year: 2005, weight: 3715, weightDistribution: 54, driveType: 'RWD', defaultPI: 580, category: 'muscle' },
  
  // VOLKSWAGEN
  { id: 'vw-beetle-1963', make: 'Volkswagen', model: 'Beetle', year: 1963, weight: 1631, weightDistribution: 40, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  { id: 'vw-corrado-1995', make: 'Volkswagen', model: 'Corrado VR6', year: 1995, weight: 2888, weightDistribution: 61, driveType: 'FWD', defaultPI: 429, category: 'euro' },
  { id: 'vw-golf-1983', make: 'Volkswagen', model: 'Golf GTI 16v Mk2', year: 1983, weight: 2050, weightDistribution: 62, driveType: 'FWD', defaultPI: 368, category: 'retro' },
  { id: 'vw-golf-1992', make: 'Volkswagen', model: 'Golf Gti VR6 Mk3', year: 1992, weight: 2822, weightDistribution: 62, driveType: 'FWD', defaultPI: 446, category: 'retro' },
  { id: 'vw-golf-r-2010', make: 'Volkswagen', model: 'Golf R', year: 2010, weight: 3175, weightDistribution: 60, driveType: 'AWD', defaultPI: 612, category: 'modern' },
  { id: 'vw-golf-r32-2003', make: 'Volkswagen', model: 'Golf R32', year: 2003, weight: 3241, weightDistribution: 60, driveType: 'AWD', defaultPI: 561, category: 'euro' },
  { id: 'vw-golf-r-2014', make: 'Volkswagen', model: 'Golf R', year: 2014, weight: 3208, weightDistribution: 59, driveType: 'AWD', defaultPI: 662, category: 'modern' },
  { id: 'vw-golf-r-2021', make: 'Volkswagen', model: 'Golf R', year: 2021, weight: 3461, weightDistribution: 59, driveType: 'AWD', defaultPI: 701, category: 'modern' },
  { id: 'vw-gti-2010', make: 'Volkswagen', model: 'Golf GTI', year: 2010, weight: 3042, weightDistribution: 62, driveType: 'FWD', defaultPI: 538, category: 'modern' },
  { id: 'vw-scirocco-2011', make: 'Volkswagen', model: 'Scirocco R', year: 2011, weight: 3042, weightDistribution: 62, driveType: 'FWD', defaultPI: 557, category: 'euro' },
  { id: 'vw-karmann-1970', make: 'Volkswagen', model: 'Karmann Ghia', year: 1970, weight: 1918, weightDistribution: 42, driveType: 'RWD', defaultPI: 130, category: 'classic' },
  { id: 'vw-bus-1963', make: 'Volkswagen', model: 'Type 2 De Luxe', year: 1963, weight: 2381, weightDistribution: 46, driveType: 'RWD', defaultPI: 100, category: 'classic' },
  { id: 'vw-idr-2018', make: 'Volkswagen', model: 'I.D. R', year: 2018, weight: 2425, weightDistribution: 46, driveType: 'AWD', defaultPI: 998, category: 'formula' },
  { id: 'vw-notchback-1967', make: 'Volkswagen', model: 'Type 3 1600 L', year: 1967, weight: 2028, weightDistribution: 40, driveType: 'RWD', defaultPI: 138, category: 'classic' },
  
  // VOLVO
  { id: 'volvo-850-1997', make: 'Volvo', model: '850 R', year: 1997, weight: 3461, weightDistribution: 60, driveType: 'FWD', defaultPI: 468, category: 'euro' },
  { id: 'volvo-242-1975', make: 'Volvo', model: '242 Turbo', year: 1975, weight: 2778, weightDistribution: 54, driveType: 'RWD', defaultPI: 375, category: 'retro' },
  { id: 'volvo-p1800-1961', make: 'Volvo', model: 'P1800', year: 1961, weight: 2469, weightDistribution: 53, driveType: 'RWD', defaultPI: 279, category: 'classic' },
  { id: 'volvo-v60-2015', make: 'Volvo', model: 'V60 Polestar', year: 2015, weight: 3792, weightDistribution: 58, driveType: 'AWD', defaultPI: 621, category: 'modern' },
  { id: 'volvo-xc90-2016', make: 'Volvo', model: 'XC90 T8', year: 2016, weight: 5203, weightDistribution: 53, driveType: 'AWD', defaultPI: 571, category: 'truck' },
  { id: 'volvo-amazon-1970', make: 'Volvo', model: 'Amazon P130', year: 1970, weight: 2414, weightDistribution: 53, driveType: 'RWD', defaultPI: 209, category: 'classic' },
  
  // VUHL
  { id: 'vuhl-05-2016', make: 'VUHL', model: '05', year: 2016, weight: 1433, weightDistribution: 45, driveType: 'RWD', defaultPI: 749, category: 'super' },
  { id: 'vuhl-05rr-2019', make: 'VUHL', model: '05RR', year: 2019, weight: 1455, weightDistribution: 45, driveType: 'RWD', defaultPI: 829, category: 'super' },
  
  // W MOTORS
  { id: 'wmotors-lykan-2016', make: 'W Motors', model: 'Lykan HyperSport', year: 2016, weight: 3042, weightDistribution: 41, driveType: 'RWD', defaultPI: 925, category: 'hyper' },
  { id: 'wmotors-fenyr-2018', make: 'W Motors', model: 'Fenyr SuperSport', year: 2018, weight: 2888, weightDistribution: 42, driveType: 'RWD', defaultPI: 940, category: 'hyper' },
  
  // ZENVO
  { id: 'zenvo-ts1-2016', make: 'Zenvo', model: 'TS1', year: 2016, weight: 3131, weightDistribution: 46, driveType: 'RWD', defaultPI: 917, category: 'hyper' },
  { id: 'zenvo-tsr-s-2020', make: 'Zenvo', model: 'TSR-S', year: 2020, weight: 3208, weightDistribution: 46, driveType: 'RWD', defaultPI: 955, category: 'hyper' },
];

// Helper function to get unique makes
export function getUniqueMakes(): string[] {
  const makes = new Set(fh5Cars.map(car => car.make));
  return Array.from(makes).sort();
}

// Helper function to filter cars by make
export function getCarsByMake(make: string): FH5Car[] {
  return fh5Cars.filter(car => car.make === make);
}

// Helper function to search cars
export function searchCars(query: string): FH5Car[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  
  return fh5Cars.filter(car => {
    const searchString = `${car.make} ${car.model} ${car.year}`.toLowerCase();
    return searchString.includes(lowerQuery);
  }).slice(0, 20); // Limit to 20 results for performance
}

// Get car display name
export function getCarDisplayName(car: FH5Car): string {
  return `${car.year} ${car.make} ${car.model}`;
}
