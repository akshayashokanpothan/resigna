-- Migration: 0006_knowledge_access_helpers
-- Shared RLS helper for every Knowledge Model table.
--
-- Every Knowledge Model table carries a project_id, so a single helper decides
-- access: the caller must be a member of the project's workspace. The function
-- is security definer so it can read projects and workspace_members without
-- tripping their own RLS policies (and without policy recursion).
-- Follows the conventions of 0005_security_rls_fixes: empty search_path with
-- schema-qualified names, and auth.uid() wrapped in a select.

create or replace function is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members m on m.workspace_id = p.workspace_id
    where p.id = p_project_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function is_project_member(uuid) from public, anon;
grant execute on function is_project_member(uuid) to authenticated;

