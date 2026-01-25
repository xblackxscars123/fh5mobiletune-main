import { useMemo, useState, useEffect } from 'react';

interface SketchAnnotation {
  text: string;
  x: string;
  y: string;
  rotate?: number;
  size?: 'sm' | 'md' | 'lg';
}

const annotations: SketchAnnotation[] = [
  { text: 'suspension geometry →', x: '5%', y: '15%', rotate: -5, size: 'md' },
  { text: '← tire contact patch', x: '75%', y: '20%', rotate: 8, size: 'sm' },
  { text: 'weight transfer', x: '10%', y: '45%', rotate: -3, size: 'lg' },
  { text: 'aero balance →', x: '80%', y: '55%', rotate: 5, size: 'md' },
  { text: '← diff lock %', x: '8%', y: '75%', rotate: -8, size: 'sm' },
  { text: 'spring rates', x: '85%', y: '80%', rotate: 3, size: 'md' },
];

// Car schematic SVG paths for self-drawing animation
const carSchematicPaths = [
  // Body outline
  'M 100,150 Q 120,100 200,100 L 350,100 Q 400,100 420,150 L 430,180 Q 440,200 420,210 L 100,210 Q 80,200 90,180 Z',
  // Roof line
  'M 150,100 Q 160,60 250,60 L 320,60 Q 340,60 350,100',
  // Front wheel well
  'M 90,180 A 30,30 0 1,1 150,180',
  // Rear wheel well
  'M 370,180 A 30,30 0 1,1 430,180',
  // Hood line
  'M 100,130 L 170,130',
  // Trunk line
  'M 350,130 L 420,130',
];

// Dimension lines data
const dimensionLines = [
  { x1: 80, y1: 250, x2: 450, y2: 250, label: 'wheelbase' },
  { x1: 50, y1: 60, x2: 50, y2: 210, label: 'height' },
];

