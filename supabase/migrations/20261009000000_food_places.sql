-- Food places: restaurants, cafés and dishes worth tracking down on a trip.
--
-- A place is saved first and planned later, so `day` starts empty (null,
-- "not planned yet"). Once planned it holds the day of the trip, counted from
-- 1, rather than a calendar date: moving the whole trip moves its plans with
-- it. A day past the trip's last (after shortening it) is shown as not
-- planned again by the app, so the place never quietly disappears.
--
-- Run once in the Supabase dashboard, after 20261007000000_trips.sql:
-- SQL Editor → New query → paste → Run. Safe to re-run.

create table if not exists public.food_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  trip_id uuid not null,
  name text not null
    check (char_length(btrim(name)) between 1 and 120),
  day smallint
    check (day >= 1),
  created_at timestamptz not null default now(),
  -- Keyed on (trip_id, user_id) so a place can only join a trip its own
  -- owner holds; RLS alone would let an insert name someone else's trip.
  -- Deleting a trip deletes its places.
  constraint food_places_trip_fkey
    foreign key (trip_id, user_id)
    references public.trips (id, user_id)
    on delete cascade
);

create index if not exists food_places_trip_id_created_at_idx
  on public.food_places (trip_id, created_at);

-- The anon key ships to the browser, so RLS is the only thing keeping one
-- user's places away from another's. Every policy is owner-scoped.
alter table public.food_places enable row level security;

drop policy if exists "Owners can read their food places" on public.food_places;
create policy "Owners can read their food places"
  on public.food_places for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can add food places" on public.food_places;
create policy "Owners can add food places"
  on public.food_places for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their food places" on public.food_places;
create policy "Owners can update their food places"
  on public.food_places for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their food places" on public.food_places;
create policy "Owners can delete their food places"
  on public.food_places for delete
  to authenticated
  using ((select auth.uid()) = user_id);
