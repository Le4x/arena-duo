-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('host', 'player');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Only hosts can assign roles
CREATE POLICY "Hosts can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'host'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create helper function to check if user is host
CREATE OR REPLACE FUNCTION public.is_host(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'host')
$$;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all access to game_sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Allow all access to teams" ON public.teams;
DROP POLICY IF EXISTS "Allow all access to rounds" ON public.rounds;
DROP POLICY IF EXISTS "Allow all access to questions" ON public.questions;
DROP POLICY IF EXISTS "Allow all access to answers" ON public.answers;
DROP POLICY IF EXISTS "Allow all access to joker_usage" ON public.joker_usage;

-- Add user_id to teams table to track ownership
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- GAME_SESSIONS policies
CREATE POLICY "Anyone can view game sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only hosts can insert game sessions"
ON public.game_sessions
FOR INSERT
TO authenticated
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can update game sessions"
ON public.game_sessions
FOR UPDATE
TO authenticated
USING (public.is_host(auth.uid()))
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can delete game sessions"
ON public.game_sessions
FOR DELETE
TO authenticated
USING (public.is_host(auth.uid()));

-- TEAMS policies
CREATE POLICY "Anyone can view teams"
ON public.teams
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create teams for themselves"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_host(auth.uid()))
WITH CHECK (auth.uid() = user_id OR public.is_host(auth.uid()));

CREATE POLICY "Hosts can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (public.is_host(auth.uid()));

-- ROUNDS policies
CREATE POLICY "Anyone can view rounds"
ON public.rounds
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only hosts can insert rounds"
ON public.rounds
FOR INSERT
TO authenticated
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can update rounds"
ON public.rounds
FOR UPDATE
TO authenticated
USING (public.is_host(auth.uid()))
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can delete rounds"
ON public.rounds
FOR DELETE
TO authenticated
USING (public.is_host(auth.uid()));

-- QUESTIONS policies - hide correct_answer from players
CREATE POLICY "Hosts can view all question data"
ON public.questions
FOR SELECT
TO authenticated
USING (public.is_host(auth.uid()));

CREATE POLICY "Players can view questions without answers"
ON public.questions
FOR SELECT
TO authenticated
USING (NOT public.is_host(auth.uid()));

CREATE POLICY "Only hosts can insert questions"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can update questions"
ON public.questions
FOR UPDATE
TO authenticated
USING (public.is_host(auth.uid()))
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can delete questions"
ON public.questions
FOR DELETE
TO authenticated
USING (public.is_host(auth.uid()));

-- ANSWERS policies
CREATE POLICY "Users can view their own team answers"
ON public.answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = answers.team_id AND teams.user_id = auth.uid()
  ) OR public.is_host(auth.uid())
);

CREATE POLICY "Users can submit answers for their team"
ON public.answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_id AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Only hosts can update answers"
ON public.answers
FOR UPDATE
TO authenticated
USING (public.is_host(auth.uid()))
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can delete answers"
ON public.answers
FOR DELETE
TO authenticated
USING (public.is_host(auth.uid()));

-- JOKER_USAGE policies
CREATE POLICY "Users can view their own joker usage"
ON public.joker_usage
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = joker_usage.team_id AND teams.user_id = auth.uid()
  ) OR public.is_host(auth.uid())
);

CREATE POLICY "Users can use jokers for their team"
ON public.joker_usage
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_id AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Only hosts can update joker usage"
ON public.joker_usage
FOR UPDATE
TO authenticated
USING (public.is_host(auth.uid()))
WITH CHECK (public.is_host(auth.uid()));

CREATE POLICY "Only hosts can delete joker usage"
ON public.joker_usage
FOR DELETE
TO authenticated
USING (public.is_host(auth.uid()));