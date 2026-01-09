-- Master Supabase schema + RLS policies for this project.
-- Copy/paste into Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_info jsonb not null,
  measurements jsonb not null default '[]'::jsonb,
  selected_type jsonb,
  total_price numeric not null default 0,
  total_units integer not null default 0,
  selection jsonb,
  pricing jsonb,
  metadata jsonb,
  status text not null default 'pending',
  reference_number text,
  budget_number text,
  budget_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists customer_info jsonb,
  add column if not exists measurements jsonb,
  add column if not exists selected_type jsonb,
  add column if not exists total_price numeric,
  add column if not exists total_units integer,
  add column if not exists selection jsonb,
  add column if not exists pricing jsonb,
  add column if not exists metadata jsonb,
  add column if not exists status text,
  add column if not exists reference_number text,
  add column if not exists budget_number text,
  add column if not exists budget_sent_at timestamptz,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table public.orders
  alter column measurements set default '[]'::jsonb,
  alter column total_price set default 0,
  alter column total_units set default 0,
  alter column status set default 'pending',
  alter column created_at set default now(),
  alter column updated_at set default now();

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_reference_number_idx on public.orders (reference_number);
create unique index if not exists orders_reference_number_uidx on public.orders (reference_number) where reference_number is not null;

-- Email logs
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  email_type text not null,
  recipient text not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent'
);

create index if not exists email_logs_order_id_idx on public.email_logs (order_id);
create index if not exists email_logs_sent_at_idx on public.email_logs (sent_at desc);

-- Materials
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  nombre text not null,
  codigo text not null,
  precio_tela_m numeric,
  precio_confeccion_m numeric,
  precio_tela_m2 numeric,
  precio_confeccion_m2 numeric,
  frunce_default numeric not null default 0,
  alto_fijo numeric,
  margen_default numeric not null default 0,
  transporte_pct_default numeric not null default 0,
  coste_riel numeric,
  coste_instalacion numeric,
  transporte_fijo numeric,
  activo boolean not null default true,
  componentes text[],
  cantidad_default numeric,
  hueco_default numeric,
  descripcion text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_activo_idx on public.materials (activo);
create index if not exists materials_created_at_idx on public.materials (created_at desc);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_orders on public.orders;
create trigger set_updated_at_orders
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_materials on public.materials;
create trigger set_updated_at_materials
before update on public.materials
for each row execute function public.set_updated_at();

-- RLS
alter table if exists public.orders enable row level security;
alter table if exists public.email_logs enable row level security;
alter table if exists public.materials enable row level security;

-- Orders policies
drop policy if exists "public_insert_orders" on public.orders;
create policy "public_insert_orders"
  on public.orders
  for insert
  with check (true);

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

-- Email logs policies
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

-- Materials policies (public read)
drop policy if exists "public_select_materials" on public.materials;
create policy "public_select_materials"
  on public.materials
  for select
  using (true);
