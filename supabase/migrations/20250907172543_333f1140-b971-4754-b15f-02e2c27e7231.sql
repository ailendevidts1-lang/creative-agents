-- Create generated_skills table for storing dynamically created skills
CREATE TABLE public.generated_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  component_name TEXT NOT NULL,
  component_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for generated_skills
CREATE POLICY "Users can view their own generated skills" 
ON public.generated_skills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated skills" 
ON public.generated_skills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated skills" 
ON public.generated_skills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated skills" 
ON public.generated_skills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_skills_updated_at
BEFORE UPDATE ON public.generated_skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();