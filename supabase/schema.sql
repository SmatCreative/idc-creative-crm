-- ============================================================
-- SmatCreative CRM — Full Schema
-- Run the reset block first if re-running (uncomment below)
-- ============================================================

-- =====================
-- RESET (uncomment to wipe & rebuild)
-- =====================
-- drop table if exists deliverables cascade;
-- drop table if exists supplier_products cascade;
-- drop table if exists suppliers cascade;
-- drop table if exists tasks cascade;
-- drop table if exists activities cascade;
-- drop table if exists deals cascade;
-- drop table if exists contacts cascade;
-- drop table if exists accounts cascade;
-- drop type if exists deal_stage cascade;
-- drop type if exists service_type cascade;
-- drop type if exists activity_type cascade;
-- drop type if exists deliverable_status cascade;

-- =====================
-- EXTENSIONS
-- =====================
create extension if not exists "uuid-ossp";

-- =====================
-- ENUMS
-- =====================
do $$ begin
  create type deal_stage as enum (
    'enquiry',
    'quote_sent',
    'deposit_paid',
    'in_production',
    'ready',
    'delivered',
    'lost'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type service_type as enum (
    'Physical Branding',
    'Social Media',
    'Digital Marketing',
    'One-Off Design',
    'Bundle',
    'Other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type activity_type as enum (
    'WhatsApp',
    'Call',
    'Meeting',
    'Email',
    'Note',
    'Update'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type deliverable_status as enum ('pending', 'in_progress', 'done');
exception when duplicate_object then null;
end $$;

-- =====================
-- CLIENTS (was accounts)
-- =====================
create table if not exists accounts (
  id                    uuid primary key default uuid_generate_v4(),
  company_name          text not null,
  industry              text,
  website               text,
  whatsapp              text,
  email                 text,
  total_lifetime_value  numeric(12,2) default 0,
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- =====================
-- CONTACTS
-- =====================
create table if not exists contacts (
  id          uuid primary key default uuid_generate_v4(),
  full_name   text not null,
  role        text,
  email       text,
  phone       text,
  whatsapp    text,
  account_id  uuid references accounts(id) on delete set null,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =====================
-- PROJECTS (was deals)
-- =====================
create table if not exists deals (
  id                  uuid primary key default uuid_generate_v4(),
  deal_name           text not null,
  account_id          uuid references accounts(id) on delete set null,
  service_type        service_type default 'Other',
  estimated_value     numeric(12,2) default 0,
  stage               deal_stage default 'enquiry',
  goal                text,
  target_launch_date  date,
  closed_lost_reason  text,
  description         text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- =====================
-- DELIVERABLES
-- =====================
create table if not exists deliverables (
  id          uuid primary key default uuid_generate_v4(),
  deal_id     uuid not null references deals(id) on delete cascade,
  title       text not null,
  description text,
  due_date    date,
  status      deliverable_status default 'pending',
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =====================
-- ACTIVITIES / MESSAGES (per project)
-- =====================
create table if not exists activities (
  id          uuid primary key default uuid_generate_v4(),
  type        activity_type not null,
  notes       text,
  deal_id     uuid references deals(id) on delete cascade,
  contact_id  uuid references contacts(id) on delete set null,
  created_at  timestamptz default now()
);

-- =====================
-- TASKS
-- =====================
create table if not exists tasks (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  deal_id      uuid references deals(id) on delete cascade,
  contact_id   uuid references contacts(id) on delete set null,
  due_date     date,
  completed    boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- =====================
-- SUPPLIERS
-- =====================
create table if not exists suppliers (
  id              uuid primary key default uuid_generate_v4(),
  company_name    text not null,
  contact_person  text,
  whatsapp        text,
  email           text,
  location        text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- =====================
-- SUPPLIER PRODUCTS / PRICING
-- =====================
create table if not exists supplier_products (
  id              uuid primary key default uuid_generate_v4(),
  supplier_id     uuid not null references suppliers(id) on delete cascade,
  product_name    text not null,
  category        text,
  unit            text default 'unit',
  cost_price      numeric(10,2) not null default 0,
  markup_percent  numeric(5,2) not null default 30,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- =====================
-- INDEXES
-- =====================
create index if not exists contacts_account_id_idx       on contacts(account_id);
create index if not exists deals_account_id_idx          on deals(account_id);
create index if not exists deals_stage_idx               on deals(stage);
create index if not exists activities_deal_id_idx        on activities(deal_id);
create index if not exists tasks_deal_id_idx             on tasks(deal_id);
create index if not exists tasks_completed_idx           on tasks(completed);
create index if not exists deliverables_deal_id_idx      on deliverables(deal_id);
create index if not exists supplier_products_supplier_id on supplier_products(supplier_id);

-- =====================
-- UPDATED_AT TRIGGERS
-- =====================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists accounts_updated_at on accounts;
create trigger accounts_updated_at before update on accounts
  for each row execute procedure update_updated_at();

drop trigger if exists contacts_updated_at on contacts;
create trigger contacts_updated_at before update on contacts
  for each row execute procedure update_updated_at();

drop trigger if exists deals_updated_at on deals;
create trigger deals_updated_at before update on deals
  for each row execute procedure update_updated_at();

drop trigger if exists deliverables_updated_at on deliverables;
create trigger deliverables_updated_at before update on deliverables
  for each row execute procedure update_updated_at();

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at();

drop trigger if exists suppliers_updated_at on suppliers;
create trigger suppliers_updated_at before update on suppliers
  for each row execute procedure update_updated_at();

drop trigger if exists supplier_products_updated_at on supplier_products;
create trigger supplier_products_updated_at before update on supplier_products
  for each row execute procedure update_updated_at();

-- =====================
-- SEED DATA
-- =====================
insert into accounts (company_name, industry, whatsapp, email, total_lifetime_value) values
  ('Apex Ventures', 'Finance', '+263 77 100 0001', 'info@apexventures.co.zw', 2800),
  ('Nova Collective', 'Tech Startup', '+263 77 100 0002', 'hello@novacollective.io', 1200),
  ('Bloom Beauty Co.', 'Beauty & Wellness', '+263 77 100 0003', 'bloom@beauty.co.zw', 4500),
  ('Meridian Hotels', 'Hospitality', '+263 77 100 0004', 'admin@meridianhotels.com', 3200),
  ('Pulse Fitness', 'Health & Fitness', '+263 77 100 0005', 'info@pulsefitness.co.zw', 980)
on conflict do nothing;

insert into suppliers (company_name, contact_person, whatsapp, location) values
  ('ZimPrint Solutions', 'Tafadzwa Moyo', '+263 77 200 0001', 'Harare CBD'),
  ('SignTech Zimbabwe', 'Brian Ncube', '+263 77 200 0002', 'Msasa Industrial'),
  ('FabricWorld Zim', 'Grace Mutasa', '+263 77 200 0003', 'Harare')
on conflict do nothing;
