-- Migration: 0006_knowledge_access_helpers
-- Shared helpers for every Knowledge Model table (0007–0010).
-- Follows the conventions of 0005_security_rls_fixes: empty search_path with
-- schema-qualified names, and auth.uid() wrapped in a select.

-- Access ---------------------------------------------------------------------
-- Every Knowledge Model table carries a project_id, so one helper decides
-- access: the caller must be a member of the project's workspace. Security
-- definer so it can read projects and workspace_members without tripping their
-- own RLS policies (and without policy recursion).

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

-- Migration utilities --------------------------------------------------------
-- Used by 0007–0010 so every table gets the same policy, updated_at trigger and
-- foreign-key indexes. Not callable through the API.

-- One policy: workspace members of the row's project can read and write it.
create or replace function km_enable_project_rls(p_table regclass)
returns void
language plpgsql
set search_path = ''
as $$
begin
  execute format('alter table %s enable row level security', p_table);
  execute format(
    'create policy "project_member_access" on %s for all to authenticated '
    'using (public.is_project_member(project_id)) '
    'with check (public.is_project_member(project_id))',
    p_table
  );
end;
$$;

-- Keeps updated_at current (function from 0001).
create or replace function km_add_updated_at_trigger(p_table regclass)
returns void
language plpgsql
set search_path = ''
as $$
begin
  execute format(
    'create trigger %I before update on %s for each row execute function public.update_updated_at_column()',
    (select relname from pg_catalog.pg_class where oid = p_table) || '_updated_at',
    p_table
  );
end;
$$;

-- Creates an index for every foreign key on the table that has no index whose
-- leading columns match it (Supabase advisor 0001, unindexed foreign keys).
create or replace function km_index_foreign_keys(p_table regclass)
returns void
language plpgsql
set search_path = ''
as $$
declare
  fk record;
  cols text;
  col_names text;
begin
  for fk in
    select c.conkey
    from pg_catalog.pg_constraint c
    where c.conrelid = p_table and c.contype = 'f'
      and not exists (
        select 1 from pg_catalog.pg_index i
        where i.indrelid = c.conrelid
          and (i.indkey::int2[])[0:cardinality(c.conkey) - 1] = c.conkey
      )
  loop
    select string_agg(format('%I', a.attname), ', ' order by k.ord),
           string_agg(a.attname, '_' order by k.ord)
      into cols, col_names
    from unnest(fk.conkey) with ordinality as k(attnum, ord)
    join pg_catalog.pg_attribute a on a.attrelid = p_table and a.attnum = k.attnum;

    execute format(
      'create index if not exists %I on %s (%s)',
      left((select relname from pg_catalog.pg_class where oid = p_table) || '_' || col_names, 59) || '_idx',
      p_table,
      cols
    );
  end loop;
end;
$$;

revoke all on function km_enable_project_rls(regclass) from public, anon, authenticated;
revoke all on function km_add_updated_at_trigger(regclass) from public, anon, authenticated;
revoke all on function km_index_foreign_keys(regclass) from public, anon, authenticated;

-- Shared vocabulary ----------------------------------------------------------
-- Every table that AI can write to carries the same review columns:
--
--   origin             human | ai | import
--   validation_status  draft | suggested | accepted | rejected
--   ai_rationale       why the AI suggested it (required when origin = 'ai')
--   ai_run_id          the AI run that produced it (FK added with ai_runs)
--   ai_original        the AI's original fields, kept when a person edits it
--   reviewed_by/at     who accepted or rejected it, and when
--
-- An AI row can only be accepted with a review time: AI never finalizes
-- research on its own (Product Vision section 9).
