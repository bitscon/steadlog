-- SteadLog Phase 2: quick log presets for one-tap common actions.

create table if not exists public.log_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('animal', 'garden', 'task', 'note', 'photo')),
  icon text not null default 'sparkles',
  created_at timestamptz not null default now(),
  constraint log_presets_user_title_unique unique (user_id, title)
);

create index if not exists log_presets_user_created_idx
  on public.log_presets (user_id, created_at desc);

alter table public.log_presets enable row level security;

drop policy if exists "Users can view own log presets" on public.log_presets;
create policy "Users can view own log presets"
on public.log_presets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own log presets" on public.log_presets;
create policy "Users can insert own log presets"
on public.log_presets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own log presets" on public.log_presets;
create policy "Users can update own log presets"
on public.log_presets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own log presets" on public.log_presets;
create policy "Users can delete own log presets"
on public.log_presets
for delete
to authenticated
using (auth.uid() = user_id);
