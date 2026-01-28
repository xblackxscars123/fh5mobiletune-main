
import fs from 'fs';
import path from 'path';

// Expected CSV Columns (ManteoMax / Standard):
// Year, Make, Model, Type (Division), Rarity, Value, Boost,
// HP, Torque, Weight, Front%, Disp, Cyl, Asp, Drive, Gears,
// F Tire, R Tire, Offroad, Speed, Hand, Accel, Launch, Brake

const CSV_PATH = path.join(process.cwd(), 'cars.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'importedCars.json');

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

function mapToSchema(raw: any): any {
  // Generate ID
  const id = `${raw.Make}-${raw.Model}-${raw.Year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  return {
    id,
    year: cleanNumber(raw.Year),
    make: raw.Make,
    model: raw.Model,
    fullname: `${raw.Year} ${raw.Make} ${raw.Model}`,
    
    // Specs
    weight: cleanNumber(raw.Weight),
    weightDistribution: cleanNumber(raw.Front) || 50, // Default to 50 if missing
    horsepower: cleanNumber(raw.HP),
    torque: cleanNumber(raw.Torque),
    displacement: cleanNumber(raw.Disp),
    cylinders: cleanNumber(raw.Cyl),
    aspiration: raw.Asp || 'Naturally Aspirated',
    
    // Drivetrain
    driveType: raw.Drive || 'RWD',
    gears: cleanNumber(raw.Gears),
    
    // Tires
    frontTireWidth: cleanNumber(raw.FTire),
    rearTireWidth: cleanNumber(raw.RTire),
    
    // Meta
    piClass: raw.Class,
    pi: cleanNumber(raw.PI),
    carType: raw.Type,
    rarity: raw.Rarity,
    value: cleanNumber(raw.Value),
    boost: raw.Boost
  };
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ File not found: ${CSV_PATH}`);
    console.log("Please place your 'cars.csv' in the root directory.");
    process.exit(1);
  }

  console.log(`Reading ${CSV_PATH}...`);
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const rawCars = parseCSV(content);
  
  console.log(`Found ${rawCars.length} cars. Mapping...`);
  const mappedCars = rawCars.map(mapToSchema);
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mappedCars, null, 2));
  console.log(`✅ Successfully imported ${mappedCars.length} cars to ${OUTPUT_PATH}`);
}

main();
