-- Create Studio Agent data models (without vector extension for now)

-- Jobs table for tracking user requests
CREATE TABLE public.studio_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_prompt TEXT NOT NULL,
  context_pack JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table for individual work items
CREATE TABLE public.studio_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.studio_jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  batch_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  plan JSONB DEFAULT '{}',
  target_files TEXT[] DEFAULT '{}',
  diffs JSONB DEFAULT '{}',
  acceptance_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Artifacts table for generated outputs
CREATE TABLE public.studio_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.studio_jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Repository index for semantic search (without vector column for now)
CREATE TABLE public.repo_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  language TEXT,
  symbols JSONB DEFAULT '{}',
  content_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, file_path)
);

-- Enable RLS on all tables
ALTER TABLE public.studio_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repo_index ENABLE ROW LEVEL SECURITY;

-- RLS policies for studio_jobs
CREATE POLICY "Users can view their own studio jobs"
ON public.studio_jobs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own studio jobs"
ON public.studio_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own studio jobs"
ON public.studio_jobs
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for studio_tasks
CREATE POLICY "Users can view tasks for their jobs"
ON public.studio_tasks
FOR SELECT
USING (job_id IN (SELECT id FROM public.studio_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can create tasks for their jobs"
ON public.studio_tasks
FOR INSERT
WITH CHECK (job_id IN (SELECT id FROM public.studio_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can update tasks for their jobs"
ON public.studio_tasks
FOR UPDATE
USING (job_id IN (SELECT id FROM public.studio_jobs WHERE user_id = auth.uid()));

-- RLS policies for studio_artifacts
CREATE POLICY "Users can view artifacts for their jobs"
ON public.studio_artifacts
FOR SELECT
USING (job_id IN (SELECT id FROM public.studio_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can create artifacts for their jobs"
ON public.studio_artifacts
FOR INSERT
WITH CHECK (job_id IN (SELECT id FROM public.studio_jobs WHERE user_id = auth.uid()));

-- RLS policies for repo_index
CREATE POLICY "Users can view their project indices"
ON public.repo_index
FOR SELECT
USING (project_id IN (SELECT id FROM public.ai_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create indices for their projects"
ON public.repo_index
FOR INSERT
WITH CHECK (project_id IN (SELECT id FROM public.ai_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update indices for their projects"
ON public.repo_index
FOR UPDATE
USING (project_id IN (SELECT id FROM public.ai_projects WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_studio_jobs_updated_at
BEFORE UPDATE ON public.studio_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studio_tasks_updated_at
BEFORE UPDATE ON public.studio_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_studio_jobs_project_id ON public.studio_jobs(project_id);
CREATE INDEX idx_studio_jobs_user_id ON public.studio_jobs(user_id);
CREATE INDEX idx_studio_jobs_status ON public.studio_jobs(status);
CREATE INDEX idx_studio_tasks_job_id ON public.studio_tasks(job_id);
CREATE INDEX idx_studio_tasks_batch_number ON public.studio_tasks(batch_number);
CREATE INDEX idx_studio_artifacts_job_id ON public.studio_artifacts(job_id);
CREATE INDEX idx_repo_index_project_id ON public.repo_index(project_id);
CREATE INDEX idx_repo_index_file_path ON public.repo_index(file_path);