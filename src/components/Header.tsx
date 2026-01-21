import { Link } from 'react-router-dom';
import { Gauge, Zap, Car, User, LogOut, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onShowAuth?: () => void;
}

export function Header({ onShowAuth }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="relative py-6 sm:py-8 md:py-10 mb-6 sm:mb-8 overflow-hidden">
      {/* Vaporwave city background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient - deep purple to dark blue */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, hsl(280, 80%, 8%) 0%, hsl(260, 70%, 12%) 30%, hsl(220, 60%, 10%) 100%)'
          }}
        />
        
        {/* Horizon glow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(320, 100%, 50%, 0.1) 60%, hsl(320, 100%, 60%, 0.3) 100%)'
          }}
        />
        
        {/* Grid floor - perspective effect */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: `
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px),
              linear-gradient(0deg, hsl(var(--neon-cyan) / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 20px',
            transform: 'perspective(200px) rotateX(60deg)',
            transformOrigin: 'bottom center',
            maskImage: 'linear-gradient(to top, white 0%, transparent 100%)'
          }}
        />

        {/* Circuit board pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              {/* Horizontal traces */}
              <line x1="0" y1="20" x2="30" y2="20" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
              <line x1="40" y1="20" x2="100" y2="20" stroke="hsl(var(--neon-pink))" strokeWidth="1"/>
              <line x1="0" y1="50" x2="60" y2="50" stroke="hsl(var(--neon-purple))" strokeWidth="1"/>
              <line x1="70" y1="50" x2="100" y2="50" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
              <line x1="0" y1="80" x2="45" y2="80" stroke="hsl(var(--neon-pink))" strokeWidth="1"/>
              
              {/* Vertical traces */}
              <line x1="30" y1="20" x2="30" y2="50" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
              <line x1="60" y1="50" x2="60" y2="80" stroke="hsl(var(--neon-purple))" strokeWidth="1"/>
              <line x1="70" y1="0" x2="70" y2="50" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
              
              {/* LED nodes */}
              <circle cx="30" cy="20" r="3" fill="hsl(var(--neon-cyan))"/>
              <circle cx="60" cy="50" r="3" fill="hsl(var(--neon-purple))"/>
              <circle cx="70" cy="50" r="3" fill="hsl(var(--neon-cyan))"/>
              <circle cx="45" cy="80" r="3" fill="hsl(var(--neon-pink))"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>

        {/* Neon city buildings silhouette */}
        <svg className="absolute bottom-0 left-0 right-0 h-40 opacity-60" preserveAspectRatio="none" viewBox="0 0 1200 200">
          <defs>
            <linearGradient id="buildingGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neon-purple))" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="hsl(var(--neon-pink))" stopOpacity="0.3"/>
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Building shapes with LED windows */}
          <g filter="url(#neonGlow)">
            {/* Left buildings */}
            <rect x="20" y="80" width="60" height="120" fill="hsl(260, 50%, 8%)" stroke="hsl(var(--neon-purple))" strokeWidth="1"/>
            <rect x="90" y="50" width="50" height="150" fill="hsl(260, 50%, 6%)" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
            <rect x="150" y="100" width="40" height="100" fill="hsl(260, 50%, 10%)" stroke="hsl(var(--neon-pink))" strokeWidth="1"/>
            
            {/* Center buildings (taller) */}
            <rect x="250" y="30" width="80" height="170" fill="hsl(260, 50%, 5%)" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5"/>
            <rect x="340" y="60" width="60" height="140" fill="hsl(260, 50%, 8%)" stroke="hsl(var(--neon-purple))" strokeWidth="1"/>
            <rect x="410" y="20" width="100" height="180" fill="hsl(260, 50%, 4%)" stroke="hsl(var(--neon-pink))" strokeWidth="2"/>
            <rect x="520" y="70" width="70" height="130" fill="hsl(260, 50%, 7%)" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
            
            {/* Right side buildings */}
            <rect x="650" y="40" width="90" height="160" fill="hsl(260, 50%, 6%)" stroke="hsl(var(--neon-purple))" strokeWidth="1.5"/>
            <rect x="750" y="90" width="50" height="110" fill="hsl(260, 50%, 9%)" stroke="hsl(var(--neon-pink))" strokeWidth="1"/>
            <rect x="810" y="55" width="70" height="145" fill="hsl(260, 50%, 5%)" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
            <rect x="890" y="80" width="55" height="120" fill="hsl(260, 50%, 8%)" stroke="hsl(var(--neon-purple))" strokeWidth="1"/>
            
            {/* Far buildings */}
            <rect x="1000" y="60" width="80" height="140" fill="hsl(260, 50%, 6%)" stroke="hsl(var(--neon-pink))" strokeWidth="1"/>
            <rect x="1090" y="100" width="60" height="100" fill="hsl(260, 50%, 10%)" stroke="hsl(var(--neon-cyan))" strokeWidth="1"/>
          </g>
          
          {/* LED window lights - scattered across buildings */}
          <g className="animate-pulse">
            {/* Building 1 windows */}
            <rect x="30" y="90" width="8" height="6" fill="hsl(var(--neon-cyan))" opacity="0.9"/>
            <rect x="50" y="110" width="8" height="6" fill="hsl(var(--neon-pink))" opacity="0.7"/>
            <rect x="30" y="140" width="8" height="6" fill="hsl(var(--neon-cyan))" opacity="0.8"/>
            
            {/* Building 2 windows */}
            <rect x="100" y="60" width="10" height="8" fill="hsl(var(--neon-purple))" opacity="0.9"/>
            <rect x="120" y="90" width="10" height="8" fill="hsl(var(--neon-cyan))" opacity="0.6"/>
            <rect x="100" y="130" width="10" height="8" fill="hsl(var(--neon-pink))" opacity="0.8"/>
            
            {/* Center building windows */}
            <rect x="260" y="45" width="12" height="10" fill="hsl(var(--neon-pink))" opacity="0.9"/>
            <rect x="290" y="45" width="12" height="10" fill="hsl(var(--neon-cyan))" opacity="0.7"/>
            <rect x="260" y="80" width="12" height="10" fill="hsl(var(--neon-cyan))" opacity="0.8"/>
            <rect x="290" y="110" width="12" height="10" fill="hsl(var(--neon-purple))" opacity="0.9"/>
            
            {/* Main tower windows */}
            <rect x="425" y="35" width="15" height="12" fill="hsl(var(--neon-cyan))" opacity="1"/>
            <rect x="460" y="35" width="15" height="12" fill="hsl(var(--neon-pink))" opacity="0.9"/>
            <rect x="425" y="70" width="15" height="12" fill="hsl(var(--neon-purple))" opacity="0.8"/>
            <rect x="460" y="100" width="15" height="12" fill="hsl(var(--neon-cyan))" opacity="0.9"/>
            <rect x="425" y="130" width="15" height="12" fill="hsl(var(--neon-pink))" opacity="0.7"/>
            <rect x="480" y="130" width="15" height="12" fill="hsl(var(--neon-cyan))" opacity="0.8"/>
            
            {/* Right side windows */}
            <rect x="665" y="55" width="12" height="10" fill="hsl(var(--neon-cyan))" opacity="0.9"/>
            <rect x="700" y="90" width="12" height="10" fill="hsl(var(--neon-pink))" opacity="0.8"/>
            <rect x="665" y="130" width="12" height="10" fill="hsl(var(--neon-purple))" opacity="0.7"/>
            
            <rect x="820" y="70" width="10" height="8" fill="hsl(var(--neon-pink))" opacity="0.9"/>
            <rect x="850" y="100" width="10" height="8" fill="hsl(var(--neon-cyan))" opacity="0.8"/>
            <rect x="820" y="140" width="10" height="8" fill="hsl(var(--neon-purple))" opacity="0.6"/>
            
            <rect x="1015" y="80" width="12" height="10" fill="hsl(var(--neon-cyan))" opacity="0.9"/>
            <rect x="1050" y="110" width="12" height="10" fill="hsl(var(--neon-pink))" opacity="0.8"/>
          </g>
        </svg>

        {/* Floating LED particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor: ['hsl(var(--neon-cyan))', 'hsl(var(--neon-pink))', 'hsl(var(--neon-purple))'][i % 3],
                boxShadow: `0 0 6px ${['hsl(var(--neon-cyan))', 'hsl(var(--neon-pink))', 'hsl(var(--neon-purple))'][i % 3]}`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6 + Math.random() * 0.4
              }}
            />
          ))}
        </div>

        {/* Sun/moon glow on horizon */}
        <div 
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-40 h-20"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--neon-pink) / 0.6) 0%, hsl(var(--neon-purple) / 0.3) 40%, transparent 70%)',
            filter: 'blur(10px)'
          }}
        />

        {/* Scanline overlay for retro effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }}
        />
      </div>
      
      <div className="relative z-10 text-center space-y-4 md:space-y-6">
        {/* Icon row with neon styling */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-pink/10 border border-neon-pink/50 shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)] backdrop-blur-sm">
            <Gauge className="w-6 h-6 md:w-8 md:h-8 text-neon-pink" />
          </div>
          <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/50 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] backdrop-blur-sm">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
          </div>
        </div>
        
        {/* Main Title - Neon Blueprint Style */}
        <div className="relative inline-block">
          {/* Glassy panel background */}
          <div 
            className="absolute inset-0 -m-4 rounded-xl backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, hsl(260, 50%, 10%, 0.8) 0%, hsl(280, 50%, 8%, 0.9) 100%)',
              border: '1px solid hsl(var(--neon-cyan) / 0.4)',
              boxShadow: `
                0 0 40px hsl(var(--neon-pink) / 0.2),
                0 0 80px hsl(var(--neon-purple) / 0.1),
                inset 0 1px 0 hsl(var(--neon-cyan) / 0.2)
              `
            }}
          />
          
          <div className="relative px-8 sm:px-12 md:px-16 py-6 sm:py-8">
            <h1 
              className="font-sketch text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--neon-pink)) 0%, hsl(var(--neon-cyan)) 50%, hsl(var(--neon-purple)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px hsl(var(--neon-pink) / 0.6)) drop-shadow(0 0 60px hsl(var(--neon-cyan) / 0.4))'
              }}
            >
              ForzaMobileTune
            </h1>
            
            {/* Decorative elements */}
            <div 
              className="absolute -top-2 -right-2 px-2 py-0.5 rounded text-xs font-mono hidden sm:block"
              style={{
                background: 'hsl(var(--neon-cyan) / 0.2)',
                border: '1px solid hsl(var(--neon-cyan) / 0.5)',
                color: 'hsl(var(--neon-cyan))',
                textShadow: '0 0 10px hsl(var(--neon-cyan))'
              }}
            >
              v2.0
            </div>
            <div 
              className="absolute -bottom-1 -left-2 px-2 py-0.5 rounded text-xs font-mono hidden sm:block"
              style={{
                background: 'hsl(var(--neon-pink) / 0.2)',
                border: '1px solid hsl(var(--neon-pink) / 0.5)',
                color: 'hsl(var(--neon-pink))',
                textShadow: '0 0 10px hsl(var(--neon-pink))'
              }}
            >
              PRO
            </div>
          </div>
        </div>
        
        {/* Subtitle with neon accent */}
        <p 
          className="font-display text-sm sm:text-base md:text-lg text-neon-cyan uppercase tracking-[0.2em] md:tracking-[0.3em]"
          style={{ textShadow: '0 0 20px hsl(var(--neon-cyan) / 0.6)' }}
        >
          Blueprint Tuning Workspace
        </p>
        
        <p className="text-muted-foreground/90 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-4 hidden sm:block backdrop-blur-sm">
          AI tuning calculator for almost all 1000+ cars in Forza Horizon 5. Enter your car specs, select your tune type, and get optimized settings instantly.
        </p>
        
        {/* Navigation Links - Neon styled */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4 flex-wrap">
          <Link 
            to="/cars" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-module-suspension/10 hover:bg-module-suspension/20 border border-module-suspension/40 hover:border-module-suspension/60 transition-all text-sm font-medium text-module-suspension shadow-[0_0_15px_hsl(var(--module-suspension)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-suspension)/0.4)] backdrop-blur-sm"
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Browse</span> Cars
          </Link>
          
          <Link 
            to="/telemetry-guide" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-module-aero/10 hover:bg-module-aero/20 border border-module-aero/40 hover:border-module-aero/60 transition-all text-sm font-medium text-module-aero shadow-[0_0_15px_hsl(var(--module-aero)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-aero)/0.4)] backdrop-blur-sm"
          >
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Telemetry</span> Guide
          </Link>
          
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2 border-module-tires/40 text-module-tires hover:bg-module-tires/10 hover:border-module-tires/60 shadow-[0_0_15px_hsl(var(--module-tires)/0.2)] backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowAuth}
              className="gap-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/70 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)] backdrop-blur-sm"
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
        
        {/* Decorative neon line */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_hsl(var(--neon-cyan)),0_0_20px_hsl(var(--neon-cyan)/0.5)]" />
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent via-neon-pink to-transparent" />
        </div>
      </div>
    </header>
  );
}
