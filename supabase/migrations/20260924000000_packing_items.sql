-- Packing list: one row per thing to bring, checked off once it's in the bag.
--
-- Items belong to a user, not yet to a trip — there is no trips table. When
-- trips arrive, add a nullable `trip_id` here and backfill.
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists public.packing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null
    check (char_length(btrim(name)) between 1 and 120),
  packed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists packing_items_user_id_created_at_idx
  on public.packing_items (user_id, created_at);

-- The anon key ships to the browser, so RLS is the only thing keeping one
-- user's list away from another's. Every policy is owner-scoped.
alter table public.packing_items enable row level security;

drop policy if exists "Owners can read their packing items" on public.packing_items;
create policy "Owners can read their packing items"
  on public.packing_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can add packing items" on public.packing_items;
create policy "Owners can add packing items"
  on public.packing_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their packing items" on public.packing_items;
create policy "Owners can update their packing items"
  on public.packing_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their packing items" on public.packing_items;
create policy "Owners can delete their packing items"
  on public.packing_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);
