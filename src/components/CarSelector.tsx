import { useState, useMemo } from 'react';
import { FH5Car, searchCars, getCarDisplayName } from '@/data/carDatabase';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarSelectorProps {
  onSelect: (car: FH5Car) => void;
  selectedCar: FH5Car | null;
}

export function CarSelector({ onSelect, selectedCar }: CarSelectorProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
        
        {isFocused && results.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-card border-border shadow-xl">
            {results.map((car) => (
              <button
                key={car.id}
                onClick={() => {
                  onSelect(car);
                  setQuery(getCarDisplayName(car));
                  setIsFocused(false);
                }}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0",
                  "flex items-center justify-between"
                )}
              >
                <div>
                  <p className="font-display text-sm">{getCarDisplayName(car)}</p>
                  <p className="text-xs text-muted-foreground">
                    {car.driveType} • {car.weight} lbs • {car.weightDistribution}% front
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                  PI {car.defaultPI}
                </span>
              </button>
            ))}
          </Card>
        )}
      </div>

      {selectedCar && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 animate-fade-in">
          <p className="font-display text-primary text-sm">{getCarDisplayName(selectedCar)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedCar.driveType} • {selectedCar.weight} lbs • {selectedCar.weightDistribution}% front • PI {selectedCar.defaultPI}
          </p>
        </div>
      )}
    </div>
  );
}
