import { useEffect, useState, useMemo } from 'react';

// Depth layers for parallax effect
type DepthLayer = 'far' | 'mid' | 'near';

// Generate a zooming building with depth layer
interface ZoomBuilding {
  id: number;
  x: number; // -50 to 150 (can be off-screen)
  width: number;
  height: number;
  color: string;
  windowColor: string;
  speed: number;
  lane: 'left' | 'right';
  depth: DepthLayer; // Depth layer for parallax
  zIndex: number;
}

const neonColors = [
  { building: 'hsl(220, 20%, 8%)', windows: '#ff6b35' },
  { building: 'hsl(240, 20%, 10%)', windows: '#00d4ff' },
  { building: 'hsl(260, 15%, 8%)', windows: '#ff3366' },
  { building: 'hsl(200, 20%, 8%)', windows: '#00ff88' },
  { building: 'hsl(280, 15%, 10%)', windows: '#ffcc00' },
  { building: 'hsl(220, 25%, 6%)', windows: '#ff00ff' },
];

// Depth layer configurations - closer = faster, larger, more opaque
const depthConfig = {
  far: { speedMultiplier: 0.3, scaleBase: 0.2, scaleMultiplier: 0.8, opacityBase: 0.3, blur: 2, zIndex: 1 },
  mid: { speedMultiplier: 0.7, scaleBase: 0.4, scaleMultiplier: 1.2, opacityBase: 0.6, blur: 0.5, zIndex: 2 },
  near: { speedMultiplier: 1.5, scaleBase: 0.6, scaleMultiplier: 2.5, opacityBase: 0.9, blur: 0, zIndex: 3 },
};

const generateBuilding = (id: number, lane: 'left' | 'right', depth?: DepthLayer): ZoomBuilding => {
  const colorSet = neonColors[Math.floor(Math.random() * neonColors.length)];
  const assignedDepth = depth || (['far', 'mid', 'near'] as DepthLayer[])[Math.floor(Math.random() * 3)];
  const config = depthConfig[assignedDepth];
  
  return {
    id,
    x: lane === 'left' ? -10 + Math.random() * 30 : 60 + Math.random() * 30,
    width: assignedDepth === 'near' ? 12 + Math.random() * 18 : assignedDepth === 'mid' ? 8 + Math.random() * 12 : 5 + Math.random() * 8,
    height: assignedDepth === 'near' ? 30 + Math.random() * 55 : assignedDepth === 'mid' ? 20 + Math.random() * 40 : 15 + Math.random() * 25,
    color: colorSet.building,
    windowColor: colorSet.windows,
    speed: (0.5 + Math.random() * 0.5) * config.speedMultiplier,
    lane,
    depth: assignedDepth,
    zIndex: config.zIndex,
  };
};

