-- Create a table to store generated projects and their metadata
CREATE TABLE IF NOT EXISTS public.ai_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    project_type TEXT NOT NULL,
    requirements JSONB NOT NULL,
    tech_stack JSONB NOT NULL,
    design_system JSONB,
    architecture JSONB NOT NULL,
    timeline JSONB NOT NULL,
    deployment_targets TEXT[] NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_projects
CREATE POLICY "Users can view their own projects" 
ON public.ai_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.ai_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.ai_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.ai_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_projects_updated_at
    BEFORE UPDATE ON public.ai_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();