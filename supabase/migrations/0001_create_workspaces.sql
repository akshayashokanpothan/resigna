-- Migration: 0001_create_workspaces
-- Creates the workspaces table with owner-based RLS.

create table if not exists workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table workspaces enable row level security;

create policy "owner_full_access" on workspaces
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Auto-update updated_at on row change
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_updated_at
  before update on workspaces
  for each row execute function update_updated_at_column();
