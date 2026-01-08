import { useEffect, useState, useMemo } from 'react';

// Generate a zooming building
interface ZoomBuilding {
  id: number;
  x: number; // -50 to 150 (can be off-screen)
  width: number;
  height: number;
  color: string;
  windowColor: string;
  speed: number;
  lane: 'left' | 'right';
}

const neonColors = [
  { building: 'hsl(220, 20%, 8%)', windows: '#ff6b35' },
  { building: 'hsl(240, 20%, 10%)', windows: '#00d4ff' },
  { building: 'hsl(260, 15%, 8%)', windows: '#ff3366' },
  { building: 'hsl(200, 20%, 8%)', windows: '#00ff88' },
  { building: 'hsl(280, 15%, 10%)', windows: '#ffcc00' },
  { building: 'hsl(220, 25%, 6%)', windows: '#ff00ff' },
];

const generateBuilding = (id: number, lane: 'left' | 'right'): ZoomBuilding => {
  const colorSet = neonColors[Math.floor(Math.random() * neonColors.length)];
  return {
    id,
    x: lane === 'left' ? -10 + Math.random() * 30 : 60 + Math.random() * 30,
    width: 8 + Math.random() * 15,
    height: 20 + Math.random() * 50,
    color: colorSet.building,
    windowColor: colorSet.windows,
    speed: 0.5 + Math.random() * 0.5,
    lane,
  };
};

// Zooming building component
const ZoomingBuilding = ({ building, scale, opacity }: { building: ZoomBuilding; scale: number; opacity: number }) => {
  const windowRows = Math.floor(building.height / 6);
  const windowCols = Math.floor(building.width / 4);
  
  return (
    <div
      className="absolute bottom-0 origin-bottom"
      style={{
        left: `${building.x}%`,
        width: `${building.width * scale}%`,
        height: `${building.height * scale}%`,
        transform: `scale(${scale})`,
        opacity: opacity,
        transition: 'none',
      }}
    >
      {/* Building body */}
      <div
        className="absolute inset-0"
        style={{
          background: building.color,
          boxShadow: `0 0 ${20 * scale}px ${building.windowColor}33`,
          border: `1px solid ${building.windowColor}22`,
        }}
      />
      {/* Windows grid */}
      <div className="absolute inset-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${windowCols}, 1fr)` }}>
        {Array.from({ length: windowRows * windowCols }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3]"
            style={{
              background: Math.random() > 0.3 ? building.windowColor : 'transparent',
              opacity: 0.4 + Math.random() * 0.6,
              boxShadow: Math.random() > 0.5 ? `0 0 4px ${building.windowColor}` : 'none',
            }}
          />
        ))}
      </div>
      {/* Neon accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: building.windowColor,
          boxShadow: `0 0 10px ${building.windowColor}, 0 0 20px ${building.windowColor}`,
        }}
      />
    </div>
  );
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

// Road lane markers zooming toward viewer
const RoadLines = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[25%] overflow-hidden" style={{ perspective: '500px' }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, hsl(220, 15%, 8%) 30%)',
        }}
      />
      {/* Center lane dividers rushing toward camera */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 bg-yellow-400/80"
          style={{
            width: '4px',
            height: '30px',
            bottom: `${i * 25}px`,
            animation: 'roadLineZoom 1s linear infinite',
            animationDelay: `${i * 0.125}s`,
            boxShadow: '0 0 10px #ffcc00, 0 0 20px #ffcc00',
          }}
        />
      ))}
      {/* Side road lines */}
      <div
        className="absolute bottom-0 left-[15%] w-1 h-full bg-gradient-to-t from-white/40 to-transparent"
        style={{ boxShadow: '0 0 5px white' }}
      />
      <div
        className="absolute bottom-0 right-[15%] w-1 h-full bg-gradient-to-t from-white/40 to-transparent"
        style={{ boxShadow: '0 0 5px white' }}
      />
    </div>
  );
};

export function CityScapeBackground() {
  const [buildings, setBuildings] = useState<ZoomBuilding[]>([]);
  const [frame, setFrame] = useState(0);

  // Initialize buildings
  useEffect(() => {
    const initial: ZoomBuilding[] = [];
    for (let i = 0; i < 12; i++) {
      initial.push(generateBuilding(i, i % 2 === 0 ? 'left' : 'right'));
    }
    setBuildings(initial);
  }, []);

  // Animation loop - buildings zoom toward camera
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    let buildingId = 12;

    const animate = (time: number) => {
      if (time - lastTime > 50) { // ~20fps for performance
        lastTime = time;
        setFrame(f => f + 1);
        
        setBuildings(prev => {
          const updated = prev.map(b => ({
            ...b,
            // Move buildings outward from center as they "approach"
            x: b.lane === 'left' 
              ? b.x - (b.speed * 2) 
              : b.x + (b.speed * 2),
          }));

          // Remove buildings that have passed by
          const filtered = updated.filter(b => 
            b.lane === 'left' ? b.x > -50 : b.x < 150
          );

          // Add new buildings if needed
          while (filtered.length < 12) {
            const lane = Math.random() > 0.5 ? 'left' : 'right';
            filtered.push({
              ...generateBuilding(buildingId++, lane),
              x: lane === 'left' ? 35 + Math.random() * 10 : 55 + Math.random() * 10,
            });
          }

          return filtered;
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const cars = useMemo(() => [
    { y: 82, delay: 0, direction: 'left' as const, color: '#ff6b35' },
    { y: 85, delay: 1.5, direction: 'right' as const, color: '#00d4ff' },
    { y: 88, delay: 0.8, direction: 'left' as const, color: '#ffcc00' },
    { y: 91, delay: 2.2, direction: 'right' as const, color: '#ff3366' },
  ], []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient - dark sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,2%)] via-[hsl(260,20%,4%)] to-[hsl(220,20%,8%)]" />

      {/* Stars/distant lights */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Zooming buildings container */}
      <div 
        className="absolute inset-0"
        style={{ 
          perspective: '1000px',
          perspectiveOrigin: '50% 70%',
        }}
      >
        {buildings.map(building => {
          // Calculate scale based on distance from center (simulates depth)
          const distanceFromCenter = Math.abs(building.x - 50);
          const scale = 0.3 + (distanceFromCenter / 50) * 2;
          const opacity = Math.min(1, scale * 0.8);
          
          return (
            <ZoomingBuilding 
              key={building.id} 
              building={building} 
              scale={scale}
              opacity={opacity}
            />
          );
        })}
      </div>

      {/* Road rushing toward camera */}
      <RoadLines />

      {/* Ambient city glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(var(--racing-orange)/0.15)] via-[hsl(var(--racing-orange)/0.05)] to-transparent" />

      {/* Speeding cars (blurred streaks) */}
      {cars.map((car, i) => (
        <SpeedingCar key={i} {...car} />
      ))}

      {/* Horizon glow */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 bottom-[25%] w-[200%] h-32 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--racing-orange)) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Speed lines (motion blur effect) */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${30 + Math.random() * 50}%`,
              width: `${50 + Math.random() * 100}px`,
              animation: `speedLine ${0.5 + Math.random() * 0.5}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
