-- Migration: 0005_security_rls_fixes
-- Applied by hand to the live project on 26 Nov 2026. Kept here so the repo matches the database.

begin;

-- 1. SECURITY: handle_new_user() is SECURITY DEFINER and callable by anyone via /rest/v1/rpc/handle_new_user.
--    The signup trigger still works after this; only direct API calls are blocked.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. SECURITY: pin search_path on the updated_at helper (advisor 0011).
alter function public.update_updated_at_column() set search_path = '';

-- 3. BUG: slug regex ran before lower(), dropping every capital letter
--    ("Akshay Ashokan Pothan's Workspace" -> "kshay-shokan-othan-s-orkspace").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_name text;
  workspace_slug text;
  new_workspace_id uuid;
begin
  if new.raw_user_meta_data->>'name' is not null and new.raw_user_meta_data->>'name' != '' then
    workspace_name := (new.raw_user_meta_data->>'name') || '''s Workspace';
  else
    workspace_name := initcap(regexp_replace(split_part(new.email, '@', 1), '[._-]', ' ', 'g')) || '''s Workspace';
  end if;

  workspace_slug := trim(both '-' from regexp_replace(lower(workspace_name), '[^a-z0-9]+', '-', 'g'));

  if exists (select 1 from workspaces where slug = workspace_slug) then
    workspace_slug := workspace_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  end if;

  insert into workspaces (name, slug, owner_id)
  values (workspace_name, workspace_slug, new.id)
  returning id into new_workspace_id;

  insert into workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$;
-- create or replace keeps grants, but re-apply the revoke to be sure.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Fix the slug already stored for existing workspaces.
update public.workspaces
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
where slug <> trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
  and not exists (
    select 1 from public.workspaces w2
    where w2.slug = trim(both '-' from regexp_replace(lower(public.workspaces.name), '[^a-z0-9]+', '-', 'g'))
  );

-- 4. PERFORMANCE: evaluate auth.uid() once per query, not once per row (advisor 0003),
--    and stop the owner policy overlapping SELECT with the member policy (advisor 0006).
drop policy if exists "owner_full_access" on public.workspaces;
create policy "owner_full_access" on public.workspaces
  for all
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "member_can_view_own_membership" on public.workspace_members;
drop policy if exists "owner_can_manage_members" on public.workspace_members;
drop policy if exists "members_select" on public.workspace_members;
drop policy if exists "owner_insert_members" on public.workspace_members;
drop policy if exists "owner_update_members" on public.workspace_members;
drop policy if exists "owner_delete_members" on public.workspace_members;
create policy "members_select" on public.workspace_members
  for select
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.workspaces w where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid()))
  );
create policy "owner_insert_members" on public.workspace_members
  for insert
  with check (exists (select 1 from public.workspaces w where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())));
create policy "owner_update_members" on public.workspace_members
  for update
  using (exists (select 1 from public.workspaces w where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())));
create policy "owner_delete_members" on public.workspace_members
  for delete
  using (exists (select 1 from public.workspaces w where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())));

drop policy if exists "workspace_member_access" on public.projects;
create policy "workspace_member_access" on public.projects
  for all
  using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = (select auth.uid())))
  with check (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = (select auth.uid())));

-- 5. PERFORMANCE: index foreign keys (advisor 0001).
create index if not exists workspaces_owner_id_idx on public.workspaces (owner_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);
create index if not exists projects_created_by_idx on public.projects (created_by);

commit;
