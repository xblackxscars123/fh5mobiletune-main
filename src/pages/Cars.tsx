import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { JDMStickerBombBackground } from '@/components/JDMStickerBombBackground';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { fh5Cars, FH5Car, getCarDisplayName } from '@/data/carDatabase';
import { createCarPhotoMap, getFallbackCarImage, getMainCarPhoto, type CarPhotoCollection } from '@/data/carPhotos';
import { getVerifiedSpecs, hasVerifiedSpecs } from '@/data/verifiedCarSpecs';
import { Search, ArrowLeft, Car, CheckCircle, Filter } from 'lucide-react';

type SortOption = 'name' | 'year-asc' | 'year-desc' | 'make';

export default function Cars() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [makeFilter, setMakeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [driveFilter, setDriveFilter] = useState<string>('all');
  const [unverifiedOnly, setUnverifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [photoMap, setPhotoMap] = useState<Map<string, CarPhotoCollection> | null>(null);
  const itemsPerPage = 50;

  // Get unique makes and categories
  const uniqueMakes = useMemo(() => {
    const makes = [...new Set(fh5Cars.map(c => c.make))].sort();
    return makes;
  }, []);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(fh5Cars.map(c => c.category))].sort();
    return categories;
  }, []);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let cars = [...fh5Cars];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      cars = cars.filter(car => 
        car.make.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower) ||
        car.year.toString().includes(searchLower) ||
        getCarDisplayName(car).toLowerCase().includes(searchLower)
      );
    }

    // Make filter
    if (makeFilter !== 'all') {
      cars = cars.filter(car => car.make === makeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      cars = cars.filter(car => car.category === categoryFilter);
    }

    // Drive type filter
    if (driveFilter !== 'all') {
      cars = cars.filter(car => car.driveType === driveFilter);
    }

    // Verified filter
    if (unverifiedOnly) {
      cars = cars.filter(car => !hasVerifiedSpecs(car.year, car.make, car.model));
    }

    // Sort
    switch (sortBy) {
      case 'year-asc':
        cars.sort((a, b) => a.year - b.year);
        break;
      case 'year-desc':
        cars.sort((a, b) => b.year - a.year);
        break;
      case 'make':
        cars.sort((a, b) => a.make.localeCompare(b.make));
        break;
      default:
        cars.sort((a, b) => getCarDisplayName(a).localeCompare(getCarDisplayName(b)));
    }

    return cars;
  }, [search, makeFilter, categoryFilter, driveFilter, sortBy, unverifiedOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, makeFilter, categoryFilter, driveFilter, unverifiedOnly]);

  useEffect(() => {
    let isActive = true;
    createCarPhotoMap().then(map => {
      if (isActive) {
        setPhotoMap(map);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  const handleSelectCar = (car: FH5Car) => {
    const tuningMode = (location.state as any)?.tuningMode as 'simple' | 'advanced' | undefined;
    navigate('/', { state: { selectedCar: car, tuningMode, scrollTo: 'specs' } });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'hyper': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      'super': 'bg-red-500/20 text-red-400 border-red-500/40',
      'modern': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      'retro': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      'jdm': 'bg-pink-500/20 text-pink-400 border-pink-500/40',
      'muscle': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      'rally': 'bg-green-500/20 text-green-400 border-green-500/40',
      'offroad': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      'drift': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      'track': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  const getMakeLogoDataUri = (make: string) => {
    let hash = 0;
    for (let i = 0; i < make.length; i += 1) {
      hash = (hash << 5) - hash + make.charCodeAt(i);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    const initials = make
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    const svg = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue}, 80%, 60%);stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:hsl(${hue}, 80%, 45%);stop-opacity:0.9" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="url(#grad)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <text x="24" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="white">
          ${initials}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  return (
    <>
      <div className="min-h-screen pb-8 md:pb-16 relative overflow-x-hidden">
        <JDMStickerBombBackground />
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <Header />

        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Tuner
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            <h1 className="font-display text-xl md:text-2xl text-foreground uppercase tracking-wider">
              Car Browser
            </h1>
            <Badge variant="outline" className="ml-2">
              {fh5Cars.length} cars
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cars..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]"
                />
              </div>

              {/* Make filter */}
              <Select value={makeFilter} onValueChange={setMakeFilter}>
                <SelectTrigger className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Drive type filter */}
              <Select value={driveFilter} onValueChange={setDriveFilter}>
                <SelectTrigger className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                  <SelectValue placeholder="All Drives" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drives</SelectItem>
                  <SelectItem value="RWD">RWD</SelectItem>
                  <SelectItem value="FWD">FWD</SelectItem>
                  <SelectItem value="AWD">AWD</SelectItem>
                </SelectContent>
              </Select>

              {/* Unverified only */}
              <Button
                variant="outline"
                onClick={() => setUnverifiedOnly(v => !v)}
                className={unverifiedOnly
                  ? 'bg-neon-pink/15 text-neon-pink border border-neon-pink/40'
                  : 'bg-[hsl(220,15%,12%)] text-muted-foreground border-[hsl(220,15%,20%)]'
                }
              >
                Unverified only
              </Button>
            </div>

            {/* Sort and results count */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(220,15%,20%)]">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedCars.length} of {filteredCars.length} cars
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-40 bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="make">Make A-Z</SelectItem>
                  <SelectItem value="year-desc">Newest First</SelectItem>
                  <SelectItem value="year-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Car Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginatedCars.map((car) => {
            const verifiedSpecs = getVerifiedSpecs(car.year, car.make, car.model);
            const isVerified = verifiedSpecs !== null;
            const weight = verifiedSpecs?.weight ?? car.weight;
            const weightDistribution = verifiedSpecs?.weightDistribution ?? car.weightDistribution;
            const driveType = verifiedSpecs?.driveType ?? car.driveType;
            const defaultPI = verifiedSpecs?.defaultPI ?? car.defaultPI;
            
            return (
              <Card 
                key={car.id}
                className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => handleSelectCar(car)}
              >
                <CardContent className="p-4">
                  <div className="relative w-full h-28 mb-3 overflow-hidden rounded-md border border-[hsl(220,15%,20%)] bg-[hsl(220,15%,10%)]">
                    {(() => {
                      const forumLink = (car.links && car.links.length > 0) ? car.links[0] : (car.shub?.link || '');
                      const mainPhoto = photoMap ? getMainCarPhoto(car, photoMap) : null;
                      const imgSrc = mainPhoto?.url || getFallbackCarImage(car);
                      return (
                        <a href={forumLink || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                          <img
                            src={imgSrc}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackCarImage(car);
                            }}
                          />
                        </a>
                      );
                    })()}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{car.year}</span>
                        {isVerified && (
                          <Badge variant="outline" className="h-5 px-2 text-[10px] border-green-500/40 text-green-400 bg-green-500/10">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={getMakeLogoDataUri(car.make)}
                          alt={`${car.make} logo`}
                          className="w-6 h-6 rounded-full border border-white/10 bg-white/10 shrink-0"
                        />
                        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {car.make}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{car.model}</p>
                    </div>
                    <Badge className={`text-xs shrink-0 ${getCategoryColor(car.category)}`}>
                      {car.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[hsl(220,15%,20%)]">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      driveType === 'AWD' ? 'bg-blue-500/20 text-blue-400' :
                      driveType === 'RWD' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {driveType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {weight.toLocaleString()} lbs
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {weightDistribution}% F
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PI {defaultPI}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty state */}
        {filteredCars.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No cars found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearch('');
                setMakeFilter('all');
                setCategoryFilter('all');
                setDriveFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
