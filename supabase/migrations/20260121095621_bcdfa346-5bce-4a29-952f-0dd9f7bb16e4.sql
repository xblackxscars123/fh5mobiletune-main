-- Fix: Restrict profile visibility to owner-only access
-- This prevents any authenticated user from browsing all user profiles

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);