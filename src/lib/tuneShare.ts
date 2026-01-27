import { CarSpecs, TuneType } from './tuningCalculator';

export interface ShareableTune {
  specs: CarSpecs;
  tuneType: TuneType;
  carName?: string;
}

/**
 * Encode a tune configuration into a URL-safe string
 */
export function encodeTuneToURL(tune: ShareableTune): string {
  try {
    // Create a compact representation
    const compact = {
      w: tune.specs.weight,
      d: tune.specs.weightDistribution,
      t: tune.specs.driveType,
      p: tune.specs.piClass,
      a: tune.specs.hasAero ? 1 : 0,
      c: tune.specs.tireCompound,
      h: tune.specs.horsepower,
      g: tune.specs.gearCount,
      tt: tune.tuneType,
      n: tune.carName || '',
    };
    
    const jsonString = JSON.stringify(compact);
    // Use base64 encoding for URL safety
    const encoded = btoa(jsonString);
    return encoded;
  } catch (error) {
    console.error('Failed to encode tune:', error);
    return '';
  }
}

/**
 * Decode a URL-safe string back into a tune configuration
 */
export function decodeTuneFromURL(encoded: string): ShareableTune | null {
  try {
    const jsonString = atob(encoded);
    const compact = JSON.parse(jsonString);
    
    // Validate and reconstruct the full tune object
    const specs: CarSpecs = {
      weight: Number(compact.w) || 3000,
      weightDistribution: Number(compact.d) || 52,
      driveType: (['RWD', 'FWD', 'AWD'].includes(compact.t) ? compact.t : 'RWD') as CarSpecs['driveType'],
      piClass: (['D', 'C', 'B', 'A', 'S1', 'S2', 'X'].includes(compact.p) ? compact.p : 'A') as CarSpecs['piClass'],
      hasAero: compact.a === 1,
      tireCompound: compact.c || 'sport',
      horsepower: Number(compact.h) || 400,
      gearCount: Number(compact.g) || 6,
      tireWidth: Number(compact.tw) || 245,
      tireProfile: Number(compact.tp) || 40,
      rimSize: Number(compact.rs) || 19,
      tireCircumference: Number(compact.tc) || 2.1,
    };
    
    const tuneType = (['grip', 'drift', 'drag', 'rally', 'offroad', 'circuit'] as TuneType[]).includes(compact.tt) 
      ? compact.tt as TuneType 
      : 'grip';
    
    return {
      specs,
      tuneType,
      carName: compact.n || undefined,
    };
  } catch (error) {
    console.error('Failed to decode tune:', error);
    return null;
  }
}

/**
 * Generate a shareable URL for a tune
 */
export function generateShareURL(tune: ShareableTune): string {
  const encoded = encodeTuneToURL(tune);
  if (!encoded) return '';
  
  const baseURL = window.location.origin;
  return `${baseURL}/?tune=${encoded}`;
}

/**
 * Parse tune from current URL if present
 */
export function parseTuneFromCurrentURL(): ShareableTune | null {
  const urlParams = new URLSearchParams(window.location.search);
  const tuneParam = urlParams.get('tune');
  
  if (!tuneParam) return null;
  
  return decodeTuneFromURL(tuneParam);
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareURLToClipboard(tune: ShareableTune): Promise<boolean> {
  const url = generateShareURL(tune);
  if (!url) return false;
  
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