// Zooming building component with parallax depth
const ZoomingBuilding = ({ building, scale, opacity }: { building: ZoomBuilding; scale: number; opacity: number }) => {
  const config = depthConfig[building.depth];
  const windowRows = Math.floor(building.height / 6);
  const windowCols = Math.floor(building.width / 4);
  
  // Apply depth-based adjustments
  const finalScale = config.scaleBase + (scale * config.scaleMultiplier);
  const finalOpacity = Math.min(1, opacity * config.opacityBase);
  const blur = config.blur;
  
  return (
    <div
      className="absolute bottom-0 origin-bottom"
      style={{
        left: `${building.x}%`,
        width: `${building.width * finalScale}%`,
        height: `${building.height * finalScale}%`,
        transform: `scale(${finalScale})`,
        opacity: finalOpacity,
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
        zIndex: building.zIndex,
        transition: 'none',
      }}
    >
      {/* Building body */}
      <div
        className="absolute inset-0"
        style={{
          background: building.color,
          boxShadow: `0 0 ${20 * finalScale}px ${building.windowColor}33`,
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

// Traffic light component - EPILEPSY SAFE: Slow transitions (4+ seconds between changes)
const TrafficLight = ({ x, delay }: { x: number; delay: number }) => {
  const [activeLight, setActiveLight] = useState(0);

  useEffect(() => {
    // Changed to 4+ seconds between light changes (safe: less than 3 flashes per second)
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev + 1) % 3);
    }, 4000 + delay * 1000);

    return () => clearInterval(interval);
  }, [delay]);

  return (
    <g transform={`translate(${x}, 75)`}>
      {/* Pole */}
      <rect x="0" y="0" width="3" height="25" fill="hsl(220, 15%, 20%)" />
      {/* Housing */}
      <rect x="-5" y="-20" width="13" height="24" rx="2" fill="hsl(220, 15%, 15%)" />
      {/* Red - smooth 1s transition */}
      <circle
        cx="1.5"
        cy="-14"
        r="3"
        fill={activeLight === 0 ? '#ff3333' : '#331111'}
        style={{
          filter: activeLight === 0 ? 'drop-shadow(0 0 6px #ff3333)' : 'none',
          transition: 'all 1s ease',
        }}
      />
      {/* Yellow - smooth 1s transition */}
      <circle
        cx="1.5"
        cy="-8"
        r="3"
        fill={activeLight === 1 ? '#ffcc00' : '#332200'}
        style={{
          filter: activeLight === 1 ? 'drop-shadow(0 0 6px #ffcc00)' : 'none',
          transition: 'all 1s ease',
        }}
      />
      {/* Green - smooth 1s transition */}
      <circle
        cx="1.5"
        cy="-2"
        r="3"
        fill={activeLight === 2 ? '#00ff66' : '#003311'}
        style={{
          filter: activeLight === 2 ? 'drop-shadow(0 0 6px #00ff66)' : 'none',
          transition: 'all 1s ease',
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
      {/* Center lane dividers - EPILEPSY SAFE: Slower animation (2s cycle) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 bg-yellow-400/60"
          style={{
            width: '4px',
            height: '30px',
            bottom: `${i * 35}px`,
            animation: 'roadLineZoom 2s linear infinite',
            animationDelay: `${i * 0.33}s`,
            boxShadow: '0 0 8px #ffcc0066',
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

  // Initialize buildings with varied depths
  useEffect(() => {
    const initial: ZoomBuilding[] = [];
    const depths: DepthLayer[] = ['far', 'far', 'far', 'far', 'mid', 'mid', 'mid', 'mid', 'near', 'near', 'near', 'near'];
    for (let i = 0; i < 12; i++) {
      initial.push(generateBuilding(i, i % 2 === 0 ? 'left' : 'right', depths[i]));
    }
    setBuildings(initial);
  }, []);

  // Animation loop - buildings zoom toward camera with parallax speeds
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    let buildingId = 12;

    const animate = (time: number) => {
      if (time - lastTime > 50) { // ~20fps for performance
        lastTime = time;
        setFrame(f => f + 1);
        
        setBuildings(prev => {
          const updated = prev.map(b => {
            // Apply depth-based speed multiplier for parallax effect
            const config = depthConfig[b.depth];
            const parallaxSpeed = b.speed * config.speedMultiplier * 3;
            
            return {
              ...b,
              // Move buildings outward from center as they "approach"
              x: b.lane === 'left' 
                ? b.x - parallaxSpeed 
                : b.x + parallaxSpeed,
            };
          });

          // Remove buildings that have passed by
          const filtered = updated.filter(b => 
            b.lane === 'left' ? b.x > -60 : b.x < 160
          );

          // Add new buildings if needed - ensure balanced depth distribution
          const depthCounts = { far: 0, mid: 0, near: 0 };
          filtered.forEach(b => depthCounts[b.depth]++);
          
          while (filtered.length < 15) {
            const lane = Math.random() > 0.5 ? 'left' : 'right';
            // Prioritize depths that are under-represented
            let depth: DepthLayer = 'mid';
            if (depthCounts.far < 4) depth = 'far';
            else if (depthCounts.near < 4) depth = 'near';
            else if (depthCounts.mid < 5) depth = 'mid';
            else depth = (['far', 'mid', 'near'] as DepthLayer[])[Math.floor(Math.random() * 3)];
            
            depthCounts[depth]++;
            
            filtered.push({
              ...generateBuilding(buildingId++, lane, depth),
              x: lane === 'left' ? 38 + Math.random() * 8 : 54 + Math.random() * 8,
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

  // Generate stable star positions
  const stars = useMemo(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 35,
      size: 0.5 + Math.random() * 1,
      twinkleDuration: 4 + Math.random() * 6, // Slower twinkle (4-10s)
      delay: Math.random() * 5,
    })), []
  );

  // Horizon silhouettes data
  const horizonBuildings = useMemo(() => [
    { x: 0, width: 8, height: 12 },
    { x: 6, width: 5, height: 18 },
    { x: 10, width: 10, height: 14 },
    { x: 18, width: 6, height: 22 },
    { x: 23, width: 12, height: 16 },
    { x: 32, width: 4, height: 25 },
    { x: 35, width: 8, height: 20 },
    { x: 42, width: 6, height: 15 },
    { x: 47, width: 10, height: 28 },
    { x: 55, width: 5, height: 18 },
    { x: 59, width: 8, height: 22 },
    { x: 66, width: 12, height: 14 },
    { x: 75, width: 6, height: 20 },
    { x: 80, width: 10, height: 16 },
    { x: 88, width: 5, height: 24 },
    { x: 92, width: 8, height: 18 },
  ], []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient - dark sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,2%)] via-[hsl(260,20%,4%)] to-[hsl(220,20%,8%)]" />

      {/* Stars with slow twinkling */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `starTwinkle ${star.twinkleDuration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Distant horizon silhouettes */}
      <div className="absolute bottom-[28%] left-0 right-0 h-[15%]">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 100 30"
          preserveAspectRatio="xMidYMax slice"
        >
          {horizonBuildings.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={30 - b.height}
              width={b.width}
              height={b.height}
              fill="hsl(220, 20%, 5%)"
              opacity="0.8"
            />
          ))}
          {/* Tiny distant window lights */}
          {horizonBuildings.map((b, i) => (
            Array.from({ length: 3 }).map((_, j) => (
              <rect
                key={`${i}-${j}`}
                x={b.x + 1 + (j * 2)}
                y={30 - b.height + 2 + (Math.floor(Math.random() * 3) * 3)}
                width="0.8"
                height="1"
                fill={Math.random() > 0.5 ? '#ffcc66' : '#ff8844'}
                opacity="0.4"
                style={{
                  animation: `starTwinkle ${6 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))
          ))}
        </svg>
      </div>

      {/* Fog/haze layer 1 - bottom horizon */}
      <div 
        className="absolute bottom-[20%] left-0 right-0 h-[20%]"
        style={{
          background: 'linear-gradient(to top, hsl(220, 20%, 8%) 0%, hsl(240, 15%, 10% / 0.6) 40%, transparent 100%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Fog/haze layer 2 - mid atmospheric */}
      <div 
        className="absolute bottom-[25%] left-0 right-0 h-[30%] opacity-40"
        style={{
          background: 'linear-gradient(to top, hsl(260, 20%, 15% / 0.5) 0%, hsl(240, 15%, 12% / 0.3) 50%, transparent 100%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Fog/haze layer 3 - drifting mist */}
      <div 
        className="absolute bottom-[22%] left-0 right-0 h-[15%] opacity-30"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 30% 80%, hsl(200, 20%, 20% / 0.5) 0%, transparent 70%)',
          filter: 'blur(15px)',
          animation: 'fogDrift 20s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-[24%] left-0 right-0 h-[12%] opacity-25"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 70% 70%, hsl(280, 15%, 18% / 0.4) 0%, transparent 70%)',
          filter: 'blur(12px)',
          animation: 'fogDrift 25s ease-in-out infinite reverse',
        }}
      />

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

      {/* Ambient city glow through fog */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(var(--racing-orange)/0.12)] via-[hsl(var(--racing-orange)/0.04)] to-transparent" />

      {/* Speeding cars (blurred streaks) */}
      {cars.map((car, i) => (
        <SpeedingCar key={i} {...car} />
      ))}

      {/* Horizon glow - dimmed */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 bottom-[25%] w-[200%] h-32 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--racing-orange)) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Speed lines - EPILEPSY SAFE: Fewer, slower, dimmer */}
      <div className="absolute inset-0 opacity-[0.03]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${30 + Math.random() * 50}%`,
              width: `${50 + Math.random() * 100}px`,
              animation: `speedLine ${2 + Math.random() * 1}s linear infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
