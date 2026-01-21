import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, Heart, Download, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeBackground } from '@/components/ThemeBackground';
import { TuneCard } from '@/components/community/TuneCard';
import { SignupIncentiveBanner } from '@/components/community/SignupIncentiveBanner';
import { AuthModal } from '@/components/AuthModal';
import { usePublicTunes, SortOption, PublicTune } from '@/hooks/usePublicTunes';
import { useAuth } from '@/hooks/useAuth';
import { TuneType } from '@/lib/tuningCalculator';
import { Link } from 'react-router-dom';

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [tuneTypeFilter, setTuneTypeFilter] = useState<TuneType | 'all'>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { tunes, loading, error, hasMore, loadMore, refresh } = usePublicTunes({
    sortBy,
    carFilter: searchQuery,
    tuneTypeFilter,
    limit: 12
  });

  const handleTryTune = (tune: PublicTune) => {
    // Navigate to home with tune data in state
    navigate('/', { 
      state: { 
        loadTune: {
          specs: tune.specs,
          tuneType: tune.tuneType,
          carName: tune.carName,
          tuneSettings: tune.tuneSettings
        }
      }
    });
  };

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'likes', label: 'Most Liked', icon: Heart },
    { value: 'downloads', label: 'Most Downloaded', icon: Download },
  ];

  return (
    <div className="min-h-screen pb-16 relative">
      <ThemeBackground />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      <div className="container max-w-7xl mx-auto px-4 md:px-6 pt-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl md:text-3xl flex items-center gap-2">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
              <span 
                className="text-gradient-neon"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--neon-cyan)) 0%, hsl(var(--neon-pink)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Community Tunes
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and try tunes shared by the community
            </p>
          </div>
        </div>

        {/* Signup Banner for guests */}
        {!user && (
          <div className="mb-6">
            <SignupIncentiveBanner onSignUp={() => setShowAuthModal(true)} />
          </div>
        )}

        {/* Filters */}
        <div className="module-block p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by car name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border"
              />
            </div>

            {/* Tune Type Filter */}
            <Select value={tuneTypeFilter} onValueChange={(v) => setTuneTypeFilter(v as TuneType | 'all')}>
              <SelectTrigger className="w-full md:w-40 bg-card/50">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="grip">Grip</SelectItem>
                <SelectItem value="drift">Drift</SelectItem>
                <SelectItem value="street">Street</SelectItem>
                <SelectItem value="rally">Rally</SelectItem>
                <SelectItem value="offroad">Offroad</SelectItem>
                <SelectItem value="drag">Drag</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full md:w-48 bg-card/50">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">Try Again</Button>
          </div>
        )}

        {!error && tunes.length === 0 && !loading && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-display text-xl mb-2 text-muted-foreground">No Tunes Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || tuneTypeFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Be the first to share a tune with the community!'}
            </p>
            <Link to="/">
              <Button className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                Create a Tune
              </Button>
            </Link>
          </div>
        )}

        {/* Tune Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tunes.map((tune) => (
            <TuneCard
              key={tune.id}
              tune={tune}
              onTryTune={handleTryTune}
              onAuthRequired={() => setShowAuthModal(true)}
            />
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="module-block p-4 animate-pulse">
                <div className="h-6 bg-card rounded mb-2" />
                <div className="h-4 bg-card rounded w-2/3 mb-3" />
                <div className="h-8 bg-card rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && tunes.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              variant="outline"
              className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
            >
              Load More Tunes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
