import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';

// Robust import for xlsx to handle ESM/CommonJS interop
const xlsxModule = (XLSX && XLSX.default) ? XLSX.default : XLSX;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../Copy of ManteoMax\'s Forza HORIZON 5 Spreadsheets.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../cars_import.csv');

console.log(`Reading from: ${INPUT_FILE}`);

if (!fs.existsSync(INPUT_FILE)) {
  console.error('Error: Input file not found!');
  process.exit(1);
}

const workbook = xlsxModule.readFile(INPUT_FILE);
const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('car')) || workbook.SheetNames[0];
console.log(`Using sheet: ${sheetName}`);

const sheet = workbook.Sheets[sheetName];
const rows = xlsxModule.utils.sheet_to_json(sheet, { defval: '' });

const normalizeKey = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '');

const headerMap = {
  year: 'year',
  make: 'make',
  model: 'model',
  cartype: 'car_type',
  type: 'car_type',
  division: 'car_type',
  class: 'pi_class',
  pi: 'default_pi',
  rarity: 'rarity',
  value: 'value',
  boost: 'boost',
  drive: 'drive_type',
  hp: 'horsepower',
  horsepower: 'horsepower',
  torque: 'torque',
  weight: 'weight',
  weightlbs: 'weight',
  front: 'weight_distribution',
  frontpercent: 'weight_distribution',
  weightdistribution: 'weight_distribution',
  disp: 'displacement',
  displacement: 'displacement',
  gears: 'gear_count',
  gearcount: 'gear_count',
  ftire: 'front_tire_width',
  fronttirewidth: 'front_tire_width',
  rtire: 'rear_tire_width',
  reartirewidth: 'rear_tire_width',
  speed: 'stat_speed',
  handling: 'stat_handling',
  hand: 'stat_handling',
  accel: 'stat_acceleration',
  acceleration: 'stat_acceleration',
  launch: 'stat_launch',
  brake: 'stat_braking',
  braking: 'stat_braking',
  offroad: 'stat_offroad'
};

const cleanNumber = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : '';
};

const out = [];

for (const row of rows) {
  const mapped = {};
  for (const [k, v] of Object.entries(row)) {
    const key = headerMap[normalizeKey(k)];
    if (key) {
      mapped[key] = v;
    }
  }

  if (!mapped.year || !mapped.make || !mapped.model) continue;

  const id = (String(mapped.make) + '-' + String(mapped.model) + '-' + String(mapped.year))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  const carName = String(mapped.year) + ' ' + String(mapped.make) + ' ' + String(mapped.model);
  
  const stats = {
    speed: cleanNumber(mapped.stat_speed),
    handling: cleanNumber(mapped.stat_handling),
    acceleration: cleanNumber(mapped.stat_acceleration),
    launch: cleanNumber(mapped.stat_launch),
    braking: cleanNumber(mapped.stat_braking),
    offroad: cleanNumber(mapped.stat_offroad)
  };

  out.push({
    id,
    year: cleanNumber(mapped.year) || mapped.year,
    make: mapped.make,
    model: mapped.model,
    car_name: carName,
    weight: cleanNumber(mapped.weight),
    weight_distribution: cleanNumber(mapped.weight_distribution),
    drive_type: mapped.drive_type || '',
    pi_class: mapped.pi_class || '',
    default_pi: cleanNumber(mapped.default_pi),
    horsepower: cleanNumber(mapped.horsepower),
    torque: cleanNumber(mapped.torque),
    displacement: cleanNumber(mapped.displacement),
    gear_count: cleanNumber(mapped.gear_count),
    front_tire_width: cleanNumber(mapped.front_tire_width),
    rear_tire_width: cleanNumber(mapped.rear_tire_width),
    rarity: mapped.rarity || '',
    value: cleanNumber(mapped.value),
    boost: mapped.boost || '',
    stats: JSON.stringify(stats)
  });
}

const headers = ['id', 'year', 'make', 'model', 'car_name', 'weight', 'weight_distribution', 'drive_type', 'pi_class', 'default_pi', 'horsepower', 'torque', 'displacement', 'gear_count', 'front_tire_width', 'rear_tire_width', 'rarity', 'value', 'boost', 'stats'];

const escapeCsv = (v) => {
  const s = String(v ?? '');
  if (/["\n,]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
};

const lines = [headers.join(',')];
for (const row of out) {
  lines.push(headers.map(h => escapeCsv(row[h])).join(','));
}

fs.writeFileSync(OUTPUT_FILE, lines.join('\n'));
console.log(`Successfully wrote ${out.length} cars to ${OUTPUT_FILE}`);