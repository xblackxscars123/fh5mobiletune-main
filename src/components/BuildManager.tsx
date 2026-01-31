import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TuneSettings, TuneType, DriveType, tuneTypeDescriptions } from '@/lib/tuningCalculator';
import { 
  BuildStorage, 
  SavedBuild, 
  formatBuildDate, 
  validateBuildName 
} from '@/data/buildStorage';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Search,
  Plus,
  Edit2,
  Check,
  X,
  Star,
  Clock,
  Car,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BuildManagerProps {
  tune: TuneSettings;
  tuneType: TuneType;
  driveType: DriveType;
  carName?: string;
  carId?: string;
  onLoadBuild?: (build: SavedBuild) => void;
  onTuneUpdate?: (tune: TuneSettings) => void;
}

export function BuildManager({ 
  tune, 
  tuneType, 
  driveType, 
  carName, 
  carId, 
  onLoadBuild,
  onTuneUpdate 
}: BuildManagerProps) {
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TuneType>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [editingBuild, setEditingBuild] = useState<SavedBuild | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBuilds();
  }, []);

  const loadBuilds = () => {
    const builds = BuildStorage.getBuilds();
    setSavedBuilds(builds);
  };

  const filteredBuilds = savedBuilds.filter(build => {
    const matchesSearch = !searchQuery || 
      build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.carName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || build.tuneType === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleSaveBuild = async () => {
    const validation = validateBuildName(saveName);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsLoading(true);
      const tags = saveTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const savedBuild = BuildStorage.saveBuild(
        saveName,
        tune,
        tuneType,
        driveType,
        carName,
        carId,
        saveNotes,
        tags
      );

      toast.success(`Build "${saveName}" saved successfully!`);
      setShowSaveDialog(false);
      setSaveName('');
      setSaveNotes('');
      setSaveTags('');
      loadBuilds();
    } catch (error) {
      toast.error('Failed to save build');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadBuild = (build: SavedBuild) => {
    if (onLoadBuild) {
      onLoadBuild(build);
    } else if (onTuneUpdate) {
      onTuneUpdate(build.tune);
    }
    setShowLoadDialog(false);
    toast.success(`Loaded build: ${build.name}`);
  };

  const handleDeleteBuild = async (buildId: string, buildName: string) => {
    if (!confirm(`Are you sure you want to delete "${buildName}"?`)) {
      return;
    }

    try {
      const success = BuildStorage.deleteBuild(buildId);
      if (success) {
        toast.success(`Build "${buildName}" deleted`);
        loadBuilds();
      } else {
        toast.error('Failed to delete build');
      }
    } catch (error) {
      toast.error('Failed to delete build');
    }
  };

  const handleDuplicateBuild = async (build: SavedBuild) => {
    try {
      const duplicated = BuildStorage.duplicateBuild(build.id);
      if (duplicated) {
        toast.success(`Build duplicated as "${duplicated.name}"`);
        loadBuilds();
      } else {
        toast.error('Failed to duplicate build');
      }
    } catch (error) {
      toast.error('Failed to duplicate build');
    }
  };

  const handleExportBuild = (build: SavedBuild) => {
    try {
      const exportData = BuildStorage.exportBuild(build.id);
      if (exportData) {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${build.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Build "${build.name}" exported`);
      }
    } catch (error) {
      toast.error('Failed to export build');
    }
  };

  const handleImportBuild = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = BuildStorage.importBuild(content);
        if (imported) {
          toast.success(`Build "${imported.name}" imported successfully`);
          loadBuilds();
        } else {
          toast.error('Failed to import build');
        }
      } catch (error) {
        toast.error('Invalid build file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const getTuneTypeIcon = (type: TuneType) => {
    const info = tuneTypeDescriptions[type];
    return info.icon;
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Build
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save Current Build</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Build Name</label>
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter build name..."
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="Add notes about this build..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="e.g., racing, drift, street..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveBuild} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Saving...' : 'Save Build'}
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Load Build ({savedBuilds.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load Saved Build</DialogTitle>
            </DialogHeader>
            
            {/* Search and Filters */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search builds..."
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.keys(tuneTypeDescriptions).map(type => (
                    <SelectItem key={type} value={type}>
                      {tuneTypeDescriptions[type as TuneType].title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Build List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredBuilds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {savedBuilds.length === 0 ? 'No saved builds yet' : 'No builds match your search'}
                </div>
              ) : (
                filteredBuilds.map((build) => (
                  <Card key={build.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTuneTypeIcon(build.tuneType)}</span>
                          <h4 className="font-medium">{build.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {tuneTypeDescriptions[build.tuneType].title}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {build.carName && (
                            <div className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {build.carName}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatBuildDate(build.updatedAt)}
                          </div>
                        </div>

                        {build.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {build.notes}
                          </p>
                        )}

                        {build.tags && build.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {build.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadBuild(build)}
                        >
                          <FolderOpen className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateBuild(build)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportBuild(build)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBuild(build.id, build.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImportBuild}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Storage Stats */}
      <Card className="p-3 bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {savedBuilds.length} builds saved
            </span>
            <span className="text-muted-foreground">
              {BuildStorage.getStorageStats().totalSize}
            </span>
          </div>
          {savedBuilds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all saved builds? This cannot be undone.')) {
                  BuildStorage.clearAllBuilds();
                  setSavedBuilds([]);
                  toast.success('All builds cleared');
                }
              }}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
