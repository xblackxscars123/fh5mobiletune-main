import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Minimal LZ-String implementation (decompress only) for:
// - decompressFromBase64
// - decompressFromEncodedURIComponent
// Based on https://github.com/pieroxy/lz-string (MIT)

const keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';

function getBaseValue(alphabet, character) {
  const idx = alphabet.indexOf(character);
  return idx;
}

function _decompress(length, resetValue, getNextValue) {
  const dictionary = [];
  let next;
  let enlargeIn = 4;
  let dictSize = 4;
  let numBits = 3;
  let entry = '';
  const result = [];
  let i;
  let w;
  let bits;
  let resb;
  let maxpower;
  let power;
  let c;

  const data = { val: getNextValue(0), position: resetValue, index: 1 };

  for (i = 0; i < 3; i += 1) {
    dictionary[i] = i;
  }

  bits = 0;
  maxpower = Math.pow(2, 2);
  power = 1;
  while (power !== maxpower) {
    resb = data.val & data.position;
    data.position >>= 1;
    if (data.position === 0) {
      data.position = resetValue;
      data.val = getNextValue(data.index++);
    }
    bits |= (resb > 0 ? 1 : 0) * power;
    power <<= 1;
  }

  switch ((next = bits)) {
    case 0:
      bits = 0;
      maxpower = Math.pow(2, 8);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 1:
      bits = 0;
      maxpower = Math.pow(2, 16);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 2:
      return '';
    default:
      return '';
  }

  dictionary[3] = c;
  w = c;
  result.push(c);

  while (true) {
    if (data.index > length) {
      return '';
    }

    bits = 0;
    maxpower = Math.pow(2, numBits);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch ((c = bits)) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }

        dictionary[dictSize++] = String.fromCharCode(bits);
        c = dictSize - 1;
        enlargeIn--;
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }

        dictionary[dictSize++] = String.fromCharCode(bits);
        c = dictSize - 1;
        enlargeIn--;
        break;
      case 2:
        return result.join('');
    }

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }

    if (dictionary[c]) {
      entry = dictionary[c];
    } else {
      if (c === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return '';
      }
    }

    result.push(entry);

    dictionary[dictSize++] = w + entry.charAt(0);
    enlargeIn--;

    w = entry;

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
  }
}

function decompressFromBase64(input) {
  if (input == null) return '';
  if (input === '') return null;
  return _decompress(input.length, 32, (index) => {
    const charCode = getBaseValue(keyStrBase64, input.charAt(index));
    return charCode;
  });
}

function decompressFromEncodedURIComponent(input) {
  if (input == null) return '';
  if (input === '') return null;
  const normalized = input.replace(/ /g, '+');
  return _decompress(normalized.length, 32, (index) => {
    const charCode = getBaseValue(keyStrUriSafe, normalized.charAt(index));
    return charCode;
  });
}

// OPTN enum/value mapping
const wt = {
  Stock: 's',
  Street: 'st',
  Sport: 'sp',
  'Semi-Slick': 'ss',
  Race: 'r',
  'Race Anti-lag': 'ral',
  Slick: 'sl',
  Drift: 'dr',
  Rally: 'ra',
  Offroad: 'o',
  Snow: 'sn',
  Drag: 'd',
  'Vintage Whitewall': 'vw',
  'Vintage Race': 'vr',
  'Multi Piece': 'mp',
  Specialized: 'spec',
  First: '1st',
  Second: '2nd',
  Third: '3rd',
  'Remove Restrictor': 'rr',
  'No Restrictor Plate': 'nrp',
  'Stock Restrictor Plate': 'srp',
  'N/A': 'na',
};

const bo = Object.keys(wt).reduce((acc, k) => ({ ...acc, [wt[k]]: k }), {});

function Nm(v) {
  if (typeof v === 'boolean') return v ? 't' : 'f';
  if (typeof v === 'string' && v in wt) return wt[v];
  return v;
}

function Em(v) {
  if (v === 't') return true;
  if (v === 'f') return false;
  if (typeof v === 'string' && v in bo) return bo[v];
  return v;
}

function flatten(obj, prefix = [], out = {}) {
  const keys = Object.keys(obj);
  for (const k of keys) {
    const v = obj[k];
    const p = [...prefix, k];
    const path = p.join('.');
    if (typeof v === 'boolean' || typeof v === 'string' || typeof v === 'number' || Array.isArray(v)) {
      out[path] = v;
    } else {
      flatten(v, p, out);
    }
  }
  return out;
}

