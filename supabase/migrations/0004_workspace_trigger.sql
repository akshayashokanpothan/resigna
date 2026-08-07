-- Migration: 0004_workspace_trigger
-- Automatically creates a default workspace when a new user signs up.
-- This runs atomically inside the auth transaction — no race conditions.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_name text;
  workspace_slug text;
  workspace_id uuid;
begin
  -- Derive workspace name from user metadata or email
  if new.raw_user_meta_data->>'name' is not null and new.raw_user_meta_data->>'name' != '' then
    workspace_name := (new.raw_user_meta_data->>'name') || '''s Workspace';
  else
    -- Extract and humanize local part of email
    workspace_name := initcap(regexp_replace(
      split_part(new.email, '@', 1),
      '[._-]', ' ', 'g'
    )) || '''s Workspace';
  end if;

  workspace_slug := lower(regexp_replace(workspace_name, '[^a-z0-9]+', '-', 'g'));
  -- Trim leading/trailing hyphens
  workspace_slug := trim(both '-' from workspace_slug);

  -- Ensure slug uniqueness
  if exists (select 1 from workspaces where slug = workspace_slug) then
    workspace_slug := workspace_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  end if;

  -- Create the workspace
  insert into workspaces (name, slug, owner_id)
  values (workspace_name, workspace_slug, new.id)
  returning id into workspace_id;

  -- Add the user as owner member
  insert into workspace_members (workspace_id, user_id, role)
  values (workspace_id, new.id, 'owner');

  return new;
end;
$$;

-- Attach trigger to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
