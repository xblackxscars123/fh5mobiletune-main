import { Gauge, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="relative py-4 sm:py-6 md:py-8 mb-4 sm:mb-6 md:mb-8 overflow-hidden">
      {/* Background glow effects - hidden on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-0 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-primary/20 rounded-full blur-[60px] md:blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-racing-cyan/15 rounded-full blur-[40px] md:blur-[80px]" />
      </div>
      
      <div className="relative z-10 text-center space-y-2 sm:space-y-3 md:space-y-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 border border-primary/50 animate-pulse-glow">
            <Gauge className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <div className="p-1.5 sm:p-2 rounded-lg bg-racing-cyan/20 border border-racing-cyan/50">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-racing-cyan" />
          </div>
        </div>
        
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-wider">
          <span className="text-gradient-racing">FH5</span>{' '}
          <span className="text-foreground">PRO TUNE</span>
        </h1>
        
        <p className="font-display text-sm sm:text-base md:text-lg lg:text-xl text-racing-cyan uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em]">
          Calculator
        </p>
        
        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 sm:px-4 hidden sm:block">
          Professional tuning calculator for all 1000+ cars in Forza Horizon 5. 
          Enter your car specs, select your tune type, and get optimized settings instantly.
        </p>
        
        {/* Decorative line - simplified on mobile */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2 sm:pt-3 md:pt-4">
          <div className="h-px w-8 sm:w-12 md:w-16 bg-gradient-to-r from-transparent to-primary" />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />
          <div className="h-px w-8 sm:w-12 md:w-16 bg-gradient-to-l from-transparent to-primary" />
        </div>
      </div>
    </header>
  );
}
