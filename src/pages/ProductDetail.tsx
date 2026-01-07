import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductByHandle, ShopifyProduct } from '@/lib/shopify';
import { useCartStore, CartItem } from '@/stores/cartStore';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Loader2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        setLoading(true);
        const data = await fetchProductByHandle(handle);
        setProduct(data);
        if (data?.variants?.edges?.[0]) {
          setSelectedVariant(data.variants.edges[0].node.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const variant = product.variants.edges.find(v => v.node.id === selectedVariant);
    if (!variant) return;

    const cartItem: CartItem = {
      product: { node: product } as ShopifyProduct,
      variantId: variant.node.id,
      variantTitle: variant.node.title,
      price: variant.node.price,
      quantity,
      selectedOptions: variant.node.selectedOptions || []
    };

    addItem(cartItem);
    toast.success(`Added ${product.title} to cart`, {
      position: 'top-center'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--racing-orange))]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Link to="/shop">
            <Button className="mt-4">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.edges || [];
  const currentVariant = product.variants.edges.find(v => v.node.id === selectedVariant)?.node;
  const price = currentVariant?.price || product.priceRange.minVariantPrice;

  return (
    <div className="min-h-screen pb-8 md:pb-16">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Header */}
        <header className="py-6 md:py-8 flex items-center justify-between">
          <Link to="/shop">
            <Button variant="ghost" size="icon" className="border border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <CartDrawer />
        </header>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[hsl(220,18%,8%)] rounded-lg border border-[hsl(220,15%,18%)] overflow-hidden">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      selectedImage === idx 
                        ? 'border-[hsl(var(--racing-orange))]' 
                        : 'border-[hsl(220,15%,18%)]'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || ''}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl md:text-4xl uppercase tracking-wide text-[hsl(var(--racing-orange))]">
                {product.title}
              </h1>
              <p className="text-2xl md:text-3xl font-bold mt-4">
                {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
              </p>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Variants */}
            {product.options && product.options.length > 0 && product.options[0].name !== 'Title' && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const matchingVariant = product.variants.edges.find(v =>
                          v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                        );
                        const isSelected = selectedVariant === matchingVariant?.node.id;
                        
                        return (
                          <button
                            key={value}
                            onClick={() => matchingVariant && setSelectedVariant(matchingVariant.node.id)}
                            className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                              isSelected
                                ? 'border-[hsl(var(--racing-orange))] bg-[hsl(var(--racing-orange)/0.1)] text-[hsl(var(--racing-orange))]'
                                : 'border-[hsl(220,15%,25%)] hover:border-[hsl(var(--racing-orange)/0.5)]'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border-[hsl(220,15%,25%)]"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="border-[hsl(220,15%,25%)]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black font-display uppercase tracking-wider text-lg h-14"
              disabled={!currentVariant?.availableForSale}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {currentVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
