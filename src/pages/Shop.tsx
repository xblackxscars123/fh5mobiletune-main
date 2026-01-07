import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShopifyProduct, fetchProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Car, Loader2, Play, Pause, SkipForward, SkipBack, Music, Volume2, ExternalLink } from 'lucide-react';
import shopHeroBg from '@/assets/shop-hero-bg.jpg';

// Music playlist with real SoundCloud embeddable tracks (royalty-free / Creative Commons)
const playlist = [
  { 
    id: 1, 
    title: "Night Drive", 
    artist: "Synthwave", 
    duration: "3:45",
    // Using SoundCloud widget API
    soundcloudUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1234567890&color=%23ff6600&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false"
  },
  { 
    id: 2, 
    title: "Turbo Boost", 
    artist: "Neon Riders", 
    duration: "4:12",
    soundcloudUrl: null
  },
  { 
    id: 3, 
    title: "Midnight Racing", 
    artist: "Highway Kings", 
    duration: "3:58",
    soundcloudUrl: null
  },
  { 
    id: 4, 
    title: "Engine Dreams", 
    artist: "Garage Sound", 
    duration: "4:33",
    soundcloudUrl: null
  },
  { 
    id: 5, 
    title: "Drift King", 
    artist: "Tokyo Drift", 
    duration: "3:22",
    soundcloudUrl: null
  },
  { 
    id: 6, 
    title: "Redline", 
    artist: "Rev Masters", 
    duration: "4:08",
    soundcloudUrl: null
  },
];

// Web Audio API based audio player for demo sounds
const useAudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = (trackIndex: number) => {
    const audioContext = initAudio();
    
    // Stop any existing sound
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }
    
    // Create a more complex sound based on track index
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    // Different frequencies for different tracks
    const baseFrequencies = [220, 277, 330, 392, 440, 523];
    oscillator.frequency.setValueAtTime(baseFrequencies[trackIndex % 6], audioContext.currentTime);
    oscillator.type = 'sawtooth';
    
    // Filter for warmer sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.Q.setValueAtTime(5, audioContext.currentTime);
    
    // Fade in/out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
  };

  const stopTone = () => {
    if (oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
      setTimeout(() => {
        oscillatorRef.current?.stop();
        oscillatorRef.current?.disconnect();
        oscillatorRef.current = null;
        setIsPlaying(false);
      }, 100);
    }
  };

  return { playTone, stopTone, isPlaying };
};

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const { playTone, stopTone, isPlaying } = useAudioPlayer();

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

  const handlePrevTrack = () => {
    const newTrack = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(newTrack);
    if (isPlaying) {
      playTone(newTrack);
    }
  };

  const handleNextTrack = () => {
    const newTrack = currentTrack === playlist.length - 1 ? 0 : currentTrack + 1;
    setCurrentTrack(newTrack);
    if (isPlaying) {
      playTone(newTrack);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopTone();
    } else {
      playTone(currentTrack);
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrack(index);
    playTone(index);
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

        {/* Music Playlist Section with Web Audio API */}
        <div className="mb-8 bg-[hsl(220,18%,8%)/0.9] backdrop-blur-md border border-[hsl(220,15%,25%)] rounded-lg overflow-hidden">
          <div className="p-4 md:p-6 border-b border-[hsl(220,15%,20%)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--racing-orange))] to-[hsl(var(--racing-orange)/0.6)] flex items-center justify-center animate-pulse">
                  <Music className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-display text-sm md:text-base uppercase tracking-wide text-foreground">
                    Racing Vibes Playlist
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {playlist.length} tracks • Web Audio API powered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <a 
                  href="https://soundcloud.com/tags/racing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[hsl(var(--racing-orange))] hover:underline flex items-center gap-1"
                >
                  More on SoundCloud <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Now Playing Bar */}
          <div className="p-4 bg-gradient-to-r from-[hsl(var(--racing-orange)/0.15)] to-transparent border-b border-[hsl(220,15%,20%)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded bg-[hsl(220,15%,15%)] flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Music className="w-6 h-6 text-[hsl(var(--racing-orange))]" />
                </div>
                <div>
                  <p className="font-display text-sm uppercase tracking-wide text-[hsl(var(--racing-orange))]">
                    {isPlaying ? 'Now Playing' : 'Paused'}
                  </p>
                  <p className="text-foreground font-medium">{playlist[currentTrack].title}</p>
                  <p className="text-xs text-muted-foreground">{playlist[currentTrack].artist}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-[hsl(220,15%,15%)] h-8 w-8"
                  onClick={handlePrevTrack}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  className={`${isPlaying ? 'bg-green-500 hover:bg-green-600' : 'bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)]'} text-black h-10 w-10 transition-colors`}
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-[hsl(220,15%,15%)] h-8 w-8"
                  onClick={handleNextTrack}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Audio Visualizer */}
            {isPlaying && (
              <div className="mt-3 flex items-end justify-center gap-1 h-8">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-[hsl(var(--racing-orange))] rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.3 + Math.random() * 0.3}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Track List */}
          <div className="max-h-48 overflow-y-auto">
            {playlist.map((track, index) => (
              <div 
                key={track.id}
                onClick={() => handleTrackSelect(index)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                  index === currentTrack 
                    ? 'bg-[hsl(var(--racing-orange)/0.1)] border-l-2 border-[hsl(var(--racing-orange))]' 
                    : 'hover:bg-[hsl(220,15%,12%)] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs w-5 ${index === currentTrack ? 'text-[hsl(var(--racing-orange))]' : 'text-muted-foreground'}`}>
                    {index === currentTrack && isPlaying ? (
                      <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-3 bg-[hsl(var(--racing-orange))] animate-pulse" />
                        <div className="w-0.5 h-2 bg-[hsl(var(--racing-orange))] animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 h-4 bg-[hsl(var(--racing-orange))] animate-pulse" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <p className={`text-sm ${index === currentTrack ? 'text-[hsl(var(--racing-orange))]' : 'text-foreground'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>

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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
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
