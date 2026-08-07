-- Migration: 0002_create_workspace_members
-- Workspace membership with roles.

create table if not exists workspace_members (
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at     timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table workspace_members enable row level security;

create policy "member_can_view_own_membership" on workspace_members
  for select
  using (auth.uid() = user_id);

create policy "owner_can_manage_members" on workspace_members
  for all
  using (
    exists (
      select 1 from workspaces
      where id = workspace_members.workspace_id
        and owner_id = auth.uid()
    )
  );
