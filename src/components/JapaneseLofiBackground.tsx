import { useMemo, useState, useEffect } from 'react';
import nissanZ from '@/assets/cars/nissan-z.jpg';
import skylineR34 from '@/assets/cars/skyline-r34.jpg';
import toyotaSupra from '@/assets/cars/toyota-supra.jpg';

// Time of day cycle (10-minute full cycle)
type TimeOfDay = 'dusk' | 'night' | 'lateNight' | 'dawn';

function getTimeOfDay(progress: number): TimeOfDay {
  if (progress < 0.2) return 'dusk';
  if (progress < 0.6) return 'night';
  if (progress < 0.8) return 'lateNight';
  return 'dawn';
}

const skyColors: Record<TimeOfDay, { from: string; via: string; to: string }> = {
  dusk: { 
    from: 'hsl(280, 40%, 15%)', 
    via: 'hsl(260, 35%, 18%)', 
    to: 'hsl(20, 50%, 20%)' 
  },
  night: { 
    from: 'hsl(260, 30%, 8%)', 
    via: 'hsl(240, 25%, 12%)', 
    to: 'hsl(220, 30%, 15%)' 
  },
  lateNight: { 
    from: 'hsl(250, 35%, 6%)', 
    via: 'hsl(240, 30%, 10%)', 
    to: 'hsl(230, 28%, 12%)' 
  },
  dawn: { 
    from: 'hsl(270, 35%, 12%)', 
    via: 'hsl(250, 30%, 15%)', 
    to: 'hsl(30, 40%, 18%)' 
  },
};

