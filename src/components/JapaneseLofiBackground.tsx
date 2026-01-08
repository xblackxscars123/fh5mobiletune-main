import { useMemo } from 'react';

// Japanese-themed chill lofi background with stanced JDM cars
export function JapaneseLofiBackground() {
  // Generate stable star positions for night sky
  const stars = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 30,
      size: 0.5 + Math.random() * 1.5,
      twinkleDuration: 6 + Math.random() * 8,
      delay: Math.random() * 5,
    })), []
  );

  // Cherry blossom petals
  const petals = useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      left: Math.random() * 100,
      size: 4 + Math.random() * 6,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      sway: 30 + Math.random() * 40,
    })), []
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Night sky gradient - deep purple/blue lofi aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,30%,8%)] via-[hsl(240,25%,12%)] to-[hsl(220,30%,15%)]" />

      {/* Stars with gentle twinkling */}
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

      {/* Moon - large and atmospheric */}
      <div 
        className="absolute top-[8%] right-[15%] w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, hsl(45, 80%, 95%) 0%, hsl(45, 60%, 85%) 50%, hsl(45, 50%, 75%) 100%)',
          boxShadow: '0 0 60px hsl(45, 60%, 80% / 0.4), 0 0 120px hsl(45, 50%, 70% / 0.2)',
        }}
      />

      {/* Distant mountains silhouette */}
      <svg
        className="absolute bottom-[25%] left-0 w-full h-[30%]"
        viewBox="0 0 100 30"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Far mountains */}
        <path
          d="M0,30 L0,20 Q10,8 20,18 Q30,5 40,15 Q50,2 60,14 Q70,6 80,16 Q90,10 100,18 L100,30 Z"
          fill="hsl(260, 25%, 12%)"
          opacity="0.8"
        />
        {/* Near mountains */}
        <path
          d="M0,30 L0,22 Q15,12 25,20 Q35,8 50,18 Q65,10 75,20 Q85,14 100,22 L100,30 Z"
          fill="hsl(240, 20%, 10%)"
          opacity="0.9"
        />
      </svg>

      {/* Torii gate silhouette */}
      <div className="absolute bottom-[28%] left-[12%]">
        <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
          {/* Main pillars */}
          <rect x="8" y="10" width="4" height="40" fill="hsl(0, 60%, 25%)" />
          <rect x="48" y="10" width="4" height="40" fill="hsl(0, 60%, 25%)" />
          {/* Top beams */}
          <rect x="0" y="0" width="60" height="5" rx="1" fill="hsl(0, 65%, 30%)" />
          <rect x="3" y="8" width="54" height="3" fill="hsl(0, 60%, 28%)" />
          {/* Cross beam */}
          <rect x="6" y="18" width="48" height="2" fill="hsl(0, 55%, 25%)" />
        </svg>
      </div>

      {/* Japanese pagoda silhouette */}
      <div className="absolute bottom-[26%] right-[8%]">
        <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
          {/* Base */}
          <rect x="15" y="50" width="20" height="10" fill="hsl(220, 20%, 8%)" />
          {/* Levels */}
          <polygon points="5,50 45,50 40,42 10,42" fill="hsl(220, 20%, 10%)" />
          <polygon points="10,42 40,42 35,34 15,34" fill="hsl(220, 20%, 9%)" />
          <polygon points="15,34 35,34 30,26 20,26" fill="hsl(220, 20%, 8%)" />
          {/* Top spire */}
          <rect x="23" y="16" width="4" height="10" fill="hsl(220, 20%, 12%)" />
          <polygon points="25,6 22,16 28,16" fill="hsl(220, 20%, 10%)" />
          {/* Roof curves */}
          <path d="M5,50 Q0,48 2,46" stroke="hsl(220, 20%, 10%)" strokeWidth="1" fill="none" />
          <path d="M45,50 Q50,48 48,46" stroke="hsl(220, 20%, 10%)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Cherry blossom tree silhouette */}
      <div className="absolute bottom-[22%] left-[65%]">
        <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
          {/* Trunk */}
          <path d="M38,70 Q35,50 40,35 Q38,30 42,25" stroke="hsl(20, 30%, 15%)" strokeWidth="4" fill="none" />
          {/* Branches */}
          <path d="M40,35 Q55,25 65,20" stroke="hsl(20, 30%, 15%)" strokeWidth="2" fill="none" />
          <path d="M40,35 Q25,20 15,15" stroke="hsl(20, 30%, 15%)" strokeWidth="2" fill="none" />
          <path d="M42,28 Q50,15 55,10" stroke="hsl(20, 30%, 15%)" strokeWidth="1.5" fill="none" />
          {/* Blossom clusters - subtle pink glow */}
          <circle cx="65" cy="18" r="12" fill="hsl(340, 60%, 25%)" opacity="0.5" />
          <circle cx="15" cy="12" r="10" fill="hsl(340, 60%, 25%)" opacity="0.4" />
          <circle cx="55" cy="8" r="8" fill="hsl(340, 60%, 30%)" opacity="0.5" />
          <circle cx="35" cy="18" r="9" fill="hsl(340, 60%, 25%)" opacity="0.4" />
        </svg>
      </div>

      {/* Ground/street area */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[22%]"
        style={{
          background: 'linear-gradient(to bottom, hsl(220, 25%, 10%) 0%, hsl(220, 20%, 8%) 100%)',
        }}
      />

      {/* Street with reflection */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[18%]"
        style={{
          background: 'linear-gradient(to bottom, hsl(220, 20%, 12%) 0%, hsl(220, 15%, 8%) 100%)',
          opacity: 0.9,
        }}
      />

      {/* Wet street reflection effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[12%] opacity-30"
        style={{
          background: 'linear-gradient(to bottom, hsl(260, 30%, 20%) 0%, transparent 100%)',
        }}
      />

      {/* Stanced JDM Cars */}
      {/* Silvia S15 style - left side */}
      <div className="absolute bottom-[8%] left-[8%]">
        <svg width="140" height="50" viewBox="0 0 140 50" fill="none">
          {/* Car body */}
          <path 
            d="M15,35 L20,35 L25,22 L45,18 L90,18 L110,20 L125,30 L130,35 L15,35" 
            fill="hsl(200, 80%, 35%)"
          />
          {/* Hood and roof line */}
          <path 
            d="M25,22 L45,18 L90,18 L95,20 L80,20 L65,22 L45,22 L30,24" 
            fill="hsl(200, 75%, 30%)"
          />
          {/* Windows */}
          <path 
            d="M50,20 L52,23 L78,23 L82,20 L50,20" 
            fill="hsl(220, 30%, 15%)"
            opacity="0.8"
          />
          {/* Headlights glow */}
          <ellipse cx="120" cy="28" rx="4" ry="3" fill="hsl(45, 90%, 70%)" opacity="0.8" />
          <ellipse cx="120" cy="28" rx="6" ry="4" fill="hsl(45, 90%, 70%)" opacity="0.3" />
          {/* Tail lights */}
          <rect x="18" y="26" width="4" height="6" rx="1" fill="hsl(0, 80%, 50%)" opacity="0.9" />
          {/* Wheels - stanced low */}
          <circle cx="38" cy="38" r="8" fill="hsl(0, 0%, 8%)" />
          <circle cx="38" cy="38" r="5" fill="hsl(0, 0%, 20%)" />
          <circle cx="100" cy="38" r="8" fill="hsl(0, 0%, 8%)" />
          <circle cx="100" cy="38" r="5" fill="hsl(0, 0%, 20%)" />
          {/* Wheel lips / fenders */}
          <path d="M28,35 Q38,28 48,35" stroke="hsl(200, 80%, 32%)" strokeWidth="2" fill="none" />
          <path d="M90,35 Q100,28 110,35" stroke="hsl(200, 80%, 32%)" strokeWidth="2" fill="none" />
          {/* Ground reflection */}
          <path 
            d="M15,38 L130,38 L130,42 L15,42 Z" 
            fill="hsl(200, 80%, 35%)"
            opacity="0.15"
          />
        </svg>
      </div>

      {/* R34 GT-R style - right side */}
      <div className="absolute bottom-[6%] right-[5%]">
        <svg width="160" height="55" viewBox="0 0 160 55" fill="none">
          {/* Car body - midnight purple */}
          <path 
            d="M10,38 L15,38 L22,24 L50,19 L105,19 L130,22 L145,32 L150,38 L10,38" 
            fill="hsl(280, 50%, 25%)"
          />
          {/* Hood detail */}
          <path 
            d="M25,24 L50,20 L100,20 L105,22 L95,22 L55,24 L30,26" 
            fill="hsl(280, 45%, 22%)"
          />
          {/* Iconic R34 headlights */}
          <rect x="130" y="26" width="12" height="3" rx="1" fill="hsl(45, 90%, 70%)" opacity="0.9" />
          <rect x="130" y="30" width="10" height="2" rx="1" fill="hsl(45, 90%, 70%)" opacity="0.7" />
          {/* Light glow */}
          <ellipse cx="136" cy="28" rx="10" ry="6" fill="hsl(45, 90%, 70%)" opacity="0.2" />
          {/* Windows */}
          <path 
            d="M55,22 L58,26 L92,26 L98,22 L55,22" 
            fill="hsl(220, 30%, 12%)"
            opacity="0.85"
          />
          {/* R34 wing */}
          <rect x="12" y="16" width="30" height="2" rx="1" fill="hsl(280, 45%, 20%)" />
          <rect x="18" y="18" width="3" height="8" fill="hsl(280, 45%, 18%)" />
          <rect x="35" y="18" width="3" height="8" fill="hsl(280, 45%, 18%)" />
          {/* Round tail lights */}
          <circle cx="18" cy="30" r="3" fill="hsl(0, 80%, 50%)" opacity="0.9" />
          <circle cx="26" cy="30" r="3" fill="hsl(0, 80%, 50%)" opacity="0.9" />
          {/* Wheels - deep dish stanced */}
          <circle cx="45" cy="42" r="9" fill="hsl(0, 0%, 5%)" />
          <circle cx="45" cy="42" r="6" fill="hsl(45, 50%, 40%)" />
          <circle cx="45" cy="42" r="3" fill="hsl(0, 0%, 15%)" />
          <circle cx="115" cy="42" r="9" fill="hsl(0, 0%, 5%)" />
          <circle cx="115" cy="42" r="6" fill="hsl(45, 50%, 40%)" />
          <circle cx="115" cy="42" r="3" fill="hsl(0, 0%, 15%)" />
          {/* Fender flares */}
          <path d="M34,38 Q45,30 56,38" stroke="hsl(280, 50%, 23%)" strokeWidth="2" fill="none" />
          <path d="M104,38 Q115,30 126,38" stroke="hsl(280, 50%, 23%)" strokeWidth="2" fill="none" />
          {/* Ground reflection */}
          <path 
            d="M10,42 L150,42 L150,48 L10,48 Z" 
            fill="hsl(280, 50%, 25%)"
            opacity="0.12"
          />
        </svg>
      </div>

      {/* AE86 Trueno style - center background */}
      <div className="absolute bottom-[12%] left-[38%] opacity-60">
        <svg width="100" height="35" viewBox="0 0 100 35" fill="none">
          {/* Classic boxy body - panda scheme */}
          <path 
            d="M10,26 L12,26 L18,16 L32,14 L68,14 L80,15 L88,22 L92,26 L10,26" 
            fill="hsl(0, 0%, 95%)"
          />
          {/* Black hood */}
          <path 
            d="M18,16 L32,14 L60,14 L62,15 L55,15 L35,16 L22,18" 
            fill="hsl(0, 0%, 10%)"
          />
          {/* Windows */}
          <path 
            d="M35,15 L37,19 L58,19 L62,15 L35,15" 
            fill="hsl(220, 30%, 15%)"
            opacity="0.8"
          />
          {/* Pop-up headlights */}
          <rect x="78" y="14" width="6" height="4" rx="1" fill="hsl(0, 0%, 90%)" />
          <rect x="79" y="15" width="4" height="2" fill="hsl(0, 0%, 10%)" />
          {/* Red tail lights */}
          <rect x="12" y="20" width="3" height="4" rx="1" fill="hsl(0, 80%, 50%)" opacity="0.8" />
          {/* Wheels */}
          <circle cx="28" cy="28" r="6" fill="hsl(0, 0%, 8%)" />
          <circle cx="28" cy="28" r="4" fill="hsl(0, 0%, 25%)" />
          <circle cx="72" cy="28" r="6" fill="hsl(0, 0%, 8%)" />
          <circle cx="72" cy="28" r="4" fill="hsl(0, 0%, 25%)" />
        </svg>
      </div>

      {/* Falling cherry blossom petals */}
      {petals.map((petal, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${petal.left}%`,
            top: '-5%',
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            background: 'radial-gradient(ellipse at center, hsl(340, 70%, 75%) 0%, hsl(340, 60%, 65%) 100%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            animation: `petalFall ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Neon shop signs in distance */}
      <div className="absolute bottom-[24%] left-[25%]">
        <div 
          className="w-8 h-3 rounded-sm"
          style={{
            background: 'hsl(0, 80%, 50%)',
            boxShadow: '0 0 10px hsl(0, 80%, 50% / 0.6), 0 0 20px hsl(0, 80%, 50% / 0.3)',
            opacity: 0.7,
          }}
        />
      </div>
      <div className="absolute bottom-[26%] left-[45%]">
        <div 
          className="w-6 h-2 rounded-sm"
          style={{
            background: 'hsl(190, 80%, 50%)',
            boxShadow: '0 0 8px hsl(190, 80%, 50% / 0.5), 0 0 15px hsl(190, 80%, 50% / 0.3)',
            opacity: 0.6,
          }}
        />
      </div>
      <div className="absolute bottom-[25%] right-[28%]">
        <div 
          className="w-10 h-2.5 rounded-sm"
          style={{
            background: 'hsl(320, 70%, 55%)',
            boxShadow: '0 0 10px hsl(320, 70%, 55% / 0.5), 0 0 20px hsl(320, 70%, 55% / 0.3)',
            opacity: 0.6,
          }}
        />
      </div>

      {/* Ambient lofi glow - warm */}
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
