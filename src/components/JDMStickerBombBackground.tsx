import { useMemo, useState, useEffect } from 'react';
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
  layer: 'far' | 'mid' | 'near'; // For parallax
  hasHolo?: boolean; // Holographic effect
}

const stickerConfigs: StickerConfig[] = [
  // Far layer (slowest parallax)
  { src: supra, alt: "Toyota Supra", top: "-2%", left: "5%", width: "280px", rotate: -8, zIndex: 4, layer: 'far' },
  { src: gtr, alt: "Nissan GTR", top: "0%", left: "30%", width: "320px", rotate: 5, zIndex: 3, mobileHidden: true, layer: 'far' },
  { src: rx7, alt: "Mazda RX7", top: "-5%", right: "15%", width: "300px", rotate: -12, zIndex: 4, layer: 'far', hasHolo: true },
  { src: nsx, alt: "Honda NSX", top: "5%", right: "-5%", width: "260px", rotate: 15, zIndex: 3, mobileHidden: true, layer: 'far' },
  
  // Mid layer
  { src: silvia, alt: "Nissan Silvia", top: "15%", left: "-8%", width: "280px", rotate: 12, zIndex: 6, layer: 'mid', hasHolo: true },
  { src: evo, alt: "Mitsubishi Evo", top: "22%", right: "8%", width: "300px", rotate: -6, zIndex: 5, mobileHidden: true, layer: 'mid' },
  { src: wrx, alt: "Subaru WRX", top: "35%", left: "-12%", width: "240px", rotate: 18, zIndex: 5, mobileHidden: true, layer: 'mid' },
  { src: z350, alt: "Nissan 350Z", top: "38%", right: "-10%", width: "260px", rotate: -15, zIndex: 6, layer: 'mid' },
  
  // Near layer (fastest parallax)
  { src: ae86, alt: "Toyota AE86", top: "55%", left: "3%", width: "260px", rotate: -10, zIndex: 8, mobileHidden: true, layer: 'near', hasHolo: true },
  { src: s2000, alt: "Honda S2000", top: "52%", right: "0%", width: "280px", rotate: 8, zIndex: 7, layer: 'near' },
  { src: r32, alt: "Nissan Skyline R32", bottom: "8%", left: "-5%", width: "300px", rotate: 6, zIndex: 8, layer: 'near' },
  { src: mr2, alt: "Toyota MR2", bottom: "5%", right: "-8%", width: "280px", rotate: -12, zIndex: 7, mobileHidden: true, layer: 'near', hasHolo: true },
];