// Japanese-themed chill lofi background with time cycle
export function JapaneseLofiBackground() {
  const [timeProgress, setTimeProgress] = useState(0.3); // Start at night
  const [isRaining, setIsRaining] = useState(false);

  // 10-minute day/night cycle
  useEffect(() => {
    const cycleDuration = 600000; // 10 minutes
    const interval = setInterval(() => {
      setTimeProgress(prev => (prev + 0.001) % 1);
    }, cycleDuration / 1000);
    return () => clearInterval(interval);
  }, []);

  // Random rain toggle (subtle)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRaining(Math.random() > 0.7);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = getTimeOfDay(timeProgress);
  const colors = skyColors[timeOfDay];

  // Generate stable star positions for night sky
  const stars = useMemo(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 35,
      size: 0.5 + Math.random() * 1.5,
      twinkleDuration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
    })), []
  );

  // Cherry blossom petals with physics-like behavior
  const petals = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      left: Math.random() * 100,
      size: 4 + Math.random() * 6,
      duration: 12 + Math.random() * 15,
      delay: Math.random() * 12,
      sway: 20 + Math.random() * 30,
      rotation: Math.random() * 360,
    })), []
  );

  // Rain drops
  const rainDrops = useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
    })), []
  );

  // Star visibility based on time
  const starOpacity = timeOfDay === 'night' || timeOfDay === 'lateNight' ? 1 : 
                      timeOfDay === 'dusk' ? 0.3 : 0.5;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dynamic sky gradient */}
      <div 
        className="absolute inset-0 transition-colors [transition-duration:5000ms]"
        style={{
          background: `linear-gradient(to bottom, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`
        }}
      />

      {/* Stars with twinkling */}
      <div className="absolute inset-0" style={{ opacity: starOpacity, transition: 'opacity 3s' }}>
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

      {/* Moon with position based on time */}
      <div 
        className="absolute w-20 h-20 rounded-full transition-all [transition-duration:10000ms]"
        style={{
          top: `${8 + Math.sin(timeProgress * Math.PI) * 5}%`,
          right: `${15 + Math.cos(timeProgress * Math.PI * 2) * 10}%`,
          background: 'radial-gradient(circle at 30% 30%, hsl(45, 80%, 95%) 0%, hsl(45, 60%, 85%) 50%, hsl(45, 50%, 75%) 100%)',
          boxShadow: '0 0 60px hsl(45, 60%, 80% / 0.4), 0 0 120px hsl(45, 50%, 70% / 0.2)',
          opacity: timeOfDay === 'dawn' ? 0.5 : 1,
        }}
      />

      {/* Distant mountains silhouette */}
      <svg
        className="absolute bottom-[25%] left-0 w-full h-[30%]"
        viewBox="0 0 100 30"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0,30 L0,20 Q10,8 20,18 Q30,5 40,15 Q50,2 60,14 Q70,6 80,16 Q90,10 100,18 L100,30 Z"
          fill="hsl(260, 25%, 12%)"
          opacity="0.8"
        />
        <path
          d="M0,30 L0,22 Q15,12 25,20 Q35,8 50,18 Q65,10 75,20 Q85,14 100,22 L100,30 Z"
          fill="hsl(240, 20%, 10%)"
          opacity="0.9"
        />
      </svg>

      {/* Torii gate silhouette */}
      <div className="absolute bottom-[28%] left-[12%]">
        <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
          <rect x="8" y="10" width="4" height="40" fill="hsl(0, 60%, 25%)" />
          <rect x="48" y="10" width="4" height="40" fill="hsl(0, 60%, 25%)" />
          <rect x="0" y="0" width="60" height="5" rx="1" fill="hsl(0, 65%, 30%)" />
          <rect x="3" y="8" width="54" height="3" fill="hsl(0, 60%, 28%)" />
          <rect x="6" y="18" width="48" height="2" fill="hsl(0, 55%, 25%)" />
        </svg>
      </div>

      {/* Japanese pagoda with window flicker */}
      <div className="absolute bottom-[26%] right-[8%]">
        <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
          <rect x="15" y="50" width="20" height="10" fill="hsl(220, 20%, 8%)" />
          <polygon points="5,50 45,50 40,42 10,42" fill="hsl(220, 20%, 10%)" />
          <polygon points="10,42 40,42 35,34 15,34" fill="hsl(220, 20%, 9%)" />
          <polygon points="15,34 35,34 30,26 20,26" fill="hsl(220, 20%, 8%)" />
          <rect x="23" y="16" width="4" height="10" fill="hsl(220, 20%, 12%)" />
          <polygon points="25,6 22,16 28,16" fill="hsl(220, 20%, 10%)" />
          {/* Flickering windows */}
          <rect x="22" y="44" width="6" height="4" fill="hsl(45, 80%, 60%)" opacity="0.6" className="animate-flicker" />
          <rect x="20" y="36" width="4" height="3" fill="hsl(45, 70%, 55%)" opacity="0.5" style={{ animationDelay: '0.3s' }} className="animate-flicker" />
        </svg>
      </div>

      {/* Cherry blossom tree with animated clusters */}
      <div className="absolute bottom-[22%] left-[65%]">
        <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
          <path d="M38,70 Q35,50 40,35 Q38,30 42,25" stroke="hsl(20, 30%, 15%)" strokeWidth="4" fill="none" />
          <path d="M40,35 Q55,25 65,20" stroke="hsl(20, 30%, 15%)" strokeWidth="2" fill="none" />
          <path d="M40,35 Q25,20 15,15" stroke="hsl(20, 30%, 15%)" strokeWidth="2" fill="none" />
          <path d="M42,28 Q50,15 55,10" stroke="hsl(20, 30%, 15%)" strokeWidth="1.5" fill="none" />
          {/* Animated blossom clusters */}
          <circle cx="65" cy="18" r="12" fill="hsl(340, 60%, 25%)" opacity="0.5" className="animate-blossom-glow" />
          <circle cx="15" cy="12" r="10" fill="hsl(340, 60%, 25%)" opacity="0.4" className="animate-blossom-glow" style={{ animationDelay: '1s' }} />
          <circle cx="55" cy="8" r="8" fill="hsl(340, 60%, 30%)" opacity="0.5" className="animate-blossom-glow" style={{ animationDelay: '2s' }} />
          <circle cx="35" cy="18" r="9" fill="hsl(340, 60%, 25%)" opacity="0.4" className="animate-blossom-glow" style={{ animationDelay: '0.5s' }} />
        </svg>
      </div>

      {/* Ground/street area */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[22%]"
        style={{
          background: 'linear-gradient(to bottom, hsl(220, 25%, 10%) 0%, hsl(220, 20%, 8%) 100%)',
        }}
      />

      {/* Wet street with rain reflection */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[18%]"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(220, 20%, ${isRaining ? 14 : 12}%) 0%, 
            hsl(220, 15%, 8%) 100%)`,
          opacity: 0.9,
          transition: 'background 2s',
        }}
      />

      {/* Rain effect */}
      {isRaining && (
        <div className="absolute inset-0 overflow-hidden">
          {rainDrops.map((drop, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-blue-300 to-transparent"
              style={{
                left: `${drop.left}%`,
                height: '20px',
                animation: `rainFall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Puddle reflections when raining */}
      {isRaining && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-[12%] opacity-40"
          style={{
            background: 'linear-gradient(to bottom, hsl(200, 50%, 30%) 0%, transparent 100%)',
          }}
        />
      )}

      {/* Smoke from distant buildings */}
      <div className="absolute bottom-[30%] left-[40%] opacity-20">
        <div 
          className="w-8 h-20 animate-smoke"
          style={{
            background: 'linear-gradient(to top, transparent, hsl(0, 0%, 50%))',
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* Real JDM Cars with atmospheric integration */}
      
      {/* Nissan Fairlady Z - left side */}
      <div className="absolute bottom-[4%] left-[3%] w-[280px] sm:w-[350px]">
        <div className="relative">
          <div 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-4 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, hsl(0 0% 0% / 0.6) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
          <img 
            src={nissanZ} 
            alt="Nissan Fairlady Z" 
            className="w-full h-auto object-cover rounded-sm animate-car-idle"
            style={{
              filter: 'brightness(0.6) contrast(1.1) saturate(0.9)',
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            }}
          />
          {/* Headlight glow */}
          <div 
            className="absolute bottom-[30%] left-[5%] w-3 h-2 rounded-full animate-headlight"
            style={{
              background: 'hsl(45, 100%, 80%)',
              boxShadow: '0 0 10px hsl(45, 100%, 70%), 0 0 20px hsl(45, 100%, 60%)',
            }}
          />
          <div 
            className="absolute top-full left-0 right-0 h-8 overflow-hidden opacity-20"
            style={{
              transform: 'scaleY(-1)',
              filter: 'blur(3px)',
            }}
          >
            <img src={nissanZ} alt="" className="w-full h-auto object-cover" style={{ filter: 'brightness(0.4)' }} />
          </div>
        </div>
      </div>

      {/* Skyline R34 GT-R - right side */}
      <div className="absolute bottom-[3%] right-[2%] w-[300px] sm:w-[380px]">
        <div className="relative">
          <div 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-5 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, hsl(0 0% 0% / 0.7) 0%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />
          <img 
            src={skylineR34} 
            alt="Nissan Skyline R34 GT-R" 
            className="w-full h-auto object-cover rounded-sm animate-car-idle"
            style={{
              filter: 'brightness(0.55) contrast(1.15) saturate(0.85)',
              maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
              animationDelay: '0.5s',
            }}
          />
          {/* Exhaust vapor */}
          <div 
            className="absolute bottom-[15%] right-[8%] w-6 h-3 opacity-30 animate-exhaust"
            style={{
              background: 'linear-gradient(to right, hsl(0, 0%, 70%), transparent)',
              filter: 'blur(4px)',
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, hsl(280 50% 50% / 0.1) 0%, transparent 50%)',
            }}
          />
          <div 
            className="absolute top-full left-0 right-0 h-10 overflow-hidden opacity-15"
            style={{
              transform: 'scaleY(-1)',
              filter: 'blur(4px)',
            }}
          >
            <img src={skylineR34} alt="" className="w-full h-auto object-cover" style={{ filter: 'brightness(0.3)' }} />
          </div>
        </div>
      </div>

      {/* Toyota Supra - center background */}
      <div className="absolute bottom-[10%] left-[35%] w-[180px] sm:w-[220px] opacity-50">
        <div className="relative">
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, hsl(0 0% 0% / 0.5) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
          <img 
            src={toyotaSupra} 
            alt="Toyota GR Supra" 
            className="w-full h-auto object-cover rounded-sm"
            style={{
              filter: 'brightness(0.4) contrast(1.05) saturate(0.7) blur(1px)',
              maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* Falling cherry blossom petals with physics */}
      {petals.map((petal, i) => (
        <div
          key={i}
          className="absolute animate-petal-fall"
          style={{
            left: `${petal.left}%`,
            top: '-5%',
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            background: 'radial-gradient(ellipse at center, hsl(340, 70%, 75%) 0%, hsl(340, 60%, 65%) 100%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            animation: `petalFall ${petal.duration}s linear infinite, petalSway ${petal.duration / 3}s ease-in-out infinite`,
            animationDelay: `${petal.delay}s`,
            opacity: 0.7,
            transform: `rotate(${petal.rotation}deg)`,
          }}
        />
      ))}

      {/* Neon shop signs with flicker */}
      <div className="absolute bottom-[24%] left-[25%]">
        <div 
          className="w-8 h-3 rounded-sm animate-neon-flicker"
          style={{
            background: 'hsl(0, 80%, 50%)',
            boxShadow: '0 0 10px hsl(0, 80%, 50% / 0.6), 0 0 20px hsl(0, 80%, 50% / 0.3)',
            opacity: 0.7,
          }}
        />
      </div>
      <div className="absolute bottom-[26%] left-[45%]">
        <div 
          className="w-6 h-2 rounded-sm animate-neon-flicker"
          style={{
            background: 'hsl(190, 80%, 50%)',
            boxShadow: '0 0 8px hsl(190, 80%, 50% / 0.5), 0 0 15px hsl(190, 80%, 50% / 0.3)',
            opacity: 0.6,
            animationDelay: '0.2s',
          }}
        />
      </div>
      <div className="absolute bottom-[25%] right-[28%]">
        <div 
          className="w-10 h-2.5 rounded-sm animate-neon-flicker"
          style={{
            background: 'hsl(320, 70%, 55%)',
            boxShadow: '0 0 10px hsl(320, 70%, 55% / 0.5), 0 0 20px hsl(320, 70%, 55% / 0.3)',
            opacity: 0.6,
            animationDelay: '0.5s',
          }}
        />
      </div>

      {/* Occasional aircraft light */}
      <div 
        className="absolute w-1 h-1 rounded-full bg-white animate-aircraft"
        style={{
          top: '10%',
          boxShadow: '0 0 4px white',
        }}
      />

      {/* Ambient lofi glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-25"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 100%, hsl(30, 60%, 50% / 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Purple ambient from city */}
      <div 
        className="absolute bottom-[15%] left-0 right-0 h-[20%] opacity-20"
        style={{
          background: 'linear-gradient(to top, hsl(280, 50%, 40% / 0.3) 0%, transparent 100%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Soft vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, hsl(260, 30%, 5% / 0.5) 100%)',
        }}
      />
    </div>
  );
}
