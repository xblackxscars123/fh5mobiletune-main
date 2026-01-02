import { useState } from 'react';
import { SavedTune, useSavedTunes } from '@/hooks/useSavedTunes';
import { CarSpecs, TuneType, tuneTypeDescriptions } from '@/lib/tuningCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface SavedTunesManagerProps {
  carName: string;
  tuneType: TuneType;
  specs: CarSpecs;
  onLoad: (tune: SavedTune) => void;
}

export function SavedTunesManager({ carName, tuneType, specs, onLoad }: SavedTunesManagerProps) {
  const { savedTunes, saveTune, deleteTune } = useSavedTunes();
  const [tuneName, setTuneName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    if (!tuneName.trim()) {
      toast.error('Please enter a tune name');
      return;
    }
    saveTune(tuneName, carName, tuneType, specs);
    setTuneName('');
    toast.success(`Saved "${tuneName}"`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteTune(id);
    toast.success(`Deleted "${name}"`);
  };

  return (
    <div className="bg-[hsl(220,18%,8%)] border border-[hsl(220,15%,20%)] rounded">
      {/* Save Section */}
      <div className="p-3 border-b border-[hsl(220,15%,20%)]">
        <div className="flex gap-2">
          <Input
            placeholder="Tune name..."
            value={tuneName}
            onChange={(e) => setTuneName(e.target.value)}
            className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,25%)] text-foreground text-sm h-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-[hsl(var(--racing-green))] hover:bg-[hsl(145,80%,35%)] text-white h-9 px-4"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Saved Tunes List */}
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[hsl(220,15%,12%)]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm text-muted-foreground">
          Saved Tunes ({savedTunes.length})
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && savedTunes.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          {savedTunes.map((tune) => (
            <div
              key={tune.id}
              className="flex items-center justify-between px-3 py-2 border-t border-[hsl(220,15%,18%)] hover:bg-[hsl(220,15%,12%)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{tune.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {tune.carName} • {tuneTypeDescriptions[tune.tuneType].title}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-[hsl(var(--racing-cyan))/20] hover:text-[hsl(var(--racing-cyan))]"
                  onClick={() => {
                    onLoad(tune);
                    toast.success(`Loaded "${tune.name}"`);
                  }}
                >
                  <Upload className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => handleDelete(tune.id, tune.name)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && savedTunes.length === 0 && (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground border-t border-[hsl(220,15%,18%)]">
          No saved tunes yet
        </div>
      )}
    </div>
  );
}
