-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL CHECK (series IN ('Adultos A', 'Adultos B', 'Senior', 'Super Senior')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.teams(id),
  away_team_id UUID REFERENCES public.teams(id),
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  series TEXT NOT NULL CHECK (series IN ('Adultos A', 'Adultos B', 'Senior', 'Super Senior')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'finished', 'cancelled')),
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create standings table
CREATE TABLE public.standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id),
  series TEXT NOT NULL CHECK (series IN ('Adultos A', 'Adultos B', 'Senior', 'Super Senior')),
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suspended players table
CREATE TABLE public.suspended_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL CHECK (series IN ('Adultos A', 'Adultos B', 'Senior', 'Super Senior')),
  remaining_matches INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  series TEXT NOT NULL CHECK (series IN ('Adultos A', 'Adultos B', 'Senior', 'Super Senior')),
  match_date TEXT NOT NULL, -- "Fecha 1", "Fecha 2", etc.
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club info table
CREATE TABLE public.club_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE, -- 'history', 'achievements', 'mission', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspended_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Teams are publicly viewable" 
ON public.teams FOR SELECT USING (true);

CREATE POLICY "Matches are publicly viewable" 
ON public.matches FOR SELECT USING (true);

CREATE POLICY "Standings are publicly viewable" 
ON public.standings FOR SELECT USING (true);

CREATE POLICY "Suspended players are publicly viewable" 
ON public.suspended_players FOR SELECT USING (true);

CREATE POLICY "Gallery is publicly viewable" 
ON public.gallery FOR SELECT USING (true);

CREATE POLICY "Club info is publicly viewable" 
ON public.club_info FOR SELECT USING (true);

-- Create policies for API updates (we'll use a service role key for Google Sheets integration)
CREATE POLICY "API can update teams" 
ON public.teams FOR ALL USING (true);

CREATE POLICY "API can update matches" 
ON public.matches FOR ALL USING (true);

CREATE POLICY "API can update standings" 
ON public.standings FOR ALL USING (true);

CREATE POLICY "API can update suspended players" 
ON public.suspended_players FOR ALL USING (true);

CREATE POLICY "API can update gallery" 
ON public.gallery FOR ALL USING (true);

CREATE POLICY "API can update club info" 
ON public.club_info FOR ALL USING (true);

-- Insert initial data
INSERT INTO public.teams (name, series) VALUES 
('Equipo A', 'Adultos A'),
('Equipo B', 'Adultos B'),
('Equipo Senior', 'Senior'),
('Equipo Super Senior', 'Super Senior');

-- Insert sample club info
INSERT INTO public.club_info (section, title, content) VALUES 
('history', 'Historia del Club', 'Nuestro club fue fundado con la pasión por el fútbol y el espíritu de competencia. A lo largo de los años, hemos crecido hasta convertirnos en una institución respetada en el fútbol local.'),
('achievements', 'Palmarés', 'Campeones Liga Local 2020, 2021, 2023. Subcampeones Copa Regional 2019, 2022.'),
('mission', 'Misión y Visión', 'Promover el deporte del fútbol en todas las edades, fomentando los valores de respeto, trabajo en equipo y fair play.');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_standings_updated_at
BEFORE UPDATE ON public.standings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suspended_players_updated_at
BEFORE UPDATE ON public.suspended_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_info_updated_at
BEFORE UPDATE ON public.club_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();