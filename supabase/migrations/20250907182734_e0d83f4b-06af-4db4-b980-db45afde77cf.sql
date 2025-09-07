-- Add missing columns to business tables for better compatibility
ALTER TABLE public.business_ideas 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generated';

ALTER TABLE public.business_plans 
ADD COLUMN IF NOT EXISTS business_idea_id UUID REFERENCES public.business_ideas(id),
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}';

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Create sample data for testing
DO $$ 
DECLARE 
    sample_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Default test user ID
BEGIN
    -- Insert sample business ideas if none exist
    INSERT INTO public.business_ideas (user_id, title, description, expected_roi, ramp_time, market, difficulty, investment, industry, status)
    SELECT sample_user_id, 'AI Recipe Optimizer', 'Mobile app that optimizes recipes based on dietary restrictions and available ingredients', 450, '2-3 months', 'Health & Nutrition', 'medium', 2500, 'Technology', 'generated'
    WHERE NOT EXISTS (SELECT 1 FROM public.business_ideas);

    INSERT INTO public.business_ideas (user_id, title, description, expected_roi, ramp_time, market, difficulty, investment, industry, status)
    SELECT sample_user_id, 'Local Business Social Media Automation', 'Automated social media posting and engagement for small businesses', 320, '6-8 weeks', 'SMB Services', 'low', 1200, 'Marketing', 'generated'
    WHERE (SELECT COUNT(*) FROM public.business_ideas) < 2;

    INSERT INTO public.business_ideas (user_id, title, description, expected_roi, ramp_time, market, difficulty, investment, industry, status)
    SELECT sample_user_id, 'Niche Newsletter Empire', 'Curated newsletters for specific professional niches with premium subscriptions', 280, '4-6 months', 'Information Products', 'high', 800, 'Media', 'generated'
    WHERE (SELECT COUNT(*) FROM public.business_ideas) < 3;

    -- Insert sample business if none exist
    INSERT INTO public.businesses (user_id, name, description, type, status, daily_revenue, total_revenue, roi, progress, channels, next_tasks, industry)
    SELECT sample_user_id, 'Tech Myths Shorts', 'Viral TikTok/YouTube Shorts debunking tech myths', 'Content Business', 'live', 127.50, 3825, 340, 78, ARRAY['TikTok', 'YouTube', 'Instagram'], ARRAY['Upload tomorrow''s video', 'Reply to 5 comments', 'Check analytics'], 'Media'
    WHERE NOT EXISTS (SELECT 1 FROM public.businesses);
END $$;