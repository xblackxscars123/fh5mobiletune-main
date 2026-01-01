import { Gauge, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="relative py-8 mb-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-racing-cyan/15 rounded-full blur-[80px]" />
      </div>
      
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/50 animate-pulse-glow">
            <Gauge className="w-8 h-8 text-primary" />
          </div>
          <div className="p-2 rounded-lg bg-racing-cyan/20 border border-racing-cyan/50">
            <Zap className="w-8 h-8 text-racing-cyan" />
          </div>
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-wider">
          <span className="text-gradient-racing">FH5</span>{' '}
          <span className="text-foreground">TUNING</span>
        </h1>
        
        <p className="font-display text-lg md:text-xl text-racing-cyan uppercase tracking-[0.3em]">
          Calculator
        </p>
        
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-4">
          Professional tuning calculator for all 1000+ cars in Forza Horizon 5. 
          Enter your car specs, select your tune type, and get optimized settings instantly.
        </p>
        
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
        </div>
      </div>
    </header>
  );
}
