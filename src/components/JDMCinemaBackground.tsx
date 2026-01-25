import { useMemo } from 'react';
import { useBackgroundSlideshow, TransitionType } from '@/hooks/useBackgroundSlideshow';
import { jdmBackgroundImages, shuffleImages } from '@/data/jdmBackgroundImages';

// Get transition class based on type
function getTransitionClass(type: TransitionType, isActive: boolean): string {
  if (!isActive) return '';
  
  const classes: Record<TransitionType, string> = {
    crossfade: 'animate-transition-crossfade',
    slideLeft: 'animate-transition-slideLeft',
    slideRight: 'animate-transition-slideRight',
    slideUp: 'animate-transition-slideUp',
    slideDown: 'animate-transition-slideDown',
    zoomIn: 'animate-transition-zoomIn',
    zoomOut: 'animate-transition-zoomOut',
    blur: 'animate-transition-blur',
    flip: 'animate-transition-flip',
    swipe: 'animate-transition-swipe',
  };
  
  return classes[type] || 'animate-transition-crossfade';
}

// Shuffle images on initial load for variety
const shuffledImages = shuffleImages(jdmBackgroundImages);

export const JDMCinemaBackground = () => {
  const { currentImage, nextImage, isTransitioning, transitionType } = useBackgroundSlideshow(
    shuffledImages,
    60000, // 60 second interval (1 minute)
    3000   // 3 second crossfade
  );

  // Generate Ken Burns direction for current image
  const kenBurnsStyle = useMemo(() => ({
    '--drift-x': `${(currentImage.focusX || 0) * 30}px`,
    '--drift-y': `${(currentImage.focusY || 0) * 30}px`,
  }), [currentImage]);

  const nextKenBurnsStyle = useMemo(() => ({
    '--drift-x': `${(nextImage.focusX || 0) * 30}px`,
    '--drift-y': `${(nextImage.focusY || 0) * 30}px`,
  }), [nextImage]);

  // Get dynamic transition class
  const transitionClass = getTransitionClass(transitionType, isTransitioning);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, 
            hsl(280 60% 12%) 0%, 
            hsl(220 50% 8%) 50%,
            hsl(220 45% 6%) 100%)`
        }}
      />

      {/* Current Image Layer with Ken Burns */}
      <div
        className="absolute inset-0 ken-burns-active"
        style={{
          ...kenBurnsStyle,
          backgroundImage: `url(${currentImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 3s ease-in-out',
        } as React.CSSProperties}
      />

      {/* Next Image Layer - with dynamic transition effect */}
      <div
        className={`absolute inset-0 ${isTransitioning ? `ken-burns-active ${transitionClass}` : ''}`}
        style={{
          ...nextKenBurnsStyle,
          backgroundImage: `url(${nextImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isTransitioning ? 1 : 0,
        } as React.CSSProperties}
      />

      {/* VHS/Film grain overlay */}
      <div 
        className="absolute inset-0 vhs-grain pointer-events-none"
        style={{ opacity: 0.15 }}
      />

      {/* Color aberration effect during transitions */}
      {isTransitioning && (
        <div 
          className="absolute inset-0 pointer-events-none animate-color-aberration"
          style={{
            background: `linear-gradient(90deg, 
              hsl(0 100% 50% / 0.03) 0%, 
              transparent 33%,
              transparent 66%,
              hsl(200 100% 50% / 0.03) 100%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Vaporwave color grading overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            hsl(280 100% 50% / 0.15) 0%, 
            transparent 40%,
            hsl(185 100% 50% / 0.1) 100%)`,
          mixBlendMode: 'color',
        }}
      />

      {/* Animated vignette with pulse */}
      <div 
        className="absolute inset-0 animate-vignette-pulse"
        style={{
          background: `
            radial-gradient(ellipse 120% 120% at 50% 50%, 
              transparent 0%, 
              hsl(220 50% 6% / 0.4) 40%,
              hsl(220 50% 6% / 0.85) 70%,
              hsl(220 50% 6% / 0.98) 100%)`
        }}
      />

      {/* Top fade for header readability */}
      <div 
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(220 50% 6% / 0.95) 0%,
            hsl(220 50% 6% / 0.7) 40%,
            transparent 100%)`
        }}
      />

      {/* Horizon glow line */}
      <div 
        className="absolute bottom-24 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            hsl(330 100% 65% / 0.6) 20%,
            hsl(185 100% 50% / 0.8) 50%,
            hsl(330 100% 65% / 0.6) 80%,
            transparent 100%)`,
          boxShadow: '0 0 30px hsl(330 100% 65% / 0.5), 0 0 60px hsl(185 100% 50% / 0.3)',
        }}
      />

      {/* Neon city skyline at bottom */}
      <svg 
        className="absolute bottom-0 left-0 right-0 h-32"
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(280 100% 60%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(280 100% 40%)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(185 100% 70%)" />
            <stop offset="100%" stopColor="hsl(45 100% 60%)" />
          </linearGradient>
        </defs>
        
        {/* Buildings silhouette */}
        <path 
          d="M0,120 L0,80 L60,80 L60,50 L120,50 L120,70 L180,70 L180,40 L220,40 L220,60 L280,60 L280,30 L340,30 L340,55 L400,55 L400,25 L450,25 L450,45 L500,45 L500,20 L550,20 L550,50 L620,50 L620,35 L680,35 L680,60 L750,60 L750,25 L820,25 L820,55 L880,55 L880,40 L950,40 L950,65 L1020,65 L1020,45 L1080,45 L1080,70 L1140,70 L1140,55 L1200,55 L1200,120 Z"
        <defs>
          <linearGradient id="cityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(280 100% 60%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(280 100% 40%)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(185 100% 70%)" />
            <stop offset="100%" stopColor="hsl(45 100% 60%)" />
          </linearGradient>
          <filter id="cityGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Buildings silhouette with glow */}
        <path 
          d="M0,120 L0,80 L60,80 L60,50 L120,50 L120,70 L180,70 L180,40 L220,40 L220,60 L280,60 L280,30 L340,30 L340,55 L400,55 L400,25 L450,25 L450,45 L500,45 L500,20 L550,20 L550,50 L620,50 L620,35 L680,35 L680,60 L750,60 L750,25 L820,25 L820,55 L880,55 L880,40 L950,40 L950,65 L1020,65 L1020,45 L1080,45 L1080,70 L1140,70 L1140,55 L1200,55 L1200,120 Z"
          fill="url(#cityGradient)"
          filter="url(#cityGlow)"
        />
        
        {/* Window lights - animated */}
        <g fill="url(#windowGlow)" className="animate-pulse">
          <rect x="75" y="60" width="3" height="4" rx="0.5" opacity="0.8" />
          <rect x="135" y="55" width="3" height="4" rx="0.5" opacity="0.6" />
          <rect x="200" y="48" width="3" height="4" rx="0.5" opacity="0.9" />
          <rect x="310" y="38" width="3" height="4" rx="0.5" opacity="0.7" />
          <rect x="420" y="33" width="3" height="4" rx="0.5" opacity="0.8" />
          <rect x="520" y="28" width="3" height="4" rx="0.5" opacity="0.6" />
          <rect x="650" y="42" width="3" height="4" rx="0.5" opacity="0.9" />
          <rect x="780" y="35" width="3" height="4" rx="0.5" opacity="0.7" />
          <rect x="910" y="50" width="3" height="4" rx="0.5" opacity="0.8" />
          <rect x="1050" y="55" width="3" height="4" rx="0.5" opacity="0.6" />
        </g>
      </svg>

      {/* Blueprint grid overlay - subtle */}
      <div 
        className="absolute inset-0 blueprint-bg opacity-20"
        style={{ pointerEvents: 'none' }}
      />

      {/* Retro scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none animate-scanlines"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            hsl(0 0% 0% / 0.03) 2px,
            hsl(0 0% 0% / 0.03) 4px
          )`,
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Light leak effect - warm glow */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 0%, 
            hsl(40 100% 60% / 0.12) 0%, 
            hsl(20 100% 50% / 0.04) 40%,
            transparent 70%)`,
          animation: 'lightLeakPulse 8s ease-in-out infinite',
        }}
      />
    </div>
  );
};
