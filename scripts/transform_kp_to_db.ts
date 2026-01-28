
import fs from 'fs';
import path from 'path';
import { FH5Car } from '../src/types/car';

// Types for the input JSON (kp-all.json)
interface KPIdentity {
  year: string | null;
  make: string | null;
  model: string | null;
}

interface KPSpecs {
  defaultPI: number | null;
  piClass: string | null;
  driveType: string | null;
  weightLbs: number | null;
  weightDistribution: number | null;
}

interface KPItem {
  id: string;
  url: string;
  identity: KPIdentity;
  specs: KPSpecs;
  rawTextSample: string;
}

interface KPData {
  generatedAt: string;
  source: string;
  game: string;
  items: KPItem[];
}

const INPUT_PATH = path.join(process.cwd(), 'kp-all.json');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'importedCars.ts');

function cleanNumber(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function extractStats(text: string) {
  const stats = {
    speed: 0,
    handling: 0,
    acceleration: 0,
    launch: 0,
    braking: 0,
    offroad: 0
  };

  // Regex for stats (e.g., "5.6SPEED", "4.6HANDLING")
  // Sometimes they have +0.2 etc, we just want the base number
  const patterns = {
    speed: /(\d+\.?\d*)\s*SPEED/i,
    handling: /(\d+\.?\d*)\s*HANDLING/i,
    acceleration: /(\d+\.?\d*)\s*ACCELERATION/i,
    launch: /(\d+\.?\d*)\s*LAUNCH/i,
    braking: /(\d+\.?\d*)\s*BRAKING/i,
    offroad: /(\d+\.?\d*)\s*OFFROAD/i
  };

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex);
    if (match) {
      stats[key as keyof typeof stats] = parseFloat(match[1]);
    }
  }

  return stats;
}

function extractEngineSpecs(text: string) {
  // Example: "145kW FWD 1197Kg 0.121kW/Kg -10.1%"
  // or "522kW AWD 1555Kg"
  
  const specs = {
    horsepower: 0,
    torque: 0,
    weight: 0,
    weightDistribution: 50
  };

  // Power (kW -> HP)
  // 1 kW = 1.34102 HP
  const kwMatch = text.match(/(\d+)\s*kW/i);
  if (kwMatch) {
    specs.horsepower = Math.round(parseInt(kwMatch[1]) * 1.34102);
  }

  // Weight (Kg -> lbs)
  // 1 Kg = 2.20462 lbs
  const kgMatch = text.match(/(\d+)\s*Kg/i);
  if (kgMatch) {
    specs.weight = Math.round(parseInt(kgMatch[1]) * 2.20462);
  }

  // Torque (N-m -> lb-ft) - usually not directly in the short string, but maybe?
  // The sample text doesn't explicitly show Torque in N-m in the summary line.
  // But let's look for "N-m" or "Nm" or "lb-ft"
  const torqueMatch = text.match(/(\d+)\s*(Nm|N-m|lb-ft)/i);
  if (torqueMatch) {
    const val = parseInt(torqueMatch[1]);
    const unit = torqueMatch[2].toLowerCase();
    if (unit.includes('nm') || unit.includes('n-m')) {
      specs.torque = Math.round(val * 0.73756);
    } else {
      specs.torque = val;
    }
  }

  // Weight Distribution
  // Look for front % (e.g. "52%")
  // In the sample: "-10.1%" seems to be weight reduction or something else.
  // Usually distribution is like "Front 52%"
  const distMatch = text.match(/Front\s*(\d+)%/i);
  if (distMatch) {
    specs.weightDistribution = parseInt(distMatch[1]);
  } else {
    // Try to infer from "52%" appearing near weight
    // But be careful.
  }

  return specs;
}

function processItems() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    return;
  }

  const rawData = fs.readFileSync(INPUT_PATH, 'utf-8');
  const data: KPData = JSON.parse(rawData);
  
  const fh5Cars: any[] = []; // Using any temporarily to construct FH5Car

  console.log(`Processing ${data.items.length} items...`);

  for (const item of data.items) {
    if (!item.identity.make || !item.identity.model) continue;

    // Basic Info
    const year = item.identity.year ? parseInt(item.identity.year) : 2020;
    const make = item.identity.make;
    const model = item.identity.model || 'Unknown';
    
    const id = `${make}-${model}-${year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Specs from structured data
    let weight = item.specs.weightLbs || 3000;
    let driveType = (item.specs.driveType as 'RWD' | 'FWD' | 'AWD') || 'RWD';
    let piClass = item.specs.piClass || 'B';
    let defaultPI = item.specs.defaultPI || 500;
    let weightDistribution = item.specs.weightDistribution || 50;

    // Extract additional info from text
    const textStats = extractStats(item.rawTextSample);
    const engineSpecs = extractEngineSpecs(item.rawTextSample);

    // Merge engine specs if missing in structured
    if (!item.specs.weightLbs && engineSpecs.weight > 0) {
      weight = engineSpecs.weight;
    }
    const horsepower = engineSpecs.horsepower || undefined;
    const torque = engineSpecs.torque || undefined;

    // Determine category (simple heuristic)
    let category = 'modern';
    if (year < 1980) category = 'classic';
    if (year < 2000 && year >= 1980) category = 'retro';
    if (item.rawTextSample.toLowerCase().includes('rally')) category = 'rally';
    if (item.rawTextSample.toLowerCase().includes('offroad')) category = 'offroad';
    if (item.rawTextSample.toLowerCase().includes('drift')) category = 'drift';
    if (item.rawTextSample.toLowerCase().includes('track toys')) category = 'track';
    if (item.rawTextSample.toLowerCase().includes('hypercar')) category = 'hyper';
    if (item.rawTextSample.toLowerCase().includes('supercar')) category = 'super';
    if (item.rawTextSample.toLowerCase().includes('muscle')) category = 'muscle';
    if (item.rawTextSample.toLowerCase().includes('truck') || item.rawTextSample.toLowerCase().includes('pickup')) category = 'truck';
    if (item.rawTextSample.toLowerCase().includes('buggy')) category = 'buggy';
    if (item.rawTextSample.toLowerCase().includes('hot hatch')) category = 'hot-hatch';
    if (item.rawTextSample.toLowerCase().includes('gt')) category = 'gt';
    
    // Construct FH5Car
    const car: any = {
      id,
      make,
      model,
      year,
      weight,
      weightDistribution, // Default or extracted
      horsepower,
      torque,
      driveType,
      defaultPI,
      piClass,
      category,
      stats: textStats
    };

    fh5Cars.push(car);
  }

  // Write to file
  const fileContent = `import { FH5Car } from './carDatabase';

export const importedCars: FH5Car[] = ${JSON.stringify(fh5Cars, null, 2)};
`;

  fs.writeFileSync(OUTPUT_PATH, fileContent);
  console.log(`Successfully imported ${fh5Cars.length} cars to ${OUTPUT_PATH}`);
}

processItems();
