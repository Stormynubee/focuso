-- Create couple_connections table for partner linking
CREATE TABLE public.couple_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create partner_status table for real-time status sharing
CREATE TABLE public.partner_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('studying', 'break', 'distracted', 'offline')),
  pomodoro_active BOOLEAN NOT NULL DEFAULT false,
  pomodoro_time_left INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create todos table for cute todolist
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  emoji TEXT DEFAULT '📝',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.couple_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- RLS policies for couple_connections
CREATE POLICY "Users can view own connection" ON public.couple_connections
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert own connection" ON public.couple_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connection" ON public.couple_connections
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can delete own connection" ON public.couple_connections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for partner_status
CREATE POLICY "Users can view partner status" ON public.partner_status
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.couple_connections 
      WHERE (user_id = auth.uid() AND partner_id = public.partner_status.user_id)
         OR (partner_id = auth.uid() AND user_id = public.partner_status.user_id)
    )
  );

CREATE POLICY "Users can insert own status" ON public.partner_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status" ON public.partner_status
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for todos
CREATE POLICY "Users can view own todos" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for partner_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_status;

-- Create triggers for updated_at
CREATE TRIGGER update_couple_connections_updated_at
  BEFORE UPDATE ON public.couple_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_status_updated_at
  BEFORE UPDATE ON public.partner_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();