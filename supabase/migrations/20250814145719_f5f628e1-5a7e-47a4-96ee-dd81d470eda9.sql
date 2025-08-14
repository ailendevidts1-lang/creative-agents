-- Create secrets table for API key management
CREATE TABLE public.secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Create policies for secrets access
CREATE POLICY "Users can view their own secrets" 
ON public.secrets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own secrets" 
ON public.secrets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secrets" 
ON public.secrets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secrets" 
ON public.secrets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;