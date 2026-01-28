import type { FH5Car } from './carDatabase';

// Interface for car photo data
export interface CarPhoto {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

// Interface for car photo collection
export interface CarPhotoCollection {
  id: string;
  identity: {
    year: string;
    make: string;
    model: string | null;
  };
  carImages: CarPhoto[];
  carImageUrls: string[];
  rawTextSample: string;
}

// Load car photos from the extracted data
export async function loadCarPhotos(): Promise<CarPhotoCollection[]> {
  try {
    // Try to load the photos file
    const response = await fetch('/kudosprime-all-photos.json');
    if (!response.ok) {
      throw new Error('Failed to load car photos');
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.warn('Could not load car photos:', error);
    return [];
  }
}

// Create a map of car photos by car ID
export async function createCarPhotoMap(): Promise<Map<string, CarPhotoCollection>> {
  const photos = await loadCarPhotos();
  const photoMap = new Map<string, CarPhotoCollection>();
  
  photos.forEach(photo => {
    photoMap.set(photo.id, photo);
  });
  
  return photoMap;
}

// Get photos for a specific car
export function getCarPhotos(car: FH5Car, photoMap: Map<string, CarPhotoCollection>): CarPhoto[] {
  const photoCollection = photoMap.get(car.id) || photoMap.get(car.fh5Id?.toString() || '');
  if (!photoCollection || !photoCollection.carImages.length) {
    return [];
  }
  
  return photoCollection.carImages.map(img => ({
    id: img.id,
    url: img.url,
    alt: img.alt || `${car.make} ${car.model}`,
    width: img.naturalWidth,
    height: img.naturalHeight
  }));
}

// Get the main photo for a car (first available image)
export function getMainCarPhoto(car: FH5Car, photoMap: Map<string, CarPhotoCollection>): CarPhoto | null {
  const photos = getCarPhotos(car, photoMap);
  return photos.length > 0 ? photos[0] : null;
}

// Get fallback image URL for cars without photos
export function getFallbackCarImage(car: FH5Car): string {
  // Create a data URI for a simple placeholder image
  const categoryColors: Record<string, string> = {
    'retro': '#64748b',
    'modern': '#3b82f6',
    'super': '#f59e0b',
    'hyper': '#ef4444',
    'muscle': '#dc2626',
    'jdm': '#10b981',
    'euro': '#8b5cf6',
    'offroad': '#059669',
    'truck': '#6366f1',
    'van': '#f97316',
    'buggy': '#22c55e',
    'track': '#84cc16',
    'rally': '#f43f5e',
    'formula': '#60a5fa',
    'drift': '#a78bfa',
    'hot-hatch': '#22d3ee',
    'gt': '#fb7185',
    'suv': '#f59e0b',
    'classic': '#94a3b8'
  };
  
  const color = categoryColors[car.category] || '#6b7280';
  const make = car.make.replace(/[^a-zA-Z0-9]/g, '');
  const model = car.model.replace(/[^a-zA-Z0-9]/g, '');
  
  // Create a simple SVG placeholder with car category color and text
  const svg = `
    <svg width="400" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.4" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="#f3f4f6" rx="8"/>
      <rect x="50" y="120" width="300" height="80" rx="15" fill="url(#grad)" stroke="#9ca3af" stroke-width="2"/>
      <path d="M120 120 L280 120 L260 80 L140 80 Z" fill="url(#grad)" stroke="#9ca3af" stroke-width="2"/>
      <circle cx="100" cy="200" r="25" fill="#9ca3af"/>
      <circle cx="300" cy="200" r="25" fill="#9ca3af"/>
      <text x="200" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#374151">
        ${make} ${model}
      </text>
      <text x="200" y="65" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${car.year} • ${car.driveType} • PI ${car.defaultPI}
      </text>
      <text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" font-style="italic">
        Image not available
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Enhanced car interface with photo support
export interface FH5CarWithPhotos extends FH5Car {
  photos?: CarPhoto[];
  mainPhoto?: CarPhoto;
}

// Enhance cars with photo data
export async function enhanceCarsWithPhotos(cars: FH5Car[]): Promise<FH5CarWithPhotos[]> {
  const photoMap = await createCarPhotoMap();
  
  return cars.map(car => {
    const photos = getCarPhotos(car, photoMap);
    const mainPhoto = getMainCarPhoto(car, photoMap);
    
    return {
      ...car,
      photos,
      mainPhoto
    };
  });
}
