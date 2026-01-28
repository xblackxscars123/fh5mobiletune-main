
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { FH5Car } from '../src/types/car';

// Expected CSV Columns (ManteoMax / Standard):
// Year, Make, Model, Type (Division), Rarity, Value, Boost,
// HP, Torque, Weight, Front%, Disp, Cyl, Asp, Drive, Gears,
// F Tire, R Tire, Offroad, Speed, Hand, Accel, Launch, Brake

const CSV_PATH = path.join(process.cwd(), 'cars.csv');
const XLSX_PATH = path.join(process.cwd(), "Copy of ManteoMax's Forza HORIZON 5 Spreadsheets.xlsx");
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'importedCars.ts');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';
const SUPABASE_TABLE = process.env.SUPABASE_CAR_TABLE || 'car_calculation_values';

interface RawCar {
  Year: string;
  Make: string;
  Model: string;
  Type: string;
  Rarity: string;
  Value: string;
  Boost: string;
  HP: string;
  Torque: string;
  Weight: string;
  Front: string; // Front %
  Disp: string;
  Cyl: string;
  Asp: string;
  Drive: string;
  Gears: string;
  FTire: string;
  RTire: string;
  PI: string;
  Class: string;
  Offroad?: string;
  Speed?: string;
  Hand?: string;
  Accel?: string;
  Launch?: string;
  Brake?: string;
  Eng?: string;
  Config?: string;
  Region?: string;
  Country?: string;
  'Model Family'?: string;
  'Open Top'?: string;
}

function parseCSV(content: string): RawCar[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const cars: RawCar[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted values containing commas
    const row: string[] = [];
    let inQuote = false;
    let current = '';
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());

    if (row.length < headers.length) continue;

    const car: any = {};
    headers.forEach((h, idx) => {
      car[h] = row[idx]?.replace(/"/g, '');
    });
    cars.push(car);
  }
  return cars;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeRow(row: Record<string, unknown>): RawCar {
  const headerMap: Record<string, keyof RawCar> = {
    year: 'Year',
    make: 'Make',
    model: 'Model',
    type: 'Type',
    cartype: 'Type',
    division: 'Type',
    rarity: 'Rarity',
    value: 'Value',
    boost: 'Boost',
    hp: 'HP',
    horsepower: 'HP',
    power: 'HP',
    torque: 'Torque',
    tq: 'Torque',
    weight: 'Weight',
    weightlbs: 'Weight',
    front: 'Front',
    frontpercent: 'Front',
    frontweight: 'Front',
    frontweightpercent: 'Front',
    weightdistribution: 'Front',
    disp: 'Disp',
    displacement: 'Disp',
    cyl: 'Cyl',
    cylinders: 'Cyl',
    asp: 'Asp',
    aspiration: 'Asp',
    drive: 'Drive',
    drivetrain: 'Drive',
    gears: 'Gears',
    gearcount: 'Gears',
    fronttire: 'FTire',
    ftire: 'FTire',
    fronttirewidth: 'FTire',
    reartire: 'RTire',
    rtire: 'RTire',
    reartirewidth: 'RTire',
    pi: 'PI',
    class: 'Class',
    offroad: 'Offroad',
    speed: 'Speed',
    hand: 'Hand',
    handling: 'Hand',
    accel: 'Accel',
    acceleration: 'Accel',
    launch: 'Launch',
    brake: 'Brake',
    braking: 'Brake',
    eng: 'Eng',
    engine: 'Eng',
    config: 'Config',
    region: 'Region',
    country: 'Country',
    modelfamily: 'Model Family',
    opentop: 'Open Top',
    yearmakemodel: 'Year Make Model',
    nickname: 'Nickname',
    ordinal: 'Ordinal',
    votes: 'Votes',
    topic: 'Topic',
    tags: 'Tags',
    link: 'Link',
    specialaccess: 'Special Access',
    dlcpack: 'DLC Pack',
    spec: 'Spec',
    doors: 'Doors',
    steering: 'Steering',
    wheels: 'Wheels',
    fh5debut: 'FH5 Debut',
    forzadebut: 'Forza Debut',
    newtoforza: 'New to Forza',
    fh5: 'FH5',
    fh4: 'FH4',
    fm7: 'FM7',
    fh3: 'FH3',
    fm6: 'FM6',
    fh2: 'FH2',
    fm5: 'FM5',
    fh1: 'FH1',
    fm4: 'FM4',
    fm3: 'FM3',
    fm2: 'FM2',
    fm1: 'FM1',
    titles: '# Titles',
  };

  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const target = headerMap[normalizeKey(key)];
    if (target) {
      mapped[target] = String(value ?? '');
    }
  }
  return mapped as RawCar;
}

