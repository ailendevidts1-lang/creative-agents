-- Create agent sessions table for tracking conversations and state
CREATE TABLE public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL DEFAULT 'manual',
  persona TEXT NOT NULL DEFAULT 'default',
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_pipeline_id UUID,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Create agent plans table for DAG storage
CREATE TABLE public.agent_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES agent_sessions(id),
  user_id UUID NOT NULL,
  goal TEXT NOT NULL,
  constraints JSONB NOT NULL DEFAULT '{}'::jsonb,
  success_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  dag_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent executions table for tracking tool executions
CREATE TABLE public.agent_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES agent_plans(id),
  step_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  dry_run BOOLEAN NOT NULL DEFAULT true,
  needs_approval BOOLEAN NOT NULL DEFAULT false,
  approval_id UUID,
  artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create agent memories table for RAG
CREATE TABLE public.agent_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  namespace TEXT NOT NULL DEFAULT 'general',
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent artifacts table for file storage
CREATE TABLE public.agent_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID REFERENCES agent_executions(id),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sha TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pipelines table for business workflows
CREATE TABLE public.agent_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  dag JSONB NOT NULL DEFAULT '[]'::jsonb,
  kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  schedule JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pipeline runs table for execution tracking
CREATE TABLE public.pipeline_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES agent_pipelines(id),
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'running',
  result JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create approvals table enhancement for agent approvals
CREATE TABLE IF NOT EXISTS public.agent_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES agent_executions(id),
  user_id UUID NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  requires_2fa BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_sessions
CREATE POLICY "Users can manage their own sessions" ON public.agent_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for agent_plans  
CREATE POLICY "Users can manage their own plans" ON public.agent_plans
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for agent_executions
CREATE POLICY "Users can manage their own executions" ON public.agent_executions
  FOR ALL USING (plan_id IN (SELECT id FROM agent_plans WHERE user_id = auth.uid()));

-- Create RLS policies for agent_memories
CREATE POLICY "Users can manage their own memories" ON public.agent_memories
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for agent_artifacts
CREATE POLICY "Users can manage their own artifacts" ON public.agent_artifacts
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for agent_pipelines
CREATE POLICY "Users can manage their own pipelines" ON public.agent_pipelines
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for pipeline_runs
CREATE POLICY "Users can manage their own pipeline runs" ON public.pipeline_runs
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for agent_approvals
CREATE POLICY "Users can manage their own approvals" ON public.agent_approvals
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX agent_sessions_user_id_idx ON public.agent_sessions(user_id);
CREATE INDEX agent_sessions_session_id_idx ON public.agent_sessions(session_id);
CREATE INDEX agent_plans_session_id_idx ON public.agent_plans(session_id);
CREATE INDEX agent_executions_plan_id_idx ON public.agent_executions(plan_id);
CREATE INDEX agent_memories_user_id_idx ON public.agent_memories(user_id);
CREATE INDEX agent_memories_namespace_idx ON public.agent_memories(namespace);
CREATE INDEX agent_artifacts_execution_id_idx ON public.agent_artifacts(execution_id);
CREATE INDEX agent_pipelines_user_id_idx ON public.agent_pipelines(user_id);
CREATE INDEX pipeline_runs_pipeline_id_idx ON public.pipeline_runs(pipeline_id);
CREATE INDEX agent_approvals_execution_id_idx ON public.agent_approvals(execution_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_agent_sessions_updated_at
  BEFORE UPDATE ON public.agent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_plans_updated_at
  BEFORE UPDATE ON public.agent_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_memories_updated_at
  BEFORE UPDATE ON public.agent_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_pipelines_updated_at
  BEFORE UPDATE ON public.agent_pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();