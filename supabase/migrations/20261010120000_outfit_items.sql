-- Outfit items: what goes into an outfit ("White t-shirt", "Sunglasses"),
-- typed in freely rather than picked from the packing list.
--
-- An item belongs to one outfit, and deleting the outfit deletes its items.
-- It also carries its trip, like every other table, so the Outfits page reads
-- a trip's items in one query.
--
-- Run once in the Supabase dashboard, after 20261010000000_outfits.sql:
-- SQL Editor → New query → paste → Run. Safe to re-run.

-- Target of the item's outfit key below.
alter table public.outfits
  drop constraint if exists outfits_id_trip_id_key;
alter table public.outfits
  add constraint outfits_id_trip_id_key unique (id, trip_id);

create table if not exists public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  trip_id uuid not null,
  outfit_id uuid not null,
  name text not null
    check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  -- Keyed on (trip_id, user_id) so an item can only join a trip its own
  -- owner holds; RLS alone would let an insert name someone else's trip.
  -- Deleting a trip deletes its items.
  constraint outfit_items_trip_fkey
    foreign key (trip_id, user_id)
    references public.trips (id, user_id)
    on delete cascade,
  -- The outfit must be in the item's own trip, which also makes it the
  -- same owner's. Deleting the outfit deletes its items.
  constraint outfit_items_outfit_fkey
    foreign key (outfit_id, trip_id)
    references public.outfits (id, trip_id)
    on delete cascade
);

create index if not exists outfit_items_trip_id_created_at_idx
  on public.outfit_items (trip_id, created_at);
create index if not exists outfit_items_outfit_id_idx
  on public.outfit_items (outfit_id);

-- The anon key ships to the browser, so RLS is the only thing keeping one
-- user's items away from another's. Every policy is owner-scoped.
alter table public.outfit_items enable row level security;

drop policy if exists "Owners can read their outfit items" on public.outfit_items;
create policy "Owners can read their outfit items"
  on public.outfit_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can add outfit items" on public.outfit_items;
create policy "Owners can add outfit items"
  on public.outfit_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their outfit items" on public.outfit_items;
create policy "Owners can update their outfit items"
  on public.outfit_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their outfit items" on public.outfit_items;
create policy "Owners can delete their outfit items"
  on public.outfit_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);
