-- SteadLog stabilization: align tracked migrations with actively used application tables.
-- Purpose: bring repository migration history in sync with runtime schema expectations.

create extension if not exists pgcrypto;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- Profiles
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text null,
  last_name text null,
  display_name text null,
  location text null,
  website_url text null,
  bio text null,
  avatar_url text null,
  role text null default 'user',
  subscription_status text null,
  plan_type text null,
  subscription_expires_at timestamptz null,
  trial_start_date timestamptz null,
  trial_end_date timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Properties
-- =====================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text null,
  size_acres numeric(12,2) null,
  location text null,
  climate_zone text null,
  soil_type text null,
  soil_ph numeric(4,2) null,
  sun_exposure text null,
  water_sources text[] null,
  property_type text null,
  purchase_date date null,
  purchase_price numeric(12,2) null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties
  add column if not exists description text null,
  add column if not exists climate_zone text null,
  add column if not exists soil_type text null,
  add column if not exists soil_ph numeric(4,2) null,
  add column if not exists sun_exposure text null,
  add column if not exists water_sources text[] null,
  add column if not exists property_type text null,
  add column if not exists purchase_date date null,
  add column if not exists purchase_price numeric(12,2) null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_properties_user_id on public.properties(user_id);

alter table public.properties enable row level security;

drop policy if exists "Users can view own properties" on public.properties;
create policy "Users can view own properties"
on public.properties
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own properties" on public.properties;
create policy "Users can insert own properties"
on public.properties
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own properties" on public.properties;
create policy "Users can update own properties"
on public.properties
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own properties" on public.properties;
create policy "Users can delete own properties"
on public.properties
for delete
using (auth.uid() = user_id);

drop trigger if exists update_properties_updated_at on public.properties;
create trigger update_properties_updated_at
before update on public.properties
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Animals
-- =====================================================
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid null references public.properties(id) on delete set null,
  name text not null,
  type text not null,
  breed text null,
  birth_date date null,
  weight_lbs numeric(10,2) null,
  gender text null,
  breeding_status text null,
  notes text null,
  photo_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.animals
  add column if not exists property_id uuid null,
  add column if not exists photo_url text null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_animals_user_id on public.animals(user_id);
create index if not exists idx_animals_property_id on public.animals(property_id);

alter table public.animals enable row level security;

drop policy if exists "Users can view own animals" on public.animals;
create policy "Users can view own animals"
on public.animals
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own animals" on public.animals;
create policy "Users can insert own animals"
on public.animals
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own animals" on public.animals;
create policy "Users can update own animals"
on public.animals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own animals" on public.animals;
create policy "Users can delete own animals"
on public.animals
for delete
using (auth.uid() = user_id);

drop trigger if exists update_animals_updated_at on public.animals;
create trigger update_animals_updated_at
before update on public.animals
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Tasks
-- =====================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text null,
  category text null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_date date null,
  assigned_to uuid null,
  property_id uuid null references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists category text null,
  add column if not exists priority text not null default 'medium',
  add column if not exists assigned_to uuid null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_property_id on public.tasks(property_id);

alter table public.tasks enable row level security;

drop policy if exists "Users can view own tasks" on public.tasks;
create policy "Users can view own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);

drop trigger if exists update_tasks_updated_at on public.tasks;
create trigger update_tasks_updated_at
before update on public.tasks
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Inventory
-- =====================================================
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  current_stock numeric(12,2) not null default 0,
  reorder_point numeric(12,2) not null default 0,
  quantity numeric(12,2) not null default 0,
  minimum_quantity numeric(12,2) not null default 0,
  unit text not null,
  location text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_items
  add column if not exists current_stock numeric(12,2) not null default 0,
  add column if not exists reorder_point numeric(12,2) not null default 0,
  add column if not exists quantity numeric(12,2) not null default 0,
  add column if not exists minimum_quantity numeric(12,2) not null default 0,
  add column if not exists location text null,
  add column if not exists notes text null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_inventory_items_user_id on public.inventory_items(user_id);

alter table public.inventory_items enable row level security;

drop policy if exists "Users can view own inventory items" on public.inventory_items;
create policy "Users can view own inventory items"
on public.inventory_items
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own inventory items" on public.inventory_items;
create policy "Users can insert own inventory items"
on public.inventory_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own inventory items" on public.inventory_items;
create policy "Users can update own inventory items"
on public.inventory_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own inventory items" on public.inventory_items;
create policy "Users can delete own inventory items"
on public.inventory_items
for delete
using (auth.uid() = user_id);

