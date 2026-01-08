import { useEffect, useState } from 'react';

// Generate random flicker patterns for windows
const generateWindowPattern = () => {
  return Array.from({ length: 50 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 60 + 20,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.7,
  }));
};

// Traffic light component
const TrafficLight = ({ x, delay }: { x: number; delay: number }) => {
  const [activeLight, setActiveLight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev + 1) % 3);
    }, 2000 + delay * 500);

    return () => clearInterval(interval);
  }, [delay]);

  return (
    <g transform={`translate(${x}, 75)`}>
      {/* Pole */}
      <rect x="0" y="0" width="3" height="25" fill="hsl(220, 15%, 20%)" />
      {/* Housing */}
      <rect x="-5" y="-20" width="13" height="24" rx="2" fill="hsl(220, 15%, 15%)" />
      {/* Red */}
      <circle
        cx="1.5"
        cy="-14"
        r="3"
        fill={activeLight === 0 ? '#ff3333' : '#331111'}
        style={{
          filter: activeLight === 0 ? 'drop-shadow(0 0 8px #ff3333)' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      {/* Yellow */}
      <circle
        cx="1.5"
        cy="-8"
        r="3"
        fill={activeLight === 1 ? '#ffcc00' : '#332200'}
        style={{
          filter: activeLight === 1 ? 'drop-shadow(0 0 8px #ffcc00)' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      {/* Green */}
      <circle
        cx="1.5"
        cy="-2"
        r="3"
        fill={activeLight === 2 ? '#00ff66' : '#003311'}
        style={{
          filter: activeLight === 2 ? 'drop-shadow(0 0 8px #00ff66)' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
    </g>
  );
};

// Speeding car component
const SpeedingCar = ({ y, delay, direction, color }: { y: number; delay: number; direction: 'left' | 'right'; color: string }) => {
  return (
    <div
      className="absolute h-2 rounded-full opacity-60"
      style={{
        top: `${y}%`,
        width: '60px',
        background: `linear-gradient(${direction === 'left' ? '90deg' : '270deg'}, transparent, ${color}, ${color}, transparent)`,
        animation: `speedCar${direction === 'left' ? 'Left' : 'Right'} ${3 + Math.random() * 2}s linear infinite`,
        animationDelay: `${delay}s`,
        filter: `blur(1px) drop-shadow(0 0 10px ${color})`,
        [direction === 'left' ? 'left' : 'right']: '-80px',
      }}
    />
  );
};

// Skyscraper component
const Skyscraper = ({ x, width, height, windows }: { x: number; width: number; height: number; windows: ReturnType<typeof generateWindowPattern> }) => {
  return (
    <g transform={`translate(${x}, ${100 - height})`}>
      {/* Building body */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="hsl(220, 20%, 8%)"
        stroke="hsl(220, 15%, 15%)"
        strokeWidth="0.5"
      />
      {/* Windows */}
      {windows.slice(0, Math.floor(width * height / 30)).map((w, i) => (
        <rect
          key={i}
          x={(i % Math.floor(width / 4)) * 4 + 2}
          y={Math.floor(i / Math.floor(width / 4)) * 5 + 3}
          width="2"
          height="3"
          fill={`hsl(${40 + Math.random() * 20}, 100%, 70%)`}
          opacity={w.opacity}
          style={{
            animation: `windowFlicker ${w.duration}s ease-in-out infinite`,
            animationDelay: `${w.delay}s`,
          }}
        />
      ))}
      {/* Antenna/spire on tall buildings */}
      {height > 50 && (
        <line
          x1={width / 2}
          y1="-5"
          x2={width / 2}
          y2="0"
          stroke="hsl(220, 15%, 25%)"
          strokeWidth="1"
        />
      )}
    </g>
  );
};

export function CityScapeBackground() {
  const [windows] = useState(() => generateWindowPattern());

  const skyscrapers = [
    { x: 0, width: 15, height: 45 },
    { x: 12, width: 20, height: 65 },
    { x: 28, width: 12, height: 35 },
    { x: 38, width: 18, height: 55 },
    { x: 52, width: 14, height: 70 },
    { x: 63, width: 22, height: 50 },
    { x: 80, width: 16, height: 60 },
    { x: 92, width: 12, height: 40 },
  ];

  const cars = [
    { y: 82, delay: 0, direction: 'left' as const, color: '#ff6b35' },
    { y: 85, delay: 1.5, direction: 'right' as const, color: '#00d4ff' },
    { y: 88, delay: 0.8, direction: 'left' as const, color: '#ffcc00' },
    { y: 91, delay: 2.2, direction: 'right' as const, color: '#ff3366' },
    { y: 84, delay: 3, direction: 'left' as const, color: '#00ff88' },
    { y: 87, delay: 1, direction: 'right' as const, color: '#ff6b35' },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,4%)] via-[hsl(220,20%,6%)] to-[hsl(220,20%,10%)]" />

      {/* Ambient city glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(var(--racing-orange)/0.1)] via-[hsl(var(--racing-orange)/0.05)] to-transparent" />

      {/* Skyline SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[60%]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Distant glow behind buildings */}
        <defs>
          <linearGradient id="skyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(280, 60%, 20%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(30, 100%, 50%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect x="0" y="20" width="100" height="80" fill="url(#skyGlow)" />

        {/* Skyscrapers */}
        {skyscrapers.map((s, i) => (
          <Skyscraper key={i} {...s} windows={windows} />
        ))}

        {/* Road/ground */}
        <rect x="0" y="80" width="100" height="20" fill="hsl(220, 15%, 8%)" />
        <line x1="0" y1="81" x2="100" y2="81" stroke="hsl(220, 15%, 15%)" strokeWidth="0.3" />

        {/* Traffic lights */}
        <TrafficLight x={20} delay={0} />
        <TrafficLight x={50} delay={1} />
        <TrafficLight x={80} delay={2} />
      </svg>

      {/* Speeding cars (blurred streaks) */}
      {cars.map((car, i) => (
        <SpeedingCar key={i} {...car} />
      ))}

      {/* Neon reflections on ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <div
          className="absolute bottom-8 left-1/4 w-32 h-1 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, #ff6b35, transparent)',
            filter: 'blur(4px)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-6 right-1/3 w-24 h-1 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            filter: 'blur(4px)',
            animation: 'pulse 4s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Atmospheric particles */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
