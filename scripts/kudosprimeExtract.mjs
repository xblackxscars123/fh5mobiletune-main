import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = {
    ids: null,
    inPath: null,
    range: null,
    start: null,
    end: null,
    outPath: 'kudosprime-verified-specs.json',
    delayMs: 1500,
    headed: false,
    logEvery: 25,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--ids') {
      out.ids = String(args[++i] ?? '');
    } else if (a === '--in') {
      out.inPath = String(args[++i] ?? '');
    } else if (a === '--range') {
      out.range = String(args[++i] ?? '');
    } else if (a === '--start') {
      out.start = Number(args[++i] ?? '');
    } else if (a === '--end') {
      out.end = Number(args[++i] ?? '');
    } else if (a === '--out') {
      out.outPath = String(args[++i] ?? '');
    } else if (a === '--delay-ms') {
      out.delayMs = Number(args[++i] ?? out.delayMs);
    } else if (a === '--headed') {
      out.headed = true;
    } else if (a === '--log-every') {
      out.logEvery = Number(args[++i] ?? out.logEvery);
    }
  }

  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeKeyPart(s) {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildKey({ year, make, model }) {
  return [year, make, model].map(normalizeKeyPart).filter(Boolean).join('-');
}

function firstMatch(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m;
  }
  return null;
}

function extractSpecsFromText(text) {
  const normalized = String(text).replace(/\u00a0/g, ' ');

  const piMatch = firstMatch(normalized, [
    /\b([A-Z])\s*(\d{2,4})\b/, // e.g. D 100
    /\bPI\s*(\d{2,4})\b/i,
  ]);

  const piClass = piMatch?.[1] && /^[A-Z]$/.test(piMatch[1]) ? piMatch[1] : null;
  const defaultPI = piMatch
    ? Number(piMatch[2] ?? piMatch[1])
    : null;

  const driveMatch = firstMatch(normalized, [/\b(AWD|RWD|FWD)\b/]);
  const driveType = driveMatch ? driveMatch[1] : null;

  const weightMatch = firstMatch(normalized, [
    /\b(\d{3,5})\s*(lbs|lb)\b/i,
    /\b(\d{3,5})\s*(kg)\b/i,
  ]);

  let weightLbs = null;
  if (weightMatch) {
    const v = Number(weightMatch[1]);
    const u = String(weightMatch[2]).toLowerCase();
    if (Number.isFinite(v)) {
      weightLbs = u.startsWith('lb') ? v : Math.round((v / 0.45359237) * 10) / 10;
    }
  }

  const wdMatch = firstMatch(normalized, [
    /\b(\d{2})\s*\/\s*(\d{2})\b/, // 54/46
    /\bFront\s*(\d{2})\s*%\s*Rear\s*(\d{2})\s*%\b/i,
  ]);

  const weightDistribution = wdMatch ? `${wdMatch[1]}/${wdMatch[2]}` : null;

  return {
    defaultPI: Number.isFinite(defaultPI) ? defaultPI : null,
    piClass,
    driveType,
    weightLbs,
    weightDistribution,
  };
}

