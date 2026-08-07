-- Migration: 0003_create_projects
-- Projects table scoped to workspaces.

create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  name          text not null,
  description   text,
  status        text not null default 'active' check (status in ('active', 'archived')),
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table projects enable row level security;

-- Members of a workspace can access its projects
create policy "workspace_member_access" on projects
  for all
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = projects.workspace_id
        and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspace_members
      where workspace_id = projects.workspace_id
        and user_id = auth.uid()
    )
  );

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at_column();

-- Indexes for common query patterns
create index if not exists projects_workspace_id_idx on projects (workspace_id);
create index if not exists projects_updated_at_idx on projects (updated_at desc);