export const BlueprintBackground = () => {
  const [drawProgress, setDrawProgress] = useState(0);
  const [gridPulse, setGridPulse] = useState({ x: 50, y: 50 });

  // Animate the car schematic drawing
  useEffect(() => {
    const interval = setInterval(() => {
      setDrawProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Random grid pulse positions
  useEffect(() => {
    const interval = setInterval(() => {
      setGridPulse({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sketchElements = useMemo(() => {
    return annotations.map((annotation, index) => ({
      ...annotation,
      id: `annotation-${index}`,
      delay: index * 0.2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base blueprint gradient - enhanced */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg,
              hsl(220, 45%, 12%) 0%,
              hsl(240, 50%, 10%) 50%,
              hsl(220, 48%, 8%) 100%
            )
          `
        }}
      />
      
      {/* Multi-layer blueprint grids for depth */}
      <div 
        className="absolute inset-0 blueprint-bg"
        style={{ opacity: 0.6 }}
      />
      <div 
        className="absolute inset-0 blueprint-bg"
        style={{ 
          opacity: 0.3, 
          transform: 'translate(2px, 2px) scale(1.01)',
          backgroundSize: 'calc(100px * 2) calc(100px * 2), calc(100px * 2) calc(100px * 2), calc(20px * 2) calc(20px * 2), calc(20px * 2) calc(20px * 2)'
        }}
      />
      <div 
        className="absolute inset-0 blueprint-bg"
        style={{ 
          opacity: 0.2, 
          transform: 'translate(4px, 4px) scale(1.02)',
          backgroundSize: 'calc(100px * 3) calc(100px * 3), calc(100px * 3) calc(100px * 3), calc(20px * 3) calc(20px * 3), calc(20px * 3) calc(20px * 3)'
        }}
      />
      
      {/* Interactive grid pulse effects with multiple layers */}
      <div 
        className="absolute w-96 h-96 rounded-full transition-all duration-1000 ease-out"
        style={{
          left: `${gridPulse.x}%`,
          top: `${gridPulse.y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, hsl(185 100% 50% / 0.12) 0%, hsl(220 100% 50% / 0.04) 50%, transparent 70%)`,
          animation: 'gridPulseExpand 3s ease-out infinite',
          boxShadow: '0 0 80px hsl(185 100% 50% / 0.2)',
        }}
      />
      
      {/* Secondary pulse */}
      <div 
        className="absolute w-72 h-72 rounded-full transition-all duration-1000 ease-out"
        style={{
          left: `${100 - gridPulse.x}%`,
          top: `${100 - gridPulse.y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, hsl(280 100% 60% / 0.08) 0%, transparent 60%)`,
          animation: 'gridPulseExpand 3.5s ease-out infinite',
          animationDelay: '0.5s',
        }}
      />
      
      {/* Self-drawing car schematic - enhanced */}
      <svg 
        className="absolute opacity-25"
        style={{ 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '300px',
          filter: 'drop-shadow(0 0 10px hsl(185 100% 50% / 0.3))',
        }}
        viewBox="0 0 500 300"
      >
        <defs>
          <linearGradient id="schematicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(185 100% 55%)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="hsl(220 100% 60%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(280 100% 60%)" stopOpacity="0.7" />
          </linearGradient>
          <filter id="glowEffect">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Car body paths with drawing animation and glow */}
        {carSchematicPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="url(#schematicGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEffect)"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000 - (drawProgress * 10),
              transition: 'stroke-dashoffset 0.1s ease-out',
            }}
          />
        ))}
        
        {/* Dimension lines - enhanced */}
        {dimensionLines.map((dim, i) => (
          <g key={i} opacity={drawProgress > 60 ? 0.7 : 0} style={{ transition: 'opacity 0.5s' }}>
            <line 
              x1={dim.x1} y1={dim.y1} 
              x2={dim.x2} y2={dim.y2}
              stroke="hsl(45 90% 65%)"
              strokeWidth="0.8"
              strokeDasharray="4 2"
              filter="url(#glowEffect)"
            />
            <text 
              x={(dim.x1 + dim.x2) / 2} 
              y={dim.y1 === dim.y2 ? dim.y1 + 15 : (dim.y1 + dim.y2) / 2}
              fill="hsl(45 90% 65%)"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              className="font-sketch"
              filter="url(#glowEffect)"
            >
              {dim.label}
            </text>
          </g>
        ))}
        
        {/* Rotating measurement wheel - enhanced */}
        <g 
          transform={`translate(450, 50) rotate(${drawProgress * 3.6})`}
          opacity="0.6"
          filter="url(#glowEffect)"
        >
          <circle r="20" fill="none" stroke="hsl(185 100% 55%)" strokeWidth="0.8" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <line 
              key={angle}
              x1="15" y1="0" x2="20" y2="0"
              stroke="hsl(185 100% 55%)"
              strokeWidth="0.8"
              transform={`rotate(${angle})`}
            />
          ))}
          <line x1="0" y1="0" x2="18" y2="0" stroke="hsl(330 100% 65%)" strokeWidth="1.2" />
        </g>
      </svg>
      
      {/* Sketch annotations - enhanced */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
        {sketchElements.map((annotation) => (
          <g key={annotation.id}>
            <text
              x={annotation.x}
              y={annotation.y}
              className="font-sketch fill-current"
              style={{
                fill: 'hsl(45, 15%, 80%)',
                fontSize: annotation.size === 'lg' ? '1.25rem' : annotation.size === 'md' ? '1rem' : '0.875rem',
                transform: `rotate(${annotation.rotate || 0}deg)`,
                transformOrigin: `${annotation.x} ${annotation.y}`,
                opacity: 0.6,
                filter: 'drop-shadow(0 0 10px hsl(185 100% 50% / 0.3))',
                fontWeight: 600,
              }}
            >
              {annotation.text}
            </text>
          </g>
        ))}
        
        {/* Animated sketch arrows */}
        <path 
          d="M 100 200 Q 150 180, 180 200" 
          stroke="hsl(45 100% 65%)"
          strokeWidth="1.5"
          fill="none"
          className="sketch-arrow animate-arrow-draw"
          style={{ opacity: 0.4, filter: 'drop-shadow(0 0 4px hsl(45 100% 65% / 0.5))' }}
        />
        <path 
          d="M 85% 30% Q 80% 35%, 75% 30%" 
          stroke="hsl(185 100% 55%)"
          strokeWidth="1.5"
          fill="none"
          className="sketch-arrow animate-arrow-draw"
          style={{ opacity: 0.4, animationDelay: '0.5s', filter: 'drop-shadow(0 0 4px hsl(185 100% 55% / 0.5))' }}
        />
        
        {/* Technical dimension lines */}
        <line x1="20%" y1="90%" x2="40%" y2="90%" stroke="hsl(185 100% 55%)" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.4" />
        <line x1="60%" y1="10%" x2="80%" y2="10%" stroke="hsl(45 100% 65%)" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.4" />
      </svg>
      
      {/* Technical readout corners - enhanced */}
      <div className="absolute top-4 left-4 opacity-50 font-mono text-xs text-cyan-300">
        <div className="animate-pulse">▸ FREQ: 2.25 Hz</div>
        <div className="mt-1">▸ ζ: 0.68</div>
      </div>
      <div className="absolute top-4 right-4 opacity-50 font-mono text-xs text-pink-300 text-right">
        <div>LLTD: 51.2%</div>
        <div className="mt-1 animate-pulse">▸ NEUTRAL</div>
      </div>
      
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Ambient neon glow spots - enhanced */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 blur-[100px] opacity-15 animate-glow-drift"
        style={{ background: 'hsl(330 100% 65%)', boxShadow: '0 0 100px hsl(330 100% 65% / 0.4)' }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-80 h-80 blur-[80px] opacity-15 animate-glow-drift"
        style={{ background: 'hsl(185 100% 50%)', boxShadow: '0 0 80px hsl(185 100% 50% / 0.3)', animationDelay: '-2s' }}
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 blur-[60px] opacity-12 animate-glow-drift"
        style={{ background: 'hsl(280 100% 70%)', boxShadow: '0 0 60px hsl(280 100% 70% / 0.2)', animationDelay: '-4s' }}
      />
      
      {/* Data flow particles - enhanced */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 animate-data-particle"
            style={{
              left: `${15 + i * 12}%`,
              top: '50%',
              animationDelay: `${i * 0.4}s`,
              boxShadow: 'drop-shadow(0 0 6px hsl(185 100% 50% / 0.8))',
              boxShadow: '0 0 6px hsl(185 100% 50%)',
            }}
          />
        ))}
      </div>
      
      {/* Edge vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 50% 50%, 
              transparent 0%, 
              hsl(220, 50%, 8% / 0.4) 70%,
              hsl(220, 50%, 6% / 0.8) 100%
            )
          `,
        }}
      />
      
      {/* Scan line effect */}
      <div className="scan-line" />
    </div>
  );
};
