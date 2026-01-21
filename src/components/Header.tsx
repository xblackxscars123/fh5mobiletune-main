import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Zap, Car, User, LogOut, Radio, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, UI_THEMES } from '@/contexts/ThemeContext';

interface HeaderProps {
  onShowAuth?: () => void;
}

export function Header({ onShowAuth }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative py-6 sm:py-8 md:py-10 mb-6 sm:mb-8 overflow-hidden">
      {/* Glassmorphism background with blur */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {/* Base glass effect - transparent with blur */}
        <div 
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(180deg, hsl(280 80% 8% / 0.3) 0%, hsl(260 70% 12% / 0.4) 30%, hsl(220 60% 10% / 0.3) 100%)',
          }}
        />
        
        {/* Horizon glow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(320 100% 50% / 0.08) 60%, hsl(320 100% 60% / 0.15) 100%)'
          }}
        />
        
        {/* Grid floor - perspective effect */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: `
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.2) 1px, transparent 1px),
              linear-gradient(0deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 20px',
            transform: 'perspective(200px) rotateX(60deg)',
            transformOrigin: 'bottom center',
            maskImage: 'linear-gradient(to top, white 0%, transparent 100%)'
          }}
        />

        {/* Circuit board pattern overlay - transparent glass effect */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="0" y1="20" x2="30" y2="20" stroke="hsl(var(--neon-cyan))" strokeWidth="0.5"/>
              <line x1="40" y1="20" x2="100" y2="20" stroke="hsl(var(--neon-pink))" strokeWidth="0.5"/>
              <line x1="0" y1="50" x2="60" y2="50" stroke="hsl(var(--neon-purple))" strokeWidth="0.5"/>
              <line x1="70" y1="50" x2="100" y2="50" stroke="hsl(var(--neon-cyan))" strokeWidth="0.5"/>
              <line x1="0" y1="80" x2="45" y2="80" stroke="hsl(var(--neon-pink))" strokeWidth="0.5"/>
              <line x1="30" y1="20" x2="30" y2="50" stroke="hsl(var(--neon-cyan))" strokeWidth="0.5"/>
              <line x1="60" y1="50" x2="60" y2="80" stroke="hsl(var(--neon-purple))" strokeWidth="0.5"/>
              <line x1="70" y1="0" x2="70" y2="50" stroke="hsl(var(--neon-cyan))" strokeWidth="0.5"/>
              <circle cx="30" cy="20" r="2" fill="hsl(var(--neon-cyan))" className="animate-pulse"/>
              <circle cx="60" cy="50" r="2" fill="hsl(var(--neon-purple))" className="animate-pulse"/>
              <circle cx="70" cy="50" r="2" fill="hsl(var(--neon-cyan))" className="animate-pulse"/>
              <circle cx="45" cy="80" r="2" fill="hsl(var(--neon-pink))" className="animate-pulse"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>

        {/* Neon city skyline - OUTLINE ONLY (no fill) */}
        <svg className="absolute bottom-0 left-0 right-0 h-40 opacity-70" preserveAspectRatio="none" viewBox="0 0 1200 200">
          <defs>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Building outlines only - no fill */}
          <g filter="url(#neonGlow)" fill="none">
            {/* Left buildings */}
            <rect x="20" y="80" width="60" height="120" stroke="hsl(var(--neon-purple))" strokeWidth="1.5"/>
            <rect x="90" y="50" width="50" height="150" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5"/>
            <rect x="150" y="100" width="40" height="100" stroke="hsl(var(--neon-pink))" strokeWidth="1.5"/>
            
            {/* Center buildings (taller) */}
            <rect x="250" y="30" width="80" height="170" stroke="hsl(var(--neon-cyan))" strokeWidth="2"/>
            <rect x="340" y="60" width="60" height="140" stroke="hsl(var(--neon-purple))" strokeWidth="1.5"/>
            <rect x="410" y="20" width="100" height="180" stroke="hsl(var(--neon-pink))" strokeWidth="2.5"/>
            <rect x="520" y="70" width="70" height="130" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5"/>
            
            {/* Right side buildings */}
            <rect x="650" y="40" width="90" height="160" stroke="hsl(var(--neon-purple))" strokeWidth="2"/>
            <rect x="750" y="90" width="50" height="110" stroke="hsl(var(--neon-pink))" strokeWidth="1.5"/>
            <rect x="810" y="55" width="70" height="145" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5"/>
            <rect x="890" y="80" width="55" height="120" stroke="hsl(var(--neon-purple))" strokeWidth="1.5"/>
            
            {/* Far buildings */}
            <rect x="1000" y="60" width="80" height="140" stroke="hsl(var(--neon-pink))" strokeWidth="1.5"/>
            <rect x="1090" y="100" width="60" height="100" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5"/>
          </g>
          
          {/* LED window lights - glowing dots */}
          <g className="animate-pulse">
            <rect x="35" y="95" width="6" height="4" fill="hsl(var(--neon-cyan))" rx="1"/>
            <rect x="55" y="115" width="6" height="4" fill="hsl(var(--neon-pink))" rx="1"/>
            <rect x="105" y="65" width="6" height="4" fill="hsl(var(--neon-purple))" rx="1"/>
            <rect x="270" y="50" width="8" height="5" fill="hsl(var(--neon-pink))" rx="1"/>
            <rect x="300" y="50" width="8" height="5" fill="hsl(var(--neon-cyan))" rx="1"/>
            <rect x="435" y="40" width="10" height="6" fill="hsl(var(--neon-cyan))" rx="1"/>
            <rect x="470" y="40" width="10" height="6" fill="hsl(var(--neon-pink))" rx="1"/>
            <rect x="435" y="80" width="10" height="6" fill="hsl(var(--neon-purple))" rx="1"/>
            <rect x="670" y="60" width="8" height="5" fill="hsl(var(--neon-cyan))" rx="1"/>
            <rect x="830" y="75" width="6" height="4" fill="hsl(var(--neon-pink))" rx="1"/>
            <rect x="1020" y="85" width="8" height="5" fill="hsl(var(--neon-cyan))" rx="1"/>
          </g>
        </svg>

        {/* Floating LED particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                left: `${(i * 7 + 5) % 100}%`,
                top: `${(i * 11 + 10) % 60}%`,
                backgroundColor: ['hsl(var(--neon-cyan))', 'hsl(var(--neon-pink))', 'hsl(var(--neon-purple))'][i % 3],
                boxShadow: `0 0 6px ${['hsl(var(--neon-cyan))', 'hsl(var(--neon-pink))', 'hsl(var(--neon-purple))'][i % 3]}`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.5
              }}
            />
          ))}
        </div>

        {/* Sun/moon glow on horizon */}
        <div 
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-16"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--neon-pink) / 0.4) 0%, hsl(var(--neon-purple) / 0.2) 40%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />

        {/* Scanline overlay for retro effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)'
          }}
        />
      </div>
      
      <div className="relative z-10 text-center space-y-4 md:space-y-6">
        {/* Icon row with neon styling - Zap is Easter egg theme switcher */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-pink/10 border border-neon-pink/50 shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)] backdrop-blur-sm">
            <Gauge className="w-6 h-6 md:w-8 md:h-8 text-neon-pink" />
          </div>
          
          {/* Easter Egg: Theme Switcher hidden in Zap icon */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/50 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] backdrop-blur-sm cursor-pointer hover:bg-neon-cyan/20 transition-all"
              aria-label="Theme switcher"
            >
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
            </button>
            
            {/* Theme Dropdown - appears when clicked */}
            {showThemeDropdown && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-48 rounded-lg overflow-hidden shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)] animate-scale-in">
                <div className="bg-card border border-neon-cyan/30 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 text-xs font-display uppercase tracking-wider text-neon-cyan border-b border-border/50 bg-card">
                    UI Theme
                  </div>
                  <div className="py-1 bg-card">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id);
                          setShowThemeDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-neon-cyan/10 ${
                          currentTheme === theme.id ? 'text-neon-cyan bg-neon-cyan/5' : 'text-foreground'
                        }`}
                      >
                        <span className="text-base">{theme.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-xs text-muted-foreground">{theme.description}</div>
                        </div>
                        {currentTheme === theme.id && (
                          <Check className="w-4 h-4 text-neon-cyan" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Title - Neon Blueprint Style */}
        <div className="relative inline-block">
          {/* Glassy panel background */}
          <div 
            className="absolute inset-0 -m-4 rounded-xl backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, hsl(260 50% 10% / 0.6) 0%, hsl(280 50% 8% / 0.7) 100%)',
              border: '1px solid hsl(var(--neon-cyan) / 0.3)',
              boxShadow: `
                0 0 40px hsl(var(--neon-pink) / 0.15),
                0 0 80px hsl(var(--neon-purple) / 0.08),
                inset 0 1px 0 hsl(var(--neon-cyan) / 0.15)
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
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-module-suspension/10 hover:bg-module-suspension/20 border border-module-suspension/40 hover:border-module-suspension/60 transition-all text-sm font-medium text-module-suspension shadow-[0_0_15px_hsl(var(--module-suspension)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-suspension)/0.4)] backdrop-blur-sm circuit-button overflow-hidden"
          >
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-module-suspension shadow-[0_0_6px_hsl(var(--module-suspension))]" />
            <Car className="w-4 h-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Browse</span> <span className="relative z-10">Cars</span>
          </Link>
          
          <Link 
            to="/telemetry-guide" 
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-module-aero/10 hover:bg-module-aero/20 border border-module-aero/40 hover:border-module-aero/60 transition-all text-sm font-medium text-module-aero shadow-[0_0_15px_hsl(var(--module-aero)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-aero)/0.4)] backdrop-blur-sm circuit-button overflow-hidden"
          >
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-module-aero shadow-[0_0_6px_hsl(var(--module-aero))]" />
            <Radio className="w-4 h-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Telemetry</span> <span className="relative z-10">Guide</span>
          </Link>
          
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2 border-module-tires/40 text-module-tires hover:bg-module-tires/10 hover:border-module-tires/60 shadow-[0_0_15px_hsl(var(--module-tires)/0.2)] backdrop-blur-sm circuit-button overflow-hidden relative"
            >
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-module-tires shadow-[0_0_6px_hsl(var(--module-tires))]" />
              <LogOut className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Sign Out</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowAuth}
              className="gap-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/70 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)] backdrop-blur-sm circuit-button overflow-hidden relative"
            >
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_hsl(var(--neon-cyan))]" />
              <User className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Sign In</span>
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
