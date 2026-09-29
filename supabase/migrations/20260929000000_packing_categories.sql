-- Optional grouping for the packing list ("Electronics", "Toiletries"). An
-- item with no category sits in the ungrouped section, which is the default.
--
-- Deleting a category never deletes its items: the foreign key sets their
-- category_id back to null, so they return to the ungrouped section.
--
-- Run once in the Supabase dashboard, after 20260925000000_packing_item_quantity.sql:
-- SQL Editor → New query → paste → Run. Safe to re-run. Needs Postgres 15+
-- for the column list on `on delete set null`.

create table if not exists public.packing_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null
    check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  -- Target of the composite key on packing_items below.
  unique (id, user_id)
);

create index if not exists packing_categories_user_id_created_at_idx
  on public.packing_categories (user_id, created_at);

-- One "Electronics" per person, whatever the capitalisation.
create unique index if not exists packing_categories_user_id_name_key
  on public.packing_categories (user_id, lower(btrim(name)));

alter table public.packing_categories enable row level security;

drop policy if exists "Owners can read their packing categories" on public.packing_categories;
create policy "Owners can read their packing categories"
  on public.packing_categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owners can add packing categories" on public.packing_categories;
create policy "Owners can add packing categories"
  on public.packing_categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update their packing categories" on public.packing_categories;
create policy "Owners can update their packing categories"
  on public.packing_categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete their packing categories" on public.packing_categories;
create policy "Owners can delete their packing categories"
  on public.packing_categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

alter table public.packing_items
  add column if not exists category_id uuid;

-- Keyed on (category_id, user_id) so an item can only join a category its
-- own owner holds; RLS alone would let an insert name someone else's id.
-- `set null (category_id)` clears just the category, leaving user_id intact.
alter table public.packing_items
  drop constraint if exists packing_items_category_fkey;
alter table public.packing_items
  add constraint packing_items_category_fkey
    foreign key (category_id, user_id)
    references public.packing_categories (id, user_id)
    on delete set null (category_id);

create index if not exists packing_items_category_id_idx
  on public.packing_items (category_id);
