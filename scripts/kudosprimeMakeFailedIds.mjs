import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function main() {
  const args = process.argv.slice(2);
  const inJson = args[0] || 'kp-all.json';
  const outTxt = args[1] || 'kp-failed-ids.txt';

  const jsonPath = path.resolve(inJson);
  const outPath = path.resolve(outTxt);

  if (!fs.existsSync(jsonPath)) {
    console.error(`Input JSON not found: ${jsonPath}`);
    process.exit(1);
  }

  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const failed = new Set();

  // Prefer explicit errors array
  if (Array.isArray(json.errors)) {
    for (const e of json.errors) {
      if (e?.id != null) failed.add(String(e.id));
    }
  }

  // Also mark items that have missing required fields
  if (Array.isArray(json.items)) {
    for (const item of json.items) {
      const id = item?.id;
      if (id == null) continue;
      const specs = item?.specs || {};
      const ok = specs.defaultPI != null && specs.driveType != null && specs.weightLbs != null;
      if (!ok) failed.add(String(id));
    }
  }

  const ids = [...failed].sort((a, b) => Number(a) - Number(b));
  fs.writeFileSync(outPath, ids.join('\n') + (ids.length ? '\n' : ''), 'utf8');

  console.log(`Wrote ${outTxt} (${ids.length} ids)`);
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && import.meta.url === pathToFileURL(executedPath).href) {
  main();
}
