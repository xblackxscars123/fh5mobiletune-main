import { useState, useEffect, useCallback } from 'react';
import { TuneSettings, TuneType, CarSpecs, calculateTune } from '@/lib/tuningCalculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { safeJsonParse, validateTuneName, validateCarSpecs } from '@/lib/security';

export interface SavedTune {
  id: string;
  name: string;
  carName: string;
  tuneType: TuneType;
  specs: CarSpecs;
  tune: TuneSettings;
  createdAt: string | number;
  isPublic?: boolean;
  tags?: string[];
  notes?: string;
  version?: number;
}

const LOCAL_STORAGE_KEY = 'fh5-saved-tunes';

// Helper to convert DB format to local format
function dbToLocal(dbTune: {
  id: string;
  name: string;
  car_name: string;
  tune_type: string;
  specs: Json;
  tune_settings: Json;
  created_at: string;
  is_public: boolean;
  tags: string[] | null;
  notes: string | null;
  version: number;
}): SavedTune {
  return {
    id: dbTune.id,
    name: dbTune.name,
    carName: dbTune.car_name,
    tuneType: dbTune.tune_type as TuneType,
    specs: dbTune.specs as unknown as CarSpecs,
    tune: dbTune.tune_settings as unknown as TuneSettings,
    createdAt: dbTune.created_at,
    isPublic: dbTune.is_public,
    tags: dbTune.tags ?? undefined,
    notes: dbTune.notes ?? undefined,
    version: dbTune.version,
  };
}

export function useSavedTunes() {
  const { user } = useAuth();
  const [savedTunes, setSavedTunes] = useState<SavedTune[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tunes from localStorage (for guests) or Supabase (for authenticated)
  const loadTunes = useCallback(async () => {
    setLoading(true);
    
    if (user) {
      // Load from Supabase
      const { data, error } = await supabase
        .from('saved_tunes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading tunes:', error);
        toast.error('Failed to load saved tunes');
      } else if (data) {
        setSavedTunes(data.map(dbToLocal));
      }
    } else {
      // Load from localStorage
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = safeJsonParse(stored, []);
        if (Array.isArray(parsed)) {
          setSavedTunes(parsed);
        } else {
          setSavedTunes([]);
        }
      }
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTunes();
  }, [loadTunes]);

  // Save tunes to localStorage when guest
  const saveToLocalStorage = useCallback((updatedTunes: SavedTune[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTunes));
  }, []);

  const saveTune = useCallback(async (
    name: string,
    carName: string,
    tuneType: TuneType,
    specs: CarSpecs,
    tuneOverride?: TuneSettings
  ): Promise<SavedTune | null> => {
    // Validate and sanitize inputs
    const sanitizedName = validateTuneName(name);
    const sanitizedCarName = validateTuneName(carName);
    const validatedSpecs = validateCarSpecs(specs) as unknown as CarSpecs;
    
    const tune = tuneOverride || calculateTune(validatedSpecs, tuneType);
    
    const newTune: SavedTune = {
      id: crypto.randomUUID(),
      name: sanitizedName,
      carName: sanitizedCarName,
      tuneType,
      specs: validatedSpecs,
      tune,
      createdAt: new Date().toISOString(),
      isPublic: false,
      version: 1,
    };

    if (user) {
      // Save to Supabase
      const { data, error } = await supabase
        .from('saved_tunes')
        .insert({
          name,
          car_name: carName,
          tune_type: tuneType,
          specs: specs as unknown as Json,
          tune_settings: tune as unknown as Json,
          user_id: user.id,
          is_public: false,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving tune:', error);
        toast.error('Failed to save tune');
        return null;
      }
      
      if (data) {
        const savedTune = dbToLocal(data);
        setSavedTunes(prev => [savedTune, ...prev]);
        toast.success(`Saved "${name}"`);
        return savedTune;
      }
    } else {
      // Save to localStorage
      const updatedTunes = [newTune, ...savedTunes];
      setSavedTunes(updatedTunes);
      saveToLocalStorage(updatedTunes);
      toast.success(`Saved "${name}" (sign in to sync)`);
      return newTune;
    }
    
    return null;
  }, [user, savedTunes, saveToLocalStorage]);

  const updateTune = useCallback(async (
    id: string,
    updates: Partial<Pick<SavedTune, 'name' | 'tune' | 'specs' | 'notes' | 'tags' | 'isPublic'>>
  ): Promise<boolean> => {
    if (user) {
      const { error } = await supabase
        .from('saved_tunes')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.tune && { tune_settings: updates.tune as unknown as Json }),
          ...(updates.specs && { specs: updates.specs as unknown as Json }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          ...(updates.tags && { tags: updates.tags }),
          ...(updates.isPublic !== undefined && { is_public: updates.isPublic }),
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating tune:', error);
        toast.error('Failed to update tune');
        return false;
      }
      
      setSavedTunes(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ));
      toast.success('Tune updated');
      return true;
    } else {
      // Update in localStorage
      const updatedTunes = savedTunes.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
      setSavedTunes(updatedTunes);
      saveToLocalStorage(updatedTunes);
      toast.success('Tune updated');
      return true;
    }
  }, [user, savedTunes, saveToLocalStorage]);

  const deleteTune = useCallback(async (id: string): Promise<boolean> => {
    if (user) {
      const { error } = await supabase
        .from('saved_tunes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting tune:', error);
        toast.error('Failed to delete tune');
        return false;
      }
      
      setSavedTunes(prev => prev.filter(t => t.id !== id));
      toast.success('Tune deleted');
      return true;
    } else {
      const updatedTunes = savedTunes.filter(t => t.id !== id);
      setSavedTunes(updatedTunes);
      saveToLocalStorage(updatedTunes);
      toast.success('Tune deleted');
      return true;
    }
  }, [user, savedTunes, saveToLocalStorage]);

  const loadTune = useCallback((id: string): SavedTune | undefined => {
    return savedTunes.find(t => t.id === id);
  }, [savedTunes]);

  // Sync local tunes to cloud when user signs in
  const syncLocalTunesToCloud = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    
    const localStored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localStored) return 0;
    
    let localTunes: SavedTune[] = [];
    try {
      localTunes = JSON.parse(localStored);
    } catch {
      return 0;
    }
    
    if (localTunes.length === 0) return 0;
    
    const { error } = await supabase
      .from('saved_tunes')
      .insert(
        localTunes.map(t => ({
          name: t.name,
          car_name: t.carName,
          tune_type: t.tuneType,
          specs: t.specs as unknown as Json,
          tune_settings: t.tune as unknown as Json,
          user_id: user.id,
          is_public: false,
        }))
      );
    
    if (error) {
      console.error('Error syncing tunes:', error);
      toast.error('Failed to sync local tunes');
      return 0;
    }
    
    // Clear local storage after successful sync
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.success(`Synced ${localTunes.length} tunes to cloud`);
    
    // Reload from cloud
    loadTunes();
    
    return localTunes.length;
  }, [user, loadTunes]);

  return {
    savedTunes,
    loading,
    saveTune,
    updateTune,
    deleteTune,
    loadTune,
    syncLocalTunesToCloud,
    refresh: loadTunes,
  };
}