drop trigger if exists update_inventory_items_updated_at on public.inventory_items;
create trigger update_inventory_items_updated_at
before update on public.inventory_items
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Journal
-- =====================================================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  date date null,
  entry_date date null,
  mood text null,
  weather text null,
  tags text[] null,
  image_urls text[] null,
  property_id uuid null references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_entries
  add column if not exists date date null,
  add column if not exists entry_date date null,
  add column if not exists mood text null,
  add column if not exists weather text null,
  add column if not exists image_urls text[] null,
  add column if not exists property_id uuid null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_journal_entries_user_id on public.journal_entries(user_id);

alter table public.journal_entries enable row level security;

drop policy if exists "Users can view own journal entries" on public.journal_entries;
create policy "Users can view own journal entries"
on public.journal_entries
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own journal entries" on public.journal_entries;
create policy "Users can insert own journal entries"
on public.journal_entries
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own journal entries" on public.journal_entries;
create policy "Users can update own journal entries"
on public.journal_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own journal entries" on public.journal_entries;
create policy "Users can delete own journal entries"
on public.journal_entries
for delete
using (auth.uid() = user_id);

drop trigger if exists update_journal_entries_updated_at on public.journal_entries;
create trigger update_journal_entries_updated_at
before update on public.journal_entries
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Finance
-- =====================================================
create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text null,
  color text null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_financial_categories_user_name on public.financial_categories(user_id, name);

alter table public.financial_categories enable row level security;

drop policy if exists "Users can view own financial categories" on public.financial_categories;
create policy "Users can view own financial categories"
on public.financial_categories
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own financial categories" on public.financial_categories;
create policy "Users can insert own financial categories"
on public.financial_categories
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own financial categories" on public.financial_categories;
create policy "Users can update own financial categories"
on public.financial_categories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own financial categories" on public.financial_categories;
create policy "Users can delete own financial categories"
on public.financial_categories
for delete
using (auth.uid() = user_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  type text not null check (type in ('income', 'expense')),
  category_id uuid not null references public.financial_categories(id) on delete restrict,
  description text not null,
  date date not null,
  property_id uuid null references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);

alter table public.transactions enable row level security;

drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions"
on public.transactions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own transactions"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own transactions" on public.transactions;
create policy "Users can delete own transactions"
on public.transactions
for delete
using (auth.uid() = user_id);

