-- Create scan_history table for user scan records
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_url TEXT NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'safe')),
  trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
  scan_details JSONB DEFAULT '{}'::jsonb,
  scan_type TEXT NOT NULL DEFAULT 'url' CHECK (scan_type IN ('url', 'email', 'file')),
  is_threat BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_reports table for threat intelligence sharing
CREATE TABLE public.community_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by_email TEXT NOT NULL,
  reported_url TEXT NOT NULL,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('phishing', 'malware', 'scam', 'fraud', 'suspicious')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  notes TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_profiles table for additional user data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  total_scans INTEGER NOT NULL DEFAULT 0,
  threats_blocked INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scan_history
CREATE POLICY "Users can view their own scan history" 
ON public.scan_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan history" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scan history" 
ON public.scan_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scan history" 
ON public.scan_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for community_reports
CREATE POLICY "Anyone can view verified community reports" 
ON public.community_reports 
FOR SELECT 
USING (verified = true);

CREATE POLICY "Authenticated users can insert community reports" 
ON public.community_reports 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_scan_history_updated_at
  BEFORE UPDATE ON public.scan_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_reports_updated_at
  BEFORE UPDATE ON public.community_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for tables
ALTER TABLE public.scan_history REPLICA IDENTITY FULL;
ALTER TABLE public.community_reports REPLICA IDENTITY FULL;
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;