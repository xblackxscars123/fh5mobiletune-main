import { useState, useEffect } from 'react';
import { CarSpecs, TuneType, TuneSettings, calculateTune } from '@/lib/tuningCalculator';

export interface SavedTune {
  id: string;
  name: string;
  carName: string;
  tuneType: TuneType;
  specs: CarSpecs;
  tune: TuneSettings;
  createdAt: number;
}

const STORAGE_KEY = 'fh5-saved-tunes';

export function useSavedTunes() {
  const [savedTunes, setSavedTunes] = useState<SavedTune[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedTunes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved tunes:', e);
      }
    }
  }, []);

  const saveTune = (name: string, carName: string, tuneType: TuneType, specs: CarSpecs) => {
    const newTune: SavedTune = {
      id: crypto.randomUUID(),
      name,
      carName,
      tuneType,
      specs,
      tune: calculateTune(specs, tuneType),
      createdAt: Date.now(),
    };

    const updated = [newTune, ...savedTunes];
    setSavedTunes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTune;
  };

  const deleteTune = (id: string) => {
    const updated = savedTunes.filter(t => t.id !== id);
    setSavedTunes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const loadTune = (id: string): SavedTune | undefined => {
    return savedTunes.find(t => t.id === id);
  };

  return { savedTunes, saveTune, deleteTune, loadTune };
}