drop trigger if exists update_transactions_updated_at on public.transactions;
create trigger update_transactions_updated_at
before update on public.transactions
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Goals
-- =====================================================
create table if not exists public.homestead_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text null,
  category text null,
  target_metric text null,
  start_value numeric(12,2) null,
  target_value numeric(12,2) null,
  target_date date null,
  priority text null,
  status text not null default 'active' check (status in ('active', 'achieved', 'archived', 'completed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homestead_goals
  add column if not exists target_metric text null,
  add column if not exists start_value numeric(12,2) null,
  add column if not exists target_value numeric(12,2) null,
  add column if not exists priority text null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_homestead_goals_user_id on public.homestead_goals(user_id);

alter table public.homestead_goals enable row level security;

drop policy if exists "Users can view own homestead goals" on public.homestead_goals;
create policy "Users can view own homestead goals"
on public.homestead_goals
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own homestead goals" on public.homestead_goals;
create policy "Users can insert own homestead goals"
on public.homestead_goals
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own homestead goals" on public.homestead_goals;
create policy "Users can update own homestead goals"
on public.homestead_goals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own homestead goals" on public.homestead_goals;
create policy "Users can delete own homestead goals"
on public.homestead_goals
for delete
using (auth.uid() = user_id);

drop trigger if exists update_homestead_goals_updated_at on public.homestead_goals;
create trigger update_homestead_goals_updated_at
before update on public.homestead_goals
for each row
execute function public.update_updated_at_column();

create table if not exists public.goal_updates (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.homestead_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  current_value numeric(12,2) null,
  notes text null,
  update_text text null,
  progress_percentage numeric(5,2) null,
  created_at timestamptz not null default now()
);

alter table public.goal_updates
  add column if not exists date date not null default current_date,
  add column if not exists current_value numeric(12,2) null,
  add column if not exists notes text null,
  add column if not exists update_text text null,
  add column if not exists progress_percentage numeric(5,2) null;

create index if not exists idx_goal_updates_goal_id on public.goal_updates(goal_id);
create index if not exists idx_goal_updates_user_date on public.goal_updates(user_id, date desc);

alter table public.goal_updates enable row level security;

drop policy if exists "Users can view own goal updates" on public.goal_updates;
create policy "Users can view own goal updates"
on public.goal_updates
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own goal updates" on public.goal_updates;
create policy "Users can insert own goal updates"
on public.goal_updates
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own goal updates" on public.goal_updates;
create policy "Users can update own goal updates"
on public.goal_updates
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own goal updates" on public.goal_updates;
create policy "Users can delete own goal updates"
on public.goal_updates
for delete
using (auth.uid() = user_id);

-- =====================================================
-- Infrastructure
-- =====================================================
create table if not exists public.infrastructure (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  status text not null check (status in ('planned', 'in_progress', 'completed')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  estimated_cost numeric(12,2) not null default 0,
  planned_completion timestamptz null,
  materials_needed text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_infrastructure_user_id on public.infrastructure(user_id);

alter table public.infrastructure enable row level security;

drop policy if exists "Users can view own infrastructure" on public.infrastructure;
create policy "Users can view own infrastructure"
on public.infrastructure
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own infrastructure" on public.infrastructure;
create policy "Users can insert own infrastructure"
on public.infrastructure
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own infrastructure" on public.infrastructure;
create policy "Users can update own infrastructure"
on public.infrastructure
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own infrastructure" on public.infrastructure;
create policy "Users can delete own infrastructure"
on public.infrastructure
for delete
using (auth.uid() = user_id);

drop trigger if exists update_infrastructure_updated_at on public.infrastructure;
create trigger update_infrastructure_updated_at
before update on public.infrastructure
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Health tables
-- =====================================================
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  name text not null,
  target_animals text[] not null default '{}',
  dosage_per_lb numeric(12,4) null,
  dosage_unit text null,
  administration_method text null,
  withdrawal_period_meat_days integer null,
  withdrawal_period_milk_days integer null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medications enable row level security;

drop policy if exists "Users can view own or shared medications" on public.medications;
create policy "Users can view own or shared medications"
on public.medications
for select
using (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can insert own medications" on public.medications;
create policy "Users can insert own medications"
on public.medications
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own medications" on public.medications;
create policy "Users can update own medications"
on public.medications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own medications" on public.medications;
create policy "Users can delete own medications"
on public.medications
for delete
using (auth.uid() = user_id);

drop trigger if exists update_medications_updated_at on public.medications;
create trigger update_medications_updated_at
before update on public.medications
for each row
execute function public.update_updated_at_column();

create table if not exists public.grooming_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  animal_id uuid not null references public.animals(id) on delete cascade,
  grooming_type text not null,
  frequency_days integer not null,
  last_completed_date date null,
  is_active boolean not null default true,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.grooming_schedules enable row level security;

drop policy if exists "Users can view own grooming schedules" on public.grooming_schedules;
create policy "Users can view own grooming schedules"
on public.grooming_schedules
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own grooming schedules" on public.grooming_schedules;
create policy "Users can insert own grooming schedules"
on public.grooming_schedules
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own grooming schedules" on public.grooming_schedules;
create policy "Users can update own grooming schedules"
on public.grooming_schedules
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own grooming schedules" on public.grooming_schedules;
create policy "Users can delete own grooming schedules"
on public.grooming_schedules
for delete
using (auth.uid() = user_id);

drop trigger if exists update_grooming_schedules_updated_at on public.grooming_schedules;
create trigger update_grooming_schedules_updated_at
before update on public.grooming_schedules
for each row
execute function public.update_updated_at_column();

create table if not exists public.grooming_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  animal_id uuid not null references public.animals(id) on delete cascade,
  grooming_type text not null,
  date date not null,
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_grooming_records_user_date on public.grooming_records(user_id, date desc);

alter table public.grooming_records enable row level security;

drop policy if exists "Users can view own grooming records" on public.grooming_records;
create policy "Users can view own grooming records"
on public.grooming_records
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own grooming records" on public.grooming_records;
create policy "Users can insert own grooming records"
on public.grooming_records
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own grooming records" on public.grooming_records;
create policy "Users can delete own grooming records"
on public.grooming_records
for delete
using (auth.uid() = user_id);

-- =====================================================
-- Crop planning
-- =====================================================
create table if not exists public.crops (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.crops enable row level security;

drop policy if exists "Authenticated users can view crops" on public.crops;
create policy "Authenticated users can view crops"
on public.crops
for select
to authenticated
using (true);

create table if not exists public.crop_rotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  property_id uuid null references public.properties(id) on delete set null,
  plot_name text not null,
  year integer not null,
  season text not null,
  crop_name text not null,
  plant_date date null,
  harvest_date date null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crop_rotations_user_year on public.crop_rotations(user_id, year desc);

alter table public.crop_rotations enable row level security;

drop policy if exists "Users can view own crop rotations" on public.crop_rotations;
create policy "Users can view own crop rotations"
on public.crop_rotations
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own crop rotations" on public.crop_rotations;
create policy "Users can insert own crop rotations"
on public.crop_rotations
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own crop rotations" on public.crop_rotations;
create policy "Users can update own crop rotations"
on public.crop_rotations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own crop rotations" on public.crop_rotations;
create policy "Users can delete own crop rotations"
on public.crop_rotations
for delete
using (auth.uid() = user_id);

drop trigger if exists update_crop_rotations_updated_at on public.crop_rotations;
create trigger update_crop_rotations_updated_at
before update on public.crop_rotations
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Breeding
-- =====================================================
create table if not exists public.breeding_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  animal_id uuid not null references public.animals(id) on delete cascade,
  event_type text not null check (event_type in ('heat_cycle', 'breeding', 'pregnancy_confirmation', 'birth')),
  date date not null,
  partner_animal_id uuid null references public.animals(id) on delete set null,
  partner_name text null,
  expected_due_date date null,
  actual_birth_date date null,
  offspring_count integer null,
  notes text null,
  property_id uuid null references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.breeding_events enable row level security;

drop policy if exists "Users can view own breeding events" on public.breeding_events;
create policy "Users can view own breeding events"
on public.breeding_events
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own breeding events" on public.breeding_events;
create policy "Users can insert own breeding events"
on public.breeding_events
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own breeding events" on public.breeding_events;
create policy "Users can update own breeding events"
on public.breeding_events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own breeding events" on public.breeding_events;
create policy "Users can delete own breeding events"
on public.breeding_events
for delete
using (auth.uid() = user_id);

drop trigger if exists update_breeding_events_updated_at on public.breeding_events;
create trigger update_breeding_events_updated_at
before update on public.breeding_events
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Gamification
-- =====================================================
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  xp integer not null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  constraint user_achievements_unique unique (user_id, achievement_id)
);

create table if not exists public.user_privacy_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  show_on_leaderboard boolean not null default true,
  display_name text null,
  show_achievements boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_xp_events_user_created on public.xp_events(user_id, created_at desc);
create index if not exists idx_user_stats_total_xp on public.user_stats(total_xp desc);

alter table public.user_stats enable row level security;
alter table public.xp_events enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_privacy_settings enable row level security;

drop policy if exists "Users can view own user_stats" on public.user_stats;
create policy "Users can view own user_stats"
on public.user_stats
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view leaderboard user_stats" on public.user_stats;
create policy "Users can view leaderboard user_stats"
on public.user_stats
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_privacy_settings ps
    where ps.user_id = user_stats.user_id
      and ps.show_on_leaderboard = true
  )
);

drop policy if exists "Users can insert own user_stats" on public.user_stats;
create policy "Users can insert own user_stats"
on public.user_stats
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own user_stats" on public.user_stats;
create policy "Users can update own user_stats"
on public.user_stats
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own xp_events" on public.xp_events;
create policy "Users can view own xp_events"
on public.xp_events
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own xp_events" on public.xp_events;
create policy "Users can insert own xp_events"
on public.xp_events
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view own user_achievements" on public.user_achievements;
create policy "Users can view own user_achievements"
on public.user_achievements
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own user_achievements" on public.user_achievements;
create policy "Users can insert own user_achievements"
on public.user_achievements
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view own user_privacy_settings" on public.user_privacy_settings;
create policy "Users can view own user_privacy_settings"
on public.user_privacy_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view public user_privacy_settings" on public.user_privacy_settings;
create policy "Users can view public user_privacy_settings"
on public.user_privacy_settings
for select
using (show_on_leaderboard = true);

drop policy if exists "Users can insert own user_privacy_settings" on public.user_privacy_settings;
create policy "Users can insert own user_privacy_settings"
on public.user_privacy_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own user_privacy_settings" on public.user_privacy_settings;
create policy "Users can update own user_privacy_settings"
on public.user_privacy_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists update_user_stats_updated_at on public.user_stats;
create trigger update_user_stats_updated_at
before update on public.user_stats
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_user_privacy_settings_updated_at on public.user_privacy_settings;
create trigger update_user_privacy_settings_updated_at
before update on public.user_privacy_settings
for each row
execute function public.update_updated_at_column();

-- =====================================================
-- Avatar storage bucket
-- =====================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 2) = auth.uid()::text
);

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 2) = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 2) = auth.uid()::text
);

drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 2) = auth.uid()::text
);

