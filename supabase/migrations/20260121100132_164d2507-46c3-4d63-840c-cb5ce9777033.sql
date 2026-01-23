-- Add community tracking columns to saved_tunes
ALTER TABLE public.saved_tunes 
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downloads_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Create tune_likes table for voting system
CREATE TABLE public.tune_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tune_id UUID NOT NULL REFERENCES public.saved_tunes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tune_id, user_id)
);

-- Enable RLS on tune_likes
ALTER TABLE public.tune_likes ENABLE ROW LEVEL SECURITY;

-- Users can view all likes (for counting)
CREATE POLICY "Anyone can view likes"
  ON public.tune_likes
  FOR SELECT
  USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can like tunes"
  ON public.tune_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can unlike tunes"
  ON public.tune_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create tune_downloads table for tracking popularity
CREATE TABLE public.tune_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tune_id UUID NOT NULL REFERENCES public.saved_tunes(id) ON DELETE CASCADE,
  user_id UUID,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on tune_downloads
ALTER TABLE public.tune_downloads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert downloads (even guests via null user_id)
CREATE POLICY "Anyone can record downloads"
  ON public.tune_downloads
  FOR INSERT
  WITH CHECK (true);

-- Tune owners can view their download stats
CREATE POLICY "Tune owners can view downloads"
  ON public.tune_downloads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_tunes 
      WHERE saved_tunes.id = tune_downloads.tune_id 
      AND saved_tunes.user_id = auth.uid()
    )
  );

-- Function to update likes_count on saved_tunes
CREATE OR REPLACE FUNCTION public.update_tune_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.saved_tunes 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.tune_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.saved_tunes 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.tune_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to auto-update likes count
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.tune_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tune_likes_count();

-- Function to update downloads_count on saved_tunes
CREATE OR REPLACE FUNCTION public.update_tune_downloads_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.saved_tunes 
  SET downloads_count = downloads_count + 1 
  WHERE id = NEW.tune_id;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update downloads count
CREATE TRIGGER update_downloads_count_trigger
  AFTER INSERT ON public.tune_downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tune_downloads_count();