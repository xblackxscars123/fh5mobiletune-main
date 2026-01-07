import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POPUP_DISMISSED_KEY = 'shop_promo_dismissed';

export function ShopPromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the popup
    const isDismissed = localStorage.getItem(POPUP_DISMISSED_KEY);
    if (isDismissed) return;

    // Show popup after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Container */}
      <div 
        className={`relative w-full max-w-lg bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,18%,8%)] to-[hsl(220,20%,6%)] rounded-2xl border border-[hsl(var(--racing-yellow)/0.3)] shadow-[0_0_60px_hsl(var(--racing-yellow)/0.15),0_0_100px_hsl(var(--racing-orange)/0.1)] overflow-hidden ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        }`}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--racing-yellow))] to-transparent opacity-60" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[hsl(var(--racing-orange)/0.15)] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[hsl(var(--racing-yellow)/0.1)] rounded-full blur-3xl" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        </button>

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--racing-yellow))] to-[hsl(var(--racing-orange))] shadow-lg">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-white uppercase tracking-wide">
                FH5 Garage Shop
              </h2>
              <p className="text-xs text-[hsl(var(--racing-yellow))] font-medium uppercase tracking-wider">
                Premium Auto Accessories
              </p>
            </div>
          </div>

          {/* Hero Message */}
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              Premium Quality.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--racing-yellow))] to-[hsl(var(--racing-orange))]">
                Unbeatable Value.
              </span>
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Curated automotive gear designed for enthusiasts who demand excellence. 
              From detailing essentials to performance accessories — all at prices that make sense.
            </p>
          </div>

          {/* Featured Categories */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {['Detailing', 'Electronics', 'Interior'].map((category) => (
              <div 
                key={category}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center"
              >
                <span className="text-xs font-medium text-white/80">{category}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              asChild
              className="flex-1 bg-gradient-to-r from-[hsl(var(--racing-yellow))] to-[hsl(var(--racing-orange))] hover:from-[hsl(45,100%,55%)] hover:to-[hsl(30,100%,55%)] text-black font-display uppercase tracking-wider h-12 shadow-lg shadow-[hsl(var(--racing-orange)/0.3)]"
            >
              <Link to="/shop" onClick={handleClose}>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Shop
              </Link>
            </Button>
          </div>

          {/* Don't Show Again */}
          <button
            onClick={handleDontShowAgain}
            className="mt-4 w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors py-2"
          >
            Don't show this again
          </button>
        </div>
      </div>
    </div>
  );
}
