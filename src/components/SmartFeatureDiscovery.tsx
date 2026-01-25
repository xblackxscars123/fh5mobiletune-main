import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CarSpecs } from '@/lib/tuningCalculator';
import {
  Save,
  Share2,
  Users,
  Brain,
  Car,
  Settings,
  Sparkles,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  variant: 'primary' | 'secondary' | 'success';
  isNew?: boolean;
  isPopular?: boolean;
  onClick: () => void;
}

interface SmartFeatureDiscoveryProps {
  currentStep: number;
  specs: CarSpecs;
  showResults: boolean;
  savedTunesCount: number;
  onAction: (action: string) => void;
}

export function SmartFeatureDiscovery({ 
  currentStep, 
  specs, 
  showResults, 
  savedTunesCount, 
  onAction 
}: SmartFeatureDiscoveryProps) {
  const [visibleFeatures, setVisibleFeatures] = useState<FeatureCard[]>([]);

  useEffect(() => {
    const features: FeatureCard[] = [];

    // Step 1: After car selection
    if (currentStep >= 2 && !showResults) {
      features.push({
        id: 'car-comparison',
        title: 'Compare Similar Cars',
        description: 'See how your car performs against similar models',
        icon: <Car className="w-5 h-5" />,
        actionText: 'Compare Now',
        variant: 'primary',
        onClick: () => onAction('compare-cars')
      });
    }

    // Step 2: After specs entered
    if (currentStep >= 2 && !showResults && specs.driveType) {
      features.push({
        id: 'ai-suggestions',
        title: 'Get AI Suggestions',
        description: 'Let our AI analyze your specs and suggest optimal settings',
        icon: <Brain className="w-5 h-5" />,
        actionText: 'Get AI Help',
        variant: 'success',
        isNew: true,
        onClick: () => onAction('ai-suggestions')
      });
    }

    // Step 3: After results generated
    if (showResults) {
      features.push({
        id: 'save-tune',
        title: 'Save This Tune',
        description: 'Keep your favorite setups organized and accessible',
        icon: <Save className="w-5 h-5" />,
        actionText: 'Save Tune',
        variant: 'primary',
        onClick: () => onAction('save-tune')
      });

      features.push({
        id: 'share-tune',
        title: 'Share Your Setup',
        description: 'Share your perfect tune with the community',
        icon: <Share2 className="w-5 h-5" />,
        actionText: 'Share Setup',
        variant: 'secondary',
        onClick: () => onAction('share-tune')
      });

      if (savedTunesCount >= 2) {
        features.push({
          id: 'compare-tunes',
          title: 'Compare Tunes',
          description: 'See how this setup compares to your saved configurations',
          icon: <Target className="w-5 h-5" />,
          actionText: 'Compare',
          variant: 'success',
          isPopular: true,
          onClick: () => onAction('compare-tunes')
        });
      }
    }

    // Always available when results are shown
    if (showResults) {
      features.push({
        id: 'advanced-tuning',
        title: 'Advanced Tuning',
        description: 'Fine-tune every parameter for track-specific optimization',
        icon: <Settings className="w-5 h-5" />,
        actionText: 'Advanced Mode',
        variant: 'secondary',
        onClick: () => onAction('advanced-tuning')
      });

      features.push({
        id: 'track-simulator',
        title: 'Virtual Track',
        description: 'Test your setup on different tracks before hitting the road',
        icon: <TrendingUp className="w-5 h-5" />,
        actionText: 'Test Setup',
        variant: 'primary',
        isNew: true,
        onClick: () => onAction('track-simulator')
      });
    }

    setVisibleFeatures(features);
  }, [currentStep, showResults, specs.driveType, savedTunesCount, onAction]);

  if (visibleFeatures.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-display font-bold mb-2">Recommended Features</h3>
        <p className="text-sm text-muted-foreground">
          Based on your progress, here are features you might find useful
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleFeatures.map((feature) => (
          <Card 
            key={feature.id}
            className={`p-4 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              feature.variant === 'primary' 
                ? 'border-[hsl(var(--neon-pink))/0.5] bg-[hsl(var(--neon-pink))/0.05]' 
                : feature.variant === 'success'
                ? 'border-[hsl(var(--neon-cyan))/0.5] bg-[hsl(var(--neon-cyan))/0.05]'
                : 'border-border hover:border-[hsl(var(--neon-purple))/0.5] bg-[hsl(var(--neon-purple))/0.05]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  feature.variant === 'primary' 
                    ? 'bg-[hsl(var(--neon-pink))/0.2] text-[hsl(var(--neon-pink))]' 
                    : feature.variant === 'success'
                    ? 'bg-[hsl(var(--neon-cyan))/0.2] text-[hsl(var(--neon-cyan))]'
                    : 'bg-[hsl(var(--neon-purple))/0.2] text-[hsl(var(--neon-purple))]'
                }`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              
              {feature.isNew && (
                <Badge variant="secondary" className="bg-[hsl(var(--neon-yellow))/0.2] text-[hsl(var(--neon-yellow))] border-[hsl(var(--neon-yellow))/0.4]">
                  New
                </Badge>
              )}
              {feature.isPopular && (
                <Badge variant="secondary" className="bg-[hsl(var(--neon-cyan))/0.2] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan))/0.4]">
                  Popular
                </Badge>
              )}
            </div>

            <Button 
              variant={feature.variant === 'primary' ? 'default' : 'outline'}
              onClick={feature.onClick}
              className={`w-full ${
                feature.variant === 'primary' 
                  ? 'bg-[hsl(var(--neon-pink))] hover:bg-[hsl(var(--neon-pink))/0.8] text-white' 
                  : feature.variant === 'success'
                  ? 'border-[hsl(var(--neon-cyan))] text-[hsl(var(--neon-cyan))] hover:bg-[hsl(var(--neon-cyan))/0.1]'
                  : 'border-[hsl(var(--neon-purple))] text-[hsl(var(--neon-purple))] hover:bg-[hsl(var(--neon-purple))/0.1]'
              }`}
            >
              {feature.actionText}
            </Button>
          </Card>
        ))}
      </div>

      {/* Progress-based encouragement */}
      {currentStep === 1 && (
        <div className="text-center p-4 bg-[hsl(var(--neon-cyan))/0.1] border border-[hsl(var(--neon-cyan))/0.3] rounded-lg">
          <p className="text-sm text-muted-foreground">
            🚀 <strong>Just getting started?</strong> Complete your first tune to unlock advanced features!
          </p>
        </div>
      )}

      {currentStep === 2 && !showResults && (
        <div className="text-center p-4 bg-[hsl(var(--neon-yellow))/0.1] border border-[hsl(var(--neon-yellow))/0.3] rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro tip:</strong> Click "Calculate" to see your custom tune and unlock all features!
          </p>
        </div>
      )}

      {showResults && savedTunesCount === 0 && (
        <div className="text-center p-4 bg-[hsl(var(--neon-pink))/0.1] border border-[hsl(var(--neon-pink))/0.3] rounded-lg">
          <p className="text-sm text-muted-foreground">
            💾 <strong>First time?</strong> Save this tune to start building your collection!
          </p>
        </div>
      )}
    </div>
  );
}

interface FeatureHighlightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isVisible: boolean;
  onDismiss?: () => void;
}

export function FeatureHighlight({ title, description, icon, isVisible, onDismiss }: FeatureHighlightProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-2 duration-500">
      <Card className="bg-[hsl(var(--neon-pink))/0.1] border-[hsl(var(--neon-pink))/0.3] shadow-xl">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--neon-pink))/0.2] text-[hsl(var(--neon-pink))] flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h4 className="font-semibold text-[hsl(var(--neon-pink))]">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
                ✕
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[hsl(var(--neon-pink))] hover:bg-[hsl(var(--neon-pink))/0.8] text-white">
              Try Now
            </Button>
            <Button variant="outline" size="sm">
              Later
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}