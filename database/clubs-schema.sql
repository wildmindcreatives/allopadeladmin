-- Create clubs table (with location field for city/country)
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clubs_updated_at
    BEFORE UPDATE ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all clubs" ON public.clubs
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can insert clubs" ON public.clubs
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update clubs" ON public.clubs
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Users can delete clubs" ON public.clubs
    FOR DELETE TO authenticated
    USING (true);

-- Grant permissions
GRANT ALL ON public.clubs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;