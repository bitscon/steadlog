-- Phase 2: Animal profile domain alignment
-- Adds first-class `species` while keeping backward compatibility with legacy `type`.

alter table if exists public.animals
  add column if not exists type text,
  add column if not exists species text;

-- Backfill species from legacy type when missing.
update public.animals
set species = coalesce(species, type)
where species is null;

-- Backfill type from species when missing (legacy compatibility).
update public.animals
set type = coalesce(type, species)
where type is null;

-- Ensure both columns stay in sync for existing legacy code paths.
create or replace function public.sync_animal_species_and_type()
returns trigger
language plpgsql
as $$
begin
  new.species = coalesce(nullif(new.species, ''), nullif(new.type, ''), 'animal');
  new.type = coalesce(nullif(new.type, ''), new.species, 'animal');
  return new;
end;
$$;

drop trigger if exists sync_animal_species_and_type_trigger on public.animals;
create trigger sync_animal_species_and_type_trigger
before insert or update on public.animals
for each row
execute function public.sync_animal_species_and_type();

-- Keep species required for new writes.
alter table if exists public.animals
  alter column species set not null;

-- Optional helper index for profile filters.
create index if not exists idx_animals_user_species on public.animals(user_id, species);
