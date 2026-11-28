-- Migration: 0011_research_workspace_functions
-- Two functions for the research workspace (roadmap Phase 2).

-- Purge a participant ---------------------------------------------------------
-- "Delete a participant and all their data" (roadmap Phase 2, consent choice
-- of 28 Nov 2026: rows are kept while consent is withdrawn, and purged on
-- request). Removing a participant row on its own only unlinks their sources
-- and evidence (on delete set null), so this function deletes, in one
-- transaction:
--   1. every research source linked to the participant (their evidence and
--      everything that cascades from it goes with it),
--   2. evidence attributed to the participant in other sources (for example a
--      speaker turn in a group session),
--   3. the participant row (study_participants cascades).
-- It returns the storage paths of the deleted sources so the app can remove
-- the uploaded files from the private bucket.
--
-- Security invoker: RLS decides. A caller who isn't a member of the
-- participant's project sees no rows and gets "participant not found".

create or replace function purge_participant(p_participant_id uuid)
returns text[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_project_id uuid;
  v_paths text[];
begin
  select p.project_id into v_project_id
  from public.participants p
  where p.id = p_participant_id;

  if v_project_id is null then
    raise exception 'participant not found' using errcode = 'no_data_found';
  end if;

  select coalesce(array_agg(s.storage_path) filter (where s.storage_path is not null), '{}')
    into v_paths
  from public.research_sources s
  where s.participant_id = p_participant_id and s.project_id = v_project_id;

  delete from public.research_sources
  where participant_id = p_participant_id and project_id = v_project_id;

  delete from public.evidence
  where participant_id = p_participant_id and project_id = v_project_id;

  delete from public.participants where id = p_participant_id;

  return v_paths;
end;
$$;

revoke all on function purge_participant(uuid) from public, anon;
grant execute on function purge_participant(uuid) to authenticated;

-- Search sources ---------------------------------------------------------------
-- Basic search for the Research page: sources whose title, file name or text
-- contains the term (case-insensitive), with a short excerpt around the first
-- match in the text so the browser never downloads whole transcripts.
-- Security invoker, so RLS limits results to the caller's projects.

create or replace function search_research_sources(p_workspace_id uuid, p_term text)
returns table (
  id uuid,
  project_id uuid,
  study_id uuid,
  title text,
  source_type text,
  snippet text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with q as (
    select
      lower(btrim(p_term)) as term,
      '%' || replace(replace(replace(btrim(p_term), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select
    s.id,
    s.project_id,
    s.study_id,
    s.title,
    s.source_type,
    case
      when s.title ilike q.pattern or s.content_text is null then null
      else (
        select case when pos > 0 then
          (case when pos > 71 then '…' else '' end)
          || regexp_replace(substr(s.content_text, greatest(1, pos - 70), char_length(q.term) + 140), '\s+', ' ', 'g')
          || (case when pos + char_length(q.term) + 70 <= char_length(s.content_text) then '…' else '' end)
        end
        from (select strpos(lower(s.content_text), q.term) as pos) m
      )
    end as snippet
  from public.research_sources s
  join public.projects p on p.id = s.project_id
  cross join q
  where p.workspace_id = p_workspace_id
    and char_length(q.term) >= 2
    and (
      s.title ilike q.pattern
      or s.original_filename ilike q.pattern
      or s.content_text ilike q.pattern
    )
  order by s.updated_at desc
  limit 30;
$$;

revoke all on function search_research_sources(uuid, text) from public, anon;
grant execute on function search_research_sources(uuid, text) to authenticated;
