-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create game_sessions table
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL DEFAULT 'MusicArena #1',
  max_teams INTEGER DEFAULT 30,
  websocket_port INTEGER DEFAULT 3000,
  is_live BOOLEAN DEFAULT FALSE,
  current_round_id UUID,
  current_question_id UUID,
  timer_active BOOLEAN DEFAULT FALSE,
  time_remaining INTEGER DEFAULT 0,
  buzzer_locked BOOLEAN DEFAULT FALSE,
  buzzer_winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  connected BOOLEAN DEFAULT FALSE,
  color TEXT NOT NULL,
  jokers_remaining INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rounds table
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buzzer', 'qcm', 'text')),
  text TEXT NOT NULL,
  choices JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 100,
  duration INTEGER DEFAULT 30,
  audio_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_correct BOOLEAN
);

-- Create jokers table for tracking joker usage
CREATE TABLE public.joker_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  joker_type TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joker_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this local game system)
CREATE POLICY "Allow all access to game_sessions" ON public.game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rounds" ON public.rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to answers" ON public.answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to joker_usage" ON public.joker_usage FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for game_sessions
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();