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
    outPath: 'kudosprime-photos.json',
    delayMs: 1500,
    headed: false,
    logEvery: 5,
    retries: 2,
    failedIdsPath: 'kp-failed-ids.txt',
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
    } else if (a === '--retries') {
      out.retries = Number(args[++i] ?? out.retries);
    } else if (a === '--failed-ids') {
      out.failedIdsPath = String(args[++i] ?? out.failedIdsPath);
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

async function extractPhotos(page, id) {
  const url = `https://www.kudosprime.com/fh5/car_sheet.php?id=${id}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  await page.waitForTimeout(1000);

  const bodyText = await page.evaluate(() => document.body?.innerText ?? '');

  const identity = extractCarIdentityFromText(bodyText);

  // Look for the main car image - typically the largest image on the page
  const images = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      title: img.title,
      className: img.className,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }))
  );

  // Filter for car images - look for images that are likely to be the main car photo
  const carImages = images.filter(img => {
    const src = (img.src || '').toLowerCase();
    const alt = (img.alt || '').toLowerCase();
    const title = (img.title || '').toLowerCase();
    
    // Exclude common non-car images
    if (src.includes('favicon') || src.includes('icon') || src.includes('logo') ||
        src.includes('button') || src.includes('arrow') || src.includes('background')) {
      return false;
    }
    
    // Include images that look like they might be car photos
    if (src.includes('car') || src.includes('vehicle') || src.includes('auto') ||
        alt.includes('car') || alt.includes('vehicle') || alt.includes('auto') ||
        title.includes('car') || title.includes('vehicle') || title.includes('auto')) {
      return true;
    }
    
    // Include larger images that are more likely to be the main car photo
    if (img.naturalWidth > 200 && img.naturalHeight > 200) {
      return true;
    }
    
    return false;
  });

  // Look for any image URLs in the page source
  const pageContent = await page.content();
  const imageUrls = [];
  
  // Common image URL patterns
  const imgPatterns = [
    /https?:\/\/[^\s'"]*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^'"]*)?/gi,
    /src="([^"]*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"]*)?)"/gi,
    /src='([^']*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^']*)?)'/gi
  ];

  for (const pattern of imgPatterns) {
    let match;
    while ((match = pattern.exec(pageContent)) !== null) {
      imageUrls.push(match[1] || match[0]);
    }
  }

  // Filter out common non-car images
  const carImageUrls = imageUrls.filter(url => {
    const lowerUrl = url.toLowerCase();
    return !lowerUrl.includes('favicon') && 
           !lowerUrl.includes('icon') && 
           !lowerUrl.includes('logo') &&
           !lowerUrl.includes('button') &&
           !lowerUrl.includes('arrow') &&
           !lowerUrl.includes('background');
  });

  return { 
    id, 
    url, 
    identity, 
    carImages,
    carImageUrls,
    rawTextSample: bodyText.slice(0, 5000) 
  };
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
  console.error('Usage: node scripts/kudosprimePhotoExtract.mjs --ids <comma-separated-ids> [--out file.json] [--delay-ms 1500] [--headed]');
  console.error('   or: node scripts/kudosprimePhotoExtract.mjs --in <ids-or-links.txt> [--out file.json] [--delay-ms 1500] [--headed]');
  console.error('   or: node scripts/kudosprimePhotoExtract.mjs --range <start-end> [--out file.json] [--delay-ms 1500] [--headed]');
  console.error('   or: node scripts/kudosprimePhotoExtract.mjs --start <n> --end <n> [--out file.json] [--delay-ms 1500] [--headed]');
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

  page.setDefaultNavigationTimeout(60_000);
  page.setDefaultTimeout(60_000);

  const results = {
    generatedAt: new Date().toISOString(),
    source: 'kudosprime.com',
    game: 'fh5',
    items: [],
    errors: [],
  };

  const failedIds = [];
  const failedIdsPath = opts.failedIdsPath ? path.resolve(opts.failedIdsPath) : null;
  if (failedIdsPath) {
    // Create/truncate so the file exists immediately during long runs.
    fs.writeFileSync(failedIdsPath, '', 'utf8');
  }

  const runStartedAt = Date.now();

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const shouldLog = opts.logEvery > 0 && (i % opts.logEvery === 0 || i === ids.length - 1);
    const startedAt = Date.now();
    if (shouldLog) {
      const ok = results.items.length;
      const elapsedS = Math.round((Date.now() - runStartedAt) / 1000);
      console.log(`[${i + 1}/${ids.length}] id=${id} ok=${ok} errors=${results.errors.length} elapsed=${elapsedS}s`);
    }
    try {
      let extracted;
      let lastErr;
      const attempts = Math.max(0, Math.floor(Number.isFinite(opts.retries) ? opts.retries : 0)) + 1;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          extracted = await extractPhotos(page, id);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          if (attempt < attempts) {
            await sleep(500 * attempt);
          }
        }
      }
      if (!extracted) {
        throw lastErr ?? new Error('Unknown extraction failure');
      }
      results.items.push(extracted);
    } catch (e) {
      results.errors.push({ id, message: e?.message ?? String(e) });
      failedIds.push(id);
      if (failedIdsPath) {
        try {
          fs.appendFileSync(failedIdsPath, `${id}\n`, 'utf8');
        } catch {
          // ignore
        }
      }
      if (shouldLog) {
        console.log(`  id=${id} failed: ${e?.message ?? String(e)}`);
      }
    }

    if (shouldLog) {
      const tookMs = Date.now() - startedAt;
      console.log(`  id=${id} done (${tookMs}ms)`);
    }

    if (i < ids.length - 1) {
      await sleep(opts.delayMs);
    }
  }

  await browser.close();

  fs.writeFileSync(opts.outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Wrote ${opts.outPath}`);
  if (failedIdsPath) {
    console.log(`Wrote ${failedIdsPath}`);
  }
  console.log(`Extracted ${results.items.length} photo entries (${results.errors.length} errors)`);
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && import.meta.url === pathToFileURL(executedPath).href) {
  main();
}