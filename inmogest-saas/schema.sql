-- InmoGest SaaS — esquema multi-cuenta (Supabase / Postgres)
-- Ejecutar en el SQL Editor de tu proyecto de Supabase.

create extension if not exists "pgcrypto";

-- 1. Organizaciones (cada inmobiliaria o propietario que contrata el servicio)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text not null unique,          -- ej: "delta" -> delta.tuplataforma.com
  logo_url text,
  color_primary text default '#1F2421',
  color_accent text default '#B08D57',
  display_font text default 'serif',       -- 'serif' | 'sans'
  style text default 'ledger',             -- 'ledger' | 'card' (referencia visual)
  created_at timestamptz default now()
);

-- 2. Usuarios admin de cada organización (vinculados a auth.users de Supabase)
create table org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'admin',               -- 'admin' | 'owner'
  created_at timestamptz default now(),
  unique(organization_id, user_id)
);

-- 3. Propiedades
create table properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  address text not null,
  unit text,
  created_at timestamptz default now()
);

-- 4. Inquilinos
create table tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  name text not null,
  email text,
  phone text,
  rent_amount numeric default 0,
  user_id uuid references auth.users(id),  -- login del inquilino al Portal
  created_at timestamptz default now()
);

-- 5. Cargos (alquiler mensual generado + cargos especiales puntuales)
create table charges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  concept text not null,
  amount numeric not null,
  kind text default 'especial',            -- 'alquiler' | 'especial'
  installments int default 1,
  due_date date,
  status text default 'pendiente',         -- 'pendiente' | 'pagado' | 'en_curso'
  created_at timestamptz default now()
);

-- 6. Pagos
create table payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid references charges(id) on delete cascade,
  amount numeric not null,
  paid_at timestamptz default now(),
  method text default 'mercado_pago'
);

-- ---------------------------------------------------------------
-- Row Level Security: cada organización solo ve sus propios datos
-- ---------------------------------------------------------------
alter table organizations enable row level security;
alter table org_members enable row level security;
alter table properties enable row level security;
alter table tenants enable row level security;
alter table charges enable row level security;
alter table payments enable row level security;

-- Un admin solo ve la organización a la que pertenece
create policy "org visible a sus miembros"
  on organizations for select
  using (id in (select organization_id from org_members where user_id = auth.uid()));

create policy "miembros ven su propia fila"
  on org_members for select
  using (user_id = auth.uid());

create policy "admin ve propiedades de su org"
  on properties for all
  using (organization_id in (select organization_id from org_members where user_id = auth.uid()));

create policy "admin ve inquilinos de su org"
  on tenants for all
  using (organization_id in (select organization_id from org_members where user_id = auth.uid()));

-- El inquilino ve únicamente su propia fila
create policy "inquilino ve su propia fila"
  on tenants for select
  using (user_id = auth.uid());

create policy "admin ve cargos de su org"
  on charges for all
  using (organization_id in (select organization_id from org_members where user_id = auth.uid()));

create policy "inquilino ve sus propios cargos"
  on charges for select
  using (tenant_id in (select id from tenants where user_id = auth.uid()));

create policy "acceso a pagos vinculado al cargo"
  on payments for select
  using (
    charge_id in (
      select id from charges where
        organization_id in (select organization_id from org_members where user_id = auth.uid())
        or tenant_id in (select id from tenants where user_id = auth.uid())
    )
  );

-- Datos de ejemplo (opcional, borrar en producción)
insert into organizations (name, subdomain, color_primary, color_accent, display_font, style)
values
  ('Estudio Delta Propiedades', 'delta', '#1F2421', '#B08D57', 'serif', 'ledger'),
  ('Casa Once', 'once', '#14232B', '#FF6B4A', 'sans', 'card');
