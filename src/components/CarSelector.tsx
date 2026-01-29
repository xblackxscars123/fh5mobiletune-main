import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FH5Car, searchCars, getCarDisplayName } from '@/data/carDatabase';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMainCarPhoto, getFallbackCarImage, createCarPhotoMap } from '@/data/carPhotos';

interface CarSelectorProps {
  onSelect: (car: FH5Car) => void;
  selectedCar: FH5Car | null;
}

export function CarSelector({ onSelect, selectedCar }: CarSelectorProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [photoMap, setPhotoMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (selectedCar) {
      setQuery(getCarDisplayName(selectedCar));
    }
  }, [selectedCar]);


  // Load photo map once when component mounts
  useEffect(() => {
    createCarPhotoMap().then(map => {
      setPhotoMap(map);
    }).catch(error => {
      console.warn('Failed to load car photos:', error);
    });
  }, []);

  const results = useMemo(() => searchCars(query), [query]);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-base font-display text-primary">
        <Car className="w-5 h-5" />
        Search Car Database
      </label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search 700+ cars... (e.g., Supra, M3, GT-R)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 bg-muted border-border focus:border-primary h-12"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Link
            to="/cars"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-module-suspension/10 hover:bg-module-suspension/20 border border-module-suspension/40 hover:border-module-suspension/60 transition-all text-xs font-medium text-module-suspension shadow-[0_0_15px_hsl(var(--module-suspension)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-suspension)/0.4)] backdrop-blur-sm circuit-button overflow-hidden whitespace-nowrap"
          >
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-module-suspension shadow-[0_0_6px_hsl(var(--module-suspension))]" />
            <span className="relative z-10">Browse</span>
          </Link>
        </div>
        
        {isFocused && results.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-card border-border shadow-xl">
            {results.map((car) => {
              const mainPhoto = getMainCarPhoto(car, photoMap);
              const photoUrl = mainPhoto ? mainPhoto.url : getFallbackCarImage(car);
              
              return (
                <button
                  key={car.id}
                  onClick={() => {
                    onSelect(car);
                    setQuery(getCarDisplayName(car));
                    setIsFocused(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0",
                    "flex flex-col gap-2"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm truncate">{getCarDisplayName(car)}</p>
                      <p className="text-xs text-muted-foreground">
                        {car.driveType} • {car.weight} lbs • {car.weightDistribution}% front
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                      PI {car.defaultPI}
                    </span>
                  </div>
                  
                  <div className="relative w-full h-16">
                    <img
                      src={photoUrl}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover rounded-md border border-border/50"
                      onError={(e) => {
                        // Fallback to generic car image if the photo fails to load
                        e.currentTarget.src = getFallbackCarImage(car);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-md" />
                  </div>
                </button>
              );
            })}
          </Card>
        )}
      </div>

      {selectedCar && (
        <Card className="p-3 rounded-lg bg-primary/10 border border-primary/30 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-display text-primary text-sm">{getCarDisplayName(selectedCar)}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCar.driveType} • {selectedCar.weight} lbs • {selectedCar.weightDistribution}% front • PI {selectedCar.defaultPI}
              </p>
            </div>
          </div>
          
          <div className="relative w-full h-20">
            <img
              src={getMainCarPhoto(selectedCar, photoMap)?.url || getFallbackCarImage(selectedCar)}
              alt={`${selectedCar.make} ${selectedCar.model}`}
              className="w-full h-full object-cover rounded-md border border-primary/30"
              onError={(e) => {
                e.currentTarget.src = getFallbackCarImage(selectedCar);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md" />
          </div>
        </Card>
      )}
    </div>
  );
}
