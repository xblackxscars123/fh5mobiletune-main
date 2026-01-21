import { Cloud, Heart, Share2, Smartphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignupIncentiveBannerProps {
  onSignUp: () => void;
  variant?: 'full' | 'compact';
}

export function SignupIncentiveBanner({ onSignUp, variant = 'full' }: SignupIncentiveBannerProps) {
  if (variant === 'compact') {
    return (
      <div 
        className="p-4 rounded-lg backdrop-blur-sm text-center"
        style={{ 
          background: 'linear-gradient(135deg, hsl(var(--neon-cyan) / 0.1) 0%, hsl(var(--neon-pink) / 0.1) 100%)',
          border: '1px solid hsl(var(--neon-cyan) / 0.3)'
        }}
      >
        <p className="text-sm text-muted-foreground mb-2">
          Sign up to access community tunes
        </p>
        <Button 
          onClick={onSignUp}
          size="sm"
          className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30"
        >
          Create Free Account
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl backdrop-blur-sm relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, hsl(var(--neon-cyan) / 0.08) 0%, hsl(var(--neon-purple) / 0.08) 50%, hsl(var(--neon-pink) / 0.08) 100%)',
        border: '1px solid hsl(var(--neon-cyan) / 0.3)'
      }}
    >
      {/* Decorative glow */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, hsl(var(--neon-pink)) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(var(--neon-cyan)) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        <h3 className="font-display text-xl mb-4 text-center">
          <span className="text-neon-cyan">🔓</span> Sign Up <span className="text-neon-pink">FREE</span> to:
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="w-4 h-4 text-neon-cyan shrink-0" />
            <span className="text-muted-foreground">Save unlimited tunes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-neon-pink shrink-0" />
            <span className="text-muted-foreground">Access community tunes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-neon-purple shrink-0" />
            <span className="text-muted-foreground">Share & earn likes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4 text-module-suspension shrink-0" />
            <span className="text-muted-foreground">Sync across devices</span>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={onSignUp}
            className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-white font-display uppercase tracking-wider shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]"
          >
            Create Account →
          </Button>
        </div>
      </div>
    </div>
  );
}
