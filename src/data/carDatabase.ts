// Forza Horizon 5 Car Database - Complete 902+ Car Collection
// Data compiled from community sources with estimated specs based on car type
import { FH5Car } from '../types/car';
import { importedCars } from './importedCars';

// Spec estimation based on car type
const typeSpecs: Record<string, { weight: number; distribution: number; driveType: 'RWD' | 'FWD' | 'AWD'; pi: number; torque: number; displacement: number; category: FH5Car['category'] }> = {
  'Modern Sports Cars': { weight: 3200, distribution: 48, driveType: 'RWD', pi: 720, torque: 350, displacement: 3.0, category: 'modern' },
  'Hot Hatch': { weight: 2800, distribution: 62, driveType: 'FWD', pi: 550, torque: 250, displacement: 2.0, category: 'hot-hatch' },
  'Classic Rally': { weight: 2200, distribution: 52, driveType: 'RWD', pi: 480, torque: 180, displacement: 2.0, category: 'rally' },
  'Cult Cars': { weight: 2400, distribution: 50, driveType: 'RWD', pi: 350, torque: 100, displacement: 1.6, category: 'classic' },
  'Modern Supercars': { weight: 3400, distribution: 44, driveType: 'AWD', pi: 850, torque: 500, displacement: 4.0, category: 'super' },
  'Retro Hot Hatch': { weight: 2600, distribution: 60, driveType: 'FWD', pi: 520, torque: 150, displacement: 1.8, category: 'jdm' },
  'Super Saloons': { weight: 3800, distribution: 54, driveType: 'AWD', pi: 780, torque: 450, displacement: 4.0, category: 'modern' },
  'GT Cars': { weight: 3600, distribution: 50, driveType: 'RWD', pi: 760, torque: 400, displacement: 4.0, category: 'gt' },
  'Retro Saloons': { weight: 3400, distribution: 54, driveType: 'RWD', pi: 620, torque: 280, displacement: 3.0, category: 'retro' },
  'Classic Racers': { weight: 2200, distribution: 48, driveType: 'RWD', pi: 280, torque: 150, displacement: 2.0, category: 'classic' },
  'Rare Classics': { weight: 2600, distribution: 50, driveType: 'RWD', pi: 520, torque: 250, displacement: 3.0, category: 'classic' },
  'Unlimited Offroad': { weight: 4500, distribution: 52, driveType: 'AWD', pi: 750, torque: 600, displacement: 6.2, category: 'offroad' },
  'Unlimited Buggies': { weight: 2500, distribution: 48, driveType: 'AWD', pi: 700, torque: 300, displacement: 2.5, category: 'buggy' },
  'Classic Muscle': { weight: 3600, distribution: 54, driveType: 'RWD', pi: 520, torque: 400, displacement: 6.0, category: 'muscle' },
  'Extreme Track Toys': { weight: 2800, distribution: 45, driveType: 'RWD', pi: 920, torque: 500, displacement: 4.0, category: 'track' },
  'Hypercars': { weight: 3200, distribution: 44, driveType: 'AWD', pi: 980, torque: 700, displacement: 6.0, category: 'hyper' },
  'Sports Utility Heroes': { weight: 4800, distribution: 54, driveType: 'AWD', pi: 720, torque: 500, displacement: 5.0, category: 'suv' },
  'Super GT': { weight: 3700, distribution: 50, driveType: 'RWD', pi: 820, torque: 550, displacement: 5.2, category: 'gt' },
  'Track Toys': { weight: 2900, distribution: 47, driveType: 'RWD', pi: 850, torque: 400, displacement: 3.8, category: 'track' },
  'Retro Supercars': { weight: 3200, distribution: 45, driveType: 'RWD', pi: 750, torque: 380, displacement: 3.5, category: 'super' },
  'Vintage Racers': { weight: 2100, distribution: 50, driveType: 'RWD', pi: 280, torque: 150, displacement: 2.0, category: 'classic' },
  'Retro Muscle': { weight: 3500, distribution: 54, driveType: 'RWD', pi: 620, torque: 350, displacement: 5.7, category: 'muscle' },
  'Modern Muscle': { weight: 3900, distribution: 53, driveType: 'RWD', pi: 780, torque: 450, displacement: 6.2, category: 'muscle' },
  'Pickups & 4x4s': { weight: 5200, distribution: 56, driveType: 'AWD', pi: 650, torque: 400, displacement: 5.0, category: 'truck' },
  'Vans & Utility': { weight: 4200, distribution: 55, driveType: 'RWD', pi: 480, torque: 250, displacement: 2.5, category: 'van' },
  'Rods and Customs': { weight: 3200, distribution: 52, driveType: 'RWD', pi: 450, torque: 300, displacement: 5.0, category: 'classic' },
  'Super Hot Hatch': { weight: 3100, distribution: 60, driveType: 'AWD', pi: 680, torque: 300, displacement: 2.0, category: 'hot-hatch' },
  'Rally Monsters': { weight: 2800, distribution: 50, driveType: 'AWD', pi: 780, torque: 400, displacement: 2.0, category: 'rally' },
  'Retro Rally': { weight: 2600, distribution: 52, driveType: 'AWD', pi: 650, torque: 200, displacement: 2.0, category: 'rally' },
  'Retro Sports Cars': { weight: 2900, distribution: 48, driveType: 'RWD', pi: 600, torque: 220, displacement: 2.5, category: 'retro' },
  'Classic Sports Cars': { weight: 2400, distribution: 50, driveType: 'RWD', pi: 420, torque: 150, displacement: 2.0, category: 'classic' },
  'Drift Cars': { weight: 3000, distribution: 52, driveType: 'RWD', pi: 700, torque: 400, displacement: 3.0, category: 'drift' },
  'Offroad': { weight: 3800, distribution: 52, driveType: 'AWD', pi: 680, torque: 350, displacement: 4.0, category: 'offroad' },
  'Buggies': { weight: 2000, distribution: 48, driveType: 'RWD', pi: 550, torque: 150, displacement: 1.6, category: 'buggy' },
  "UTV's": { weight: 1800, distribution: 50, driveType: 'AWD', pi: 500, torque: 120, displacement: 1.0, category: 'offroad' },
};

// Parse car data from the user's provided list
function parseCarName(fullName: string): { year: number; make: string; model: string } {
  const match = fullName.match(/^(\d{4})\s+(.+)$/);
  if (!match) {
    return { year: 2020, make: 'Unknown', model: fullName };
  }
  const year = parseInt(match[1]);
  const rest = match[2];
  
  // Common make patterns
  const makePatterns = [
    'Abarth', 'Acura', 'Alfa Romeo', 'Alpine', 'Alumicraft', 'AMC', 'AMG Transport Dynamics',
    'Apollo', 'Ariel', 'Ascari', 'Aston Martin', 'ATS', 'Audi', 'Austin-Healey', 'Auto Union',
    'Automobili Pininfarina', 'Autozam', 'BAC', 'Bentley', 'BMW', 'Brabham', 'Bugatti', 'Buick',
    'Cadillac', 'Can-Am', 'Casey Currie Motorsports', 'Caterham', 'Chevrolet', 'Citroën', 'CUPRA',
    'Czinger', 'Datsun', 'DeBerti', 'DeLorean', 'Dodge', 'Donkervoort', 'DS Automobiles', 'Eagle',
    'Elemental', 'Exomotive', 'Extreme E', 'Fast and Furious', 'Ferrari', 'FIAT', 'Ford',
    'Formula Drift', 'Forsberg Racing', 'Funco Motorsports', 'Ginetta', 'GMC', 'Gordon Murray Automotive',
    'HDT', 'Hennessey', 'Holden', 'Honda', 'Hoonigan', 'Hot Wheels', 'HSV', 'HUMMER', 'Hyundai',
    'Infiniti', 'International', 'Italdesign', 'Jaguar', 'Jeep', 'Jimco', 'KIA', 'Koenigsegg',
    'KTM', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Local Motors', 'Lola',
    'Lotus', 'Lucid', 'Lynk & Co', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-AMG', 'Mercedes-Benz',
    'Mercury', 'MG', 'MINI', 'Mitsubishi', 'Morgan', 'Mosler', 'NIO', 'Nissan', 'Noble',
    'Oldsmobile', 'Opel', 'Pagani', 'Peel', 'Penhall', 'Peugeot', 'Plymouth', 'Polaris', 'Pontiac',
    'Porsche', 'Radical', 'RAM', 'Renault', 'Rimac', 'Rivian', 'Rolls-Royce', 'Saleen', 'SEAT',
    'Shelby', 'Singer', 'Spania GTA', 'SSC', 'Subaru', 'Suzuki', 'Talbot', 'Tamo', 'Toyota',
    'Triumph', 'TVR', 'Vauxhall', 'Volkswagen', 'Volvo', 'VUHL', 'W Motors', 'Willys', 'Zenvo'
  ];
  
  for (const makeName of makePatterns) {
    if (rest.startsWith(makeName + ' ') || rest.startsWith(makeName)) {
      const model = rest.slice(makeName.length).trim() || makeName;
      return { year, make: makeName, model };
    }
  }
  
  // Fallback: first word is make
  const parts = rest.split(' ');
  return { year, make: parts[0], model: parts.slice(1).join(' ') || parts[0] };
}

function generateCarId(year: number, make: string, model: string): string {
  const cleanMake = make.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const cleanModel = model.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
  return `${cleanMake}-${cleanModel}-${year}`;
}