function parseXlsx(filePath: string): RawCar[] {
  const xlsxModule = (XLSX as unknown as { default?: typeof XLSX }).default ?? XLSX;
  const workbook = xlsxModule.readFile(filePath);
  const sheetName =
    workbook.SheetNames.find(name => normalizeKey(name).includes('car')) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsxModule.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return rows.map(normalizeRow);
}

function cleanNumber(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function mapToSchema(raw: RawCar): FH5Car {
  // Generate ID
  const id = `${raw.Make}-${raw.Model}-${raw.Year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  const linkSet = new Set<string>();
  for (const v of Object.values(raw)) {
    const s = String(v || '');
    if (s.startsWith('http://') || s.startsWith('https://')) {
      linkSet.add(s);
    } else if (s.startsWith('www.')) {
      linkSet.add(`https://${s}`);
    }
  }
  const links = Array.from(linkSet);

  return {
    id,
    year: cleanNumber(raw.Year),
    make: raw.Make,
    model: raw.Model,
    
    // Specs
    weight: cleanNumber(raw.Weight),
    weightDistribution: normalizeDistribution(raw.Front),
    horsepower: cleanNumber(raw.HP),
    torque: cleanNumber(raw.Torque),
    displacement: cleanNumber(raw.Disp),
    cylinders: cleanNumber(raw.Cyl),
    aspiration: raw.Asp || 'Naturally Aspirated',
    
    // Drivetrain
    driveType: raw.Drive || 'RWD',
    stockGearCount: cleanNumber(raw.Gears),
    
    // Tires
    frontTireWidth: cleanNumber(raw.FTire),
    rearTireWidth: cleanNumber(raw.RTire),
    
    // Meta
    piClass: raw.Class,
    defaultPI: cleanNumber(raw.PI),
    category: mapCategory(raw.Type),
    carType: raw.Type,
    rarity: raw.Rarity,
    value: cleanNumber(raw.Value),
    boost: raw.Boost,
    enginePlacement: normalizePlacement(raw.Eng),
    engineConfig: raw.Config || undefined,
    region: raw.Region || undefined,
    country: raw.Country || undefined,
    modelFamily: raw['Model Family'] || undefined,
    openTop: normalizeOpenTop(raw['Open Top']),
    links: links.length ? links : undefined,

    // Stats
    stats: {
      speed: cleanNumber(raw.Speed),
      handling: cleanNumber(raw.Hand),
      acceleration: cleanNumber(raw.Accel),
      launch: cleanNumber(raw.Launch),
      braking: cleanNumber(raw.Brake),
      offroad: cleanNumber(raw.Offroad)
    },
    shub: {
      yearMakeModel: raw['Year Make Model'] || undefined,
      nickname: raw['Nickname'] || undefined,
      ordinal: cleanNumber(raw['Ordinal'] || ''),
      votes: cleanNumber(raw['Votes'] || ''),
      topic: raw['Topic'] || undefined,
      tags: raw['Tags'] || undefined,
      link: raw['Link'] || undefined,
      specialAccess: raw['Special Access'] || undefined,
      dlcPack: raw['DLC Pack'] || undefined,
      spec: raw['Spec'] || undefined,
      doors: raw['Doors'] || undefined,
      steering: raw['Steering'] || undefined,
      wheels: raw['Wheels'] || undefined,
      fh5Debut: raw['FH5 Debut'] || undefined,
      forzaDebut: raw['Forza Debut'] || undefined,
      newToForza: raw['New to Forza'] || undefined,
      appearances: {
        fh5: raw['FH5'] || undefined,
        fh4: raw['FH4'] || undefined,
        fm7: raw['FM7'] || undefined,
        fh3: raw['FH3'] || undefined,
        fm6: raw['FM6'] || undefined,
        fh2: raw['FH2'] || undefined,
        fm5: raw['FM5'] || undefined,
        fh1: raw['FH1'] || undefined,
        fm4: raw['FM4'] || undefined,
        fm3: raw['FM3'] || undefined,
        fm2: raw['FM2'] || undefined,
        fm1: raw['FM1'] || undefined,
        titlesCount: cleanNumber(raw['# Titles'] || '')
      }
    }
  };
}

