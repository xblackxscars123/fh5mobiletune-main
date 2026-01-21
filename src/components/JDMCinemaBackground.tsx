import { useMemo } from 'react';
import { useBackgroundSlideshow, BackgroundImage } from '@/hooks/useBackgroundSlideshow';

// Import all JDM images
import supra from '@/assets/jdm/supra.jpg';
import gtr from '@/assets/jdm/gtr.jpg';
import rx7 from '@/assets/jdm/rx7.jpg';
import nsx from '@/assets/jdm/nsx.jpg';
import silvia from '@/assets/jdm/silvia.jpg';
import evo from '@/assets/jdm/evo.jpg';
import wrx from '@/assets/jdm/wrx.jpg';
import z350 from '@/assets/jdm/350z.jpg';
import ae86 from '@/assets/jdm/ae86.jpg';
import s2000 from '@/assets/jdm/s2000.jpg';
import r32 from '@/assets/jdm/r32.jpg';
import mr2 from '@/assets/jdm/mr2.jpg';

const jdmImages: BackgroundImage[] = [
  { src: supra, alt: 'Toyota Supra MK4', focusX: -0.3, focusY: 0.2 },
  { src: gtr, alt: 'Nissan GT-R R35', focusX: 0.4, focusY: -0.1 },
  { src: rx7, alt: 'Mazda RX-7 FD', focusX: 0.2, focusY: 0.3 },
  { src: nsx, alt: 'Honda NSX', focusX: -0.4, focusY: 0.1 },
  { src: silvia, alt: 'Nissan Silvia S15', focusX: 0.3, focusY: -0.2 },
  { src: evo, alt: 'Mitsubishi Evolution', focusX: -0.2, focusY: -0.3 },
  { src: wrx, alt: 'Subaru WRX STI', focusX: 0.1, focusY: 0.4 },
  { src: z350, alt: 'Nissan 350Z', focusX: -0.3, focusY: -0.1 },
  { src: ae86, alt: 'Toyota AE86 Trueno', focusX: 0.4, focusY: 0.2 },
  { src: s2000, alt: 'Honda S2000', focusX: -0.1, focusY: 0.3 },
  { src: r32, alt: 'Nissan Skyline R32', focusX: 0.2, focusY: -0.3 },
  { src: mr2, alt: 'Toyota MR2', focusX: -0.4, focusY: 0.1 },
];

export const JDMCinemaBackground = () => {
  const { currentImage, nextImage, isTransitioning } = useBackgroundSlideshow(
    jdmImages,
    8000, // 8 second interval
    2000  // 2 second crossfade
  );

  // Generate random Ken Burns direction for current image
  const kenBurnsStyle = useMemo(() => ({
    '--drift-x': `${(currentImage.focusX || 0) * 30}px`,
    '--drift-y': `${(currentImage.focusY || 0) * 30}px`,
  }), [currentImage]);

  const nextKenBurnsStyle = useMemo(() => ({
    '--drift-x': `${(nextImage.focusX || 0) * 30}px`,
    '--drift-y': `${(nextImage.focusY || 0) * 30}px`,
  }), [nextImage]);

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
          transition: 'opacity 2s ease-in-out',
        } as React.CSSProperties}
      />

      {/* Next Image Layer - fades in during transition */}
      <div
        className={isTransitioning ? 'absolute inset-0 ken-burns-active' : 'absolute inset-0'}
        style={{
          ...nextKenBurnsStyle,
          backgroundImage: `url(${nextImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 2s ease-in-out',
        } as React.CSSProperties}
      />

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

      {/* Strong vignette for content readability */}
      <div 
        className="absolute inset-0"
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

      {/* Neon city skyline at bottom */}
      <svg 
        className="absolute bottom-0 left-0 right-0 h-32 opacity-60"
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
          fill="url(#cityGradient)"
        />
        
        {/* Window lights */}
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

      {/* Blueprint grid overlay - subtle */}
      <div 
        className="absolute inset-0 blueprint-bg opacity-20"
        style={{ pointerEvents: 'none' }}
      />

      {/* Retro scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none"
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
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Animated scan line */}
      <div className="scan-line" />
    </div>
  );
};