// Complete FH5 car list with all 902 cars
const rawCarData = `2017 Abarth 124 Spider	Modern Sports Cars	Seasonal	Series 24	Abarth 124 '17	2740
2016 Abarth 695 Biposto	Hot Hatch	Backstage, Seasonal	Series 24	Abarth 695 '16	2489
1980 Abarth Fiat 131	Classic Rally	Backstage, Seasonal	Series 24	Abarth 131	1124
1968 Abarth 595 esseesse	Cult Cars	Autoshow	Series 24	Abarth 595 '68	2017
2017 Acura NSX	Modern Supercars	Autoshow	Launch	Acura NSX '17	2352
2002 Acura RSX Type-S	Retro Hot Hatch	Autoshow	Launch	Acura RSX	422
2001 Acura Integra Type-R	Retro Hot Hatch	Autoshow	Launch	Acura Integra	368
2017 Alfa Romeo Giulia Quadrifoglio	Super Saloons	Autoshow	Series 24	Alfa Giulia '17	2542
2014 Alfa Romeo 4C	Modern Sports Cars	Backstage, Seasonal	Series 24	Alfa Romeo 4C	2038
2007 Alfa Romeo 8C Competizione	GT Cars	Seasonal	Series 24	Alfa Romeo 8C	1032
1992 Alfa Romeo 155 Q4	Retro Saloons	Backstage, Seasonal	Series 24	Alfa Romeo 155	1393
1968 Alfa Romeo 33 Stradale	Classic Racers	Autoshow	Series 24	Alfa Romeo 33S	1549
1965 Alfa Romeo Giulia Sprint GTA Stradale	Rare Classics	Autoshow	Series 24	Alfa Romeo GTA	1150
1965 Alfa Romeo Giulia TZ2	Classic Racers	Autoshow	Series 24	Alfa Romeo TZ2	2161
2017 Alpine A110	Modern Sports Cars	Backstage, Wheelspin, Seasonal	Launch	Alpine A110 '17	2973
1973 Alpine A110 1600s	Classic Rally	Autoshow	Launch	Renault A110	1536
2022 Alumicraft #6165 Trick Truck	Unlimited Offroad	Autoshow DLC	Rally Adventure Expansion	#6165 Truck	3693
2021 Alumicraft #122 Class 1 Buggy	Unlimited Buggies	Autoshow DLC	Rally Adventure Expansion	#122 AC Class 1	3549
2015 Alumicraft Class 10 Race Car	Unlimited Buggies	Autoshow, Wheelspin	Launch	Alumi Craft C.10	2552
1973 AMC Gremlin X	Cult Cars	Autoshow, Wheelspin	Launch	AMC Gremlin	1482
1971 AMC Javelin AMX	Classic Muscle	Seasonal	Series 15	AMC Javelin	1267
1970 AMC Rebel The Machine	Classic Muscle	Seasonal	Series 15	AMC Rebel	1572
2554 AMG Transport Dynamics M12S Warthog CST	Unlimited Offroad	Autoshow, Wheelspin	Launch	M12S Warthog CST	2574
2018 Apollo Intensa Emozione 'Welcome Pack'	Extreme Track Toys	Autoshow DLC	Welcome Pack	Apollo IE '18	3141
2018 Apollo Intensa Emozione	Extreme Track Toys	Autoshow, Wheelspin	Launch	Apollo IE WP	3682
2016 Ariel Nomad	Unlimited Buggies	Autoshow, Wheelspin	Launch	Ariel Nomad	2430
2013 Ariel Atom 500 V8	Extreme Track Toys	Autoshow, Wheelspin	Launch	Ariel Atom	3786
2012 Ascari KZ1R	Modern Supercars	Seasonal	Series 6	Ascari KZ1R	1428
2023 Aston Martin Valkyrie	Hypercars	Seasonal	Series 28	AM Valkyrie	2968
2022 Aston Martin Valkyrie AMR Pro	Extreme Track Toys	Backstage, Seasonal	Series 31	AM Valkyrie AMR	3631
2021 Aston Martin DBX	Sports Utility Heroes	Autoshow DLC	Car Pass	AM DBX '21	3580
2019 Aston Martin DBS Superleggera	Super GT	Autoshow, Wheelspin	Launch	AM DBS SL '19	3185
2019 Aston Martin Valhalla Concept Car	Hypercars	Autoshow, Wheelspin	Launch	Valhalla Concept	3364
2019 Aston Martin Vantage	GT Cars	Autoshow, Wheelspin	Launch	AM Vantage '19	3091
2017 Aston Martin DB11	Super GT	Autoshow, Wheelspin	Launch	AM DB11	2527
2017 Aston Martin Vanquish Zagato Coupe	Super GT	Backstage, Seasonal	Series 36	AM Vanquish '17	3125
2017 Aston Martin Vulcan AMR Pro	Extreme Track Toys	Autoshow, Wheelspin	Launch	AM Vulcan AMR	3211
2015 Aston Martin Vantage GT12	Track Toys	Accolade	Launch	AM Vantage '16	2493
2013 Aston Martin V12 Vantage S	Super GT	Autoshow, Wheelspin	Launch	Vantage S '13	1651
2010 Aston Martin One-77	Super GT	Autoshow	Series 13	AM One-77	1181
2008 Aston Martin DBS	GT Cars	Backstage, Seasonal	Series 29	AM DBS	1081
1990 Aston Martin Lagonda	Retro Sports Cars	Backstage, Seasonal	Series 39	AM Lagonda '90	3274
1964 Aston Martin DB5	Rare Classics	Autoshow, Wheelspin	Launch	AM DB5	1105
1958 Aston Martin DBR1	Classic Racers	Autoshow	Series 28	AM DBR1	1386
2018 ATS GT	Modern Supercars	Seasonal	Series 6	ATS GT '18	3195
2021 Audi RS 6 Avant	Super Saloons	Backstage, Seasonal	Series 20	Audi RS 6 '21	3583
2021 Audi RS 7 Sportback	Super Saloons	Backstage, Seasonal	Series 12	Audi RS '21	3584
2021 Audi RS e-tron GT	Super Saloons	Seasonal	Series 12	Audi RS e-tron	3359
2020 Audi RS 3 Sedan	Super Saloons	Autoshow DLC	Car Pass	Audi TT RS '20	3453
2020 Audi TT RS Coupe	Modern Sports Cars	Seasonal	Series 32	Audi RS 3 '20	3454
2018 Audi RS 4 Avant	Super Saloons	Backstage, Seasonal	Series 8	RS 4 Avant '18	3318
2018 Audi RS 5 Coupé	Super Saloons	Autoshow DLC	Car Pass	Audi RS 5 '18	3264
2018 Audi TT RS	Modern Sports Cars	Autoshow DLC	Car Pass	Audi TT RS '18	3286
2016 Audi R8 V10 plus	Modern Supercars	Autoshow, Wheelspin	Launch	Audi R8 V10 plus	2473
2015 Audi RS 6 Avant	Super Saloons	Autoshow, Wheelspin	Launch	Audi RS 6 '15	2180
2015 Audi S1	Hot Hatch	Autoshow, Wheelspin	Launch	Audi S1	2179
2015 Audi TTS Coupe	Modern Sports Cars	Autoshow, Wheelspin	Launch	Audi TTS	2182
2013 Audi R8 Coupe V10 plus 5.2 FSI quattro	Modern Supercars	Backstage, Wheelspin, Seasonal	Launch	Audi R8 '13	2181
2013 Audi RS 4 Avant	Super Saloons	Autoshow, Wheelspin	Launch	Audi RS 4 '13	2010
2013 Audi RS 7 Sportback	Super Saloons	Autoshow, Wheelspin	Launch	Audi RS 7	1607
2011 Audi RS 3 Sportback	Super Hot Hatch	Autoshow, Wheelspin	Launch	Audi RS 3	1216
2011 Audi RS 5 Coupe	Super Saloons	Autoshow, Wheelspin	Launch	Audi RS 5	1417
2010 Audi TT RS Coupe	Modern Sports Cars	Autoshow, Wheelspin	Launch	Audi TT RS	1220
2009 Audi RS 6	Super Saloons	Autoshow, Wheelspin	Launch	Audi RS 6 '09	1184
2006 Audi RS 4	Super Saloons	Autoshow, Wheelspin	Launch	Audi RS 4 '06	419
2003 Audi RS 6	Retro Saloons	Autoshow, Wheelspin	Launch	Audi RS 6 '03	420
2001 Audi RS 4 Avant	Retro Saloons	Autoshow, Wheelspin	Launch	Audi RS 4 '01	2178
1995 Audi Avant RS 2	Retro Saloons	Autoshow, Wheelspin	Launch	Audi RS 2	1370
1986 Audi #2 Audi Sport quattro S1	Rally Monsters	Seasonal	Series 18	#2 Audi S1	1478
1983 Audi Sport quattro	Retro Rally	Autoshow, Wheelspin	Launch	Audi quattro	633
1958 Austin-Healey Sprite MkI	Classic Sports Cars	Autoshow, Wheelspin	Launch	Sprite MKI	1574
1939 Auto Union Type D	Vintage Racers	Autoshow	Launch	AutoUnion Type D	2096
2020 Automobili Pininfarina Battista	Hypercars	Autoshow DLC	European Auto Car Pack	Battista '20	3360
1993 Autozam AZ-1	Retro Hot Hatch	Autoshow DLC	JDM Jewels Car Pack	Autozam AZ-1 '93	3854
2014 BAC Mono	Track Toys	Accolade, Wheelspin	Launch	BAC Mono	2040
2021 Bentley Continental GT Convertible	GT Cars	Autoshow DLC	European Auto Car Pack	Bentley Cont GTC	3728
2021 Bentley Flying Spur	Super Saloons	Seasonal	Series 41	Flying Spur '21	3588
2017 Bentley Continental Supersports	GT Cars	Autoshow, Wheelspin	Launch	Bentley Cont '17	2665
2016 Bentley Bentayga	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Bentley Bentayga	2625
1991 Bentley Turbo R	Retro Saloons	Seasonal	Series 12	Bentley Turbo R	3172
1930 Bentley 8 Litre	Rare Classics	Autoshow, Wheelspin	Launch	4-1/2 Liter '31	2976
1930 Bentley Blower 4-1/2 Litre Supercharged	Vintage Racers	Autoshow, Wheelspin	Launch	Bentley 8 Litre	1372
2023 BMW M2	Super Saloons	Backstage, Seasonal	Series 25	BMW M2 '23	3763
2022 BMW i4 eDrive40	Super Saloons	Backstage, Seasonal	Series 25	BMW i4 '22	3734
2022 BMW iX xDrive50	Sports Utility Heroes	Backstage, Seasonal	Series 25	BMW iX '22	3737
2022 BMW M5 CS	Super Saloons	Backstage, Seasonal	Series 41	BMW M5 '22	3764
2021 BMW M3 Competition Sedan	Super Saloons	Backstage, Seasonal	Series 25	BMW M3 '21	3644
2021 BMW M4 Competition Coupé	Super Saloons	Backstage, Seasonal	Series 11	BMW M4 '21	3645
2020 BMW M8 Competition Coupe	GT Cars	Autoshow DLC	Car Pass	BMW M8 Comp	3518
2019 BMW Z4 Roadster	Modern Sports Cars	Autoshow, Wheelspin	Launch	BMW Z4 '19	3173
2018 BMW #1 BMW M Motorsport M8 GTE	Extreme Track Toys	Autoshow DLC	Apex Allstars Car Pack	BMW #1 M8 GTE	3073
2018 BMW M5	Super Saloons	Autoshow, Wheelspin	Launch	BMW M5 '18	3071
2016 BMW M2 Coupé	Super Saloons	Autoshow, Wheelspin	Launch	BMW M2	2477
2016 BMW M4 GTS	Track Toys	Car Collection	Launch	BMW M4 '16	2628
2015 BMW i8	Modern Supercars	Autoshow, Wheelspin	Launch	BMW I8	2133
2015 BMW X6 M	Sports Utility Heroes	Wheelspin, Seasonal	Launch	BMW X6 M	2431
2014 BMW M4 Coupe	Super Saloons	Autoshow, Wheelspin	Launch	BMW M4 '14	2154
2013 BMW M6 Coupe	GT Cars	Autoshow, Wheelspin	Launch	BMW M6 '13	2018
2012 BMW M5	Super Saloons	Autoshow, Wheelspin	Launch	BMW M5 '12	1451
2011 BMW 1 Series M Coupe	Super Saloons	Autoshow, Wheelspin	Launch	BMW 1M	1385
2011 BMW X5 M	Sports Utility Heroes	Autoshow, Wheelspin	Launch	BMW X5 M	1350
2011 BMW X5 M Forza Edition	Extreme Track Toys	Autoshow DLC	VIP	BMW X5M FE	3556
2010 BMW M3 GTS	Track Toys	Backstage, Seasonal	Series 11	BMW E92 M3 GTS	1598
2009 BMW M5	Super Saloons	Autoshow, Wheelspin	Launch	BMW M5 '09	1126
2008 BMW M3	Super Saloons	Autoshow, Wheelspin	Launch	BMW M3 '08	1011
2008 BMW Z4 M Coupe	Modern Sports Cars	Autoshow, Wheelspin	Launch	BMW Z4 '08	1059
2005 BMW M3	Retro Saloons	Autoshow, Wheelspin	Launch	BMW M3 '05	383
2003 BMW M5	Retro Saloons	Autoshow, Wheelspin	Launch	BMW M5 '03	1367
2002 BMW M3-GTR	Track Toys	Autoshow, Wheelspin	Launch	BMW M3-GTR	565
2002 BMW Z3 M Coupe	Retro Sports Cars	Autoshow, Wheelspin	Launch	BMW Z3	1268
1997 BMW M3	Retro Saloons	Autoshow, Wheelspin	Launch	BMW M3 '97	382
1995 BMW 850CSi	Retro Sports Cars	Backstage, Seasonal	Series 25	BMW 850CSi	1493
1995 BMW M5	Retro Saloons	Autoshow, Wheelspin	Launch	BMW M5 '95	1418
1991 BMW M3	Retro Saloons	Autoshow, Wheelspin	Launch	BMW M3 '91	642
1988 BMW M5	Retro Saloons	Autoshow, Wheelspin	Launch	BMW M5 '88	1368
1986 BMW M635CSi	Retro Saloons	Backstage, Seasonal	Series 34	BMW M6 '86	1290
1981 BMW M1	Retro Supercars	Autoshow, Wheelspin	Launch	BMW M1	1040
1973 BMW 2002 Turbo	Classic Sports Cars	Barn Find	Launch	BMW 2002 Turbo	1269
1957 BMW Isetta 300 Export	Cult Cars	Autoshow, Wheelspin	Launch	BMW Isetta	2412
2019 Brabham BT62	Extreme Track Toys	Autoshow DLC	Hot Wheels Expansion	Brabham BT62	3285
2019 Bugatti Divo	Extreme Track Toys	Autoshow, Wheelspin	Launch	Bugatti Divo	3168
2018 Bugatti Chiron	Hypercars	Autoshow, Wheelspin	Launch	Bugatti Chiron	2624
2011 Bugatti Veyron Super Sport	Hypercars	Autoshow	Launch	Bugatti Veyron	3556
1992 Bugatti EB110 Super Sport	Retro Supercars	Autoshow, Wheelspin	Launch	Bugatti EB110	1219
1926 Bugatti Type 35 C	Vintage Racers	Autoshow, Wheelspin	Launch	Bugatti T35 C	2066
1987 Buick Regal GNX	Retro Muscle	Autoshow, Wheelspin	Launch	Buick Regal GNX	1329
1970 Buick GSX	Classic Muscle	Autoshow, Wheelspin	Launch	Buick GSX	417
2022 Cadillac CT4-V Blackwing	Modern Muscle	Seasonal	Series 19	Cadillac CT4-V	3719
2022 Cadillac CT5-V Blackwing	Modern Muscle	Backstage, Seasonal	Series 19	Cadillac CT5-V	3720
2016 Cadillac ATS-V	Modern Muscle	Autoshow, Wheelspin	Launch	Caddy ATS-V	2262
2016 Cadillac CTS-V Sedan	Modern Muscle	Autoshow, Wheelspin	Launch	Caddy CTS-V '16	2421
2015 Cadillac #3 Cadillac Racing ATS-V.R	Extreme Track Toys	Autoshow DLC	Apex Allstars Car Pack	Cadillac #3 ATS	3281
2014 Cadillac CTS-V Sport Wagon	Modern Muscle	Backstage, Seasonal	Series 41	CTS-V Wagon '14	3242
2013 Cadillac XTS Limousine	Super Saloons	Backstage, Seasonal	Series 15	Caddy Limo	2128
2018 Can-Am Maverick X RS Turbo R	UTV's	Autoshow, Wheelspin	Launch	Can-Am Maverick	2871
2019 Casey Currie Motorsports #4402 Ultra 4 'Trophy Jeep'	Unlimited Offroad	Autoshow DLC	Rally Adventure Expansion	#4402 Ultra 4	3603
2013 Caterham Superlight R500	Track Toys	Autoshow, Wheelspin	Launch	Caterham R500	1652
2024 Chevrolet Corvette E-Ray	Modern Supercars	Autoshow	Launch	Corvette E-Ray	3771
2023 Chevrolet Corvette Z06	Track Toys	Backstage, Seasonal	Series 27	Corvette Z06 '23	3766
2020 Chevrolet #3 Corvette Racing C8.R	Extreme Track Toys	Autoshow DLC	Apex Allstars Car Pack	#3 Chevy C8.R	3490
2020 Chevrolet Corvette Stingray Coupe	Modern Supercars	Autoshow	Launch	Corvette C8 '20	3369
2020 Chevrolet Silverado LT Trail Boss	Pickups & 4x4s	Autoshow DLC	American Auto Car Pack	Chevy Trail Boss	3477
2019 Chevrolet Corvette ZR1	Track Toys	Accolade	Launch	Corvette '19	3118
2018 Chevrolet Camaro ZL1 1LE	Track Toys	Autoshow, Wheelspin	Launch	Chevy Camaro '18	3149
2018 Chevrolet Hot Wheels COPO Camaro	Track Toys	Autoshow DLC	Hot Wheels Expansion	COPO Camaro '18	3163
2017 Chevrolet Camaro ZL1	Modern Muscle	Autoshow, Wheelspin	Launch	Chevy Camaro '17	2739
2017 Chevrolet Colorado ZR2	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Chevrolet ZR2	2847
2015 Chevrolet Camaro Z/28	Track Toys	Autoshow, Wheelspin	Launch	Chevy Camaro '15	2183
2015 Chevrolet Corvette Z06	Modern Muscle	Autoshow, Wheelspin	Launch	Corvette '15	2177
2013 Chevrolet Summit Racing Pro Stock Camaro	Track Toys	Seasonal	Series 33	Pro Stock Camaro	2130
2009 Chevrolet Corvette ZR1	Modern Muscle	Autoshow, Wheelspin	Launch	Corvette '09	1069
2002 Chevrolet Corvette Z06	Retro Muscle	Autoshow, Wheelspin	Launch	Corvette '02	314
1996 Chevrolet Impala Super Sport	Retro Muscle	Autoshow, Wheelspin	Launch	Chevy Impala '96	1379
1995 Chevrolet Corvette ZR-1	Retro Muscle	Autoshow, Wheelspin	Launch	Corvette '95	2006
1988 Chevrolet Monte Carlo Super Sport	Retro Muscle	Autoshow, Wheelspin	Launch	Chevy MonteCarlo	1575
1979 Chevrolet Camaro Z28	Classic Muscle	Autoshow, Wheelspin	Launch	Chevy Camaro '79	1064
1972 Chevrolet K10 Custom	Pickups & 4x4s	Backstage, Seasonal	Series 21	Chevy K10 '72	3590
1970 Chevrolet Camaro Z28	Classic Muscle	Autoshow, Wheelspin	Launch	Chevy Camaro '70	1330
1970 Chevrolet Chevelle Super Sport 454	Classic Muscle	Autoshow, Wheelspin	Launch	Chevelle '70	299
1970 Chevrolet Corvette ZR-1	Classic Muscle	Backstage, Wheelspin, Seasonal	Launch	Corvette '70	315
1970 Chevrolet El Camino Super Sport 454	Vans & Utility	Autoshow	Launch	Chevy El Camino	1291
1969 Chevrolet Camaro Jordan Luka 3 Forza Edition	Track Toys	Seasonal	Series 38	Camaro ME '69	3972
1969 Chevrolet Camaro Super Sport Coupe	Classic Muscle	Autoshow, Wheelspin	Launch	Chevy Camaro '69	289
1969 Chevrolet Nova Super Sport 396	Classic Muscle	Autoshow, Wheelspin	Launch	Chevy Nova '69	1429
1967 Chevrolet Corvette Stingray 427	Classic Muscle	Autoshow, Wheelspin	Launch	Corvette '67	312
1966 Chevrolet Nova Super Sport	Classic Muscle	Backstage, Seasonal	Series 27	Chevy Nova '66	1354
1964 Chevrolet Impala Super Sport 409	Rods and Customs	Autoshow, Wheelspin	Launch	Chevy Impala	1300
1960 Chevrolet Corvette	Classic Sports Cars	Car Collection	Launch	Corvette '60	1093
1957 Chevrolet Bel Air	Rods and Customs	Autoshow, Wheelspin	Launch	Chevy Bel Air	1459
1956 Chevrolet 'Barbie Movie' Corvette EV	Rods and Customs	Autoshow	Series 22	Barbie Corvette	3808
1955 Chevrolet 150 Utility Sedan	Rods and Customs	Autoshow, Wheelspin	Launch	Chevy 150 Sedan	2507
1953 Chevrolet Corvette	Classic Sports Cars	Barn Find	Launch	Corvette '53	1564
1953 Chevrolet Corvette Forza Edition	Classic Racers	Wheelspin, Seasonal	Launch	Corvette '53 FE	3559
1986 Citroën BX4TC	Retro Rally	Backstage, Seasonal	Series 34	Citroën BX4TC	3508
2022 CUPRA Formentor VZ5	Sports Utility Heroes	Autoshow	Series 21	Formentor '22	3746
2022 CUPRA Tavascan Concept	Sports Utility Heroes	Autoshow	Series 21	Tavascan '22	3747
2022 CUPRA UrbanRebel Concept	Track Toys	Autoshow	Series 15	UrbanRebel '22	3748
2024 Czinger 21C	Extreme Track Toys	Autoshow DLC	American Auto Car Pack	Czinger 21C	3757
1970 Datsun 510	Cult Cars	Autoshow, Wheelspin	Launch	Datsun 510	1104
2019 DeBerti Ford Super Duty F-250 Lariat 'Transformer'	Unlimited Offroad	Backstage, Seasonal	Series 21	DeBerti F-250	3439
2019 DeBerti Toyota Tacoma TRD The Performance Truck	Drift Cars	Autoshow	Launch	DD Tacoma TRD	3441
2018 DeBerti Chevrolet Silverado 1500 Drift Truck	Drift Cars	Autoshow, Wheelspin	Launch	Silverado DD	3088
2018 DeBerti F-150 Prerunner Truck	Unlimited Offroad	Autoshow, Wheelspin	Launch	DeBerti F-150	3109
2018 DeBerti Ford Mustang GT	Modern Muscle	Backstage, Seasonal	Series 23	Ford Mustang DD	3046
2018 DeBerti Wrangler Unlimited	Unlimited Offroad	Car Mastery, Seasonal	Launch	DeBerti Wrangler	3110
1965 DeBerti Chevrolet C10 'Slayer'	Rods and Customs	Backstage, Seasonal	Series 41	C10 Slayer '65	3896
1961 DeBerti Ford Econoline 'Shop Rod'	Rods and Customs	Autoshow DLC	American Auto Car Pack	DeBerti Shop Rod	3438
1982 DeLorean DMC-12	Retro Sports Cars	Seasonal	Series 1	DeLorean DMC-12	1270
2022 Dodge Challenger SRT Super Stock	Modern Muscle	Backstage Shop., Seasonal	Series 43	Challenger '22	3959
2021 Dodge Durango SRT Hellcat	Sports Utility Heroes	Backstage, Seasonal	Series 37	SRT Durango '21	3850
2018 Dodge Challenger SRT Demon	Modern Muscle	Autoshow, Wheelspin	Launch	Dodge SRT Demon	2909
2018 Dodge Durango SRT	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Dodge Durango	2839
2016 Dodge Viper ACR	Track Toys	Autoshow	Launch	Dodge Viper '16	2544
2015 Dodge Challenger SRT Hellcat	Modern Muscle	Autoshow, Wheelspin	Launch	Challenger '15	2263
2015 Dodge Charger SRT Hellcat	Modern Muscle	Autoshow, Wheelspin	Launch	Dodge Charger '15	2468
2013 Dodge SRT Viper GTS Anniversary Edition	Modern Muscle	Accolade	Series 13	Dodge Viper '13	3749
2013 Dodge SRT Viper GTS	Modern Muscle	Autoshow, Wheelspin	Launch	Viper '13 AE	2105
2008 Dodge Magnum SRT8	Modern Muscle	Autoshow DLC	Car Pass	Dodge Magnum	3169
2008 Dodge Viper SRT10 ACR	Track Toys	Autoshow, Wheelspin	Launch	Dodge Viper '08	1046
1999 Dodge Viper GTS ACR	Retro Muscle	Barn Find	Launch	Dodge Viper '99	483
1970 Dodge Challenger R/T	Classic Muscle	Autoshow, Wheelspin	Launch	Challenger '70	639
1970 Dodge Coronet Super Bee	Classic Muscle	Backstage, Seasonal	Series 9	Dodge Super Bee	1352
1969 Dodge Charger Daytona HEMI	Classic Muscle	Car Mastery, Seasonal	Launch	Charger Daytona	1063
1969 Dodge Charger R/T	Classic Muscle	Autoshow, Wheelspin	Launch	Dodge Charger '69	513
1969 Dodge Charger R/T Forza Edition	Track Toys	Autoshow DLC	VIP	Charger '69 FE	3561
1968 Dodge Dart HEMI Super Stock	Classic Muscle	Barn Find	Launch	Dodge Dart '68	1332
2013 Donkervoort D8 GTO	Track Toys	Seasonal	Series 3	Donkervoort GTO	2184
1975 DS Automobiles DS 23	Cult Cars	Seasonal	Series 31	DS 23	2432
2012 Eagle Speedster	Modern Sports Cars	Seasonal	Series 13	Eagle Speedster	1388
2019 Elemental RP1	Track Toys	Autoshow DLC	Super Speed Car Pack	Elemental Rp 1	3334
2018 Exomotive Exocet Off-Road	Unlimited Buggies	Autoshow, Wheelspin	Launch	Exocet Off-Road	3089
2018 Exomotive Exocet Off-Road Forza Edition	Rally Monsters	Wheelspin, Seasonal	Launch	Exocet OR FE	3562
2022 Extreme E #125 ABT Cupra XE	Unlimited Offroad	Seasonal	Series 10	#125 Extreme E	3708
2022 Extreme E #22 JBXE	Unlimited Offroad	Seasonal	Series 10	#22 Extreme E	3709
2022 Extreme E #23 Genesys Andretti United	Unlimited Offroad	Seasonal	Series 10	#23 Extreme E	3710
2022 Extreme E #42 XITE Racing Team	Unlimited Offroad	Seasonal	Series 10	#42 Extreme E	3711
2022 Extreme E #44 X44	Unlimited Offroad	Seasonal	Series 10	#44 Extreme E	3712
2022 Extreme E #5 Veloce Racing	Unlimited Offroad	Seasonal	Series 10	#5 Extreme E	3713
2022 Extreme E #55 ACCIONA / Sainz XE Team	Unlimited Offroad	Seasonal	Series 10	#55 Extreme E	3714
2022 Extreme E #58 McLaren Racing	Unlimited Offroad	Seasonal	Series 10	#58 Extreme E	3727
2022 Extreme E #6 Rosberg X Racing	Unlimited Offroad	Seasonal	Series 10	#6 Extreme E	3715
2022 Extreme E #99 Chip Ganassi Racing GMC Hummer EV	Unlimited Offroad	Autoshow	Series 10	#99 Extreme E	3733
2022 Fast and Furious Dodge Charger SRT Hellcat Redeye Widebody 'Fast X'	Modern Muscle	Autoshow DLC	Fast X Car Pack	FAF Hellcat	3836
2022 Fast and Furious Flip Car 2.0 'Fast X'	Track Toys	Autoshow DLC	Fast X Car Pack	FAF Flip Car	3838
1973 Fast and Furious Datsun 240Z 'Fast X'	Classic Sports Cars	Autoshow DLC	Fast X Car Pack	FAF 240Z	3832
1970 Fast and Furious Dodge Charger 'Fast X'	Classic Muscle	Autoshow DLC	Fast X Car Pack	FAF Charger	3837
1966 Fast and Furious Chevrolet Impala Super Sport 'Fast X'	Track Toys	Autoshow DLC	Fast X Car Pack	FAF Impala	3835
2022 Ferrari 296 GTB	Modern Supercars	Autoshow DLC	Italian Exotics Car Pack	Ferrari 296 GTB	3724
2020 Ferrari Roma	Super GT	Autoshow DLC	Italian Exotics Car Pack	Ferrari Roma	3594
2020 Ferrari SF90 Stradale	Hypercars	Seasonal	Series 7	Ferrari SF90	3595
2019 Ferrari 488 Pista	Track Toys	Autoshow, Wheelspin	Launch	Ferrari 488 Pista '19	3227
2019 Ferrari #62 Risi Competitizione 488 GTE	Extreme Track Toys	Autoshow DLC	Apex Allstars Car Pack	Ferrari #62 488	2972
2019 Ferrari F8 Tributo	Modern Supercars	Seasonal	Series 7	F8 Tributo '19	3367
2019 Ferrari Monza SP2	Super GT	Autoshow DLC	Car Pass	Ferrari Monza	3312
2018 Ferrari FXX-K EVO	Extreme Track Toys	Autoshow DLC	Car Pass	Ferrari FXX-K E	3311
2018 Ferrari Portofino	Super GT	Autoshow, Wheelspin	Launch	Portofino '18	3225
2017 Ferrari #25 Corse Clienti 488 Challenge	Track Toys	Autoshow DLC	Car Pass	#25 Ferrari 488	3112
2017 Ferrari 812 Superfast	Super GT	Autoshow, Wheelspin	Launch	Ferrari 812	2974
2017 Ferrari GTC4Lusso	Super GT	Accolade	Launch	Ferrari GTC4L	3122
2017 Ferrari J50	Modern Supercars	Autoshow DLC	Car Pass	Ferrari J50 '17	3226
2015 Ferrari 488 GTB	Modern Supercars	Autoshow, Wheelspin	Launch	Ferrari 488 GTB	2467
2015 Ferrari F12tdf	Super GT	Autoshow, Wheelspin	Launch	Ferrari F12TDF	2577
2014 Ferrari California T	Super GT	Seasonal	Series 7	Ferrari Cali T	2194
2014 Ferrari FXX K	Extreme Track Toys	Autoshow, Wheelspin	Launch	Ferrari FXX K	2371
2013 Ferrari 458 Speciale	Track Toys	Backstage, Wheelspin, Seasonal	Launch	Ferrari 458 S	2034
2013 Ferrari LaFerrari	Hypercars	Car Collection	Launch	LaFerrari	1654
2012 Ferrari 599XX Evoluzione	Extreme Track Toys	Autoshow, Wheelspin	Launch	Ferrari 599XX E	2908
2010 Ferrari 599 GTO	Super GT	Backstage, Seasonal	Series 2	Ferrari 599 GTO	1319
2010 Ferrari 599XX	Extreme Track Toys	Autoshow	Series 13	Ferrari 599XX	1171
2009 Ferrari 458 Italia	Modern Supercars	Autoshow, Wheelspin	Launch	Ferrari 458	1131
2007 Ferrari 430 Scuderia	Modern Supercars	Autoshow, Wheelspin	Launch	Ferrari 430 S	1022
2005 Ferrari FXX	Extreme Track Toys	Autoshow, Wheelspin	Launch	Ferrari FXX	1006
2003 Ferrari 360 Challenge Stradale	Retro Supercars	Accolade, Wheelspin	Launch	Ferrari 360 CS	297
2002 Ferrari 575M Maranello	Retro Supercars	Backstage, Seasonal	Series 2	Ferrari 575M	257
2002 Ferrari Enzo Ferrari	Retro Supercars	Autoshow, Wheelspin	Launch	Ferrari Enzo	333
1996 Ferrari F50 GT	Extreme Track Toys	Autoshow, Wheelspin	Launch	Ferrari F50 GT	1020
1995 Ferrari F50	Retro Supercars	Autoshow, Wheelspin	Launch	Ferrari F50	342
1994 Ferrari F355 Berlinetta	Retro Supercars	Autoshow, Wheelspin	Launch	Ferrari F355	253
1992 Ferrari 512 TR	Retro Supercars	Backstage, Seasonal	Series 7	Ferrari 512TR	255
1989 Ferrari F40 Competizione	Extreme Track Toys	Barn Find	Launch	Ferrari F40 C	1023
1987 Ferrari F40	Retro Supercars	Autoshow, Wheelspin	Launch	Ferrari F40	340
1984 Ferrari 288 GTO	Retro Supercars	Autoshow, Wheelspin	Launch	Ferrari 288 GTO	358
1970 Ferrari 512 S	Classic Racers	Autoshow	Series 28	Ferrari 512S	3062
1969 Ferrari Dino 246 GT	Rare Classics	Backstage, Wheelspin, Seasonal	Launch	Ferrari Dino	326
1968 Ferrari 365 GTB/4	Rare Classics	Autoshow, Wheelspin	Launch	Ferrari 365 GTB4	1318
1967 Ferrari #24 Ferrari Spa 330 P4	Classic Racers	Autoshow, Wheelspin	Launch	#24 Ferrari P4	2793
1962 Ferrari 250 GT Berlinetta Lusso	Rare Classics	Autoshow	Series 7	Ferrari 250 GT	1578
1962 Ferrari 250 GTO	Classic Racers	Barn Find	Launch	Ferrari 250 GTO	249
1957 Ferrari 250 California	Rare Classics	Autoshow, Wheelspin	Launch	Ferrari 250 Cali	1271
1957 Ferrari 250 Testa Rossa	Classic Racers	Autoshow, Wheelspin	Launch	Ferrari 250 TR	1154
1980 FIAT 124 Sport Spider	Classic Sports Cars	Autoshow	Series 24	FIAT 124 Spider	2195
1969 FIAT Dino 2.4 Coupe	Classic Sports Cars	Backstage, Seasonal	Series 29	FIAT Dino	1615
2024 Ford Mustang Dark Horse	Modern Muscle	Backstage, Seasonal	Series 35	Ford Dark Horse	3847
2024 Ford Mustang GT	Modern Muscle	Seasonal	Series 32	Ford Mustang '24	3846
2023 Ford F-150 Raptor R	Pickups & 4x4s	Seasonal	Series 32	Ford Raptor R	3849
2023 Ford Fiesta ST	Hot Hatch	Seasonal	Series 37	Ford Fiesta '23	3903
2022 Ford Bronco Raptor	Pickups & 4x4s	Seasonal	Series 26	Bronco Raptor	3736
2022 Ford F-150 Lightning Platinum	Pickups & 4x4s	Autoshow DLC	Rally Adventure Expansion	F-150 Lightning	3692
2022 Ford Focus ST	Super Hot Hatch	Backstage, Seasonal	Series 37	Ford Focus '22	3904
2022 Ford Supervan 4	Extreme Track Toys	Autoshow DLC	Acceleration Car Pack	Ford SuperVan 4	3755
2021 Ford Bronco	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Ford Bronco '21	3489
2021 Ford Mustang Mach-E 1400	Track Toys	Accolade	Series 6	Ford Mach-E 1400	3598
2020 Ford #2069 Ford Performance Bronco R	Offroad	Autoshow, Wheelspin	Launch	Bronco R	3404
2020 Ford #2069 Ford Performance Bronco R 'Welcome Pack'	Offroad	Autoshow DLC	Welcome Pack	Bronco R WP	3684
2020 Ford Mustang Shelby GT500	Modern Muscle	Autoshow, Wheelspin	Launch	Ford GT500 '20	3277
2020 Ford Super Duty F-450 DRW Platinum	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Ford SD F-450	3476
2019 Ford Ranger Raptor	Pickups & 4x4s	Wheelspin, Seasonal	Launch	Ranger Raptor	3174
2018 Ford #25 Mustang RTR	Drift Cars	Autoshow, Wheelspin	Launch	#25 RTR Mustang	3093
2018 Ford #88 Mustang RTR	Drift Cars	Autoshow, Wheelspin	Launch	#88 RTR Mustang	3151
2018 Ford Mustang GT	Modern Muscle	Autoshow, Wheelspin	Launch	Ford Mustang '18	3046
2018 Ford Mustang RTR Spec 5	Modern Muscle	Autoshow, Wheelspin	Launch	Ford Mustang S5	3108
2017 Ford #14 Rahal Letterman Lanigan Racing GRC Fiesta	Rally Monsters	Wheelspin, Seasonal	Launch	#14 Ford Fiesta	2937
2017 Ford #25 'Brocky' Ultra4 Bronco RTR	Unlimited Offroad	Autoshow, Wheelspin	Launch	#25 Ford Bronco	3128
2017 Ford F-150 Raptor	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Ford Raptor '17	3485
2017 Ford Focus RS	Super Hot Hatch	Autoshow, Wheelspin	Launch	Ford Focus '17	2357
2017 Ford GT 'OPI Edition'	Modern Supercars	Promotional DLC	Promo code	Ford GT OPI	3699
2017 Ford GT	Modern Supercars	Autoshow	Launch	Ford GT '17	2363
2017 Ford M-Sport Fiesta RS	Rally Monsters	Autoshow, Wheelspin	Launch	Ford Fiesta RS	3051
2016 Ford #66 Ford Racing GTLM Le Mans	Extreme Track Toys	Seasonal	Series 33	#66 Ford GT	2543
2016 Ford Shelby GT350R	Track Toys	Autoshow, Wheelspin	Launch	Ford Mustang '16	2400
2015 Ford Falcon GT F 351	Modern Muscle	Autoshow, Wheelspin	Launch	Ford Falcon '15	2580
2014 Ford #11 Rockstar F-150 Trophy Truck	Unlimited Offroad	Autoshow, Wheelspin	Launch	#11 Ford F-150	2517
2014 Ford Fiesta ST	Hot Hatch	Autoshow, Wheelspin	Launch	Ford Fiesta '14	2011
2014 Ford FPV Limited Edition Pursuit Ute	Vans & Utility	Autoshow, Wheelspin	Launch	Ford Ute '14	2551
2014 Ford Ranger T6 Rally Raid	Offroad	Autoshow, Wheelspin	Launch	Ford Ranger T6	2145
2013 Ford Shelby GT500	Modern Muscle	Autoshow, Wheelspin	Launch	Ford Mustang '13	3232
2011 Ford F-150 SVT Raptor	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Ford Raptor '11	1328
2011 Ford Transit SuperSportVan	Vans & Utility	Autoshow, Wheelspin	Launch	Ford Transit SSV	1460
2010 Ford Crown Victoria Police Interceptor	Retro Muscle	Autoshow, Wheelspin	Launch	Crown Victoria	2649
2009 Ford Focus RS	Super Hot Hatch	Autoshow, Wheelspin	Launch	Ford Focus '09	1086
2005 Ford GT	Retro Supercars	Backstage, Wheelspin, Seasonal	Launch	Ford GT '05	348
2003 Ford F-150 SVT Lightning	Vans & Utility	Autoshow DLC	Car Pass	Ford Lightning	3190
2003 Ford Focus RS	Hot Hatch	Autoshow, Wheelspin	Launch	Ford Focus '03	2019
2003 Ford Mustang SVT Cobra	Retro Muscle	Seasonal	Series 32	Mustang SVT '03	3199
2001 Ford #4 Ford Focus RS	Rally Monsters	Autoshow DLC	Rally Adventure Expansion	#4 Ford Focus	3670
2000 Ford SVT Cobra R	Retro Muscle	Autoshow, Wheelspin	Launch	Ford Mustang '00	405
1999 Ford Racing Puma	Retro Rally	Autoshow, Wheelspin	Launch	Ford Racing Puma	3228
1999 Ford Racing Puma Forza Edition	Rally Monsters	Autoshow DLC	VIP	Ford Puma FE	3564
1995 Ford Mustang SVT Cobra R	Retro Muscle	Backstage, Seasonal	Series 43	Ford Mustang '95	1510
1994 Ford Supervan 3	Track Toys	Autoshow, Wheelspin	Launch	Ford Supervan 3	3170
1994 Ford Supervan 3 'Donut Media Edition'	Track Toys	Accolade	Series 22	Supervan 3 DME	9007
1993 Ford SVT Cobra R	Retro Muscle	Autoshow, Wheelspin	Launch	Ford Mustang '93	1041
1992 Ford Escort RS Cosworth	Retro Rally	Autoshow, Wheelspin	Launch	Ford Escort '92	1272
1987 Ford Sierra Cosworth RS500	Retro Saloons	Autoshow, Wheelspin	Launch	Ford RS500	1293
1986 Ford Escort RS Turbo	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Ford Escort RS	2981
1986 Ford F-150 XLT Lariat	Pickups & 4x4s	Backstage, Seasonal	Series 21	Ford F-150 '86	3597
1986 Ford Mustang SVO	Retro Muscle	Autoshow DLC	Car Pass	Ford Mustang SVO	3181
1985 Ford RS200 Evolution	Rally Monsters	Autoshow, Wheelspin	Launch	Ford RS200	1108
1981 Ford Fiesta XR2	Retro Hot Hatch	Wheelspin, Seasonal	Launch	Ford Fiesta '81	2158
1977 Ford #5 Escort RS1800 MkII	Classic Rally	Autoshow, Wheelspin	Launch	#5 Escort '77	3184
1977 Ford Escort RS1800	Classic Rally	Autoshow, Wheelspin	Launch	Ford Escort '77	1302
1975 Ford Bronco	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Ford Bronco	3484
1973 Ford Capri RS3100	Classic Sports Cars	Autoshow, Wheelspin	Launch	Ford Capri MKI	1529
1973 Ford Escort RS1600	Classic Rally	Autoshow, Wheelspin	Launch	Ford Escort '73	1580
1973 Ford XB Falcon GT	Classic Muscle	Backstage, Seasonal	Series 23	Ford XB Falcon	1278
1972 Ford Falcon XA GT-HO	Classic Muscle	Autoshow, Wheelspin	Launch	Ford Falcon '72	2585
1971 Ford Mustang Mach 1	Classic Muscle	Seasonal	Series 3	Ford Mustang '71	3120
1970 Ford GT70	Classic Rally	Autoshow, Wheelspin	Launch	Ford GT70 '70	3167
1969 Ford Mustang Boss 302	Classic Muscle	Autoshow, Wheelspin	Launch	Ford Mustang '69	1668
1968 Ford Mustang GT 2+2 Fastback	Classic Muscle	Barn Find	Launch	Ford Mustang '68	2614
1967 Ford Racing Escort Mk1	Classic Rally	Barn Find	Launch	Ford Escort '67	3183
1966 Ford #2 GT40 MkII	Classic Racers	Autoshow, Wheelspin	Launch	#2 Ford GT40	2792
1966 Ford Lotus Cortina	Classic Racers	Autoshow, Wheelspin	Launch	Ford Cortina	1486
1965 Ford Mustang GT Coupe	Classic Muscle	Autoshow, Wheelspin	Launch	Ford Mustang '65	1355
1965 Ford Transit	Vans & Utility	Autoshow, Wheelspin	Launch	Ford Transit MK1	3126
1964 Ford GT40 Mk I	Classic Racers	Car Collection	Launch	Ford GT40 '64	2980
1959 Ford Anglia 105E	Cult Cars	Autoshow, Wheelspin	Launch	Ford Anglia '59	2979
1956 Ford F-100	Rods and Customs	Barn Find	Launch	Ford F-100	1581
1946 Ford Super Deluxe Station Wagon	Rods and Customs	Backstage, Seasonal	Series 14	Ford Wagon	2504
1940 Ford De Luxe Coupe	Rods and Customs	Autoshow, Wheelspin	Launch	Ford Coupe '40	1530
1932 Ford De Luxe Five-Window Coupe	Rods and Customs	Autoshow, Wheelspin	Launch	Ford Coupe '32	2372
1932 Ford De Luxe Five-Window Coupe Forza Edition	Unlimited Buggies	Promotional DLC	Promo code	Ford Coupe FE	2930
2023 Formula Drift #64 Forsberg Racing Nissan Z	Drift Cars	Seasonal	Series 22	#64 Nissan Z	3744
2020 Formula Drift #151 Toyota GR Supra	Drift Cars	Autoshow DLC	Formula Drift Car Pack	#151 FD Supra	3523
2020 Formula Drift #91 BMW M2	Drift Cars	Autoshow DLC	Formula Drift Car Pack	#91 BMW M2	3551
2019 Formula Drift #411 Toyota Corolla Hatchback	Drift Cars	Autoshow DLC	Formula Drift Car Pack	#411 FD Corolla	3524
2018 Formula Drift #64 Nissan 370Z	Drift Cars	Autoshow, Wheelspin	Launch	#64 Nissan 370Z	3247
2017 Formula Drift #357 Chevrolet Corvette Z06	Drift Cars	Autoshow DLC	Formula Drift Car Pack	#357 Corvette	3446
2016 Formula Drift #530 HSV Maloo Gen-F	Drift Cars	Autoshow, Wheelspin	Launch	#530 HSV Maloo	2997
2015 Formula Drift #13 Ford Mustang	Drift Cars	Autoshow, Wheelspin	Launch	#13 Ford Mustang	2996
2013 Formula Drift #777 Chevrolet Corvette	Drift Cars	Autoshow, Wheelspin	Launch	#777 Corvette	3702
2009 Formula Drift #99 Mazda RX-8	Drift Cars	Autoshow DLC	Formula Drift Car Pack	#99 Mazda RX-8	3400
2007 Formula Drift #117 599 GTB Fiorano	Drift Cars	Autoshow, Wheelspin	Launch	Formula D 599	3249
2006 Formula Drift #43 Dodge Viper SRT10	Drift Cars	Autoshow, Wheelspin	Launch	#43 Dodge Viper	3003
1997 Formula Drift #777 Nissan 240SX	Drift Cars	Autoshow, Wheelspin	Launch	#777 Nissan 240	3000
1996 Formula Drift #51 Donut Media Nissan 240SX	Drift Cars	Accolade	Series 22	#51 Nissan 240SX	3741
1995 Formula Drift #34 Toyota Supra MKIV	Drift Cars	Autoshow DLC	Formula Drift Car Pack	#34 Toyota Supra	3411
1989 Formula Drift #98 BMW 325i	Drift Cars	Autoshow, Wheelspin	Launch	#98 BMW 325I	3037
2021 Forsberg Racing Nissan 'Altimaniac'	Drift Cars	Autoshow DLC	Horizon Racing Car Pack	Altimaniac	3530
2014 Forsberg Racing Nissan 'SafariZ' 370Z Safari Rally Tribute	Rally Monsters	Autoshow DLC	Car Pass	SafariZ' 370Z	3531
2010 Forsberg Racing Toyota Gumout 2JZ Camry Stock Car	Track Toys	Autoshow DLC	Formula Drift Car Pack	FR Stock Car	3528
1975 Forsberg Racing Nissan Gold Leader Datsun 280Z	Retro Sports Cars	Autoshow DLC	Formula Drift Car Pack	Datsun 280Z	3529
2018 Funco Motorsports F9	Unlimited Buggies	Accolade, Wheelspin	Launch	Funco F9	2935
2019 Ginetta G10 RM	Track Toys	Autoshow DLC	Acceleration Car Pack	Ginetta G10 RM	3428
2022 GMC 'Barbie Movie' HUMMER EV PICKUP	Pickups & 4x4s	Autoshow	Series 22	Barbie HUMMER EV	3809
2022 GMC HUMMER EV Pickup	Pickups & 4x4s	Backstage, Seasonal	Series 21	HUMMER EV Truck	3722
1992 GMC Typhoon	Vans & Utility	Backstage, Seasonal	Series 22	GMC Typhoon	1394
1991 GMC Syclone	Vans & Utility	Backstage, Seasonal	Series 22	GMC Syclone	1294
1983 GMC Vandura G-1500	Vans & Utility	Autoshow, Wheelspin	Launch	GMC Vandura	1531
1970 GMC Jimmy	Pickups & 4x4s	Barn Find	Launch	GMC K5 Jimmy	2613
2022 Gordon Murray Automotive T.50	Hypercars	Backstage, Seasonal	Series 28	GMA T.50	3599
1985 HDT VK Commodore Group A	Retro Muscle	Seasonal	Series 11	HDT VK Commodore	2584
2022 Hennessey Mammoth 6x6	Pickups & 4x4s	Accolade	Horizon Realms	Mammoth 6x6	3740
2021 Hennessey Venom F5	Hypercars	Autoshow DLC	Hot Wheel Expansion	Venom F5	3600
2019 Hennessey Camaro Exorcist	Track Toys	Accolade	Series 23	Exorcist '19	3284
2019 Hennessey VelociRaptor 6x6	Pickups & 4x4s	Autoshow, Wheelspin	Launch	VelociRaptor '19	3189
2012 Hennessey Venom GT	Hypercars	Autoshow, Wheelspin	Launch	Hennessey Venom	1599
1977 Holden Torana A9X	Classic Muscle	Autoshow, Wheelspin	Launch	Holden Torana	1533
1974 Holden Sandman HQ panel van	Vans & Utility	Autoshow, Wheelspin	Launch	Holden Sandman	2510
1973 Holden HQ Monaro GTS 350	Classic Muscle	Autoshow, Wheelspin	Launch	Holden Monaro	2417
2018 Honda Civic Type R	Super Hot Hatch	Autoshow	Launch	Honda Civic '18	2870
2016 Honda Civic Coupe	Rally Monsters	Seasonal	Launch	Honda Civic Coupe	3069
2016 Honda Civic Type R	Super Hot Hatch	Autoshow	Launch	Honda Civic '16	2163
2015 Honda Ridgeline Baja Trophy Truck	Unlimited Offroad	Seasonal	Series 18	Honda Trophy '15	2745
2009 Honda S2000 CR	Modern Sports Cars	Autoshow, Wheelspin	Launch	Honda S2000	2005
2007 Honda Civic Type-R	Hot Hatch	Autoshow	Launch	Honda Civic '07	625
2005 Honda NSX-R GT	Retro Sports Cars	Backstage Shop., Seasonal	Launch	Honda NSX-R GT	569
2005 Honda NSX-R	Retro Sports Cars	Autoshow, Wheelspin	Launch	Honda NSX-R '05	411
2004 Honda Civic Type-R	Retro Hot Hatch	Autoshow	Launch	Honda Civic '04	302
2003 Honda S2000	Modern Sports Cars	Autoshow, Wheelspin	Launch	Honda S2000	427
1997 Honda Civic Type R	Retro Hot Hatch	Autoshow	Launch	Honda Civic '97	1273
1994 Honda Prelude Si	Retro Hot Hatch	Autoshow	Launch	Honda Prelude 94	2121
1992 Honda NSX-R	Retro Sports Cars	Autoshow, Wheelspin	Launch	Honda NSX-R '92	412
1991 Honda CR-X SiR	Retro Hot Hatch	Autoshow	Launch	Honda CR-X	320
1984 Honda Civic CRX Mugen	Retro Hot Hatch	Seasonal	Launch	Honda Civic '84	2119
1974 Honda Civic RS	Retro Hot Hatch	Autoshow	Launch	Honda Civic '74	1568
2016 Hoonigan Gymkhana 9 Ford Focus RS RX	Rally Monsters	Seasonal	Series 18	Hoonigan Focus	2648
2016 Hoonigan Gymkhana 10 Ford Focus RS RX	Rally Monsters	Accolade, Wheelspin	Launch	Gymkhana 10 Focus	3115
1994 Hoonigan Ford Escort RS Cosworth WRC 'Cossie V2'	Rally Monsters	Autoshow	Launch	Hoonigan Cossie	3370
1992 Hoonigan Mazda RX-7 Twerkstallion	Drift Cars	Car Mastery, Seasonal	Launch	Twerkstallion	2732
1991 Hoonigan Gymkhana 10 Ford Escort Cosworth Group A	Rally Monsters	Autoshow, Wheelspin	Launch	Hoonigan Group A	2984
1991 Hoonigan Rauh-Welt Begriff Porsche 911 Turbo	Retro Supercars	Car Mastery, Seasonal	Launch	Hoonigan Porsche	2736
1986 Hoonigan Ford RS200 Evolution	Rally Monsters	Autoshow, Wheelspin	Launch	Hoonigan RS200	3119
1978 Hoonigan Ford Escort RS1800	Rally Monsters	Autoshow, Wheelspin	Launch	Hoonigan Escort	2730
1977 Hoonigan Gymkhana 10 Ford F-150 'Hoonitruck'	Drift Cars	Autoshow, Wheelspin	Launch	Hoonigan F-150	2982
1973 Hoonigan Volkswagen Baja Beetle Class 5/1600 'Scumbug'	Buggies	Autoshow DLC	Rally Adventure Expansion	Hoonigan Scumbug	3553
1972 Hoonigan Chevrolet Napalm Nova	Classic Muscle	Autoshow, Wheelspin	Launch	Hoonigan Nova	2729
1965 Hoonigan Ford Hoonicorn Mustang	Drift Cars	Autoshow, Wheelspin	Launch	Hoonicorn	2734
1965 Hoonigan Gymkhana 10 Ford Hoonicorn Mustang	Drift Cars	Backstage, Seasonal	Launch	Hoonicorn V2	3006
1955 Hoonigan Chevrolet Bel Air	Rods and Customs	Autoshow, Wheelspin	Launch	Hoonigan Bel Air	1459
2018 Hot Wheels 2JetZ	Rods and Customs	Backstage, Wheelspin, Seasonal	Series 9	2JetZ	3405
2013 Hot Wheels Baja Bone Shaker	Unlimited Offroad	Autoshow DLC	Hot Wheels Expansion	Baja Bone Shaker	1653
2012 Hot Wheels Bad to the Blade	Extreme Track Toys	Autoshow DLC	Hot Wheels Expansion	Hot Wheels BTTB	1532
2012 Hot Wheels Rip Rod	Unlimited Buggies	Backstage, Wheelspin, Seasonal	Series 9	Rip Rod	3704
2011 Hot Wheels Bone Shaker	Rods and Customs	Autoshow	Launch	Bone Shaker	1477
2005 Hot Wheels Ford Mustang	Track Toys	Wheelspin, Seasonal	Series 9	HW Ford Mustang	2576
2000 Hot Wheels Deora II	Rods and Customs	Autoshow DLC	Hot Wheels Expansion	Hot Wheels Deora	3703
1970 Hot Wheels Pontiac Firebird Trans Am Custom	Track Toys	Seasonal	Series 23	HW Trans Am	3706
1969 Hot Wheels Twin Mill	Rods and Customs	Backstage, Wheelspin, Seasonal	Launch	Twin Mill	2750
1957 Hot Wheels Nash Metropolitan Custom	Rods and Customs	Backstage, Wheelspin, Seasonal	Series 9	Hot Wheels Metro	3407
1949 Hot Wheels Ford F-5 Dually Custom Hot Rod	Rods and Customs	Wheelspin, Seasonal	Series 9	HW Dually '49	3252
2014 HSV GEN-F GTS	Modern Muscle	Autoshow, Wheelspin	Launch	HSV GEN-F GTS	2131
2014 HSV Limited Edition Gen-F GTS Maloo	Vans & Utility	Autoshow, Wheelspin	Launch	HSV Maloo '14	2422
2006 HUMMER H1 Alpha	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Hummer H1	1345
2023 Hyundai IONIQ 5 N	Sports Utility Heroes	Seasonal	Series 35	IONIQ 5 N '23	3827
2022 Hyundai IONIQ 6	Super Saloons	Seasonal	Series 30	IONIQ6 '22	3828
2022 Hyundai Kona N	Sports Utility Heroes	Seasonal	Series 30	Hyundai Kona '22	3820
2022 Hyundai N Vision 74	Track Toys	Backstage, Seasonal	Series 34	N Vision 74 '22	3829
2021 Hyundai #98 Bryan Herta Autosport Elantra N	Track Toys	Seasonal	Series 33	#98 Elantra	3676
2020 Hyundai I30 N	Super Hot Hatch	Seasonal	Series 30	Hyundai i30 N	3678
2019 Hyundai Veloster N	Super Hot Hatch	Autoshow, Wheelspin	Launch	Veloster N	2872
2015 Infiniti Q60 Concept	Super Saloons	Autoshow, Wheelspin	Launch	Infiniti Q60	2437
1970 International Scout 800A	Pickups & 4x4s	Autoshow, Wheelspin	Launch	IH Scout 800A	2558
2019 Italdesign DaVinci Concept	GT Cars	Autoshow DLC	Italian Exotics Car Pack	DaVinci	3320
2018 Italdesign Zerouno	Hypercars	Autoshow	Launch	ID Zerouno '18	3194
2020 Jaguar F-Type SVR	GT Cars	Seasonal	Series 32	Jag F-TYPE SVR	3697
2019 Jaguar XE SV Project 8	Track Toys	Autoshow DLC	European Auto Car Pack	Jag. XE P8 '19	3602
2018 Jaguar I-PACE	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Jaguar I-PACE	2841
2017 Jaguar F-PACE S	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Jaguar F-PACE S	2571
2016 Jaguar F-TYPE Project 7	Track Toys	Accolade, Wheelspin	Launch	Jaguar Project 7	2492
2015 Jaguar F-TYPE R Coupé	GT Cars	Wheelspin, Seasonal	Launch	Jaguar F-Type	2162
2015 Jaguar XE-S	Super Saloons	Autoshow, Wheelspin	Launch	Jaguar XE-S	2570
2015 Jaguar XFR-S	Super Saloons	Autoshow, Wheelspin	Launch	Jaguar XFR-S	2185
2015 Jaguar XKR-S GT	Track Toys	Backstage, Seasonal	Series 3	Jaguar XKR-S '15	2235
2012 Jaguar XKR-S	GT Cars	Autoshow, Wheelspin	Launch	Jaguar XKR-S '12	2751
2010 Jaguar C-X75	Modern Supercars	Autoshow, Wheelspin	Launch	Jaguar C-X75	3055
1993 Jaguar XJ220	Retro Supercars	Wheelspin, Seasonal	Launch	Jaguar XJ220	489
1993 Jaguar XJ220S TWR	Retro Supercars	Autoshow DLC	Car Pass	Jaguar XJ220S	3293
1991 Jaguar Sport XJR-15	Retro Supercars	Barn Find	Launch	Jaguar XJR-15	3287
1966 Jaguar XJ13	Classic Racers	Autoshow DLC	Car Pass	Jaguar XJ13	3415
1964 Jaguar Lightweight E-Type	Classic Racers	Autoshow, Wheelspin	Launch	Jaguar LW E-Type	2992
1961 Jaguar E-type	Rare Classics	Autoshow, Wheelspin	Launch	Jaguar E-Type	336
1959 Jaguar Mk II 3.8	Classic Racers	Autoshow, Wheelspin	Launch	Jaguar MK II 3.8	2559
1956 Jaguar D-Type	Classic Racers	Autoshow, Wheelspin	Launch	Jaguar D-Type	1301
1953 Jaguar C-Type	Classic Racers	Autoshow	Series 28	Jaguar C-Type	3097
2020 Jeep Gladiator Rubicon	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Jeep Gladiator	3255
2018 Jeep Grand Cherokee Trackhawk	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Jeep Trackhawk	3164
2016 Jeep Trailcat	Unlimited Offroad	Autoshow, Wheelspin	Launch	Jeep Trailcat	2742
2014 Jeep Grand Cherokee SRT	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Cherokee '14	2108
2012 Jeep Wrangler Rubicon	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Jeep Wrangler	1496
1976 Jeep CJ5 Renegade	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Jeep CJ5	2511
2020 Jimco #179 Hammerhead Class 1	Unlimited Buggies	Autoshow DLC	Rally Adventure Expansion	#179 Hammerhead	3604
2019 Jimco #240 Fastball Racing Spec Trophy Truck	Unlimited Offroad	Autoshow DLC	Rally Adventure Expansion	#240 Jimco TT	3605
2023 KIA EV6 GT	Sports Utility Heroes	Backstage, Seasonal	Series 35	KIA EV6 GT '23	3864
2020 Koenigsegg Jesko	Hypercars	Autoshow, Wheelspin	Launch	Koenigsegg Jesko	3315
2017 Koenigsegg Agera RS	Hypercars	Autoshow, Wheelspin	Launch	Agera RS	2910
2016 Koenigsegg Regera	Hypercars	Autoshow, Wheelspin	Launch	Regera	2526
2015 Koenigsegg One:1	Hypercars	Autoshow, Wheelspin	Launch	Koenigsegg One	2188
2011 Koenigsegg Agera	Hypercars	Backstage, Seasonal	Series 13	Koenigsegg Agera	2575
2008 Koenigsegg CCGT	Extreme Track Toys	Backstage, Wheelspin, Seasonal	Launch	Koenigsegg CCGT	1007
2006 Koenigsegg CCX	Hypercars	Backstage, Seasonal	Series 29	Koenigsegg CCX	1275
2002 Koenigsegg CC8S	Hypercars	Autoshow, Wheelspin	Launch	Koenigsegg CC8S	294
2020 KTM X-Bow GT2	Extreme Track Toys	Autoshow DLC	Super Speed Car Pack	X-Bow GT2	3492
2018 KTM X-Bow GT4	Extreme Track Toys	Backstage, Seasonal	Series 5	KTM X-Bow GT4	3035
2013 KTM X-Bow R	Track Toys	Autoshow, Wheelspin	Launch	KTM X-Bow	2042
2024 Lamborghini Revuelto	Hypercars	Accolade	Horizon Realms	Revuelto '24	3891
2023 Lamborghini Huracán Sterrato	Rally Monsters	Accolade	Horizon Realms	Huracán Sterrato	3840
2023 Lamborghini Huracán Tecnica	Modern Supercars	Autoshow DLC	Italian Exotics Car Pack	Huracán Technica	3753
2021 Lamborghini Aventador LP 780-4 Ultimae	Hypercars	Backstage, Seasonal	Series 36	L. Aventador '21	3775
2021 Lamborghini Countach LPI 800-4	Hypercars	Seasonal	Series 34	L. Countach '21	3774
2020 Lamborghini Essenza SCV12	Extreme Track Toys	Autoshow DLC	Italian Exotics Car Pack	Lambo SCV12	3606
2020 Lamborghini Huracán EVO	Modern Supercars	Autoshow DLC	Car Pass	Huracán EVO	3371
2020 Lamborghini Huracán STO	Track Toys	Backstage, Seasonal	Series 20	Huracán STO	3672
2020 Lamborghini SC20	Hypercars	Autoshow DLC	Italian Exotics Car Pack	Lambo SC20	3673
2020 Lamborghini Sián Roadster	Hypercars	Autoshow	Series 15	Lambo Sián R	3608
2019 Lamborghini Urus	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Urus '19	3120
2018 Lamborghini #63 Squadra Corse Huracán Super Trofeo Evo	Extreme Track Toys	Autoshow DLC	Italian Exotics Car Pack	#63 Lambo Trofeo	3239
2018 Lamborghini Aventador SVJ	Hypercars	Backstage, Seasonal	Series 2	Aventador SVJ	3289
2018 Lamborghini Huracán Performante	Track Toys	Autoshow, Wheelspin	Launch	Lambo Huracan P	3217
2016 Lamborghini Aventador Superveloce	Hypercars	Autoshow, Wheelspin	Launch	Aventador '16	2479
2016 Lamborghini Centenario LP 770-4	Hypercars	Autoshow, Wheelspin	Launch	Lambo Centenario	2616
2014 Lamborghini Huracán LP 610-4	Modern Supercars	Autoshow, Wheelspin	Launch	Lambo Huracan	2164
2013 Lamborghini Veneno	Hypercars	Autoshow, Wheelspin	Launch	Lambo Veneno	2004
2012 Lamborghini Aventador J	Hypercars	Backstage, Seasonal	Series 2	Aventador J	1522
2012 Lamborghini Aventador LP700-4	Hypercars	Autoshow, Wheelspin	Launch	Aventador '12	1583
2012 Lamborghini Gallardo LP 570-4 Spyder Performante	Modern Supercars	Backstage, Seasonal	Series 2	Gallardo Spyder	1398
2011 Lamborghini Gallardo LP 570-4 Superleggera	Modern Supercars	Accolade	Launch	Lambo Gallardo	1397
2011 Lamborghini Sesto Elemento Forza Edition	Extreme Track Toys	Wheelspin, Seasonal	Launch	Lambo Sesto FE	1392
2011 Lamborghini Sesto Elemento	Extreme Track Toys	Autoshow, Wheelspin	Launch	Lambo Sesto	1322
2010 Lamborghini Murcielago LP 670-4 SV	Modern Supercars	Wheelspin, Seasonal	Launch	Lambo Murcielago	1173
2008 Lamborghini Reventon	Modern Supercars	Car Collection	Launch	Lambo Reventon	1125
1999 Lamborghini Diablo GTR	Extreme Track Toys	Car Mastery, Seasonal	Launch	Diablo GTR	324
1997 Lamborghini Diablo SV	Retro Supercars	Autoshow, Wheelspin	Launch	Lambo Diablo SV	325
1988 Lamborghini Countach LP5000 QV	Retro Supercars	Autoshow, Wheelspin	Launch	Lambo Countach	316
1986 Lamborghini LM 002	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Lambo LM 002	2176
1973 Lamborghini Espada 400 GT	Retro Supercars	Autoshow DLC	Car Pass	Espada 400GT '73	3191
1967 Lamborghini Miura P400	Rare Classics	Autoshow, Wheelspin	Launch	Lambo Miura	637
1992 Lancia Delta HF Integrale EVO	Retro Rally	Autoshow	Series 24	Lancia Delta	323
1986 Lancia Delta S4	Retro Rally	Seasonal	Series 24	Lancia Delta S4	1661
1982 Lancia 037 Stradale	Retro Rally	Backstage, Seasonal	Series 24	Lancia 037	1295
1974 Lancia Stratos HF Stradale	Classic Rally	Autoshow	Series 24	Lancia Stratos	458
1968 Lancia Fulvia Coupe Rallye 1.6 HF	Classic Rally	Backstage, Seasonal	Series 31	Lancia Fulvia	1585
2020 Land Rover Defender 110 X	Sports Utility Heroes	Autoshow, Wheelspin	Launch	LR Defender '20	3414
2018 Land Rover Range Rover Velar First Edition	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Land Rover Velar	3136
2015 Land Rover Range Rover Sport SVR	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Range Rover '15	2494
1997 Land Rover Defender 90	Pickups & 4x4s	Autoshow, Wheelspin	Launch	LR Defender	2135
1973 Land Rover Range Rover	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Range Rover '73	2985
1972 Land Rover Series III	Pickups & 4x4s	Autoshow, Wheelspin	Launch	LR Series III	2560
2021 Lexus LC 500	GT Cars	Seasonal	Series 19	Lexus LC 500 '21	3520
2020 Lexus #14 VASSER SULLIVAN RC F GT3	Extreme Track Toys	Autoshow DLC	Apex Allstars Car Pack	Lexus #14 RC F	3457
2020 Lexus RC F Track Edition	Track Toys	Autoshow DLC	Car Pass	Lexus RC F '20	3546
2015 Lexus RC F	Super Saloons	Autoshow, Wheelspin	Launch	Lexus RC F	2175
2010 Lexus LFA	Modern Supercars	Autoshow, Wheelspin	Launch	Lexus LFA	1260
1997 Lexus SC300	Retro Sports Cars	Autoshow, Wheelspin	Launch	Lexus SC300	1351
1962 Lincoln Continental	Rods and Customs	Backstage, Seasonal	Series 27	Continental '62	1586
2014 Local Motors Rally Fighter	Unlimited Offroad	Autoshow, Wheelspin	Launch	Rally Fighter	2146
1969 Lola #6 Penske Sunoco T70 MkIIIB	Classic Racers	Autoshow, Wheelspin	Launch	#6 Lola T70	2423
2023 Lotus Emira	Modern Sports Cars	Autoshow DLC	Horizon Racing Car Pack	Lotus Emira	3716
2020 Lotus Evija	Hypercars	Autoshow	Launch	Lotus Evija '20	3449
2018 Lotus Exige Cup 430	Track Toys	Accolade	Horizon Realms	Lotus Exige '18	3661
2016 Lotus 3-Eleven	Track Toys	Autoshow, Wheelspin	Launch	Lotus 3-Eleven	2541
2012 Lotus Exige S	Modern Sports Cars	Autoshow, Wheelspin	Launch	Lotus Exige S	1601
2009 Lotus 2-Eleven	Track Toys	Backstage, Seasonal	Series 28	Lotus 2-Eleven	1187
2002 Lotus Esprit V8	Retro Supercars	Seasonal	Series 31	Lotus Esprit	335
2000 Lotus 340R	Track Toys	Seasonal	Series 28	Lotus 340R	2405
1999 Lotus Elise Series 1 Sport 190	Retro Sports Cars	Autoshow, Wheelspin	Launch	Lotus Elise '99	1376
1997 Lotus Elise GT1	Retro Supercars	Autoshow, Wheelspin	Launch	Lotus Elise GT1	2825
1980 Lotus Esprit Turbo	Retro Supercars	Seasonal	Series 34	Lotus Esprit '80	1334
1971 Lotus Elan Sprint	Classic Sports Cars	Autoshow, Wheelspin	Launch	Lotus Elan	330
2023 Lucid Air Sapphire	Super Saloons	Backstage, Wheelspin, Seasonal	Series 27	Lucid Air	3811
2022 Lynk & Co 02 Hatchback	Hot Hatch	Seasonal	Series 30	Lynk & Co 02 HB	3788
2022 Lynk & Co 05+	Sports Utility Heroes	Autoshow DLC	Chinese Lucky Stars Car Pack	Lynk & Co 05+	3787
2021 Lynk & Co 03+	Super Saloons	Autoshow	Series 12	Lynk & Co 03+	3677
2020 Lynk & Co #100 Cyan Racing 03	Track Toys	Seasonal	Series 14	#100 Lynk&Co 03	3552
2017 Maserati Levante S	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Maserati Levante	2865
2010 Maserati Gran Turismo S	GT Cars	Autoshow, Wheelspin	Launch	Maserati GT-S	1304
2010 Maserati Gran Turismo S Forza Edition	Track Toys	Wheelspin, Seasonal	Launch	Maserati GTS FE	3568
2008 Maserati MC12 Versione Corsa	Extreme Track Toys	Autoshow, Wheelspin	Launch	MC12 Corsa '08	3082
1939 Maserati 8CTF	Vintage Racers	Seasonal	Series 2	Maserati 8CTF	2068
2022 Mazda MX-5 Miata RF	Modern Sports Cars	Backstage, Seasonal	Series 40	MX-5 RF '22	3861
2022 Mazda RX-7 Spirit R Type A	Retro Sports Cars	Autoshow DLC	JDM Jewels Car Pack	RX-7 Spirit R	3856
2020 Mazda MX-5 Miata	Modern Sports Cars	Autoshow, Wheelspin	Launch	Mazda MX-5 '20	3321
2016 Mazda MX-5	Modern Sports Cars	Autoshow, Wheelspin	Launch	Mazda MX-5 '16	2524
2013 Mazda MX-5	Modern Sports Cars	Autoshow, Wheelspin	Launch	Mazda MX-5 '13	1603
2011 Mazda RX-8 R3	Modern Sports Cars	Autoshow, Wheelspin	Launch	Mazda RX-8	1419
2005 Mazda Mazdaspeed MX-5	Modern Sports Cars	Autoshow, Wheelspin	Launch	Mazdaspeed MX5	2589
2002 Mazda RX-7 Spirit R Type-A	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mazda RX-7	1286
1997 Mazda RX-7	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mazda RX-7 '97	392
1994 Mazda MX-5 Miata	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mazda MX-5 '94	2590
1992 Mazda 323 GT-R	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Mazda 323 GT-R	2595
1990 Mazda Savanna RX-7	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mazda Savanna	392
1985 Mazda RX-7 GSL-SE	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mazda RX-7 '85	391
1973 Mazda RX-3	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mazda RX-3	2120
1972 Mazda Cosmo 110S Series II	Rare Classics	Wheelspin, Seasonal	Launch	Mazda Cosmo	1288
2021 McLaren 620R	Track Toys	Seasonal	Series 25	McLaren 620R	3616
2021 McLaren 765LT	Hypercars	Backstage, Seasonal	Series 41	McLaren 765LT	3617
2020 McLaren GT	Super GT	Autoshow, Wheelspin	Launch	McLaren GT '20	3618
2019 McLaren 600LT Coupé	Track Toys	Autoshow, Wheelspin	Launch	McLaren 600LT	3246
2019 McLaren Senna	Extreme Track Toys	Autoshow, Wheelspin	Launch	McLaren Senna	3233
2019 McLaren Senna GTR	Extreme Track Toys	Autoshow DLC	Car Pass	McLaren Senna GTR	3416
2019 McLaren Speedtail	Hypercars	Backstage, Seasonal	Series 1	McLaren Speedtail	3310
2018 McLaren 720S Coupe	Hypercars	Autoshow, Wheelspin	Launch	McLaren 720S	2975
2018 McLaren 720S Spider	Hypercars	Backstage, Seasonal	Series 5	McLaren 720S S	3262
2017 McLaren 570S Coupé	Modern Supercars	Accolade, Wheelspin	Launch	McLaren 570S	2539
2017 McLaren 720S	Hypercars	Autoshow, Wheelspin	Launch	McLaren 720S '17	2975
2015 McLaren 570S	Modern Supercars	Autoshow, Wheelspin	Launch	McLaren 570S '15	2539
2015 McLaren 650S Coupé	Modern Supercars	Autoshow, Wheelspin	Launch	McLaren 650S	2220
2015 McLaren P1 GTR	Extreme Track Toys	Autoshow, Wheelspin	Launch	McLaren P1 GTR	2450
2014 McLaren 650S Spider	Modern Supercars	Autoshow, Wheelspin	Launch	McLaren 650S S	2220
2013 McLaren P1	Hypercars	Autoshow, Wheelspin	Launch	McLaren P1	2149
2012 McLaren MP4-12C	Modern Supercars	Autoshow, Wheelspin	Launch	McLaren MP4-12C	1619
2011 McLaren 12C	Modern Supercars	Autoshow, Wheelspin	Launch	McLaren 12C	1619
1997 McLaren F1 GT	Extreme Track Toys	Autoshow, Wheelspin	Launch	McLaren F1 GT	2844
1993 McLaren F1	Hypercars	Autoshow, Wheelspin	Launch	McLaren F1	1495
2022 Mercedes-AMG ONE	Hypercars	Seasonal	Series 15	AMG ONE	3740
2021 Mercedes-AMG Project One	Hypercars	Backstage, Seasonal	Series 26	AMG Project One	3741
2021 Mercedes-AMG GT Black Series	Extreme Track Toys	Backstage, Seasonal	Series 17	AMG GT Black	3622
2019 Mercedes-AMG A 35 4MATIC	Super Saloons	Backstage, Seasonal	Series 1	AMG A35	3308
2019 Mercedes-AMG C 63 S Coupé	Super Saloons	Autoshow, Wheelspin	Launch	AMG C63 S '19	3260
2019 Mercedes-AMG GT 63 S 4-Door Coupé	Super Saloons	Autoshow, Wheelspin	Launch	AMG GT 63 S	3309
2018 Mercedes-AMG E 63 S	Super Saloons	Autoshow, Wheelspin	Launch	AMG E63 S	3045
2018 Mercedes-AMG GT 4-Door Coupé	Super Saloons	Autoshow, Wheelspin	Launch	AMG GT 4-Door	3309
2017 Mercedes-AMG GT R	Track Toys	Accolade	Launch	AMG GT R	2745
2016 Mercedes-AMG C 63 S Coupé	Super Saloons	Autoshow, Wheelspin	Launch	AMG C63 S	2536
2016 Mercedes-AMG GT S	Super GT	Autoshow, Wheelspin	Launch	AMG GT S	2476
2015 Mercedes-AMG GT S	Super GT	Autoshow, Wheelspin	Launch	AMG GT S '15	2476
2014 Mercedes-AMG S 63 Coupé	Super Saloons	Autoshow, Wheelspin	Launch	AMG S63 Coupe	2455
2013 Mercedes-Benz A 45 AMG	Super Hot Hatch	Autoshow, Wheelspin	Launch	AMG A45	1677
2013 Mercedes-Benz E 63 AMG	Super Saloons	Autoshow, Wheelspin	Launch	AMG E63	1649
2013 Mercedes-Benz G 65 AMG	Sports Utility Heroes	Autoshow, Wheelspin	Launch	AMG G65	1669
2012 Mercedes-Benz C 63 AMG Coupé Black Series	Track Toys	Autoshow, Wheelspin	Launch	AMG C63 Black	1588
2012 Mercedes-Benz SL 65 AMG	Super GT	Autoshow, Wheelspin	Launch	AMG SL65	1589
2012 Mercedes-Benz SLK 55 AMG	Modern Sports Cars	Autoshow, Wheelspin	Launch	AMG SLK55	1590
2012 Mercedes-Benz SLS AMG Coupé Black Series	Track Toys	Autoshow, Wheelspin	Launch	SLS Black Series	1639
2011 Mercedes-Benz SLS AMG	Super GT	Autoshow, Wheelspin	Launch	Mercedes SLS	1461
2009 Mercedes-Benz SL 65 AMG Black Series	Track Toys	Backstage, Seasonal	Series 3	SL65 Black	1186
2005 Mercedes-Benz SLR McLaren	Hypercars	Wheelspin, Seasonal	Launch	SLR McLaren	558
2004 Mercedes-Benz C 32 AMG	Retro Saloons	Autoshow, Wheelspin	Launch	AMG C32	1580
1998 Mercedes-Benz AMG CLK GTR	Extreme Track Toys	Autoshow, Wheelspin	Launch	CLK GTR	547
1990 Mercedes-Benz 190E 2.5-16 Evolution II	Retro Saloons	Barn Find	Launch	Mercedes 190E	1335
1984 Mercedes-Benz #6 AMG Mercedes 300 SEL 6.8 'Rote Sau'	Classic Racers	Autoshow DLC	Car Pass	#6 300 SEL 6.8	3180
1971 Mercedes-Benz 300 SEL 6.3	Rare Classics	Seasonal	Series 5	Mercedes 300 SEL	1465
1954 Mercedes-Benz 300 SL Coupé	Rare Classics	Autoshow	Launch	Mercedes 300 SL	1336
2018 Mercury Cougar Eliminator	Retro Muscle	Autoshow DLC	American Auto Car Pack	Cougar Elim '18	3469
1970 Mercury Cougar Eliminator	Classic Muscle	Autoshow, Wheelspin	Launch	Mercury Cougar	1339
1949 Mercury Eight Coupe	Rods and Customs	Autoshow, Wheelspin	Launch	Mercury Coupe	1338
2016 MG MG3	Hot Hatch	Autoshow, Wheelspin	Launch	MG MG3	2515
1972 MG B GT	Classic Sports Cars	Autoshow, Wheelspin	Launch	MG B GT	1341
1958 MG MGA Twin-Cam	Classic Sports Cars	Autoshow, Wheelspin	Launch	MG MGA	1340
2021 MINI JCW GP	Super Hot Hatch	Backstage, Seasonal	Series 8	MINI JCW GP	3624
2012 MINI John Cooper Works GP	Hot Hatch	Autoshow, Wheelspin	Launch	MINI JCW GP '12	1437
2009 MINI John Cooper Works	Hot Hatch	Autoshow, Wheelspin	Launch	MINI JCW '09	1134
1965 MINI Cooper S	Classic Sports Cars	Autoshow, Wheelspin	Launch	MINI Cooper S	1343
2020 Mitsubishi Eclipse Cross	Sports Utility Heroes	Autoshow DLC	JDM Jewels Car Pack	Eclipse Cross	3858
2015 Mitsubishi Lancer Evolution X Final Edition	Super Hot Hatch	Autoshow, Wheelspin	Launch	Mitsubishi Evo X	2460
2008 Mitsubishi Lancer Evolution X GSR	Super Hot Hatch	Autoshow	Launch	Mitsubishi Evo X	1097
2006 Mitsubishi Lancer Evolution IX MR	Super Hot Hatch	Autoshow	Launch	Mitsubishi Evo 9	1137
2004 Mitsubishi Lancer Evolution VIII MR	Retro Hot Hatch	Autoshow	Launch	Mitsubishi Evo 8	395
1999 Mitsubishi Lancer Evolution VI GSR	Retro Hot Hatch	Autoshow	Launch	Mitsubishi Evo 6	393
1997 Mitsubishi GTO	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mitsubishi GTO	1342
1995 Mitsubishi Eclipse GSX	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mitsubishi Eclipse	1344
1992 Mitsubishi Galant VR-4	Retro Rally	Autoshow	Launch	Mitsubishi Galant	1346
1988 Mitsubishi Starion ESI-R	Retro Sports Cars	Autoshow, Wheelspin	Launch	Mitsubishi Starion	1347
2018 Morgan Aero GT	Super GT	Autoshow DLC	Hot Wheels Expansion	Morgan Aero GT	3290
2011 Morgan Aero Supersports	Modern Sports Cars	Backstage, Seasonal	Series 31	Morgan Aero	1353
2010 Mosler MT900S	Modern Supercars	Seasonal	Series 6	Mosler MT900S	1356
2022 NIO EP9	Extreme Track Toys	Seasonal	Series 19	NIO EP9	3632
2020 Nissan GT-R NISMO (R35)	Track Toys	Autoshow DLC	Car Pass	GT-R Nismo '20	3381
2019 Nissan 370Z Nismo	Modern Sports Cars	Autoshow, Wheelspin	Launch	Nissan 370Z N	3068
2018 Nissan Sentra NISMO	Hot Hatch	Autoshow, Wheelspin	Launch	Nissan Sentra	3100
2017 Nissan GT-R	Modern Supercars	Autoshow, Wheelspin	Launch	Nissan GT-R '17	2738
2012 Nissan GT-R Black Edition	Modern Supercars	Autoshow, Wheelspin	Launch	Nissan GT-R '12	1455
2010 Nissan 370Z	Modern Sports Cars	Autoshow, Wheelspin	Launch	Nissan 370Z '10	1196
2003 Nissan Fairlady Z	Modern Sports Cars	Autoshow, Wheelspin	Launch	Nissan 350Z	393
2002 Nissan Skyline GT-R V-Spec II (R34)	Retro Sports Cars	Autoshow	Launch	Nissan GT-R R34	394
2000 Nissan Silvia Spec-R	Retro Sports Cars	Autoshow	Launch	Nissan Silvia	1449
1998 Nissan Silvia K's Aero	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan Silvia '98	1450
1998 Nissan R390	Extreme Track Toys	Autoshow, Wheelspin	Launch	Nissan R390	1448
1997 Nissan Skyline GT-R V-Spec (R33)	Retro Sports Cars	Autoshow	Launch	Nissan GT-R R33	484
1994 Nissan 240SX SE	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan 240SX	1456
1994 Nissan Fairlady Z Version S Twin Turbo	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan 300ZX	1457
1994 Nissan Silvia K's	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan Silvia '94	1458
1993 Nissan 240SX	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan 240SX '93	1456
1993 Nissan Skyline GT-R V-Spec (R32)	Retro Sports Cars	Autoshow	Launch	Nissan GT-R R32	395
1992 Nissan Silvia Club K's	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan Silvia '92	1458
1990 Nissan Pulsar GTI-R	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Nissan Pulsar	1454
1987 Nissan Skyline GTS-R (R31)	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan Skyline R31	1462
1984 Nissan 300ZX Turbo	Retro Sports Cars	Autoshow, Wheelspin	Launch	Nissan 300ZX '84	1463
1973 Nissan Skyline H/T 2000GT-R	Classic Muscle	Autoshow	Launch	Nissan Skyline	1464
1972 Nissan Datsun 240Z	Classic Sports Cars	Autoshow, Wheelspin	Launch	Datsun 240Z	1104
1971 Nissan Skyline 2000GT-R	Rare Classics	Barn Find	Launch	Nissan Skyline '71	1466
1970 Nissan Datsun 510	Cult Cars	Autoshow, Wheelspin	Launch	Datsun 510	1104
1969 Nissan Fairlady Z 432	Rare Classics	Autoshow, Wheelspin	Launch	Fairlady Z 432	1467
2023 Nissan Z	Modern Sports Cars	Backstage, Seasonal	Series 18	Nissan Z '23	3744
2023 Nissan Z Heritage Edition	Modern Sports Cars	Autoshow DLC	Car Pass	Nissan Z HE	3745
2020 Noble M600	Hypercars	Autoshow, Wheelspin	Launch	Noble M600	3343
2018 Noble M500	Modern Supercars	Autoshow DLC	Hot Wheels Expansion	Noble M500	3291
2006 Noble M400	Modern Supercars	Autoshow, Wheelspin	Launch	Noble M400	1468
1970 Oldsmobile 442 W-30	Classic Muscle	Autoshow, Wheelspin	Launch	Olds 442	1469
1969 Oldsmobile Hurst/Olds 442	Classic Muscle	Autoshow, Wheelspin	Launch	Olds Hurst	1470
1966 Oldsmobile Toronado	Rare Classics	Autoshow, Wheelspin	Launch	Olds Toronado	1471
2014 Opel Adam S	Hot Hatch	Autoshow DLC	Car Pass	Opel Adam S	3389
2012 Opel Astra OPC	Hot Hatch	Autoshow, Wheelspin	Launch	Opel Astra OPC	1472
2004 Opel Astra 1.6 Turbo	Hot Hatch	Autoshow DLC	Car Pass	Opel Astra '04	3390
1984 Opel Manta 400	Retro Rally	Autoshow, Wheelspin	Launch	Opel Manta	1473
1986 Opel Kadett GT/E 16v	Retro Hot Hatch	Autoshow DLC	Car Pass	Opel Kadett	3391
1969 Opel GT	Classic Sports Cars	Autoshow, Wheelspin	Launch	Opel GT	1474
2018 Pagani Huayra Roadster BC	Hypercars	Autoshow DLC	Super Speed Car Pack	Huayra BC	3344
2017 Pagani Huayra BC	Extreme Track Toys	Autoshow, Wheelspin	Launch	Pagani Huayra BC	2813
2016 Pagani Huayra BC	Extreme Track Toys	Autoshow, Wheelspin	Launch	Pagani Huayra BC	2813
2012 Pagani Huayra	Hypercars	Autoshow, Wheelspin	Launch	Pagani Huayra	1571
2009 Pagani Zonda Cinque Roadster	Hypercars	Accolade, Wheelspin	Launch	Pagani Cinque	1476
2009 Pagani Zonda R	Extreme Track Toys	Autoshow DLC	Car Pass	Pagani Zonda R	3383
1999 Pagani Zonda C12	Hypercars	Backstage, Seasonal	Series 13	Pagani Zonda C12	517
1965 Peel P50	Cult Cars	Seasonal	Series 13	Peel P50	2107
1962 Peel Trident	Cult Cars	Seasonal	Series 19	Peel Trident	2107
2013 Penhall 'The Cholla'	Unlimited Offroad	Autoshow, Wheelspin	Launch	Penhall Cholla	1479
2018 Peugeot 308 GTI	Hot Hatch	Autoshow DLC	European Auto Car Pack	Peugeot 308 GTI	3396
1991 Peugeot 205 Rallye	Retro Hot Hatch	Backstage, Seasonal	Series 29	Peugeot 205	1481
1984 Peugeot 205 T16	Rally Monsters	Autoshow, Wheelspin	Launch	Peugeot 205 T16	1480
1971 Plymouth Cuda 426 HEMI	Classic Muscle	Autoshow, Wheelspin	Launch	Plymouth Cuda	1483
1970 Plymouth Superbird	Classic Muscle	Seasonal	Series 29	Superbird	1484
1969 Plymouth Road Runner	Classic Muscle	Autoshow, Wheelspin	Launch	Plymouth Road Runner	1485
1968 Plymouth Barracuda Formula-S	Classic Muscle	Autoshow, Wheelspin	Launch	Plymouth Barracuda	1486
1958 Plymouth Fury	Rods and Customs	Barn Find	Launch	Plymouth Fury	1487
2018 Polaris RZR Turbo S	UTV's	Seasonal	Series 5	Polaris RZR	3111
2017 Polaris RZR XP 1000	UTV's	Autoshow, Wheelspin	Launch	Polaris RZR '17	2870
2020 Porsche Taycan Turbo S	Super Saloons	Autoshow DLC	Car Pass	Porsche Taycan	3501
2019 Porsche 718 Cayman GT4	Track Toys	Backstage, Seasonal	Series 15	718 Cayman GT4	3398
2019 Porsche 718 Cayman GTS	Modern Sports Cars	Autoshow, Wheelspin	Launch	718 Cayman GTS	3253
2019 Porsche 911 Carrera S	Super GT	Autoshow, Wheelspin	Launch	911 Carrera S	3386
2019 Porsche 911 GT3 RS	Track Toys	Autoshow DLC	Car Pass	911 GT3 RS '19	3399
2019 Porsche 911 Speedster	Super GT	Autoshow DLC	Car Pass	911 Speedster	3500
2018 Porsche 911 GT2 RS	Track Toys	Autoshow	Launch	911 GT2 RS '18	2886
2016 Porsche 911 GT3 RS	Track Toys	Autoshow, Wheelspin	Launch	911 GT3 RS '16	2451
2016 Porsche Cayman GT4	Track Toys	Autoshow, Wheelspin	Launch	Porsche Cayman	2525
2015 Porsche Macan Turbo	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Porsche Macan	2402
2015 Porsche Cayman GTS	Modern Sports Cars	Autoshow, Wheelspin	Launch	Porsche Cayman '15	2403
2014 Porsche 918 Spyder	Hypercars	Autoshow, Wheelspin	Launch	Porsche 918	2091
2014 Porsche 911 Turbo S	Super GT	Autoshow, Wheelspin	Launch	911 Turbo S '14	2143
2012 Porsche 911 GT2 RS	Track Toys	Accolade	Launch	911 GT2 RS '12	1605
2012 Porsche 911 GT3 RS 4.0	Track Toys	Autoshow, Wheelspin	Launch	911 GT3 RS '12	1606
2012 Porsche Cayenne Turbo	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Porsche Cayenne	1604
2010 Porsche 911 GT3 RS	Track Toys	Autoshow, Wheelspin	Launch	911 GT3 RS '10	1203
2007 Porsche 911 GT3 RS	Track Toys	Autoshow, Wheelspin	Launch	911 GT3 RS '07	1035
2004 Porsche Carrera GT	Hypercars	Autoshow, Wheelspin	Launch	Porsche Carrera GT	530
2003 Porsche 911 GT2	Retro Supercars	Autoshow, Wheelspin	Launch	911 GT2 '03	400
1998 Porsche 911 GT1 Strassenversion	Extreme Track Toys	Autoshow, Wheelspin	Launch	911 GT1	548
1995 Porsche 911 GT2	Retro Supercars	Autoshow, Wheelspin	Launch	911 GT2 '95	517
1993 Porsche 968 Turbo S	Retro Sports Cars	Autoshow DLC	Car Pass	968 Turbo S	3503
1989 Porsche 944 Turbo	Retro Sports Cars	Autoshow, Wheelspin	Launch	Porsche 944	504
1987 Porsche 959	Rally Monsters	Autoshow, Wheelspin	Launch	Porsche 959	1044
1982 Porsche 911 Turbo 3.3	Retro Supercars	Autoshow, Wheelspin	Launch	911 Turbo '82	490
1973 Porsche 911 Carrera RS	Classic Sports Cars	Autoshow, Wheelspin	Launch	911 Carrera RS	491
1970 Porsche 914/6	Classic Sports Cars	Autoshow, Wheelspin	Launch	Porsche 914/6	1611
1960 Porsche 718 RS 60	Classic Racers	Barn Find	Launch	Porsche 718 RS	1612
1957 Porsche 356A Speedster	Classic Sports Cars	Autoshow, Wheelspin	Launch	Porsche 356A	492
1955 Porsche 550 Spyder	Classic Racers	Autoshow, Wheelspin	Launch	Porsche 550	1613
1979 Pontiac Firebird Trans Am	Classic Muscle	Autoshow, Wheelspin	Launch	Pontiac Trans Am	1499
1977 Pontiac Firebird Trans Am	Classic Muscle	Autoshow, Wheelspin	Launch	Pontiac Trans Am	1500
1973 Pontiac Firebird Trans Am SD-455	Classic Muscle	Autoshow, Wheelspin	Launch	Pontiac Trans Am	1501
1969 Pontiac GTO	Classic Muscle	Autoshow, Wheelspin	Launch	Pontiac GTO	1502
1969 Pontiac Firebird Trans Am	Classic Muscle	Autoshow, Wheelspin	Launch	Pontiac Trans Am	1503
1965 Pontiac GTO	Classic Muscle	Autoshow, Wheelspin	Launch	Pontiac GTO	1504
1987 Pontiac Fiero GT	Retro Sports Cars	Autoshow, Wheelspin	Launch	Pontiac Fiero	1505
2020 RAM 1500 TRX	Pickups & 4x4s	Backstage, Seasonal	Series 4	RAM 1500 TRX	3386
2017 RAM 2500 Power Wagon	Pickups & 4x4s	Autoshow, Wheelspin	Launch	RAM 2500	2763
2015 RAM 1500 Rebel TRX Concept	Pickups & 4x4s	Autoshow, Wheelspin	Launch	RAM 1500 Rebel	2437
2017 Radical RXC Turbo	Extreme Track Toys	Autoshow, Wheelspin	Launch	Radical RXC	2767
2019 Radical Rapture	Extreme Track Toys	Accolade	Horizon Realms	Radical Rapture	3636
2019 Renault Megane R.S. Trophy	Super Hot Hatch	Autoshow DLC	European Auto Car Pack	Megane RS Trophy	3451
2018 Renault Megane R.S.	Super Hot Hatch	Autoshow, Wheelspin	Launch	Renault Megane RS	3090
2010 Renault Clio R.S.	Hot Hatch	Autoshow, Wheelspin	Launch	Renault Clio RS	1202
2003 Renault Sport Clio V6	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Renault Clio V6	1512
1980 Renault 5 Turbo	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Renault 5 Turbo	1513
1973 Renault Alpine A110 1600s	Classic Rally	Autoshow	Launch	Renault A110	1536
2020 Rimac Nevera	Hypercars	Backstage, Seasonal	Series 24	Rimac Nevera	3638
2019 Rimac Concept Two	Hypercars	Autoshow, Wheelspin	Launch	Rimac C_Two	3305
2023 Rivian R1S	Sports Utility Heroes	Seasonal	Series 39	Rivian R1S	3870
2023 Rivian R1T	Pickups & 4x4s	Seasonal	Series 39	Rivian R1T	3871
1953 Rolls-Royce Silver Dawn	Rare Classics	Autoshow, Wheelspin	Launch	Rolls-Royce	1515
2009 Saleen S7 LM	Extreme Track Toys	Seasonal	Series 33	Saleen S7 LM	3403
2004 Saleen S7	Retro Supercars	Autoshow, Wheelspin	Launch	Saleen S7	1517
2010 Saleen S5S Raptor	Track Toys	Seasonal	Series 40	Saleen S5S	1518
1996 Saleen S281	Retro Muscle	Autoshow DLC	American Auto Car Pack	Saleen S281	3464
1991 Saleen Mustang SC	Retro Muscle	Autoshow DLC	American Auto Car Pack	Saleen Mustang	3465
2017 SEAT Leon Cupra ST 300	Super Hot Hatch	Backstage, Seasonal	Series 34	SEAT Leon ST	3069
2016 SEAT Leon Cupra	Super Hot Hatch	Autoshow, Wheelspin	Launch	SEAT Leon Cupra	2513
2018 Shelby 1000	Modern Muscle	Backstage, Seasonal	Series 13	Shelby 1000	3111
1965 Shelby Cobra Daytona Coupe	Classic Racers	Autoshow	Launch	Cobra Daytona	654
1965 Shelby Cobra 427 S/C	Classic Sports Cars	Autoshow, Wheelspin	Launch	Shelby Cobra	559
1967 Shelby GT500	Classic Muscle	Autoshow, Wheelspin	Launch	Shelby GT500	648
1999 Shelby Series 1	Retro Muscle	Autoshow, Wheelspin	Launch	Shelby Series 1	649
2011 Shelby Super Snake	Modern Muscle	Autoshow, Wheelspin	Launch	Super Snake '11	3249
2013 Shelby GT500	Modern Muscle	Autoshow, Wheelspin	Launch	Shelby GT500 '13	3232
2016 Shelby GT350R	Track Toys	Autoshow, Wheelspin	Launch	Ford Mustang '16	2400
2022 Singer DLS	Modern Supercars	Backstage, Seasonal	Series 38	Singer DLS	3767
2022 Singer DLS Turbo	Modern Supercars	Seasonal	Series 40	Singer DLS Turbo	3768
2016 Spania GTA Spano	Hypercars	Backstage, Seasonal	Series 6	GTA Spano	2462
2007 SSC Ultimate Aero	Hypercars	Seasonal	Series 29	SSC Ultimate	1519
2020 SSC Tuatara	Hypercars	Backstage, Seasonal	Series 21	SSC Tuatara	3640
2020 Subaru Impreza WRX STI	Super Hot Hatch	Backstage, Seasonal	Series 43	Subaru WRX '20	3474
2019 Subaru STI S209	Super Hot Hatch	Autoshow, Wheelspin	Launch	Subaru S209	3218
2018 Subaru BRZ tS	Modern Sports Cars	Autoshow, Wheelspin	Launch	Subaru BRZ tS	3053
2015 Subaru WRX STI	Super Hot Hatch	Autoshow, Wheelspin	Launch	Subaru WRX STI	2413
2011 Subaru WRX STI	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Subaru Impreza	1357
2008 Subaru Impreza WRX STI	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Subaru Impreza	1099
2005 Subaru Impreza WRX STI	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Subaru Impreza	438
2004 Subaru Impreza WRX STI	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Subaru Impreza	438
1998 Subaru Impreza 22B STi	Retro Hot Hatch	Autoshow	Launch	Subaru 22B	528
1990 Subaru Legacy RS	Retro Rally	Autoshow, Wheelspin	Launch	Subaru Legacy	1520
2017 Subaru #199 WRX STI VT17x	Rally Monsters	Autoshow, Wheelspin	Launch	#199 Subaru WRX	2806
1988 Suzuki Escudo Pikes Peak Special	Rally Monsters	Backstage, Seasonal	Series 9	Suzuki PP	3424
1981 Suzuki SJ413	Pickups & 4x4s	Autoshow DLC	Rally Adventure Expansion	Suzuki SJ413	3697
1979 Suzuki Whizzkid	Buggies	Autoshow DLC	Rally Adventure Expansion	Suzuki Whizzkid	3698
1985 Suzuki Samurai	Pickups & 4x4s	Autoshow DLC	Rally Adventure Expansion	Suzuki Samurai	3699
1986 Talbot Sunbeam Lotus	Retro Rally	Backstage, Seasonal	Series 34	Talbot Sunbeam	3508
2018 Tamo Racemo	Modern Sports Cars	Seasonal	Series 31	Tamo Racemo	3098
2023 Toyota GR Corolla	Super Hot Hatch	Backstage, Seasonal	Series 30	GR Corolla '23	3874
2022 Toyota GR86	Modern Sports Cars	Backstage, Seasonal	Series 23	Toyota GR86	3759
2021 Toyota Tundra TRD Pro	Pickups & 4x4s	Backstage, Seasonal	Series 23	Tundra TRD '21	3759
2020 Toyota GR Yaris	Super Hot Hatch	Seasonal	Series 1	Toyota GR Yaris	3473
2020 Toyota GR Supra	Modern Sports Cars	Autoshow, Wheelspin	Launch	Toyota Supra	3061
2019 Toyota Tacoma TRD Pro	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Toyota Tacoma	3220
1998 Toyota Supra RZ	Retro Sports Cars	Autoshow	Launch	Toyota Supra '98	524
1995 Toyota MR2 GT	Retro Sports Cars	Autoshow, Wheelspin	Launch	Toyota MR2	1522
1994 Toyota Celica GT-Four ST205	Retro Rally	Autoshow	Launch	Toyota Celica	434
1992 Toyota Supra 2.0 GT Twin Turbo	Retro Sports Cars	Autoshow, Wheelspin	Launch	Toyota Supra '92	1523
1992 Toyota Celica GT-Four RC ST185	Retro Rally	Autoshow	Launch	Toyota Celica '92	1524
1989 Toyota MR2 SC	Retro Sports Cars	Autoshow, Wheelspin	Launch	Toyota MR2 '89	1525
1985 Toyota Sprinter Trueno GT Apex	Retro Sports Cars	Autoshow	Launch	Toyota AE86	435
1974 Toyota Celica GT	Retro Sports Cars	Autoshow, Wheelspin	Launch	Toyota Celica '74	1526
1969 Toyota 2000GT	Classic Sports Cars	Barn Find	Launch	Toyota 2000GT	1527
1979 Toyota FJ40	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Toyota FJ40	2523
1989 Toyota Land Cruiser FJ62	Pickups & 4x4s	Autoshow DLC	JDM Jewels Car Pack	Land Cruiser FJ62	3859
1973 Toyota Hilux LN-65 Baja	Offroad	Autoshow DLC	Rally Adventure Expansion	Toyota Hilux '73	3701
1993 Toyota #1 T100 Baja Truck	Offroad	Autoshow DLC	Rally Adventure Expansion	#1 Toyota T100	3702
2020 Toyota T100 'Baja Edition'	Offroad	Autoshow DLC	Rally Adventure Expansion	Toyota T100	3700
1974 Triumph Spitfire 1500	Classic Sports Cars	Autoshow, Wheelspin	Launch	Triumph Spitfire	1528
1970 Triumph TR6	Classic Sports Cars	Autoshow, Wheelspin	Launch	Triumph TR6	1528
1961 Triumph TR3A	Classic Sports Cars	Autoshow, Wheelspin	Launch	Triumph TR3A	1528
1998 TVR Cerbera Speed 12	Extreme Track Toys	Autoshow, Wheelspin	Launch	TVR Cerbera	1533
2018 TVR Griffith	Modern Sports Cars	Autoshow DLC	Car Pass	TVR Griffith	3296
2005 TVR Sagaris	Retro Supercars	Autoshow, Wheelspin	Launch	TVR Sagaris	432
2001 TVR Tuscan S	Retro Sports Cars	Autoshow, Wheelspin	Launch	TVR Tuscan	1535
1966 Vauxhall Lotus Carlton	Retro Saloons	Autoshow, Wheelspin	Launch	Lotus Carlton	1560
2015 Vauxhall Corsa VXR	Hot Hatch	Autoshow, Wheelspin	Launch	Vauxhall Corsa	2442
2012 Vauxhall Astra VXR	Hot Hatch	Autoshow, Wheelspin	Launch	Vauxhall Astra	1541
2004 Vauxhall VX220 Turbo	Modern Sports Cars	Autoshow, Wheelspin	Launch	Vauxhall VX220	1542
2022 Volkswagen Golf R	Super Hot Hatch	Backstage, Seasonal	Series 39	Golf R '22	3879
2021 Volkswagen ID.4	Sports Utility Heroes	Autoshow DLC	European Auto Car Pack	Volkswagen ID.4	3729
2019 Volkswagen Beetle	Cult Cars	Autoshow DLC	Car Pass	VW Beetle '19	3429
2014 Volkswagen Golf R	Super Hot Hatch	Autoshow, Wheelspin	Launch	Golf R '14	2138
2010 Volkswagen Golf R	Super Hot Hatch	Autoshow, Wheelspin	Launch	Golf R '10	1197
2008 Volkswagen Touareg R50	Sports Utility Heroes	Autoshow, Wheelspin	Launch	Touareg R50	1545
2003 Volkswagen Golf R32	Hot Hatch	Autoshow, Wheelspin	Launch	Golf R32	1546
1995 Volkswagen Corrado VR6	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Corrado VR6	1547
1992 Volkswagen Golf Gti VR6 Mk3	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Golf GTI VR6	1548
1984 Volkswagen Golf GTI Mk2	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Golf GTI Mk2	1549
1983 Volkswagen Golf GTI	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Golf GTI '83	1550
1981 Volkswagen Scirocco S	Retro Hot Hatch	Autoshow, Wheelspin	Launch	Scirocco S	1551
1970 Volkswagen Karmann Ghia	Cult Cars	Autoshow, Wheelspin	Launch	Karmann Ghia	1552
1969 Volkswagen Baja Bug	Buggies	Autoshow DLC	Rally Adventure Expansion	Baja Bug '69	3707
1967 Volkswagen Beetle	Cult Cars	Autoshow, Wheelspin	Launch	Beetle '67	1553
1963 Volkswagen Type 2 De Luxe	Vans & Utility	Autoshow, Wheelspin	Launch	Type 2 De Luxe	1554
1963 Volkswagen Beetle	Cult Cars	Autoshow, Wheelspin	Launch	Beetle '63	1555
2018 Volkswagen I.D. R	Extreme Track Toys	Seasonal	Series 13	VW I.D. R	3102
1987 Volkswagen Scirocco 16v	Retro Hot Hatch	Seasonal	Series 40	Scirocco 16v	3880
2018 Volkswagen Golf GTI SE	Hot Hatch	Autoshow, Wheelspin	Launch	Golf GTI SE	3062
2015 Volvo V60 Polestar	Super Saloons	Autoshow, Wheelspin	Launch	V60 Polestar	2278
1997 Volvo 850 R	Retro Saloons	Autoshow, Wheelspin	Launch	Volvo 850 R	1556
1983 Volvo 242 Turbo	Retro Saloons	Autoshow, Wheelspin	Launch	Volvo 242	1557
1972 Volvo 1800E	Classic Sports Cars	Autoshow, Wheelspin	Launch	Volvo 1800E	1558
1983 Volvo 240 GL Estate	Retro Saloons	Seasonal	Series 31	240 GL Estate	3441
2019 Volvo S60 Polestar	Super Saloons	Autoshow DLC	Car Pass	S60 Polestar	3435
2016 VUHL 05RR	Track Toys	Accolade	Launch	VUHL 05RR	2814
2014 VUHL 05	Track Toys	Autoshow, Wheelspin	Launch	VUHL 05	2815
2018 W Motors Fenyr SuperSport	Hypercars	Autoshow, Wheelspin	Launch	Fenyr SS	2981
2016 W Motors Lykan HyperSport	Hypercars	Backstage, Seasonal	Series 33	Lykan HS	2617
1945 Willys MB Jeep	Pickups & 4x4s	Autoshow, Wheelspin	Launch	Willys Jeep	1559
1941 Willys Coupe	Rods and Customs	Autoshow, Wheelspin	Launch	Willys Coupe	1560
2020 Zenvo TSR-S	Extreme Track Toys	Autoshow, Wheelspin	Launch	Zenvo TSR-S	3348
2016 Zenvo TS1	Hypercars	Backstage, Seasonal	Series 13	Zenvo TS1	2621`;

