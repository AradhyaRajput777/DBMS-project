-- Create enum for event categories
CREATE TYPE event_category AS ENUM ('cultural', 'technical', 'sports');

-- Create enum for event status
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'participant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category event_category NOT NULL,
  status event_status DEFAULT 'upcoming',
  venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  coordinator_id UUID REFERENCES public.profiles(id),
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Coordinators can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = coordinator_id);

CREATE POLICY "Coordinators can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = coordinator_id);

CREATE POLICY "Coordinators can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = coordinator_id);

-- Create participants table for event registrations
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create policies for participants
CREATE POLICY "Anyone can view participants"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Users can register for events"
  ON public.participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
  ON public.participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own registrations"
  ON public.participants FOR DELETE
  USING (auth.uid() = user_id);

-- Create results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  position INTEGER,
  score TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);

-- Enable RLS on results
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create policies for results
CREATE POLICY "Anyone can view results"
  ON public.results FOR SELECT
  USING (true);

CREATE POLICY "Coordinators can add results"
  ON public.results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
      AND events.coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can update results"
  ON public.results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
      AND events.coordinator_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();