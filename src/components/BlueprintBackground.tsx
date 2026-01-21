import { useMemo } from 'react';

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

export const BlueprintBackground = () => {
  const sketchElements = useMemo(() => {
    return annotations.map((annotation, index) => ({
      ...annotation,
      id: `annotation-${index}`,
      delay: index * 0.2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base blueprint gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 0%, 
              hsl(220, 50%, 14%) 0%, 
              hsl(220, 50%, 10%) 50%,
              hsl(220, 50%, 8%) 100%
            )
          `
        }}
      />
      
      {/* Blueprint grid pattern */}
      <div 
        className="absolute inset-0 blueprint-bg"
        style={{ opacity: 0.8 }}
      />
      
      {/* Sketch annotations */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
        {sketchElements.map((annotation) => (
          <g key={annotation.id}>
            <text
              x={annotation.x}
              y={annotation.y}
              className="font-sketch fill-current"
              style={{
                fill: 'hsl(45, 10%, 75%)',
                fontSize: annotation.size === 'lg' ? '1.25rem' : annotation.size === 'md' ? '1rem' : '0.875rem',
                transform: `rotate(${annotation.rotate || 0}deg)`,
                transformOrigin: `${annotation.x} ${annotation.y}`,
                opacity: 0.5,
                filter: 'drop-shadow(0 0 8px hsl(185, 100%, 50%, 0.2))',
              }}
            >
              {annotation.text}
            </text>
          </g>
        ))}
        
        {/* Decorative sketch arrows */}
        <path 
          d="M 100 200 Q 150 180, 180 200" 
          className="sketch-arrow"
          style={{ opacity: 0.3 }}
        />
        <path 
          d="M 85% 30% Q 80% 35%, 75% 30%" 
          className="sketch-arrow"
          style={{ opacity: 0.3 }}
        />
        
        {/* Technical dimension lines */}
        <line x1="20%" y1="90%" x2="40%" y2="90%" stroke="hsl(45, 10%, 60%)" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
        <line x1="60%" y1="10%" x2="80%" y2="10%" stroke="hsl(45, 10%, 60%)" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
      </svg>
      
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Ambient neon glow spots */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 blur-[100px] opacity-10"
        style={{ background: 'hsl(330, 100%, 65%)' }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-80 h-80 blur-[80px] opacity-10"
        style={{ background: 'hsl(185, 100%, 50%)' }}
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 blur-[60px] opacity-8"
        style={{ background: 'hsl(280, 100%, 70%)' }}
      />
      
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
