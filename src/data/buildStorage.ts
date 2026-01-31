// Local storage system for saving and loading tune builds
import { TuneSettings, TuneType, DriveType } from '@/lib/tuningCalculator';

export interface SavedBuild {
  id: string;
  name: string;
  carName?: string;
  carId?: string;
  tuneType: TuneType;
  driveType: DriveType;
  tune: TuneSettings;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

export interface BuildStorageData {
  builds: SavedBuild[];
  lastSaved?: string;
}

const STORAGE_KEY = 'fh5-saved-builds';
const MAX_BUILDS = 50; // Limit storage to prevent bloat

export class BuildStorage {
  static getBuilds(): SavedBuild[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed: BuildStorageData = JSON.parse(data);
      return parsed.builds || [];
    } catch (error) {
      console.error('Failed to load builds from storage:', error);
      return [];
    }
  }

  static saveBuild(
    name: string,
    tune: TuneSettings,
    tuneType: TuneType,
    driveType: DriveType,
    carName?: string,
    carId?: string,
    notes?: string,
    tags?: string[]
  ): SavedBuild {
    try {
      const builds = this.getBuilds();
      const now = new Date().toISOString();
      
      const newBuild: SavedBuild = {
        id: this.generateId(),
        name: name.trim(),
        carName,
        carId,
        tuneType,
        driveType,
        tune: { ...tune }, // Deep copy to prevent mutations
        createdAt: now,
        updatedAt: now,
        notes,
        tags
      };

      // Add to builds array
      builds.unshift(newBuild);

      // Limit storage size
      if (builds.length > MAX_BUILDS) {
        builds.splice(MAX_BUILDS);
      }

      // Save to storage
      const storageData: BuildStorageData = {
        builds,
        lastSaved: now
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return newBuild;
    } catch (error) {
      console.error('Failed to save build:', error);
      throw new Error('Failed to save build to storage');
    }
  }

  static updateBuild(buildId: string, updates: Partial<SavedBuild>): SavedBuild | null {
    try {
      const builds = this.getBuilds();
      const buildIndex = builds.findIndex(b => b.id === buildId);
      
      if (buildIndex === -1) {
        throw new Error('Build not found');
      }

      const updatedBuild = {
        ...builds[buildIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      builds[buildIndex] = updatedBuild;

      const storageData: BuildStorageData = {
        builds,
        lastSaved: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return updatedBuild;
    } catch (error) {
      console.error('Failed to update build:', error);
      throw new Error('Failed to update build');
    }
  }

  static deleteBuild(buildId: string): boolean {
    try {
      const builds = this.getBuilds();
      const filteredBuilds = builds.filter(b => b.id !== buildId);
      
      if (filteredBuilds.length === builds.length) {
        return false; // Build not found
      }

      const storageData: BuildStorageData = {
        builds: filteredBuilds,
        lastSaved: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error('Failed to delete build:', error);
      return false;
    }
  }

  static duplicateBuild(buildId: string, newName?: string): SavedBuild | null {
    try {
      const builds = this.getBuilds();
      const originalBuild = builds.find(b => b.id === buildId);
      
      if (!originalBuild) {
        throw new Error('Build not found');
      }

      return this.saveBuild(
        newName || `${originalBuild.name} (Copy)`,
        originalBuild.tune,
        originalBuild.tuneType,
        originalBuild.driveType,
        originalBuild.carName,
        originalBuild.carId,
        originalBuild.notes,
        originalBuild.tags
      );
    } catch (error) {
      console.error('Failed to duplicate build:', error);
      return null;
    }
  }

  static exportBuild(buildId: string): string | null {
    try {
      const builds = this.getBuilds();
      const build = builds.find(b => b.id === buildId);
      
      if (!build) {
        return null;
      }

      // Create exportable JSON
      const exportData = {
        version: '1.0',
        build: {
          ...build,
          exportedAt: new Date().toISOString()
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export build:', error);
      return null;
    }
  }

  static importBuild(jsonString: string): SavedBuild | null {
    try {
      const importData = JSON.parse(jsonString);
      
      if (!importData.version || !importData.build) {
        throw new Error('Invalid build format');
      }

      const build = importData.build as SavedBuild;
      
      // Generate new ID and timestamps for imported build
      const now = new Date().toISOString();
      const importedBuild: SavedBuild = {
        ...build,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now,
        name: `${build.name} (Imported)`
      };

      // Save the imported build
      return this.saveBuild(
        importedBuild.name,
        importedBuild.tune,
        importedBuild.tuneType,
        importedBuild.driveType,
        importedBuild.carName,
        importedBuild.carId,
        importedBuild.notes,
        importedBuild.tags
      );
    } catch (error) {
      console.error('Failed to import build:', error);
      throw new Error('Invalid build file format');
    }
  }

  static searchBuilds(query: string): SavedBuild[] {
    const builds = this.getBuilds();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return builds;

    return builds.filter(build => 
      build.name.toLowerCase().includes(searchTerm) ||
      build.carName?.toLowerCase().includes(searchTerm) ||
      build.notes?.toLowerCase().includes(searchTerm) ||
      build.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  static getBuildsByCar(carId: string): SavedBuild[] {
    const builds = this.getBuilds();
    return builds.filter(build => build.carId === carId);
  }

  static getBuildsByType(tuneType: TuneType): SavedBuild[] {
    const builds = this.getBuilds();
    return builds.filter(build => build.tuneType === tuneType);
  }

  static getStorageStats(): { totalBuilds: number; totalSize: string; lastSaved?: string } {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const builds = this.getBuilds();
      
      const totalSize = data ? `${(data.length / 1024).toFixed(2)} KB` : '0 KB';
      const lastSaved = builds.length > 0 ? builds[0].updatedAt : undefined;

      return {
        totalBuilds: builds.length,
        totalSize,
        lastSaved
      };
    } catch (error) {
      return { totalBuilds: 0, totalSize: '0 KB' };
    }
  }

  static clearAllBuilds(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear builds:', error);
      return false;
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Utility functions for build management
export function formatBuildDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function validateBuildName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) {
    return { valid: false, error: 'Build name is required' };
  }
  
  if (name.trim().length > 50) {
    return { valid: false, error: 'Build name must be 50 characters or less' };
  }

  const builds = BuildStorage.getBuilds();
  const existingBuild = builds.find(b => b.name.toLowerCase() === name.trim().toLowerCase());
  
  if (existingBuild) {
    return { valid: false, error: 'A build with this name already exists' };
  }

  return { valid: true };
}
