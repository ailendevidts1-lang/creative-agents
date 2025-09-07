-- Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'executing', 'live', 'paused')),
  daily_revenue DECIMAL(10,2) DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  roi DECIMAL(5,2) DEFAULT 0,
  progress INTEGER DEFAULT 0,
  channels TEXT[] DEFAULT '{}',
  next_tasks TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_ideas table
CREATE TABLE public.business_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  expected_roi DECIMAL(5,2),
  ramp_time TEXT,
  market TEXT,
  difficulty TEXT CHECK (difficulty IN ('low', 'medium', 'high')),
  investment DECIMAL(10,2),
  analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_plans table
CREATE TABLE public.business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  idea_id UUID REFERENCES public.business_ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  niche TEXT,
  budget DECIMAL(10,2),
  timeline TEXT,
  channels TEXT[] DEFAULT '{}',
  milestones TEXT[] DEFAULT '{}',
  okrs JSONB DEFAULT '{}',
  ready BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_tasks table
CREATE TABLE public.business_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_at TIMESTAMPTZ,
  assignee TEXT DEFAULT 'ai',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_assets table
CREATE TABLE public.business_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  uri TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_analytics table
CREATE TABLE public.business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  value DECIMAL(12,4),
  period DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for businesses
CREATE POLICY "Users can view their own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for business_ideas
CREATE POLICY "Users can view their own business ideas" ON public.business_ideas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own business ideas" ON public.business_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business ideas" ON public.business_ideas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business ideas" ON public.business_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for business_plans
CREATE POLICY "Users can view their own business plans" ON public.business_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own business plans" ON public.business_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business plans" ON public.business_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business plans" ON public.business_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for business_tasks
CREATE POLICY "Users can view tasks for their businesses" ON public.business_tasks
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create tasks for their businesses" ON public.business_tasks
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update tasks for their businesses" ON public.business_tasks
  FOR UPDATE USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Create RLS policies for business_assets
CREATE POLICY "Users can view assets for their businesses" ON public.business_assets
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create assets for their businesses" ON public.business_assets
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Create RLS policies for business_analytics
CREATE POLICY "Users can view analytics for their businesses" ON public.business_analytics
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create analytics for their businesses" ON public.business_analytics
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Create update triggers
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plans_updated_at
  BEFORE UPDATE ON public.business_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_tasks_updated_at
  BEFORE UPDATE ON public.business_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();