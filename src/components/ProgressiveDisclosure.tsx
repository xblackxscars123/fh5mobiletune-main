import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Settings, Eye, EyeOff } from 'lucide-react';

interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export function ProgressiveDisclosure({ 
  title, 
  children, 
  defaultOpen = false, 
  icon, 
  description 
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <Card className={`transition-all duration-300 ${
      isOpen 
        ? 'border-[hsl(var(--neon-cyan))/0.5] bg-[hsl(var(--neon-cyan))/0.05]' 
        : 'border-border hover:border-[hsl(var(--neon-cyan))/0.3]'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isOpen ? 'bg-[hsl(var(--neon-cyan))/0.2] text-[hsl(var(--neon-cyan))]' : 'bg-muted text-muted-foreground'
              }`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-display font-bold text-sm">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2"
          >
            {isOpen ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show
              </>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-2 pb-4">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface SmartDisclosureProps {
  children: React.ReactNode;
  triggerCondition: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onShow?: () => void;
}

export function SmartDisclosure({ 
  children, 
  triggerCondition, 
  title, 
  description,
  icon,
  onShow 
}: SmartDisclosureProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (triggerCondition && !isVisible) {
      setIsVisible(true);
      onShow?.();
    }
  }, [triggerCondition, isVisible, onShow]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500">
      <Card className="border-[hsl(var(--neon-pink))/0.5] bg-[hsl(var(--neon-pink))/0.05]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--neon-pink))/0.2] text-[hsl(var(--neon-pink))] flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="font-display font-bold text-sm text-[hsl(var(--neon-pink))]">{title}</h3>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
}

interface ContextualHelpProps {
  title: string;
  content: string;
  isVisible: boolean;
  type?: 'info' | 'warning' | 'success' | 'tip';
}

export function ContextualHelp({ title, content, isVisible, type = 'info' }: ContextualHelpProps) {
  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-[hsl(var(--neon-yellow))/0.1]',
          border: 'border-[hsl(var(--neon-yellow))/0.3]',
          text: 'text-[hsl(var(--neon-yellow))]',
          icon: '⚠️'
        };
      case 'success':
        return {
          bg: 'bg-[hsl(var(--neon-cyan))/0.1]',
          border: 'border-[hsl(var(--neon-cyan))/0.3]',
          text: 'text-[hsl(var(--neon-cyan))]',
          icon: '✅'
        };
      case 'tip':
        return {
          bg: 'bg-[hsl(var(--neon-purple))/0.1]',
          border: 'border-[hsl(var(--neon-purple))/0.3]',
          text: 'text-[hsl(var(--neon-purple))]',
          icon: '💡'
        };
      default:
        return {
          bg: 'bg-[hsl(var(--neon-pink))/0.1]',
          border: 'border-[hsl(var(--neon-pink))/0.3]',
          text: 'text-[hsl(var(--neon-pink))]',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-4 rounded-lg border animate-in slide-in-from-top-2 duration-300 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{styles.icon}</span>
        <div className="flex-1">
          <h4 className={`font-semibold mb-1 ${styles.text}`}>{title}</h4>
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </div>
    </div>
  );
}