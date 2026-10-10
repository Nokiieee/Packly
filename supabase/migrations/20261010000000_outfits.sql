-- Outfits: what to wear on each day of a trip.
--
-- Like food places, an outfit holds the day of the trip it's for, counted
-- from 1, rather than a calendar date: moving the whole trip moves its
-- outfits with it. Outfits on days past the trip's last (after shortening it)
-- stay saved but aren't shown, and come back if the trip grows again.
--
-- Every day starts with a "Day outfit" and a "Night outfit". They're real
-- rows, so they can be renamed or deleted like any other. A trigger on trips
-- adds them for each new day: all of a trip's days when it's created, and
-- only the added days when it's made longer. A day the user has emptied keeps
-- no outfits.
--
-- Run once in the Supabase dashboard, after 20261009000000_food_places.sql:
-- SQL Editor → New query → paste → Run. Safe to re-run.

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  trip_id uuid not null,
  day smallint not null
    check (day >= 1),
  name text not null
    check (char_length(btrim(name)) between 1 and 60),
  -- Counts up by one for every outfit saved, so a day's outfits list in the
  -- order they were made. Day and Night are saved in the same instant, so
  -- created_at alone couldn't keep Day first.
  seq bigint generated always as identity,
  created_at timestamptz not null default now(),
  -- Keyed on (trip_id, user_id) so an outfit can only join a trip its own
  -- owner holds; RLS alone would let an insert name someone else's trip.
  -- Deleting a trip deletes its outfits.
  constraint outfits_trip_fkey
    foreign key (trip_id, user_id)
    references public.trips (id, user_id)
    on delete cascade
);

create index if not exists outfits_trip_id_seq_idx
  on public.outfits (trip_id, seq);

-- The anon key ships to the browser, so RLS is the only thing keeping one
-- user's outfits away from another's. Every policy is owner-scoped.
alter table public.outfits enable row level security;

drop policy if exists "Owners can read their outfits" on public.outfits;
create policy "Owners can read their outfits"
  on public.outfits for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can add outfits" on public.outfits;
create policy "Owners can add outfits"
  on public.outfits for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their outfits" on public.outfits;
create policy "Owners can update their outfits"
  on public.outfits for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their outfits" on public.outfits;
create policy "Owners can delete their outfits"
  on public.outfits for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- The default outfits for a trip's new days. Runs as the user saving the
-- trip, so the insert passes the same RLS check as one from the app. Stops
-- at a year of days, so a mistyped end date can't write thousands of rows;
-- later days start empty and can still have outfits added.

create or replace function public.add_default_outfits()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  first_day integer := 1;
  last_day integer;
begin
  if tg_op = 'UPDATE' then
    first_day := old.end_date - old.start_date + 2;
  end if;
  last_day := least(new.end_date - new.start_date + 1, 366);

  insert into public.outfits (user_id, trip_id, day, name)
  select new.user_id, new.id, d.day, presets.name
  from generate_series(first_day, last_day) as d (day)
  cross join (values (1, 'Day outfit'), (2, 'Night outfit'))
    as presets (sort, name)
  -- Days that already have outfits (from before the trip was shortened)
  -- keep them instead of gaining another pair.
  where not exists (
    select 1 from public.outfits o
    where o.trip_id = new.id and o.day = d.day
  )
  order by d.day, presets.sort;

  return null;
end;
$$;

drop trigger if exists trips_add_default_outfits on public.trips;
create trigger trips_add_default_outfits
  after insert or update of start_date, end_date on public.trips
  for each row execute function public.add_default_outfits();

-- Backfill: trips saved before this migration get the defaults on every
-- day. Skips any trip that already has outfits, so a re-run adds nothing.

insert into public.outfits (user_id, trip_id, day, name)
select t.user_id, t.id, d.day, presets.name
from public.trips t
cross join lateral generate_series(
  1, least(t.end_date - t.start_date + 1, 366)
) as d (day)
cross join (values (1, 'Day outfit'), (2, 'Night outfit'))
  as presets (sort, name)
where not exists (
  select 1 from public.outfits o where o.trip_id = t.id
)
order by t.created_at, d.day, presets.sort;