function normalizeDistribution(val: string): number {
  const num = cleanNumber(val);
  if (num > 0 && num < 1) return num * 100;
  return num || 50;
}

function mapCategory(type: string): FH5Car['category'] {
  // Simple mapping, default to 'modern'
  const t = (type || '').toLowerCase();
  if (t.includes('retro')) return 'retro';
  if (t.includes('classic')) return 'classic';
  if (t.includes('rally')) return 'rally';
  if (t.includes('offroad') || t.includes('buggy')) return 'offroad';
  if (t.includes('truck') || t.includes('pickup')) return 'truck';
  if (t.includes('drift')) return 'drift';
  if (t.includes('super')) return 'super';
  if (t.includes('hyper')) return 'hyper';
  if (t.includes('muscle')) return 'muscle';
  if (t.includes('gt')) return 'gt';
  if (t.includes('hot hatch')) return 'hot-hatch';
  return 'modern';
}

function normalizePlacement(val?: string): 'Front' | 'Mid' | 'Rear' | undefined {
  const t = String(val || '').toLowerCase();
  if (t.includes('front')) return 'Front';
  if (t.includes('mid')) return 'Mid';
  if (t.includes('rear')) return 'Rear';
  return undefined;
}

function normalizeOpenTop(val?: string): boolean | undefined {
  const t = String(val || '').toLowerCase();
  if (!t) return undefined;
  if (['yes', 'true', 'open', 'y'].some(x => t.includes(x))) return true;
  if (['no', 'false', 'closed', 'n'].some(x => t.includes(x))) return false;
  return undefined;
}

async function importToSupabase(cars: FH5Car[]) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY.');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const rows = cars.map(car => ({
    id: car.id,
    year: car.year,
    make: car.make,
    model: car.model,
    car_name: `${car.year} ${car.make} ${car.model}`,
    weight: car.weight,
    weight_distribution: car.weightDistribution,
    drive_type: car.driveType,
    pi_class: car.piClass,
    default_pi: car.defaultPI,
    horsepower: car.horsepower ?? null,
    torque: car.torque ?? null,
    displacement: car.displacement ?? null,
    gear_count: car.stockGearCount ?? null,
    front_tire_width: car.frontTireWidth ?? null,
    rear_tire_width: car.rearTireWidth ?? null,
    rarity: car.rarity ?? null,
    value: car.value ?? null,
    boost: car.boost ?? null,
    stats: car.stats ?? null,
  }));
  const { error } = await supabase.from(SUPABASE_TABLE).upsert(rows);
  if (error) {
    console.error('❌ Supabase import failed:', error.message);
    process.exit(1);
  }
  console.log(`✅ Supabase import complete (${rows.length} rows) to ${SUPABASE_TABLE}`);
}

async function main() {
  const hasXlsx = fs.existsSync(XLSX_PATH);
  const hasCsv = fs.existsSync(CSV_PATH);
  if (!hasXlsx && !hasCsv) {
    console.error(`❌ File not found: ${XLSX_PATH} or ${CSV_PATH}`);
    process.exit(1);
  }

  const rawCars = hasXlsx ? parseXlsx(XLSX_PATH) : parseCSV(fs.readFileSync(CSV_PATH, 'utf-8'));
  
  if (rawCars.length === 0) {
    console.error('❌ No cars found in input.');
    process.exit(1);
  }

  console.log('Found columns:', Object.keys(rawCars[0]).join(', '));
  
  console.log(`Found ${rawCars.length} cars. Mapping...`);
  const mappedCars = rawCars.map(mapToSchema);
  
  const ts = [
    "import { FH5Car } from '../types/car';",
    "",
    "export const importedCars: FH5Car[] = ",
    JSON.stringify(mappedCars, null, 2),
    ";"
  ].join('\n');
  fs.writeFileSync(OUTPUT_PATH, ts);
  console.log(`✅ Successfully imported ${mappedCars.length} cars to ${OUTPUT_PATH}`);

  if (process.env.IMPORT_TO_SUPABASE === 'true') {
    await importToSupabase(mappedCars);
  }
}

main();
