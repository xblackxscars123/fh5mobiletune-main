import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function normalizeKeyPart(s) {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildVerifiedKey(year, make, model) {
  const key = `${year}-${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return key;
}

function extractIdentityFromRawText(rawTextSample, fallbackIdentity) {
  const t = String(rawTextSample || '').replace(/\u00a0/g, ' ');

  // Typical block:
  // " 2001 Acura\n\nIntegra Type-R\n\nadd_a_photo"
  const m1 = t.match(/\n\s*(19\d{2}|20\d{2})\s+([^\n]+)\n\n([^\n]+)\n\nadd_a_photo/i);
  if (m1) {
    return {
      year: m1[1].trim(),
      make: m1[2].trim(),
      model: m1[3].trim(),
    };
  }

  // Fallback: "YEAR MAKE" then a header-like line
  const m2 = t.match(/\n\s*(19\d{2}|20\d{2})\s+([^\n]+)\n\n([^\n]+)\n/i);
  if (m2) {
    return {
      year: m2[1].trim(),
      make: m2[2].trim(),
      model: m2[3].trim(),
    };
  }

  return {
    year: fallbackIdentity?.year ?? null,
    make: fallbackIdentity?.make ?? null,
    model: fallbackIdentity?.model ?? null,
  };
}

function readExistingKeys(tsContent) {
  const keys = new Set();
  const re = /\n\s*'([^']+)'\s*:\s*\{/g;
  let m;
  while ((m = re.exec(tsContent))) {
    keys.add(m[1]);
  }
  return keys;
}

function formatEntry(key, { weight, weightDistribution, driveType, defaultPI, notes }) {
  // Keep formatting consistent with existing file
  const safeNotes = String(notes).replace(/'/g, "\\'");
  return `  '${key}': {\n` +
    `    weight: ${weight},\n` +
    `    weightDistribution: ${weightDistribution},\n` +
    `    driveType: '${driveType}',\n` +
    `    defaultPI: ${defaultPI},\n` +
    `    notes: '${safeNotes}',\n` +
    `  },`;
}

function main() {
  const args = process.argv.slice(2);
  const inJson = args[0] || 'kp-all.json';
  const targetTs = args[1] || path.join('src', 'data', 'verifiedCarSpecs.ts');

  const jsonPath = path.resolve(inJson);
  const tsPath = path.resolve(targetTs);

  if (!fs.existsSync(jsonPath)) {
    console.error(`Input JSON not found: ${jsonPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(tsPath)) {
    console.error(`Target TS not found: ${tsPath}`);
    process.exit(1);
  }

  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const ts = fs.readFileSync(tsPath, 'utf8');
  const existingKeys = readExistingKeys(ts);

  const items = Array.isArray(json.items) ? json.items : [];

  const newEntries = [];
  const warnings = [];

  for (const item of items) {
    const identity = extractIdentityFromRawText(item?.rawTextSample, item?.identity);
    const year = identity?.year;
    const make = identity?.make;
    const model = identity?.model;

    if (!year || !make || !model) {
      warnings.push({ id: item?.id, url: item?.url, reason: 'Missing identity fields', identity });
      continue;
    }

    const key = buildVerifiedKey(year, make, model);
    if (!key) continue;
    if (existingKeys.has(key)) continue;

    const specs = item?.specs || {};
    const weight = Number.isFinite(Number(specs.weightLbs)) ? Math.round(Number(specs.weightLbs)) : null;
    const defaultPI = Number.isFinite(Number(specs.defaultPI)) ? Number(specs.defaultPI) : null;
    const driveType = specs.driveType;

    if (!weight || !defaultPI || !driveType) {
      warnings.push({ id: item?.id, url: item?.url, reason: 'Missing required spec fields', extracted: { weight, defaultPI, driveType }, identity });
      continue;
    }

    newEntries.push({
      key,
      entry: {
        weight,
        weightDistribution: 50,
        driveType,
        defaultPI,
        notes: 'Verified via KudosPrime (weight/drive/PI); weight distribution not provided',
      },
    });
    existingKeys.add(key);
  }

  newEntries.sort((a, b) => a.key.localeCompare(b.key));

  const insertionPoint = ts.lastIndexOf('\n};');
  if (insertionPoint === -1) {
    console.error('Could not find end of verifiedSpecs object ("\n};") in target TS file.');
    process.exit(1);
  }

  const before = ts.slice(0, insertionPoint);
  const after = ts.slice(insertionPoint);

  const formatted = newEntries.map((e) => formatEntry(e.key, e.entry)).join('\n');
  const injected = formatted ? `${before}\n${formatted}\n${after}` : ts;

  fs.writeFileSync(tsPath, injected, 'utf8');

  console.log(`Merged ${newEntries.length} new entries into ${targetTs}`);
  console.log(`Skipped existing entries: ${items.length - newEntries.length - warnings.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (warnings.length) {
    fs.writeFileSync(path.resolve('kp-merge-warnings.json'), JSON.stringify(warnings, null, 2), 'utf8');
    console.log('Wrote kp-merge-warnings.json');
  }
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && import.meta.url === pathToFileURL(executedPath).href) {
  main();
}
