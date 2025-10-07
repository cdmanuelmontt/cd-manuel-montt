-- Fix profiles table RLS policies to prevent email harvesting
-- Drop existing SELECT policies that may be misconfigured
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new PERMISSIVE SELECT policies with proper access control
-- Policy 1: Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles table with RLS enabled. Users can only view their own profile, admins can view all profiles. Email addresses are protected from harvesting.';