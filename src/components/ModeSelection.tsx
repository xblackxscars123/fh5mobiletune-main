import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Settings, Check, Car, Gauge, Users } from 'lucide-react';

interface ModeSelectionProps {
  selectedMode: 'simple' | 'advanced';
  onModeChange: (mode: 'simple' | 'advanced') => void;
}

export function ModeSelection({ selectedMode, onModeChange }: ModeSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-display font-bold text-gradient-neon mb-2">
          Choose Your Tuning Experience
        </h2>
        <p className="text-muted-foreground text-sm">
          Select the mode that matches your tuning expertise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Simple Mode Card */}
        <Card 
          className={`p-6 md:p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            selectedMode === 'simple' 
              ? 'border-2 border-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan)/0.05)]' 
              : 'border-border hover:border-[hsl(var(--neon-cyan))/0.5]'
          }`}
          onClick={() => onModeChange('simple')}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--neon-cyan)/0.2)] flex items-center justify-center flex-shrink-0">
              <Zap className={`w-6 h-6 ${selectedMode === 'simple' ? 'text-[hsl(var(--neon-cyan))]' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-display font-bold">Simple Mode</h3>
                {selectedMode === 'simple' && (
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--neon-cyan))] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Perfect for beginners and quick tuning sessions. Just enter your basic car specs 
                and get professional-grade results in seconds.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                  <span>Basic specifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                  <span>Automatic optimization</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                  <span>Quick setup</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                  <span>Beginner-friendly</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Car className="w-4 h-4" />
                <span>Recommended for: New Forza players, casual tuners</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Advanced Mode Card */}
        <Card 
          className={`p-6 md:p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${
            selectedMode === 'advanced' 
              ? 'border-2 border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink)/0.05)]' 
              : 'border-border hover:border-[hsl(var(--neon-pink))/0.5]'
          }`}
          onClick={() => onModeChange('advanced')}
        >
          {/* Decorative accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[hsl(var(--neon-pink)/0.3)] to-transparent rounded-bl-full"></div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--neon-pink)/0.2)] flex items-center justify-center flex-shrink-0">
              <Settings className={`w-6 h-6 ${selectedMode === 'advanced' ? 'text-[hsl(var(--neon-pink))]' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-display font-bold">Advanced Mode</h3>
                {selectedMode === 'advanced' && (
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--neon-pink))] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                For tuning experts who want complete control. Access every parameter, 
                fine-tune every setting, and create custom setups for any track or driving style.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-pink))]" />
                  <span>All tuning parameters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-pink))]" />
                  <span>Custom configurations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-pink))]" />
                  <span>Professional features</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-pink))]" />
                  <span>Track-specific tuning</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Gauge className="w-4 h-4" />
                <span>Recommended for: Experienced tuners, racing enthusiasts</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Comparison */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-4 bg-card/50 border border-border rounded-full px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
            <span className="text-muted-foreground">75% of users start with</span>
            <span className="font-semibold">Simple Mode</span>
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Switch between modes anytime</span>
            <Settings className="w-4 h-4 text-[hsl(var(--neon-pink))]" />
          </div>
        </div>
      </div>
    </div>
  );
}