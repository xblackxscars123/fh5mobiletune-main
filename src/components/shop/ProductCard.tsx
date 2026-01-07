import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShopifyProduct } from '@/lib/shopify';
import { useCartStore, CartItem } from '@/stores/cartStore';
import { ShoppingCart, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const firstImage = node.images?.edges?.[0]?.node;
  const firstVariant = node.variants?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) {
      toast.error('Product not available');
      return;
    }

    const cartItem: CartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success(`Added ${node.title} to cart`, {
      position: 'top-center'
    });
  };

  return (
    <Link to={`/shop/product/${node.handle}`} className="group block">
      <div className="bg-[hsl(220,18%,8%)] border border-[hsl(220,15%,18%)] rounded-lg overflow-hidden transition-all duration-300 hover:border-[hsl(var(--racing-orange)/0.5)] hover:shadow-[0_0_20px_hsl(var(--racing-orange)/0.2)]">
        {/* Product Image */}
        <div className="aspect-square bg-[hsl(220,15%,12%)] relative overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage.url}
              alt={firstImage.altText || node.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Quick Add Button */}
          <Button
            onClick={handleAddToCart}
            size="icon"
            className="absolute bottom-3 right-3 bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-display text-sm uppercase tracking-wide text-foreground truncate group-hover:text-[hsl(var(--racing-orange))] transition-colors">
            {node.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {node.description || 'High-quality car accessory'}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-[hsl(var(--racing-orange))]">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </span>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black font-display text-xs uppercase tracking-wider"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
