-- Ensure clean policy creation
drop policy if exists "select_own_subscription" on public.subscribers;
drop policy if exists "update_own_subscription" on public.subscribers;
drop policy if exists "insert_subscription" on public.subscribers;

-- Create subscribers table (if not exists) and policies
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  stripe_customer_id text,
  subscribed boolean not null default false,
  subscription_tier text,
  subscription_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

create policy "select_own_subscription" on public.subscribers
for select
using (auth.uid() = user_id or email = auth.email());

create policy "update_own_subscription" on public.subscribers
for update
using (auth.uid() = user_id or email = auth.email());

create policy "insert_subscription" on public.subscribers
for insert
with check (true);

-- Timestamp trigger to keep updated_at fresh
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_subscribers_updated_at
before update on public.subscribers
for each row execute function public.update_updated_at_column();