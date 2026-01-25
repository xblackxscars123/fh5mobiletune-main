import { useState, useEffect } from 'react';
import { Check, Car, Settings, Calculator, Zap } from 'lucide-react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

interface WorkflowIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export function WorkflowIndicator({ currentStep, totalSteps, onStepClick }: WorkflowIndicatorProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Select Car',
      description: 'Choose your vehicle or enter custom specs',
      icon: <Car className="w-5 h-5" />,
      status: currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : 'pending'
    },
    {
      id: 2,
      title: 'Configure Specs',
      description: 'Enter weight, power, and tuning preferences',
      icon: <Settings className="w-5 h-5" />,
      status: currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : 'pending'
    },
    {
      id: 3,
      title: 'Get Tune',
      description: 'Generate your custom setup',
      icon: <Calculator className="w-5 h-5" />,
      status: currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : 'pending'
    }
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))/0.2]';
      case 'active': return 'text-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink))/0.2] border-2 border-[hsl(var(--neon-pink))/0.5]';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getProgressColor = (index: number) => {
    if (index < currentStep - 1) return 'bg-[hsl(var(--neon-cyan))]';
    if (index === currentStep - 1) return 'bg-[hsl(var(--neon-pink))]';
    return 'bg-border';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 bg-border rounded-full h-2 mx-4">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(0)}`}
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg ${
              step.status === 'active' 
                ? 'border-[hsl(var(--neon-pink))/0.5] bg-[hsl(var(--neon-pink))/0.05]' 
                : step.status === 'completed'
                ? 'border-[hsl(var(--neon-cyan))/0.5] bg-[hsl(var(--neon-cyan))/0.05]'
                : 'border-border hover:border-muted/50'
            }`}
            onClick={() => onStepClick && onStepClick(step.id)}
          >
            {/* Step Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${getStepColor(step.status)}`}>
                {step.status === 'completed' ? (
                  <Check className="w-6 h-6 text-[hsl(var(--neon-cyan))]" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Step {step.id}</div>
                <div className={`text-sm font-medium ${step.status === 'active' ? 'text-[hsl(var(--neon-pink))]' : step.status === 'completed' ? 'text-[hsl(var(--neon-cyan))]' : 'text-muted-foreground'}`}>
                  {step.status === 'completed' ? 'Completed' : step.status === 'active' ? 'Current' : 'Next'}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-2">
              <h3 className={`text-lg font-display font-bold ${
                step.status === 'active' ? 'text-[hsl(var(--neon-pink))]' : 
                step.status === 'completed' ? 'text-[hsl(var(--neon-cyan))]' : 'text-foreground'
              }`}>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Action Hint */}
            {step.status === 'active' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--neon-pink))] font-medium">
                <Zap className="w-3 h-3" />
                <span>Ready to continue</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contextual Guidance */}
      <div className="mt-8 text-center">
        {currentStep === 1 && (
          <div className="inline-flex items-center gap-3 bg-[hsl(var(--neon-cyan))/0.1] border border-[hsl(var(--neon-cyan))/0.3] rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-[hsl(var(--neon-cyan))] rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Start by selecting your car or entering basic specs</span>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="inline-flex items-center gap-3 bg-[hsl(var(--neon-pink))/0.1] border border-[hsl(var(--neon-pink))/0.3] rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-[hsl(var(--neon-pink))] rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Configure your car's specifications for optimal results</span>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="inline-flex items-center gap-3 bg-[hsl(var(--neon-yellow))/0.1] border border-[hsl(var(--neon-yellow))/0.3] rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-[hsl(var(--neon-yellow))] rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Your custom tune is being generated...</span>
          </div>
        )}
      </div>
    </div>
  );
}