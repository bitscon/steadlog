-- SteadLog Phase 1: Core logging, timeline primitives, reminders, and media attachments.
-- Barn-first requirements addressed via append-first action model + sync metadata + idempotent writes.

create extension if not exists pgcrypto;

create table if not exists public.homestead_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  category text not null check (category in ('animal', 'garden', 'task', 'note', 'photo')),
  action_type text not null,
  animal_id uuid null,
  garden_id uuid null,
  notes text null,
  action_timestamp timestamptz not null default now(),
  location text null,
  media_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  created_at_device timestamptz null,
  sync_state text not null default 'synced' check (sync_state in ('pending', 'synced', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  constraint homestead_actions_user_client_unique unique (user_id, client_id)
);

create index if not exists homestead_actions_user_time_idx
  on public.homestead_actions (user_id, action_timestamp desc);

create index if not exists homestead_actions_user_created_idx
  on public.homestead_actions (user_id, created_at desc);

create table if not exists public.homestead_action_media (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references public.homestead_actions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  public_url text null,
  mime_type text null,
  size_bytes integer null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint homestead_action_media_action_path_unique unique (action_id, storage_path)
);

create index if not exists homestead_action_media_user_idx
  on public.homestead_action_media (user_id, created_at desc);

create table if not exists public.praxis_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid null references public.homestead_actions(id) on delete set null,
  client_id uuid not null default gen_random_uuid(),
  title text not null,
  category text not null default 'task',
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'completed', 'dismissed')),
  notes text null,
  notified_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint praxis_reminders_user_client_unique unique (user_id, client_id)
);

create index if not exists praxis_reminders_user_due_idx
  on public.praxis_reminders (user_id, due_at asc);

create table if not exists public.praxis_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid null references public.homestead_actions(id) on delete set null,
  milestone_type text not null,
  title text not null,
  description text null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint praxis_milestones_user_type_unique unique (user_id, milestone_type)
);

create index if not exists praxis_milestones_user_achieved_idx
  on public.praxis_milestones (user_id, achieved_at desc);

create or replace function public.set_praxis_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_praxis_reminders_updated_at on public.praxis_reminders;
create trigger set_praxis_reminders_updated_at
before update on public.praxis_reminders
for each row
execute function public.set_praxis_updated_at_timestamp();

create or replace function public.create_praxis_category_milestone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  milestone_key text;
  milestone_title text;
begin
  milestone_key := 'first_' || new.category || '_action';
  milestone_title := 'First ' || initcap(new.category) || ' Log';

  insert into public.praxis_milestones (
    user_id,
    action_id,
    milestone_type,
    title,
    description,
    achieved_at
  )
  values (
    new.user_id,
    new.id,
    milestone_key,
    milestone_title,
    'First logged ' || new.category || ' action recorded in SteadLog.',
    new.action_timestamp
  )
  on conflict (user_id, milestone_type) do nothing;

  return new;
end;
$$;

drop trigger if exists create_category_milestone_on_action on public.homestead_actions;
create trigger create_category_milestone_on_action
after insert on public.homestead_actions
for each row
execute function public.create_praxis_category_milestone();

alter table public.homestead_actions enable row level security;
alter table public.homestead_action_media enable row level security;
alter table public.praxis_reminders enable row level security;
alter table public.praxis_milestones enable row level security;

drop policy if exists "Users can view own homestead actions" on public.homestead_actions;
create policy "Users can view own homestead actions"
on public.homestead_actions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own homestead actions" on public.homestead_actions;
create policy "Users can insert own homestead actions"
on public.homestead_actions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own homestead actions" on public.homestead_actions;
create policy "Users can update own homestead actions"
on public.homestead_actions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own homestead actions" on public.homestead_actions;
create policy "Users can delete own homestead actions"
on public.homestead_actions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own action media" on public.homestead_action_media;
create policy "Users can view own action media"
on public.homestead_action_media
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own action media" on public.homestead_action_media;
create policy "Users can insert own action media"
on public.homestead_action_media
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own action media" on public.homestead_action_media;
create policy "Users can delete own action media"
on public.homestead_action_media
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own reminders" on public.praxis_reminders;
create policy "Users can view own reminders"
on public.praxis_reminders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own reminders" on public.praxis_reminders;
create policy "Users can insert own reminders"
on public.praxis_reminders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own reminders" on public.praxis_reminders;
create policy "Users can update own reminders"
on public.praxis_reminders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own reminders" on public.praxis_reminders;
create policy "Users can delete own reminders"
on public.praxis_reminders
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own milestones" on public.praxis_milestones;
create policy "Users can view own milestones"
on public.praxis_milestones
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own milestones" on public.praxis_milestones;
create policy "Users can insert own milestones"
on public.praxis_milestones
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own milestones" on public.praxis_milestones;
create policy "Users can update own milestones"
on public.praxis_milestones
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own milestones" on public.praxis_milestones;
create policy "Users can delete own milestones"
on public.praxis_milestones
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homestead-action-media',
  'homestead-action-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Users can upload own homestead action media" on storage.objects;
create policy "Users can upload own homestead action media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'homestead-action-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own homestead action media" on storage.objects;
create policy "Users can update own homestead action media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'homestead-action-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'homestead-action-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own homestead action media" on storage.objects;
create policy "Users can delete own homestead action media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'homestead-action-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
