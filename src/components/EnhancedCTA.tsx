import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Zap, 
  Share2, 
  Save, 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Rocket 
} from 'lucide-react';

interface EnhancedCTAProps {
  type: 'calculate' | 'save' | 'share' | 'reset' | 'advanced';
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  showProgress?: boolean;
  progress?: number;
  children: React.ReactNode;
  description?: string;
  isNew?: boolean;
  isPopular?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function EnhancedCTA({ 
  type, 
  onClick, 
  disabled = false, 
  isLoading = false, 
  showProgress = false, 
  progress = 0,
  children, 
  description, 
  isNew = false, 
  isPopular = false, 
  size = 'md' 
}: EnhancedCTAProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const getButtonStyles = () => {
    switch (type) {
      case 'calculate':
        return {
          bg: 'bg-gradient-to-r from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-purple))]',
          hover: 'hover:from-[hsl(var(--neon-pink))/0.9] hover:to-[hsl(var(--neon-purple))/0.9]',
          text: 'text-white',
          shadow: 'shadow-lg shadow-[hsl(var(--neon-pink))/0.3]',
          border: 'border border-[hsl(var(--neon-pink))/0.3]'
        };
      case 'save':
        return {
          bg: 'bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-blue))]',
          hover: 'hover:from-[hsl(var(--neon-cyan))/0.9] hover:to-[hsl(var(--neon-blue))/0.9]',
          text: 'text-white',
          shadow: 'shadow-lg shadow-[hsl(var(--neon-cyan))/0.3]',
          border: 'border border-[hsl(var(--neon-cyan))/0.3]'
        };
      case 'share':
        return {
          bg: 'bg-gradient-to-r from-[hsl(var(--neon-yellow))] to-[hsl(var(--neon-orange))]',
          hover: 'hover:from-[hsl(var(--neon-yellow))/0.9] hover:to-[hsl(var(--neon-orange))/0.9]',
          text: 'text-white',
          shadow: 'shadow-lg shadow-[hsl(var(--neon-yellow))/0.3]',
          border: 'border border-[hsl(var(--neon-yellow))/0.3]'
        };
      case 'reset':
        return {
          bg: 'bg-gradient-to-r from-[hsl(var(--neon-gray))] to-[hsl(var(--neon-slate))]',
          hover: 'hover:from-[hsl(var(--neon-gray))/0.9] hover:to-[hsl(var(--neon-slate))/0.9]',
          text: 'text-white',
          shadow: 'shadow-lg shadow-[hsl(var(--neon-gray))/0.3]',
          border: 'border border-[hsl(var(--neon-gray))/0.3]'
        };
      case 'advanced':
        return {
          bg: 'bg-gradient-to-r from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))]',
          hover: 'hover:from-[hsl(var(--neon-purple))/0.9] hover:to-[hsl(var(--neon-pink))/0.9]',
          text: 'text-white',
          shadow: 'shadow-lg shadow-[hsl(var(--neon-purple))/0.3]',
          border: 'border border-[hsl(var(--neon-purple))/0.3]'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-purple))]',
          hover: 'hover:from-[hsl(var(--neon-pink))/0.9] hover:to-[hsl(var(--neon-purple))/0.9]',
          text: 'text-white',
          shadow: 'shadow-lg shadow-[hsl(var(--neon-pink))/0.3]',
          border: 'border border-[hsl(var(--neon-pink))/0.3]'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'calculate': return <Calculator className="w-5 h-5" />;
      case 'save': return <Save className="w-5 h-5" />;
      case 'share': return <Share2 className="w-5 h-5" />;
      case 'reset': return <Zap className="w-5 h-5" />;
      case 'advanced': return <Sparkles className="w-5 h-5" />;
      default: return <Calculator className="w-5 h-5" />;
    }
  };

  const getBadgeText = () => {
    if (isNew) return 'New';
    if (isPopular) return 'Popular';
    return '';
  };

  const getBadgeColor = () => {
    if (isNew) return 'bg-[hsl(var(--neon-yellow))/0.2] text-[hsl(var(--neon-yellow))] border-[hsl(var(--neon-yellow))/0.4]';
    if (isPopular) return 'bg-[hsl(var(--neon-cyan))/0.2] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan))/0.4]';
    return '';
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <Card className={`p-1 ${getButtonStyles().border} ${getButtonStyles().shadow} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95'}`}>
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
          w-full ${getButtonStyles().bg} ${getButtonStyles().hover} ${getButtonStyles().text} 
          ${getButtonStyles().shadow} transition-all duration-300 relative overflow-hidden
          ${isAnimating ? 'animate-pulse' : ''} ${sizeClasses[size]}
        `}
      >
        {/* Progress Bar */}
        {showProgress && (
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Content */}
        <div className={`flex items-center gap-3 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          {getIcon()}
          <div className="text-left">
            <span className="font-bold">{children}</span>
            {description && (
              <p className="text-xs opacity-80 mt-1">{description}</p>
            )}
          </div>
          {getBadgeText() && (
            <Badge className={`ml-auto ${getBadgeColor()}`}>
              {getBadgeText()}
            </Badge>
          )}
        </div>
      </Button>
    </Card>
  );
}