export const JDMStickerBombBackground = () => {
  const isMobile = useIsMobile();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredSticker, setHoveredSticker] = useState<number | null>(null);
  const [driftOffset, setDriftOffset] = useState({ x: 0, y: 0 });
  
  // Slow continuous drift animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDriftOffset(prev => ({
        x: Math.sin(Date.now() / 10000) * 2,
        y: Math.cos(Date.now() / 12000) * 1.5,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Random z-index shuffle every 30 seconds
  const [shuffleSeed, setShuffleSeed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setShuffleSeed(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const visibleStickers = useMemo(() => {
    if (isMobile) {
      return stickerConfigs.filter(s => !s.mobileHidden);
    }
    return stickerConfigs;
  }, [isMobile]);

  // Parallax factors for each layer
  const parallaxFactor: Record<'far' | 'mid' | 'near', number> = {
    far: 0.2,
    mid: 0.5,
    near: 0.8,
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient - darker in center for content readability - enhanced */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 70% at 50% 50%, 
              hsl(220 25% 6%) 0%, 
              hsl(220 20% 8%) 40%, 
              hsl(220 22% 10%) 100%
            )
          `
        }}
      />

      {/* Dynamic glow background spots */}
      <div 
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-8"
        style={{ background: 'hsl(330 100% 60%)', animation: 'glowPulse 6s ease-in-out infinite' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-[100px] opacity-8"
        style={{ background: 'hsl(185 100% 50%)', animation: 'glowPulse 7s ease-in-out infinite', animationDelay: '-2s' }}
      />
      
      {/* Sticker images with parallax layers */}
      {visibleStickers.map((sticker, index) => {
        const parallax = parallaxFactor[sticker.layer];
        const isHovered = hoveredSticker === index;
        const driftX = driftOffset.x * parallax;
        const driftY = driftOffset.y * parallax;
        
        return (
          <div
            key={index}
            className={`absolute transition-all duration-700 ${isHovered ? 'z-50' : ''}`}
            style={{
              top: sticker.top,
              left: sticker.left,
              right: sticker.right,
              bottom: sticker.bottom,
              width: isMobile ? `calc(${sticker.width} * 0.6)` : sticker.width,
              zIndex: sticker.zIndex + (shuffleSeed % 3),
              transform: `
                rotate(${sticker.rotate + driftX * 0.1}deg) 
                translateX(${driftX}px) 
                translateY(${driftY}px)
                ${isHovered ? 'scale(1.05) rotate(0deg)' : ''}
              `,
            }}
            onMouseEnter={() => setHoveredSticker(index)}
            onMouseLeave={() => setHoveredSticker(null)}
          >
            <div
              className={`relative w-full h-full transition-all duration-300 ${isHovered ? 'animate-sticker-wobble' : ''}`}
              style={{
                filter: 'saturate(1.1) contrast(1.05)',
              }}
            >
              {/* Sticker border/shadow effect */}
              <div
                className={`absolute inset-0 rounded-lg transition-all duration-300 ${isHovered ? 'shadow-2xl' : ''}`}
                style={{
                  boxShadow: isHovered ? `
                    0 8px 40px rgba(0,0,0,0.6),
                    0 0 40px hsl(var(--primary) / 0.3),
                    inset 0 0 0 2px rgba(255,255,255,0.15)
                  ` : `
                    0 4px 20px rgba(0,0,0,0.5),
                    0 0 30px hsl(var(--primary) / 0.15),
                    inset 0 0 0 2px rgba(255,255,255,0.08)
                  `,
                }}
              />
              
              {/* Peel corner effect on hover */}
              {isHovered && (
                <div 
                  className="absolute top-0 right-0 w-8 h-8 animate-peel"
                  style={{
                    background: 'linear-gradient(135deg, transparent 50%, hsl(var(--neon-pink)) 50%)',
                    borderRadius: '0 8px 0 0',
                  }}
                />
              )}
              
              <img
                src={sticker.src}
                alt={sticker.alt}
                className="w-full h-auto rounded-lg object-cover pointer-events-auto cursor-pointer"
                style={{
                  opacity: isHovered ? 0.9 : 0.75,
                  mixBlendMode: 'normal',
                }}
                loading="lazy"
              />
              
              {/* Holographic shimmer effect */}
              {sticker.hasHolo && (
                <div 
                  className="absolute inset-0 rounded-lg pointer-events-none animate-holo-shimmer"
                  style={{
                    background: `linear-gradient(
                      ${45 + driftX * 10}deg, 
                      transparent 0%,
                      hsl(300 100% 70% / 0.1) 25%,
                      hsl(180 100% 70% / 0.1) 50%,
                      hsl(60 100% 70% / 0.1) 75%,
                      transparent 100%
                    )`,
                    mixBlendMode: 'overlay',
                  }}
                />
              )}
              
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
        );
      })}
      
      {/* JDM Text stickers (decorative) */}
      <div className="absolute top-[40%] left-[15%] rotate-[-15deg] opacity-20 font-display text-3xl text-white hidden md:block">
        チューン
      </div>
      <div className="absolute bottom-[35%] right-[20%] rotate-[10deg] opacity-15 font-display text-2xl text-cyan-400 hidden md:block">
        カスタム
      </div>
      
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
      
      {/* Chrome accent lines */}
      <div 
        className="absolute top-[20%] left-0 right-0 h-px opacity-10 hidden md:block"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)',
        }}
      />
      <div 
        className="absolute bottom-[25%] left-0 right-0 h-px opacity-10 hidden md:block"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--neon-pink)), transparent)',
        }}
      />
      
      {/* Ambient racing glow accents */}
      <div 
        className="absolute top-1/4 left-0 w-1/3 h-96 opacity-20 blur-3xl hidden md:block animate-glow-pulse"
        style={{
          background: 'hsl(var(--primary) / 0.3)',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-0 w-1/3 h-96 opacity-15 blur-3xl hidden md:block animate-glow-pulse"
        style={{
          background: 'hsl(var(--racing-cyan) / 0.3)',
          animationDelay: '-2s',
        }}
      />
    </div>
  );
};
