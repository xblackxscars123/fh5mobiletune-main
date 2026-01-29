import { useState, useEffect } from 'react';
import { FH5Car } from '@/data/carDatabase';
import { getMainCarPhoto, getFallbackCarImage, loadCarPhotos } from '@/data/carPhotos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

interface CarPhotoTestProps {
  cars: FH5Car[];
}

export function CarPhotoTest({ cars }: CarPhotoTestProps) {
  const [photoMap, setPhotoMap] = useState<Map<string, any>>(new Map());
  const [selectedCar, setSelectedCar] = useState<FH5Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhotos() {
      setLoading(true);
      try {
        const photos = await loadCarPhotos();
        const map = new Map();
        photos.forEach(photo => map.set(photo.id, photo));
        setPhotoMap(map);
      } catch (error) {
        console.warn('Failed to load photos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  const testCars = cars.slice(0, 10); // Test with first 10 cars

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Car className="w-5 h-5" />
        <h2 className="text-lg font-display">Car Photo Integration Test</h2>
      </div>

      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Loading car photos...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testCars.map((car) => {
          const mainPhoto = getMainCarPhoto(car, photoMap);
          const photoUrl = mainPhoto ? mainPhoto.url : getFallbackCarImage(car);
          const hasPhoto = !!mainPhoto;

          return (
            <Card key={car.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="relative aspect-video mb-3">
                <img
                  src={photoUrl}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src = getFallbackCarImage(car);
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    hasPhoto 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hasPhoto ? 'Photo Available' : 'Placeholder'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-semibold">{car.make} {car.model}</h3>
                <p className="text-sm text-muted-foreground">
                  {car.year} • {car.driveType} • PI {car.defaultPI}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCar(car)}
                  >
                    Select
                  </Button>
                  {mainPhoto && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(mainPhoto.url, '_blank')}
                    >
                      View Full
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedCar && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <h3 className="font-display text-primary mb-2">Selected Car</h3>
          <p className="text-sm text-muted-foreground">
            {getCarDisplayName(selectedCar)}
          </p>
        </Card>
      )}
    </div>
  );
}