import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// Import JDM car images
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

interface StickerConfig {
  src: string;
  alt: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width: string;
  rotate: number;
  zIndex: number;
  mobileHidden?: boolean;
}

const stickerConfigs: StickerConfig[] = [
  // Top row - visible on desktop & mobile
  { src: supra, alt: "Toyota Supra", top: "-2%", left: "5%", width: "280px", rotate: -8, zIndex: 12 },
  { src: gtr, alt: "Nissan GTR", top: "0%", left: "30%", width: "320px", rotate: 5, zIndex: 11, mobileHidden: true },
  { src: rx7, alt: "Mazda RX7", top: "-5%", right: "15%", width: "300px", rotate: -12, zIndex: 10 },
  { src: nsx, alt: "Honda NSX", top: "5%", right: "-5%", width: "260px", rotate: 15, zIndex: 9, mobileHidden: true },
  
  // Upper middle - staggered
  { src: silvia, alt: "Nissan Silvia", top: "15%", left: "-8%", width: "280px", rotate: 12, zIndex: 8 },
  { src: evo, alt: "Mitsubishi Evo", top: "22%", right: "8%", width: "300px", rotate: -6, zIndex: 7, mobileHidden: true },
  
  // Middle row - peek from sides
  { src: wrx, alt: "Subaru WRX", top: "35%", left: "-12%", width: "240px", rotate: 18, zIndex: 6, mobileHidden: true },
  { src: z350, alt: "Nissan 350Z", top: "38%", right: "-10%", width: "260px", rotate: -15, zIndex: 5 },
  
  // Lower middle
  { src: ae86, alt: "Toyota AE86", top: "55%", left: "3%", width: "260px", rotate: -10, zIndex: 4, mobileHidden: true },
  { src: s2000, alt: "Honda S2000", top: "52%", right: "0%", width: "280px", rotate: 8, zIndex: 3 },
  
  // Bottom row
  { src: r32, alt: "Nissan Skyline R32", bottom: "8%", left: "-5%", width: "300px", rotate: 6, zIndex: 2 },
  { src: mr2, alt: "Toyota MR2", bottom: "5%", right: "-8%", width: "280px", rotate: -12, zIndex: 1, mobileHidden: true },
];

export const JDMStickerBombBackground = () => {
  const isMobile = useIsMobile();
  
  const visibleStickers = useMemo(() => {
    if (isMobile) {
      return stickerConfigs.filter(s => !s.mobileHidden);
    }
    return stickerConfigs;
  }, [isMobile]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient - darker in center for content readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, 
              hsl(220, 20%, 4%) 0%, 
              hsl(220, 20%, 6%) 40%, 
              hsl(220, 22%, 8%) 100%
            )
          `
        }}
      />
      
      {/* Sticker images */}
      {visibleStickers.map((sticker, index) => (
        <div
          key={index}
          className="absolute transition-transform duration-500"
          style={{
            top: sticker.top,
            left: sticker.left,
            right: sticker.right,
            bottom: sticker.bottom,
            width: isMobile ? `calc(${sticker.width} * 0.6)` : sticker.width,
            zIndex: sticker.zIndex,
            transform: `rotate(${sticker.rotate}deg)`,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              filter: 'saturate(1.1) contrast(1.05)',
            }}
          >
            {/* Sticker border/shadow effect */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                boxShadow: `
                  0 4px 20px rgba(0,0,0,0.5),
                  0 0 30px hsl(var(--primary) / 0.15),
                  inset 0 0 0 2px rgba(255,255,255,0.08)
                `,
              }}
            />
            <img
              src={sticker.src}
              alt={sticker.alt}
              className="w-full h-auto rounded-lg object-cover"
              style={{
                opacity: 0.75,
                mixBlendMode: 'normal',
              }}
              loading="lazy"
            />
            {/* Subtle overlay for blending */}
            <div 
              className="absolute inset-0 rounded-lg"
              style={{
                background: `linear-gradient(135deg, 
                  hsl(var(--primary) / 0.05) 0%, 
                  transparent 50%,
                  hsl(var(--racing-cyan) / 0.05) 100%
                )`,
              }}
            />
          </div>
        </div>
      ))}
      
      {/* Frosted glass blur overlay for content readability */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, 
              hsl(220, 20%, 6% / 0.65) 0%, 
              hsl(220, 20%, 6% / 0.5) 40%,
              hsl(220, 20%, 6% / 0.4) 100%
            )
          `,
        }}
      />
      
      {/* Strong vignette for content focus */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 50%, 
              transparent 0%, 
              hsl(220, 20%, 6% / 0.7) 60%,
              hsl(220, 20%, 6% / 0.95) 100%
            )
          `,
        }}
      />
      
      {/* Top and bottom fade for clean edges */}
      <div 
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, hsl(220, 20%, 6%) 0%, transparent 100%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, hsl(220, 20%, 6%) 0%, transparent 100%)',
        }}
      />
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Ambient racing glow accents */}
      <div 
        className="absolute top-1/4 left-0 w-1/3 h-96 opacity-20 blur-3xl hidden md:block"
        style={{
          background: 'hsl(var(--primary) / 0.3)',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-0 w-1/3 h-96 opacity-15 blur-3xl hidden md:block"
        style={{
          background: 'hsl(var(--racing-cyan) / 0.3)',
        }}
      />
    </div>
  );
};
