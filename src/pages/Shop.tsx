import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShopifyProduct, fetchProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Car, Loader2, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music2, Shuffle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import shopHeroBg from '@/assets/shop-hero-bg.jpg';

// Music player tracks - add your uploaded songs here
// Example: { title: 'Song Name', artist: 'Artist Name', url: '/path/to/song.mp3', duration: 180 }
const UPLOADED_TRACKS: { title: string; artist: string; url: string; duration: number }[] = [
  // Add your uploaded songs here
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Detailing', 'Electronics', 'Interior', 'Exterior', 'Tools', 'Accessories', 'Safety'] as const;
  type Category = typeof categories[number];
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const normalizedCategory = selectedCategory.toLowerCase();

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter(({ node }) => {
          const productType = (node.productType || '').toLowerCase();
          const tags = (node.tags || []).map(t => t.toLowerCase());
          return productType === normalizedCategory || tags.includes(normalizedCategory);
        });

  const featuredProducts = products
    .filter(({ node }) =>
      (node.tags || []).some(t => ['featured', 'best-seller', 'bestseller', 'best_seller'].includes(t.toLowerCase())),
    )
    .slice(0, 4);
  
  // Audio player state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const hasMusic = UPLOADED_TRACKS.length > 0;
  const currentTrack = hasMusic ? UPLOADED_TRACKS[currentTrackIndex] : null;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(20);
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      handleNext();
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Load track when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrackIndex]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!audioRef.current || !hasMusic) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handlePrevious = () => {
    if (!hasMusic) return;
    if (currentTime > 3) {
      // Restart current track if more than 3 seconds in
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      setCurrentTrackIndex((prev) => 
        prev === 0 ? UPLOADED_TRACKS.length - 1 : prev - 1
      );
    }
  };

  const handleNext = () => {
    if (!hasMusic) return;
    if (isShuffleOn) {
      // Pick a random track that's different from current
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * UPLOADED_TRACKS.length);
      } while (randomIndex === currentTrackIndex && UPLOADED_TRACKS.length > 1);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => 
        prev === UPLOADED_TRACKS.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };


  return (
    <div className="min-h-screen pb-8 md:pb-16 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${shopHeroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,5%)/0.85] via-[hsl(220,20%,5%)/0.9] to-[hsl(220,20%,5%)/0.95]" />
      </div>

      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        {/* Header */}
        <header className="py-6 md:py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="border border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)] bg-[hsl(220,18%,8%)/0.8] backdrop-blur-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl md:text-4xl uppercase tracking-wider">
                <span className="text-[hsl(var(--racing-orange))]">FH5</span> Garage Shop
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Premium car accessories & gear
              </p>
            </div>
          </div>
          <CartDrawer />
        </header>

        {/* Hero Banner with Background */}
        <div className="mb-8 bg-gradient-to-r from-[hsl(var(--racing-orange)/0.2)] via-[hsl(var(--racing-orange)/0.1)] to-transparent border border-[hsl(var(--racing-orange)/0.4)] rounded-lg p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center opacity-20">
            <Car className="w-32 h-32 md:w-48 md:h-48" />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-xl md:text-3xl uppercase tracking-wide text-[hsl(var(--racing-orange))]">
              Car Enthusiast Essentials
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-lg">
              Gear up with premium automotive accessories, detailing products, and racing-inspired merchandise.
            </p>
          </div>
        </div>

        {/* Audio Player */}
        <div className="mb-8 bg-[hsl(220,18%,8%)/0.9] backdrop-blur-md border border-[hsl(220,15%,25%)] rounded-lg overflow-hidden">
          {/* Player Header */}
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--racing-orange))] to-[hsl(var(--racing-orange)/0.6)] flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Music2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  {hasMusic && currentTrack ? (
                    <>
                      <h3 className="font-medium text-foreground">{currentTrack.title}</h3>
                      <p className="text-xs text-muted-foreground">{currentTrack.artist}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium text-muted-foreground">No music uploaded</h3>
                      <p className="text-xs text-muted-foreground">Upload songs to play</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Track count */}
              <div className="text-xs text-muted-foreground">
                {hasMusic ? `${UPLOADED_TRACKS.length} track${UPLOADED_TRACKS.length > 1 ? 's' : ''}` : 'No tracks'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 hover:bg-[hsl(220,15%,15%)] ${isShuffleOn ? 'text-[hsl(var(--racing-orange))]' : ''}`}
                  onClick={() => setIsShuffleOn(!isShuffleOn)}
                  title={isShuffleOn ? 'Shuffle: On' : 'Shuffle: Off'}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-[hsl(220,15%,15%)]"
                  onClick={handlePrevious}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  className={`h-11 w-11 ${isPlaying ? 'bg-green-500 hover:bg-green-600' : 'bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)]'} text-black`}
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-[hsl(220,15%,15%)]"
                  onClick={handleNext}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-[hsl(220,15%,15%)]"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Track List */}
            {hasMusic ? (
              <div className="mt-4 pt-4 border-t border-[hsl(220,15%,20%)]">
                <div className="flex flex-wrap gap-2">
                  {UPLOADED_TRACKS.map((track, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentTrackIndex(index);
                        if (audioRef.current) {
                          setTimeout(() => {
                            audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
                          }, 100);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        currentTrackIndex === index
                          ? 'bg-[hsl(var(--racing-orange))] text-black font-medium'
                          : 'bg-[hsl(220,15%,15%)] text-muted-foreground hover:bg-[hsl(220,15%,20%)]'
                      }`}
                    >
                      {track.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-[hsl(220,15%,20%)] text-center text-sm text-muted-foreground">
                Upload your own music files to enable playback
              </div>
            )}
          </div>
        </div>

        {/* Featured + Filters */}
        {!loading && !error && products.length > 0 && (
          <section className="mb-6 space-y-4">
            {featuredProducts.length > 0 && (
              <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg p-4">
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display text-lg uppercase tracking-wide text-primary">Featured Picks</h2>
                    <p className="text-xs text-muted-foreground">Tagged as featured / best-sellers</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredProducts.map((product) => (
                    <ProductCard key={`featured-${product.node.id}`} product={product} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wide text-foreground">Browse by type</h3>
                  <p className="text-xs text-muted-foreground">Uses Shopify productType or tags</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={selectedCategory === cat ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--racing-orange))]" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[hsl(220,18%,8%)/0.9] backdrop-blur-md rounded-lg border border-[hsl(220,15%,18%)]">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-muted-foreground uppercase tracking-wide">No Products Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              We're stocking up on awesome car accessories! Tell us what products you'd like to see by chatting with the assistant.
            </p>
            <p className="text-xs text-[hsl(var(--racing-orange))] mt-4">
              💡 Try: "Create a product for a car phone mount for $29.99"
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card/80 backdrop-blur-md rounded-lg border border-border">
            <h3 className="font-display text-lg uppercase tracking-wide text-foreground">No matches</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No products found for <span className="text-primary">{selectedCategory}</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Tip: add a Shopify tag like <span className="text-primary">{normalizedCategory}</span> or set productType to <span className="text-primary">{selectedCategory}</span>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 md:mt-16 text-center text-muted-foreground text-xs px-4 bg-[hsl(220,18%,8%)/0.8] backdrop-blur-sm rounded-lg py-4">
          <p>Secure checkout powered by Shopify</p>
        </footer>
      </div>
    </div>
  );
}
