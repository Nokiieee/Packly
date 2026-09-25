-- Bulk packing items: "T-shirt ×5" is one row with a quantity, packed one at a
-- time. `packed_count` replaces the old `packed` boolean — an item is packed
-- once packed_count reaches quantity. Existing rows keep their state: a ticked
-- item becomes 1 of 1, an unticked one 0 of 1.
--
-- Run once in the Supabase dashboard, after 20260924000000_packing_items.sql:
-- SQL Editor → New query → paste → Run. Safe to re-run.

alter table public.packing_items
  add column if not exists quantity smallint not null default 1
    check (quantity between 1 and 99),
  add column if not exists packed_count smallint not null default 0;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'packing_items'
      and column_name = 'packed'
  ) then
    update public.packing_items set packed_count = quantity where packed;
    alter table public.packing_items drop column packed;
  end if;
end $$;

alter table public.packing_items
  drop constraint if exists packing_items_packed_count_range;
alter table public.packing_items
  add constraint packing_items_packed_count_range
    check (packed_count between 0 and quantity);
