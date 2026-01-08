import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShopifyProduct, fetchProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Car, Loader2, Music2, ExternalLink } from 'lucide-react';
import shopHeroBg from '@/assets/shop-hero-bg.jpg';

// Curated car scene music genres with Spotify playlist links
const MUSIC_GENRES = [
  { 
    name: 'Synthwave', 
    description: 'Retro-futuristic vibes', 
    color: 'from-purple-500 to-pink-500',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM'
  },
  { 
    name: 'Drum & Bass', 
    description: 'High-energy racing beats', 
    color: 'from-orange-500 to-red-500',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8tZsk68tuDw'
  },
  { 
    name: 'Lo-Fi Beats', 
    description: 'Chill cruising sessions', 
    color: 'from-cyan-500 to-blue-500',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn'
  },
  { 
    name: 'EDM', 
    description: 'Festival-ready car audio', 
    color: 'from-yellow-500 to-orange-500',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n'
  },
  { 
    name: 'Hip-Hop', 
    description: 'Street scene classics', 
    color: 'from-green-500 to-emerald-500',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd'
  },
  { 
    name: 'Phonk', 
    description: 'Drift-ready underground', 
    color: 'from-red-600 to-purple-600',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWY64wDtewQt'
  },
];

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

        {/* Curated Music Genres */}
        <div className="mb-8 bg-[hsl(220,18%,8%)/0.9] backdrop-blur-md border border-[hsl(220,15%,25%)] rounded-lg overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--racing-orange))] to-[hsl(var(--racing-orange)/0.6)] flex items-center justify-center">
                <Music2 className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-display text-sm uppercase tracking-wide text-foreground">Car Scene Vibes</h3>
                <p className="text-xs text-muted-foreground">Curated playlists for your drive</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {MUSIC_GENRES.map((genre) => (
                <a
                  key={genre.name}
                  href={genre.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-lg p-4 transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, hsl(220, 18%, 12%), hsl(220, 18%, 8%))`,
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                  <div className="relative z-10">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-white transition-colors">{genre.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{genre.description}</p>
                    <ExternalLink className="w-3 h-3 text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
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
