-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create saved_tunes table with versioning support
CREATE TABLE public.saved_tunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  car_name TEXT NOT NULL,
  tune_type TEXT NOT NULL,
  specs JSONB NOT NULL,
  tune_settings JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  parent_tune_id UUID REFERENCES public.saved_tunes(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on saved_tunes
ALTER TABLE public.saved_tunes ENABLE ROW LEVEL SECURITY;

-- Saved tunes policies
CREATE POLICY "Users can view own tunes" ON public.saved_tunes FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own tunes" ON public.saved_tunes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tunes" ON public.saved_tunes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tunes" ON public.saved_tunes FOR DELETE USING (auth.uid() = user_id);

-- Create tune_history table for version tracking
CREATE TABLE public.tune_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tune_id UUID REFERENCES public.saved_tunes(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  specs JSONB NOT NULL,
  tune_settings JSONB NOT NULL,
  change_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on tune_history
ALTER TABLE public.tune_history ENABLE ROW LEVEL SECURITY;

-- Tune history policies (users can view history of their own tunes)
CREATE POLICY "Users can view own tune history" ON public.tune_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.saved_tunes WHERE saved_tunes.id = tune_history.tune_id AND saved_tunes.user_id = auth.uid()));
CREATE POLICY "Users can insert own tune history" ON public.tune_history FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.saved_tunes WHERE saved_tunes.id = tune_history.tune_id AND saved_tunes.user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_saved_tunes_user_id ON public.saved_tunes(user_id);
CREATE INDEX idx_saved_tunes_is_public ON public.saved_tunes(is_public) WHERE is_public = true;
CREATE INDEX idx_tune_history_tune_id ON public.tune_history(tune_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_tunes_updated_at
  BEFORE UPDATE ON public.saved_tunes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();