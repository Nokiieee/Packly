-- Trips. Everything in Packly belongs to one: a destination and a run of
-- dates. Whether a trip is current, upcoming or past is worked out from those
-- dates in the trip's own time zone when a page loads — never stored, and
-- nothing moves a trip when it ends.
--
-- The packing list moves onto trips here: packing_items and
-- packing_categories gain a required trip_id. Each user who already has
-- packing rows gets a "My first trip" (today plus six days, in UTC) holding
-- all of them — rename it and fix its dates in the app afterwards.
--
-- Categories become per trip, so a name is unique within a trip rather than
-- across the account, and deleting one never reaches into another trip.
--
-- Run once in the Supabase dashboard, after 20260929000000_packing_categories.sql:
-- SQL Editor → New query → paste → Run. Safe to re-run.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null
    check (char_length(btrim(name)) between 1 and 80),
  start_date date not null,
  end_date date not null,
  -- IANA name ("Europe/Lisbon"). Decides when each day of the trip begins.
  time_zone text not null
    check (char_length(time_zone) between 1 and 64),
  created_at timestamptz not null default now(),
  constraint trips_dates_in_order check (end_date >= start_date),
  -- Target of the composite keys on the packing tables below.
  unique (id, user_id)
);

create index if not exists trips_user_id_end_date_idx
  on public.trips (user_id, end_date);

alter table public.trips enable row level security;

drop policy if exists "Owners can read their trips" on public.trips;
create policy "Owners can read their trips"
  on public.trips for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can add trips" on public.trips;
create policy "Owners can add trips"
  on public.trips for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their trips" on public.trips;
create policy "Owners can update their trips"
  on public.trips for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their trips" on public.trips;
create policy "Owners can delete their trips"
  on public.trips for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Backfill: a first trip for anyone with packing rows and no trip yet, then
-- every trip-less row joins that user's earliest trip.

alter table public.packing_items add column if not exists trip_id uuid;
alter table public.packing_categories add column if not exists trip_id uuid;

--

insert into public.trips (user_id, name, start_date, end_date, time_zone)
select owners.user_id, 'My first trip', current_date, current_date + 6, 'UTC'
from (
  select user_id from public.packing_items where trip_id is null
  union
  select user_id from public.packing_categories where trip_id is null
) as owners
where not exists (
  select 1 from public.trips where trips.user_id = owners.user_id
);

update public.packing_categories as c
set trip_id = (
  select t.id from public.trips t
  where t.user_id = c.user_id
  order by t.created_at
  limit 1
)
where c.trip_id is null;

update public.packing_items as i
set trip_id = (
  select t.id from public.trips t
  where t.user_id = i.user_id
  order by t.created_at
  limit 1
)
where i.trip_id is null;

--

alter table public.packing_categories alter column trip_id set not null;
alter table public.packing_items alter column trip_id set not null;

-- Keyed on (trip_id, user_id) so a row can only join a trip its own owner
-- holds; RLS alone would let an insert name someone else's trip. Deleting a
-- trip deletes its list.
alter table public.packing_categories
  drop constraint if exists packing_categories_trip_fkey;
alter table public.packing_categories
  add constraint packing_categories_trip_fkey
    foreign key (trip_id, user_id)
    references public.trips (id, user_id)
    on delete cascade;

alter table public.packing_items
  drop constraint if exists packing_items_trip_fkey;
alter table public.packing_items
  add constraint packing_items_trip_fkey
    foreign key (trip_id, user_id)
    references public.trips (id, user_id)
    on delete cascade;

-- An item's category must be in the item's own trip. Same trip implies same
-- owner, so this replaces the (category_id, user_id) key; `set null
-- (category_id)` still returns a deleted category's items to the ungrouped
-- section without touching their trip.
alter table public.packing_categories
  drop constraint if exists packing_categories_id_trip_id_key;
alter table public.packing_categories
  add constraint packing_categories_id_trip_id_key unique (id, trip_id);

alter table public.packing_items
  drop constraint if exists packing_items_category_fkey;
alter table public.packing_items
  add constraint packing_items_category_fkey
    foreign key (category_id, trip_id)
    references public.packing_categories (id, trip_id)
    on delete set null (category_id);

alter table public.packing_categories
  drop constraint if exists packing_categories_id_user_id_key;

-- One "Electronics" per trip, whatever the capitalisation.
drop index if exists public.packing_categories_user_id_name_key;
create unique index if not exists packing_categories_trip_id_name_key
  on public.packing_categories (trip_id, lower(btrim(name)));

create index if not exists packing_items_trip_id_created_at_idx
  on public.packing_items (trip_id, created_at);
create index if not exists packing_categories_trip_id_created_at_idx
  on public.packing_categories (trip_id, created_at);
