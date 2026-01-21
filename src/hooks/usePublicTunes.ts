import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TuneType, CarSpecs, TuneSettings } from '@/lib/tuningCalculator';
import { useAuth } from '@/hooks/useAuth';

export interface PublicTune {
  id: string;
  name: string;
  carName: string;
  tuneType: TuneType;
  specs: CarSpecs;
  tuneSettings: TuneSettings;
  description?: string;
  likesCount: number;
  downloadsCount: number;
  featured: boolean;
  createdAt: string;
  creatorId: string;
  creatorName?: string;
  isLikedByUser?: boolean;
}

export type SortOption = 'popular' | 'newest' | 'downloads' | 'likes';

interface UsePublicTunesOptions {
  sortBy?: SortOption;
  carFilter?: string;
  tuneTypeFilter?: TuneType | 'all';
  limit?: number;
}

export function usePublicTunes(options: UsePublicTunesOptions = {}) {
  const { sortBy = 'popular', carFilter, tuneTypeFilter = 'all', limit = 20 } = options;
  const { user } = useAuth();
  const [tunes, setTunes] = useState<PublicTune[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchTunes = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('saved_tunes')
        .select(`
          id,
          name,
          car_name,
          tune_type,
          specs,
          tune_settings,
          description,
          likes_count,
          downloads_count,
          featured,
          created_at,
          user_id
        `)
        .eq('is_public', true)
        .range(pageNum * limit, (pageNum + 1) * limit - 1);

      // Apply filters
      if (carFilter) {
        query = query.ilike('car_name', `%${carFilter}%`);
      }
      if (tuneTypeFilter && tuneTypeFilter !== 'all') {
        query = query.eq('tune_type', tuneTypeFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('likes_count', { ascending: false }).order('downloads_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'downloads':
          query = query.order('downloads_count', { ascending: false });
          break;
        case 'likes':
          query = query.order('likes_count', { ascending: false });
          break;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Get user's likes if logged in
      let userLikes: Set<string> = new Set();
      if (user && data && data.length > 0) {
        const { data: likesData } = await supabase
          .from('tune_likes')
          .select('tune_id')
          .eq('user_id', user.id)
          .in('tune_id', data.map(t => t.id));
        
        if (likesData) {
          userLikes = new Set(likesData.map(l => l.tune_id));
        }
      }

      // Get creator names
      const userIds = [...new Set((data || []).map(t => t.user_id))];
      let creatorNames: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        
        if (profilesData) {
          creatorNames = Object.fromEntries(
            profilesData.map(p => [p.user_id, p.display_name || 'Anonymous'])
          );
        }
      }

      const formattedTunes: PublicTune[] = (data || []).map(tune => ({
        id: tune.id,
        name: tune.name,
        carName: tune.car_name,
        tuneType: tune.tune_type as TuneType,
        specs: tune.specs as unknown as CarSpecs,
        tuneSettings: tune.tune_settings as unknown as TuneSettings,
        description: tune.description || undefined,
        likesCount: tune.likes_count,
        downloadsCount: tune.downloads_count,
        featured: tune.featured,
        createdAt: tune.created_at,
        creatorId: tune.user_id,
        creatorName: creatorNames[tune.user_id] || 'Anonymous',
        isLikedByUser: userLikes.has(tune.id)
      }));

      if (append) {
        setTunes(prev => [...prev, ...formattedTunes]);
      } else {
        setTunes(formattedTunes);
      }

      setHasMore(formattedTunes.length === limit);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching public tunes:', err);
      setError('Failed to load community tunes');
    } finally {
      setLoading(false);
    }
  }, [sortBy, carFilter, tuneTypeFilter, limit, user]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchTunes(page + 1, true);
    }
  }, [loading, hasMore, page, fetchTunes]);

  const refresh = useCallback(() => {
    fetchTunes(0, false);
  }, [fetchTunes]);

  useEffect(() => {
    fetchTunes(0, false);
  }, [fetchTunes]);

  return { tunes, loading, error, hasMore, loadMore, refresh };
}

export function useTuneLike() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleLike = async (tuneId: string, isCurrentlyLiked: boolean): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      if (isCurrentlyLiked) {
        // Unlike
        const { error } = await supabase
          .from('tune_likes')
          .delete()
          .eq('tune_id', tuneId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return false; // Now unliked
      } else {
        // Like
        const { error } = await supabase
          .from('tune_likes')
          .insert({ tune_id: tuneId, user_id: user.id });
        
        if (error) throw error;
        return true; // Now liked
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      return isCurrentlyLiked; // Return original state on error
    } finally {
      setLoading(false);
    }
  };

  return { toggleLike, loading, isAuthenticated: !!user };
}

export function useTuneDownload() {
  const { user } = useAuth();

  const recordDownload = async (tuneId: string) => {
    try {
      await supabase
        .from('tune_downloads')
        .insert({ 
          tune_id: tuneId, 
          user_id: user?.id || null 
        });
    } catch (err) {
      console.error('Error recording download:', err);
    }
  };

  return { recordDownload };
}
