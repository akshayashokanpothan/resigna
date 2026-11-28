-- Migration: 0008_create_evidence_and_observations
-- Layer 2, Organize: evidence (verbatim, never edited) and observations
-- (something noticed in the data, not yet an insight).

-- Evidence -------------------------------------------------------------------
-- A specific excerpt, response or data point from a source (Product Vision
-- 7.6). Evidence is original research: it is never edited, only deleted
-- (guardrail 1). Position is a character offset into the source's
-- content_text, counted in Unicode code points (convert from JS UTF-16 indexes
-- in the app). When a position is given, the text must be exactly that span of
-- the source, so neither a person nor the AI can invent a quote (guardrail 10).

create table if not exists evidence (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  source_id           uuid not null,
  participant_id      uuid,
  evidence_type       text not null default 'quote' check (evidence_type in (
                        'quote', 'excerpt', 'response', 'data_point', 'field_note'
                      )),
  content             text not null check (char_length(content) between 1 and 10000),
  start_offset        integer check (start_offset is null or start_offset >= 0),
  end_offset          integer,
  start_ms            integer check (start_ms is null or start_ms >= 0),
  end_ms              integer,
  page_number         integer check (page_number is null or page_number > 0),
  speaker             text,
  origin              text not null default 'human' check (origin in ('human', 'ai', 'import')),
  validation_status   text not null default 'accepted' check (validation_status in (
                        'draft', 'suggested', 'accepted', 'rejected'
                      )),
  ai_rationale        text,
  ai_run_id           uuid,
  reviewed_by         uuid references auth.users(id) on delete set null,
  reviewed_at         timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  search              tsvector generated always as (to_tsvector('english', content)) stored,
  unique (id, project_id),
  foreign key (source_id, project_id)
    references research_sources(id, project_id) on delete cascade,
  foreign key (participant_id, project_id)
    references participants(id, project_id) on delete set null (participant_id),
  check ((start_offset is null) = (end_offset is null)),
  check (end_offset is null or end_offset > start_offset),
  check (end_ms is null or (start_ms is not null and end_ms >= start_ms)),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

-- Evidence with a position must match the source text exactly.
create or replace function require_verbatim_evidence()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  source_text text;
begin
  if new.start_offset is null then
    return new;
  end if;

  select s.content_text into source_text
  from public.research_sources s
  where s.id = new.source_id;

  if source_text is null
     or substr(source_text, new.start_offset + 1, new.end_offset - new.start_offset) is distinct from new.content then
    raise exception 'evidence text must match the source text at the given position'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger evidence_verbatim
  before insert on evidence
  for each row execute function require_verbatim_evidence();

-- What makes evidence evidence can't change after creation. Review fields,
-- speaker and participant can (to correct attribution).
create or replace function prevent_evidence_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.content is distinct from old.content
     or new.source_id is distinct from old.source_id
     or new.evidence_type is distinct from old.evidence_type
     or new.start_offset is distinct from old.start_offset
     or new.end_offset is distinct from old.end_offset
     or new.origin is distinct from old.origin then
    raise exception 'evidence is original research and cannot be edited; delete and re-create instead'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger evidence_immutable
  before update on evidence
  for each row execute function prevent_evidence_change();

-- A source's text can't change while evidence points into it.
create or replace function prevent_evidenced_source_text_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.content_text is distinct from old.content_text
     and exists (select 1 from public.evidence where source_id = old.id) then
    raise exception 'research source text is referenced by evidence and cannot change'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger research_sources_text_locked
  before update of content_text on research_sources
  for each row execute function prevent_evidenced_source_text_change();

-- Observations ---------------------------------------------------------------
-- Something noticed in the data, in a researcher's or the AI's words (7.7).
-- Not a validated insight. Grounded in evidence through evidence_links (0009).

create table if not exists observations (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  study_id            uuid,
  kind                text check (kind is null or kind in (
                        'behaviour', 'pain_point', 'need', 'goal', 'motivation',
                        'expectation', 'other'
                      )),
  content             text not null check (char_length(content) between 1 and 2000),
  origin              text not null default 'human' check (origin in ('human', 'ai', 'import')),
  validation_status   text not null default 'accepted' check (validation_status in (
                        'draft', 'suggested', 'accepted', 'rejected'
                      )),
  ai_rationale        text,
  ai_run_id           uuid,
  ai_original         jsonb,
  reviewed_by         uuid references auth.users(id) on delete set null,
  reviewed_at         timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  search              tsvector generated always as (to_tsvector('english', content)) stored,
  unique (id, project_id),
  foreign key (study_id, project_id)
    references studies(id, project_id) on delete set null (study_id),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

-- RLS, triggers, indexes -----------------------------------------------------

select km_enable_project_rls(t) from unnest(array['evidence', 'observations']::regclass[]) t;
select km_add_updated_at_trigger(t) from unnest(array['evidence', 'observations']::regclass[]) t;

create index if not exists evidence_source_id_idx on evidence (source_id, project_id, start_offset);
create index if not exists evidence_search_idx on evidence using gin (search);
create index if not exists observations_project_id_idx on observations (project_id, created_at desc);
create index if not exists observations_search_idx on observations using gin (search);

select km_index_foreign_keys(t) from unnest(array['evidence', 'observations']::regclass[]) t;
