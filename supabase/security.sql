-- Enable RLS and set policies for sensitive tables.
-- Apply this script in Supabase SQL editor.

-- Orders table
alter table if exists public.orders enable row level security;

-- Public can submit orders (insert only)
drop policy if exists "public_insert_orders" on public.orders;
create policy "public_insert_orders"
  on public.orders
  for insert
  with check (true);

-- Only authenticated users can read/manage orders
drop policy if exists "admin_select_orders" on public.orders;
create policy "admin_select_orders"
  on public.orders
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "admin_update_orders" on public.orders;
create policy "admin_update_orders"
  on public.orders
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin_delete_orders" on public.orders;
create policy "admin_delete_orders"
  on public.orders
  for delete
  using (auth.role() = 'authenticated');

-- Email logs table
alter table if exists public.email_logs enable row level security;

drop policy if exists "admin_select_email_logs" on public.email_logs;
create policy "admin_select_email_logs"
  on public.email_logs
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "admin_insert_email_logs" on public.email_logs;
create policy "admin_insert_email_logs"
  on public.email_logs
  for insert
  with check (auth.role() = 'authenticated');

-- Materials table (read-only for public)
alter table if exists public.materials enable row level security;

drop policy if exists "public_select_materials" on public.materials;
create policy "public_select_materials"
  on public.materials
  for select
  using (true);
