import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POPUP_DISMISSED_KEY = 'shop_promo_dismissed';

export function ShopPromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the popup
    const isDismissed = localStorage.getItem(POPUP_DISMISSED_KEY);
    if (isDismissed) return;

    // Show banner after a brief delay for smooth page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`mb-4 md:mb-6 overflow-hidden rounded-lg border border-[hsl(var(--racing-orange)/0.3)] bg-gradient-to-r from-[hsl(220,20%,8%)] via-[hsl(220,18%,10%)] to-[hsl(220,20%,8%)] relative ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      {/* Subtle glow accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--racing-orange)/0.5)] to-transparent" />
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
        aria-label="Close promotion"
      >
        <X className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
      </button>

      {/* Content - Horizontal Layout */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 pr-10">
        {/* Icon + Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--racing-yellow))] to-[hsl(var(--racing-orange))] shadow-lg shadow-[hsl(var(--racing-orange)/0.2)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-sm uppercase tracking-wide text-[hsl(var(--racing-orange))]">
                FH5 Garage Shop
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-white/60">Premium Auto Accessories</span>
            </div>
            <p className="text-sm text-white/80 mt-0.5">
              <span className="font-semibold text-white">Premium Quality.</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--racing-yellow))] to-[hsl(var(--racing-orange))]">
                Unbeatable Value.
              </span>
            </p>
          </div>
        </div>

        {/* Category Pills - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {['Detailing', 'Electronics', 'Interior'].map((category) => (
            <span 
              key={category}
              className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/70"
            >
              {category}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            asChild
            size="sm"
            className="bg-gradient-to-r from-[hsl(var(--racing-yellow))] to-[hsl(var(--racing-orange))] hover:from-[hsl(45,100%,55%)] hover:to-[hsl(30,100%,55%)] text-black font-display uppercase tracking-wider text-xs h-9 px-4 shadow-lg shadow-[hsl(var(--racing-orange)/0.2)]"
          >
            <Link to="/shop" className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Browse Shop</span>
              <span className="sm:hidden">Shop</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </Button>
          
          {/* Dismiss link - subtle */}
          <button
            onClick={handleDontShowAgain}
            className="text-[10px] text-white/30 hover:text-white/50 transition-colors px-2 hidden sm:block"
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
}
