import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShopifyProduct, fetchProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Car, Loader2, Youtube, ChevronDown, ChevronUp, Music2 } from 'lucide-react';
import shopHeroBg from '@/assets/shop-hero-bg.jpg';

// Preset playlists for users to choose from
const PLAYLISTS = [
  { id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf', name: 'Lo-fi Beats', icon: '🎧' },
  { id: 'PLChOO_ZAB22WuyDODJ3kjJiU0oQzWOTyb', name: 'Synthwave', icon: '🌆' },
  { id: 'PLw-VjHDlEOgtl4ldJJ8Arb2WeSlAyBkJS', name: 'Driving Music', icon: '🚗' },
  { id: 'PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10', name: 'Night Drive', icon: '🌙' },
];

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(PLAYLISTS[0]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

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

        {/* Collapsible YouTube Music Player */}
        <div className="mb-8 bg-[hsl(220,18%,8%)/0.9] backdrop-blur-md border border-[hsl(220,15%,25%)] rounded-lg overflow-hidden">
          {/* Player Header - Always Visible */}
          <div 
            className="p-4 md:p-5 cursor-pointer hover:bg-[hsl(220,15%,12%)] transition-colors"
            onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-sm md:text-base uppercase tracking-wide text-foreground flex items-center gap-2">
                    Racing Vibes
                    <span className="text-xs font-normal normal-case text-muted-foreground">
                      {isPlayerExpanded ? 'Click to minimize' : 'Click to expand'}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Music2 className="w-3 h-3" />
                    {selectedPlaylist.icon} {selectedPlaylist.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`https://www.youtube.com/playlist?list=${selectedPlaylist.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-red-500 hover:underline hidden sm:flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open on YouTube <Youtube className="w-3 h-3" />
                </a>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-[hsl(220,15%,20%)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlayerExpanded(!isPlayerExpanded);
                  }}
                >
                  {isPlayerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable Content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isPlayerExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {/* Playlist Selector */}
            <div className="px-4 pb-3 border-b border-[hsl(220,15%,20%)]">
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between bg-[hsl(220,15%,12%)] border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,18%)]"
                  onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                >
                  <span className="flex items-center gap-2">
                    <span>{selectedPlaylist.icon}</span>
                    <span>{selectedPlaylist.name}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPlaylistMenu ? 'rotate-180' : ''}`} />
                </Button>
                
                {showPlaylistMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,25%)] rounded-md overflow-hidden z-20">
                    {PLAYLISTS.map((playlist) => (
                      <button
                        key={playlist.id}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[hsl(220,15%,18%)] flex items-center gap-2 transition-colors ${
                          selectedPlaylist.id === playlist.id ? 'bg-[hsl(var(--racing-orange)/0.1)] text-[hsl(var(--racing-orange))]' : ''
                        }`}
                        onClick={() => {
                          setSelectedPlaylist(playlist);
                          setShowPlaylistMenu(false);
                        }}
                      >
                        <span>{playlist.icon}</span>
                        <span>{playlist.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Embedded YouTube Player */}
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/videoseries?list=${selectedPlaylist.id}&autoplay=0&rel=0`}
                title="Racing Vibes Playlist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
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