// Parse all cars from raw data and merge with imported data
function buildCarDatabase(): FH5Car[] {
  const lines = rawCarData.trim().split('\n');
  const carMap = new Map<string, FH5Car>();
  
  // 1. First load imported cars (they have high quality data)
  for (const car of importedCars) {
    carMap.set(car.id, car);
  }
  
  // 2. Supplement with raw data for missing cars
  const seenIds = new Set<string>(carMap.keys());
  
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 5) continue;
    
    const [fullName, carType, , , nickname, idStr] = parts;
    const { year, make, model } = parseCarName(fullName);
    
    // Generate ID
    const baseId = generateCarId(year, make, model);
    let id = baseId;
    
    // If we already have this exact ID from imports, skip this raw entry
    if (carMap.has(id)) {
      continue;
    }
    
    // Handle collision for non-imported cars
    let counter = 1;
    while (seenIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    seenIds.add(id);
    
    // Get base specs from car type
    const specs = typeSpecs[carType] || typeSpecs['Modern Sports Cars'];
    
    // Slight variations based on year for more realistic specs
    const weightVariation = Math.floor((Math.random() - 0.5) * 200);
    const piVariation = Math.floor((Math.random() - 0.5) * 30);
    
    // Ensure weight never goes below 1000 lbs (minimum safe weight)
    const finalWeight = Math.max(1000, specs.weight + weightVariation);
    
    carMap.set(id, {
      id,
      make,
      model,
      year,
      weight: finalWeight,
      weightDistribution: specs.distribution + Math.floor((Math.random() - 0.5) * 4),
      driveType: specs.driveType,
      defaultPI: Math.max(100, Math.min(998, specs.pi + piVariation)),
      category: specs.category,
      carType,
      nickname: nickname || undefined,
      fh5Id: parseInt(idStr) || undefined
    });
  }
  
  return Array.from(carMap.values());
}

// Export the complete car database
export const fh5Cars: FH5Car[] = buildCarDatabase();

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
    const searchString = `${car.make} ${car.model} ${car.year} ${car.nickname || ''} ${car.carType || ''}`.toLowerCase();
    return searchString.includes(lowerQuery);
  }).slice(0, 30); // Limit to 30 results for performance
}

// Get car display name
export function getCarDisplayName(car: FH5Car): string {
  return `${car.year} ${car.make} ${car.model}`;
}

// Get car by ID
export function getCarById(id: string): FH5Car | undefined {
  return fh5Cars.find(car => car.id === id);
}

// Get cars by category
export function getCarsByCategory(category: FH5Car['category']): FH5Car[] {
  return fh5Cars.filter(car => car.category === category);
}

// Get all unique car types
export function getUniqueCarTypes(): string[] {
  const types = new Set(fh5Cars.map(car => car.carType).filter(Boolean) as string[]);
  return Array.from(types).sort();
}

// Get total car count
export function getTotalCarCount(): number {
  return fh5Cars.length;
}
