
import fs from 'fs';
import path from 'path';
import { FH5Car } from '../src/types/car';

// Expected CSV Columns (ManteoMax / Standard):
// Year, Make, Model, Type (Division), Rarity, Value, Boost,
// HP, Torque, Weight, Front%, Disp, Cyl, Asp, Drive, Gears,
// F Tire, R Tire, Offroad, Speed, Hand, Accel, Launch, Brake

const CSV_PATH = path.join(process.cwd(), 'cars.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'importedCars.ts');

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

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ File not found: ${CSV_PATH}`);
    console.log("Please download the 'Cars' sheet as CSV and place it in the root directory as 'cars.csv'.");
    process.exit(1);
  }

  console.log(`Reading ${CSV_PATH}...`);
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const rawCars = parseCSV(content);
  
  if (rawCars.length === 0) {
    console.error("❌ No cars found in CSV.");
    process.exit(1);
  }

  // Debug: Print headers found
  console.log("Found columns:", Object.keys(rawCars[0]).join(', '));
  
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
}

main();