interface CTASectionProps {
  currentStep: number;
  showResults: boolean;
  onCalculate: () => void;
  onReset: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onAdvanced?: () => void;
  isLoading?: boolean;
}

export function CTASection({ 
  currentStep, 
  showResults, 
  onCalculate, 
  onReset, 
  onShare, 
  onSave, 
  onAdvanced, 
  isLoading = false 
}: CTASectionProps) {
  const [showAdvancedCTA, setShowAdvancedCTA] = useState(false);

  useEffect(() => {
    // Show advanced CTA after user has completed their first tune
    if (showResults) {
      const timer = setTimeout(() => setShowAdvancedCTA(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowAdvancedCTA(false);
    }
  }, [showResults]);

  if (showResults) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-base md:text-lg font-display font-bold mb-2">🎉 Perfect Tune Generated!</h3>
          <p className="text-sm text-muted-foreground">Your custom setup is ready to use</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Save Button */}
          <EnhancedCTA
            type="save"
            onClick={onSave || onCalculate}
            isNew={true}
            description="Keep this setup for future use"
          >
            Save This Tune
          </EnhancedCTA>

          {/* Share Button */}
          <EnhancedCTA
            type="share"
            onClick={onShare || onCalculate}
            isPopular={true}
            description="Share with the community"
          >
            Share Setup
          </EnhancedCTA>
        </div>

        {/* Advanced Features */}
        {showAdvancedCTA && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Want more control?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <EnhancedCTA
                type="advanced"
                onClick={onAdvanced || onCalculate}
                size="sm"
                description="Fine-tune every parameter"
              >
                Advanced Tuning
              </EnhancedCTA>
              
              <EnhancedCTA
                type="calculate"
                onClick={onCalculate}
                size="sm"
                description="Try different settings"
              >
                Recalculate
              </EnhancedCTA>
              
              <EnhancedCTA
                type="reset"
                onClick={onReset}
                size="sm"
                description="Start fresh"
              >
                New Car
              </EnhancedCTA>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main CTA */}
      <EnhancedCTA
        type="calculate"
        onClick={onCalculate}
        isLoading={isLoading}
        showProgress={isLoading}
        progress={isLoading ? 50 : 100}
        description={currentStep === 1 ? "Start your tuning journey" : currentStep === 2 ? "Generate your custom setup" : "Get your perfect tune"}
      >
        {isLoading ? "Calculating..." : "Generate My Tune"}
      </EnhancedCTA>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <EnhancedCTA
          type="reset"
          onClick={onReset}
          size="sm"
          description="Clear all settings"
        >
          Reset
        </EnhancedCTA>
        
        <EnhancedCTA
          type="advanced"
          onClick={onAdvanced || onCalculate}
          size="sm"
          isNew={currentStep >= 2}
          description="Unlock advanced features"
        >
          Advanced Mode
        </EnhancedCTA>
      </div>

      {/* Progress-based encouragement */}
      {currentStep === 1 && (
        <div className="text-center p-3 bg-[hsl(var(--neon-cyan))/0.1] border border-[hsl(var(--neon-cyan))/0.3] rounded-lg">
          <p className="text-sm text-muted-foreground">
            🚀 <strong>Ready to start?</strong> Complete your first tune to unlock all features!
          </p>
        </div>
      )}

      {currentStep === 2 && (
        <div className="text-center p-3 bg-[hsl(var(--neon-yellow))/0.1] border border-[hsl(var(--neon-yellow))/0.3] rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Almost there!</strong> Click "Generate My Tune" to see your custom setup!
          </p>
        </div>
      )}
    </div>
  );
}