function extractCarIdentityFromText(text) {
  const normalized = String(text).replace(/\u00a0/g, ' ');

  const ymMatch = normalized.match(/\b(19\d{2}|20\d{2})\s+([A-Za-z0-9][A-Za-z0-9\-']*)\b/);
  const year = ymMatch ? ymMatch[1] : null;
  const make = ymMatch ? ymMatch[2] : null;

  let model = null;
  const nameMatch = normalized.match(/\n#\s*([^\n]+)\n/);
  if (nameMatch) model = nameMatch[1].trim();

  if (!model) {
    const titleLine = normalized.match(/\n([A-Za-z0-9].*?)\s+'\d{2}\s*\n/);
    if (titleLine) model = titleLine[1].trim();
  }

  return { year, make, model };
}

async function extractOne(page, id) {
  const url = `https://www.kudosprime.com/fh5/car_sheet.php?id=${id}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  await page.waitForTimeout(1000);

  const bodyText = await page.evaluate(() => document.body?.innerText ?? '');

  const identity = extractCarIdentityFromText(bodyText);
  const specs = extractSpecsFromText(bodyText);

  return { id, url, identity, specs, rawTextSample: bodyText.slice(0, 5000) };
}

function readIdsFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const ids = [];
  for (const l of lines) {
    const m = l.match(/id=(\d+)/i) || l.match(/^(\d+)$/);
    if (m) ids.push(m[1]);
  }
  return ids;
}

function parseRange(rangeStr) {
  const s = String(rangeStr || '').trim();
  const m = s.match(/^(\d+)\s*[-:]\s*(\d+)$/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = Number(m[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return { start, end };
}

function buildIdsFromRange(start, end) {
  const s = Math.min(start, end);
  const e = Math.max(start, end);
  const ids = [];
  for (let i = s; i <= e; i++) ids.push(String(i));
  return ids;
}

function mainUsage() {
  console.error('Usage: node scripts/kudosprimeExtract.mjs --ids <comma-separated-ids> [--out file.json] [--delay-ms 1500] [--headed]');
  console.error('   or: node scripts/kudosprimeExtract.mjs --in <ids-or-links.txt> [--out file.json] [--delay-ms 1500] [--headed]');
  console.error('   or: node scripts/kudosprimeExtract.mjs --range <start-end> [--out file.json] [--delay-ms 1500] [--headed]');
  console.error('   or: node scripts/kudosprimeExtract.mjs --start <n> --end <n> [--out file.json] [--delay-ms 1500] [--headed]');
}

async function main() {
  const opts = parseArgs(process.argv);

  let ids = [];
  if (opts.ids) {
    ids = opts.ids
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (opts.inPath) {
    ids = readIdsFromFile(opts.inPath);
  } else if (opts.range) {
    const r = parseRange(opts.range);
    if (!r) {
      console.error('Invalid --range. Expected e.g. 0-900');
      process.exit(1);
    }
    ids = buildIdsFromRange(r.start, r.end);
  } else if (Number.isFinite(opts.start) && Number.isFinite(opts.end)) {
    ids = buildIdsFromRange(opts.start, opts.end);
  }

  ids = [...new Set(ids)];

  if (ids.length === 0) {
    mainUsage();
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: !opts.headed });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const results = {
    generatedAt: new Date().toISOString(),
    source: 'kudosprime.com',
    game: 'fh5',
    items: [],
    verifiedSpecsByKey: {},
    errors: [],
  };

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (opts.logEvery > 0 && (i % opts.logEvery === 0 || i === ids.length - 1)) {
      const ok = Object.keys(results.verifiedSpecsByKey).length;
      console.log(`[${i + 1}/${ids.length}] id=${id} ok=${ok} errors=${results.errors.length}`);
    }
    try {
      const extracted = await extractOne(page, id);
      const key = buildKey(extracted.identity);

      results.items.push(extracted);

      if (key && extracted.specs.driveType && extracted.specs.weightLbs != null && extracted.specs.defaultPI != null) {
        results.verifiedSpecsByKey[key] = {
          sourceUrl: extracted.url,
          defaultPI: extracted.specs.defaultPI,
          driveType: extracted.specs.driveType,
          weightLbs: extracted.specs.weightLbs,
          weightDistribution: extracted.specs.weightDistribution ?? null,
        };
      } else {
        results.errors.push({
          id,
          url: extracted.url,
          key: key || null,
          message: 'Missing one or more required fields (key, PI, drive type, weight).',
          extracted: extracted.specs,
          identity: extracted.identity,
        });
      }
    } catch (e) {
      results.errors.push({ id, message: e?.message ?? String(e) });
    }

    if (i < ids.length - 1) {
      await sleep(opts.delayMs);
    }
  }

  await browser.close();

  fs.writeFileSync(opts.outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Wrote ${opts.outPath}`);
  console.log(`Extracted ${Object.keys(results.verifiedSpecsByKey).length} verified entries (${results.errors.length} errors)`);
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && import.meta.url === pathToFileURL(executedPath).href) {
  main();
}
