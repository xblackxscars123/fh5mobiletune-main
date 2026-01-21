import { useState } from 'react';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PublishTuneToggleProps {
  tuneId: string;
  isPublic: boolean;
  onToggle?: (isPublic: boolean) => void;
}

export function PublishTuneToggle({ tuneId, isPublic: initialIsPublic, onToggle }: PublishTuneToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('saved_tunes')
        .update({ is_public: checked })
        .eq('id', tuneId);

      if (error) throw error;

      setIsPublic(checked);
      onToggle?.(checked);
      
      toast.success(checked 
        ? 'Tune is now visible to the community!' 
        : 'Tune is now private'
      );
    } catch (err) {
      console.error('Error updating tune visibility:', err);
      toast.error('Failed to update tune visibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
      <div className="flex items-center gap-3">
        {isPublic ? (
          <Globe className="w-4 h-4 text-neon-cyan" />
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground" />
        )}
        <div>
          <Label htmlFor={`publish-${tuneId}`} className="text-sm font-medium cursor-pointer">
            {isPublic ? 'Shared with Community' : 'Private Tune'}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isPublic ? 'Others can find and try your tune' : 'Only you can see this tune'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <Switch
          id={`publish-${tuneId}`}
          checked={isPublic}
          onCheckedChange={handleToggle}
          disabled={loading}
        />
      </div>
    </div>
  );
}
