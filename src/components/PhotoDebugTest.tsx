import React, { useState, useEffect } from 'react';
import { FH5Car } from '@/data/carDatabase';
import { getMainCarPhoto, getFallbackCarImage, loadCarPhotos } from '@/data/carPhotos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PhotoDebugTestProps {
  cars: FH5Car[];
}

export function PhotoDebugTest({ cars }: PhotoDebugTestProps) {
  const [photoMap, setPhotoMap] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    async function loadPhotos() {
      setLoading(true);
      try {
        const photos = await loadCarPhotos();
        const map = new Map();
        photos.forEach(photo => map.set(photo.id, photo));
        setPhotoMap(map);
        
        // Debug information
        const debug = `
          Total photos loaded: ${photos.length}
          Sample photo IDs: ${photos.slice(0, 3).map(p => p.id).join(', ')}
          Sample car IDs: ${cars.slice(0, 3).map(c => c.fh5Id).join(', ')}
        `;
        setDebugInfo(debug);
      } catch (error) {
        console.warn('Failed to load photos:', error);
        setDebugInfo('Error loading photos: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, [cars]);

  const testCar = cars[0]; // Test with first car

  if (!testCar) {
    return <div>No cars available for testing</div>;
  }

  const mainPhoto = getMainCarPhoto(testCar, photoMap);
  const photoUrl = mainPhoto ? mainPhoto.url : getFallbackCarImage(testCar);
  const hasPhoto = !!mainPhoto;

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-display text-lg">Photo Debug Test</h3>
      
      {loading && <div>Loading photos...</div>}
      
      <div className="space-y-2">
        <p><strong>Test Car:</strong> {testCar.make} {testCar.model} ({testCar.year})</p>
        <p><strong>FH5 ID:</strong> {testCar.fh5Id}</p>
        <p><strong>Has Photo:</strong> {hasPhoto ? 'Yes' : 'No'}</p>
        <p><strong>Photo URL:</strong> {photoUrl}</p>
      </div>

      <div className="space-y-2">
        <h4>Debug Information:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded">{debugInfo}</pre>
      </div>

      <div className="space-y-2">
        <h4>Photo Display Test:</h4>
        <div className="relative w-full h-32 border rounded">
          <img
            src={photoUrl}
            alt={`${testCar.make} ${testCar.model}`}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              console.log('Image failed to load:', photoUrl);
              e.currentTarget.src = getFallbackCarImage(testCar);
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', photoUrl);
            }}
          />
          <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
            {hasPhoto ? 'Real Photo' : 'Fallback'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            // Force reload photos
            loadCarPhotos().then(photos => {
              const map = new Map();
              photos.forEach(photo => map.set(photo.id, photo));
              setPhotoMap(map);
            });
          }}
        >
          Reload Photos
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Test with different car
            const randomCar = cars[Math.floor(Math.random() * cars.length)];
            console.log('Testing with car:', randomCar);
          }}
        >
          Test Random Car
        </Button>
      </div>
    </Card>
  );
}