function unflatten(flat, template, prefix = []) {
  const keys = Object.keys(template);
  for (const k of keys) {
    const p = [...prefix, k];
    const v = template[k];
    if (typeof v === 'boolean' || typeof v === 'string' || typeof v === 'number' || Array.isArray(v)) {
      const path = p.join('.');
      template[k] = flat[path];
    } else {
      template[k] = unflatten(flat, v, p);
    }
  }
  return template;
}

function sortedKeysForTemplate(template) {
  const flat = flatten(template);
  const keys = Object.keys(flat);
  keys.sort();
  return keys;
}

function defaultFH5Form() {
  // Matches OPTN's FH5 formatter default form (v1)
  return {
    make: '',
    model: '',
    tune: {
      tires: { front: '', rear: '', units: 'bar' },
      gears: { ratios: ['', '', '', '', '', '', '', '', '', '', ''], na: false },
      camber: { front: '', rear: '' },
      toe: { front: '', rear: '' },
      caster: '',
      arb: { front: '', rear: '', na: false },
      springs: { front: '', rear: '', units: 'kgf/mm', na: false },
      rideHeight: { front: '', rear: '', units: 'cm', na: false },
      damping: { front: '', rear: '', na: false },
      bump: { front: '', rear: '', na: false },
      aero: { front: '', rear: '', units: 'kgf', na: false },
      brake: { na: false, bias: '', pressure: '' },
      diff: {
        front: { accel: '', decel: '' },
        rear: { accel: '', decel: '' },
        center: '',
        na: false,
      },
    },
    build: {
      conversions: { engine: '', drivetrain: 'Stock', aspiration: '', bodyKit: '' },
      engine: {
        intake: 'Stock',
        intakeManifold: 'N/A',
        carburator: 'N/A',
        fuelSystem: 'Stock',
        ignition: 'Stock',
        exhaust: 'Stock',
        camshaft: 'Stock',
        valves: 'Stock',
        displacement: 'Stock',
        pistons: 'Stock',
        turbo: 'N/A',
        twinTurbo: 'N/A',
        supercharger: 'N/A',
        centrifugalSupercharger: 'N/A',
        intercooler: 'Stock',
        oilCooling: 'Stock',
        flywheel: 'Stock',
        motorAndBattery: 'N/A',
        restrictorPlate: 'N/A',
      },
      platformAndHandling: {
        brakes: 'Stock',
        springs: 'Stock',
        frontArb: 'Stock',
        rearArb: 'Stock',
        chassisReinforcement: 'Stock',
        weightReduction: 'Stock',
      },
      drivetrain: { clutch: 'Stock', transmission: 'Stock', driveline: 'Stock', differential: 'Stock' },
      tiresAndRims: {
        compound: 'Stock',
        width: { front: '', rear: '' },
        rimStyle: { type: 'Stock', name: '' },
        rimSize: { front: '', rear: '' },
        trackWidth: { front: 'Stock', rear: 'Stock' },
        profileSize: { front: 'Stock', rear: 'Stock' },
      },
      aeroAndAppearance: { frontBumper: '', rearBumper: '', rearWing: '', sideSkirts: '', hood: '' },
    },
    stats: {
      pi: '800',
      classification: 'A',
      hp: '',
      torque: '',
      weight: '',
      balance: '',
      topSpeed: '',
      zeroToSixty: '',
      zeroToHundred: '',
      shareCode: '',
    },
  };
}

function tryDecodeEncodedForm(encodedForm) {
  const raw = decodeURIComponent(encodedForm);

  // 1) Newer OPTN uses base64 (compressToBase64)
  const base64Decompressed = decompressFromBase64(raw);
  if (base64Decompressed) {
    return base64Decompressed;
  }

  // 2) Older links use encodedURIComponent
  const uriDecompressed = decompressFromEncodedURIComponent(raw);
  if (uriDecompressed) {
    return uriDecompressed;
  }

  return '';
}

function decodeFH5(encodedForm) {
  const template = defaultFH5Form();
  const keys = sortedKeysForTemplate(template);

  const decompressed = tryDecodeEncodedForm(encodedForm);
  if (!decompressed) {
    throw new Error('Failed to decompress payload');
  }

  let arr;
  try {
    arr = JSON.parse(decompressed);
  } catch (e) {
    throw new Error(`Decompressed payload is not valid JSON: ${e?.message}`);
  }

  const flat = {};
  for (let i = 0; i < keys.length; i++) {
    flat[keys[i]] = Em(arr[i]);
  }

  return unflatten(flat, template);
}

