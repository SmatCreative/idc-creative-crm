-- IDC Creative Agency CRM Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- ACCOUNTS
-- =====================
create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  industry text,
  website text,
  total_lifetime_value numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- CONTACTS
-- =====================
create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  role text,
  email text,
  phone text,
  account_id uuid references accounts(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- DEALS / PROJECTS
-- =====================
do $$ begin
  create type deal_stage as enum (
    'lead_captured',
    'discovery_scoping',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type project_type as enum (
    'Branding',
    'Web Design',
    'Campaign',
    'Retainer',
    'Social Media',
    'Video Production',
    'Photography',
    'Copywriting',
    'Strategy',
    'Other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  deal_name text not null,
  account_id uuid references accounts(id) on delete set null,
  project_type project_type default 'Other',
  estimated_value numeric(12,2) default 0,
  stage deal_stage default 'lead_captured',
  target_launch_date date,
  closed_lost_reason text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- ACTIVITIES
-- =====================
do $$ begin
  create type activity_type as enum (
    'Email',
    'Call',
    'Pitch Meeting',
    'Review',
    'Note',
    'Task Completed'
  );
exception when duplicate_object then null;
end $$;

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  type activity_type not null,
  notes text,
  deal_id uuid references deals(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now()
);

-- =====================
-- TASKS
-- =====================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  deal_id uuid references deals(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- INDEXES
-- =====================
create index if not exists contacts_account_id_idx on contacts(account_id);
create index if not exists deals_account_id_idx on deals(account_id);
create index if not exists deals_stage_idx on deals(stage);
create index if not exists activities_deal_id_idx on activities(deal_id);
create index if not exists activities_contact_id_idx on activities(contact_id);
create index if not exists tasks_deal_id_idx on tasks(deal_id);
create index if not exists tasks_completed_idx on tasks(completed);

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

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at();

-- =====================
-- RLS POLICIES (enable after auth setup)
-- =====================
-- alter table accounts enable row level security;
-- alter table contacts enable row level security;
-- alter table deals enable row level security;
-- alter table activities enable row level security;
-- alter table tasks enable row level security;

-- =====================
-- SEED DATA (optional demo data)
-- =====================
-- Accounts
insert into accounts (company_name, industry, website, total_lifetime_value) values
  ('Apex Ventures', 'Finance', 'apexventures.com', 85000),
  ('Nova Collective', 'Tech Startup', 'novacollective.io', 42000),
  ('Bloom Beauty Co.', 'Beauty & Wellness', 'bloombeauty.com', 120000),
  ('Meridian Hotels', 'Hospitality', 'meridianhotels.com', 65000),
  ('Pulse Fitness', 'Health & Fitness', 'pulsefitness.com', 28000)
on conflict do nothing;
