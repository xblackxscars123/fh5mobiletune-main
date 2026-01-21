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
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Neon glow effects */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-neon-pink/20 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-neon-cyan/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-neon-purple/15 rounded-full blur-[60px]" />
      </div>
      
      <div className="relative z-10 text-center space-y-4 md:space-y-6">
        {/* Icon row with neon styling */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-pink/10 border border-neon-pink/50 shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]">
            <Gauge className="w-6 h-6 md:w-8 md:h-8 text-neon-pink" />
          </div>
          <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/50 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)]">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
          </div>
        </div>
        
        {/* Main Title - Neon Blueprint Style */}
        <div className="relative inline-block">
          {/* Blueprint paper effect background */}
          <div 
            className="absolute inset-0 -m-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--blueprint-bg)) 0%, hsl(220, 60%, 12%) 100%)',
              border: '2px solid hsl(var(--neon-cyan) / 0.3)',
              boxShadow: `
                0 0 30px hsl(var(--neon-cyan) / 0.2),
                inset 0 0 60px hsl(var(--blueprint-bg) / 0.5)
              `
            }}
          />
          
          {/* Hand-drawn sketch border effect */}
          <svg className="absolute inset-0 -m-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none opacity-60">
            <rect 
              x="4" y="4" 
              width="calc(100% - 8px)" height="calc(100% - 8px)" 
              fill="none" 
              stroke="hsl(var(--neon-cyan))" 
              strokeWidth="1"
              strokeDasharray="8 4"
              rx="8"
            />
          </svg>
          
          <div className="relative px-8 sm:px-12 md:px-16 py-6 sm:py-8">
            <h1 
              className="font-sketch text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--neon-pink)) 0%, hsl(var(--neon-cyan)) 50%, hsl(var(--neon-purple)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px hsl(var(--neon-pink) / 0.5)',
                filter: 'drop-shadow(0 0 20px hsl(var(--neon-cyan) / 0.4))'
              }}
            >
              ForzaMobileTune
            </h1>
            
            {/* Decorative sketch annotations */}
            <div className="absolute -top-2 -right-2 text-neon-cyan/60 font-sketch text-xs rotate-12 hidden sm:block">
              v2.0
            </div>
            <div className="absolute -bottom-1 -left-2 text-neon-pink/60 font-sketch text-xs -rotate-6 hidden sm:block">
              PRO
            </div>
          </div>
        </div>
        
        {/* Subtitle with neon accent */}
        <p 
          className="font-display text-sm sm:text-base md:text-lg text-neon-cyan uppercase tracking-[0.2em] md:tracking-[0.3em]"
          style={{ textShadow: '0 0 20px hsl(var(--neon-cyan) / 0.5)' }}
        >
          Blueprint Tuning Workspace
        </p>
        
        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-4 hidden sm:block">
          AI tuning calculator for almost all 1000+ cars in Forza Horizon 5. Enter your car specs, select your tune type, and get optimized settings instantly.
        </p>
        
        {/* Navigation Links - Neon styled */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4 flex-wrap">
          <Link 
            to="/cars" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-module-suspension/10 hover:bg-module-suspension/20 border border-module-suspension/40 hover:border-module-suspension/60 transition-all text-sm font-medium text-module-suspension shadow-[0_0_15px_hsl(var(--module-suspension)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-suspension)/0.4)]"
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Browse</span> Cars
          </Link>
          
          <Link 
            to="/telemetry-guide" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-module-aero/10 hover:bg-module-aero/20 border border-module-aero/40 hover:border-module-aero/60 transition-all text-sm font-medium text-module-aero shadow-[0_0_15px_hsl(var(--module-aero)/0.2)] hover:shadow-[0_0_25px_hsl(var(--module-aero)/0.4)]"
          >
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Telemetry</span> Guide
          </Link>
          
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2 border-module-tires/40 text-module-tires hover:bg-module-tires/10 hover:border-module-tires/60 shadow-[0_0_15px_hsl(var(--module-tires)/0.2)]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowAuth}
              className="gap-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/70 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)]"
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
        
        {/* Decorative neon line */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_hsl(var(--neon-cyan))]" />
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent via-neon-pink to-transparent" />
        </div>
      </div>
    </header>
  );
}