function toNumber(v) {
  if (v === '' || v == null) return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toCuratedTuneDraft(form, { id, tuneType, creatorName, source, editorNote, tags = [], difficulty = 'intermediate' }) {
  const carName = [form.model].filter(Boolean).join(' ').trim();

  const tirePressureFront = toNumber(form.tune?.tires?.front) ?? 0;
  const tirePressureRear = toNumber(form.tune?.tires?.rear) ?? 0;

  const camberFront = toNumber(form.tune?.camber?.front) ?? 0;
  const camberRear = toNumber(form.tune?.camber?.rear) ?? 0;
  const toeFront = toNumber(form.tune?.toe?.front) ?? 0;
  const toeRear = toNumber(form.tune?.toe?.rear) ?? 0;
  const caster = toNumber(form.tune?.caster) ?? 0;

  const arbFront = toNumber(form.tune?.arb?.front) ?? 0;
  const arbRear = toNumber(form.tune?.arb?.rear) ?? 0;

  const springsFront = toNumber(form.tune?.springs?.front) ?? 0;
  const springsRear = toNumber(form.tune?.springs?.rear) ?? 0;

  const rideHeightFront = toNumber(form.tune?.rideHeight?.front) ?? 0;
  const rideHeightRear = toNumber(form.tune?.rideHeight?.rear) ?? 0;

  const reboundFront = toNumber(form.tune?.damping?.front) ?? 0;
  const reboundRear = toNumber(form.tune?.damping?.rear) ?? 0;
  const bumpFront = toNumber(form.tune?.bump?.front) ?? 0;
  const bumpRear = toNumber(form.tune?.bump?.rear) ?? 0;

  const aeroFront = toNumber(form.tune?.aero?.front) ?? 0;
  const aeroRear = toNumber(form.tune?.aero?.rear) ?? 0;

  const brakeBalance = toNumber(form.tune?.brake?.bias) ?? 50;
  const brakePressure = toNumber(form.tune?.brake?.pressure) ?? 100;

  const diffAccelFront = toNumber(form.tune?.diff?.front?.accel) ?? undefined;
  const diffDecelFront = toNumber(form.tune?.diff?.front?.decel) ?? undefined;
  const diffAccelRear = toNumber(form.tune?.diff?.rear?.accel) ?? undefined;
  const diffDecelRear = toNumber(form.tune?.diff?.rear?.decel) ?? undefined;
  const diffCenter = toNumber(form.tune?.diff?.center) ?? undefined;

  const piClass = `${form.stats?.classification || ''}${form.stats?.pi || ''}`.trim();

  return {
    id,
    carName,
    tuneType,
    piClass,
    creatorName,
    source,
    editorNote,
    tags,
    difficulty,
    // Specs are unknown from OPTN payload alone; you can fill these using your verified specs DB.
    specs: {
      weight: 0,
      weightDistribution: 50,
      driveType: 'RWD',
      piClass: form.stats?.classification || 'A',
      hasAero: aeroFront !== 0 || aeroRear !== 0,
      tireCompound: 'race',
    },
    tuneSettings: {
      tirePressureFront,
      tirePressureRear,
      camberFront,
      camberRear,
      toeFront,
      toeRear,
      caster,
      arbFront,
      arbRear,
      springsFront,
      springsRear,
      rideHeightFront,
      rideHeightRear,
      reboundFront,
      reboundRear,
      bumpFront,
      bumpRear,
      aeroFront,
      aeroRear,
      diffAccelFront,
      diffDecelFront,
      diffAccelRear,
      diffDecelRear,
      diffCenter,
      brakePressure,
      brakeBalance,
    },
    likesCount: 0,
    downloadsCount: 0,
  };
}

function extractEncodedFormFromUrl(url) {
  const u = url.trim();
  const m = u.match(/\/formatter\/(?:forza\/horizon5\/v\d+\/)?([^?#]+)/i);
  if (!m) throw new Error('URL does not look like an optn.club formatter link');
  return m[1];
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/optnDecode.mjs <optn.club formatter url>');
    process.exit(1);
  }

  const url = args[0];
  const encodedForm = extractEncodedFormFromUrl(url);
  const form = decodeFH5(encodedForm);

  // Dump the decoded form to stdout
  console.log(JSON.stringify(form, null, 2));

  // Optionally write to a file if requested
  const outPath = args[1];
  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(form, null, 2), 'utf8');
  }
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && import.meta.url === pathToFileURL(executedPath).href) {
  main();
}

export { decodeFH5, toCuratedTuneDraft };
