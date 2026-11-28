-- Migration: 0008_create_knowledge_items
-- The Knowledge Model core: verbatim source quotes (evidence) and knowledge
-- items (normalized, editable statements), linked many-to-many.
-- This is the only data modules/ai may read (ADR-0003).

-- Source quotes --------------------------------------------------------------
-- An exact excerpt of a research source with its position. Quotes are evidence:
-- the text is never edited after creation, only deleted.
-- Position: character offsets into research_sources.content_text (always),
-- plus optional media timestamps and page number for display and deep links.

create table if not exists source_quotes (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null,
  source_id       uuid not null,
  session_id      uuid not null,
  participant_id  uuid,
  speaker         text,
  quote_text      text not null check (char_length(quote_text) > 0),
  start_offset    integer check (start_offset is null or start_offset >= 0),
  end_offset      integer,
  start_ms        integer check (start_ms is null or start_ms >= 0),
  end_ms          integer,
  page_number     integer check (page_number is null or page_number > 0),
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (id, project_id),
  foreign key (project_id) references projects(id) on delete cascade,
  foreign key (source_id, project_id)
    references research_sources(id, project_id) on delete cascade,
  foreign key (session_id, project_id)
    references research_sessions(id, project_id) on delete cascade,
  foreign key (participant_id, project_id)
    references participants(id, project_id) on delete set null (participant_id),
  check ((start_offset is null) = (end_offset is null)),
  check (end_offset is null or end_offset > start_offset),
  check (end_ms is null or (start_ms is not null and end_ms >= start_ms))
);

create or replace function prevent_source_quote_text_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.quote_text is distinct from old.quote_text
     or new.source_id is distinct from old.source_id
     or new.start_offset is distinct from old.start_offset
     or new.end_offset is distinct from old.end_offset then
    raise exception 'source_quotes are immutable evidence; delete and re-create instead'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger source_quotes_immutable
  before update on source_quotes
  for each row execute function prevent_source_quote_text_change();

-- A source's text cannot change while quotes point into it.
create or replace function prevent_quoted_source_text_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.content_text is distinct from old.content_text
     and exists (select 1 from public.source_quotes where source_id = old.id) then
    raise exception 'research source text is referenced by quotes and cannot change'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger research_sources_text_locked
  before update of content_text on research_sources
  for each row execute function prevent_quoted_source_text_change();

-- Knowledge items ------------------------------------------------------------
-- The atomic unit of the Knowledge Model. A short statement in the
-- researcher's (or normalizer's) words, typed, reviewable, backed by quotes.

create table if not exists knowledge_items (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  session_id      uuid,
  participant_id  uuid,
  item_type       text not null check (item_type in (
                    'observation', 'pain_point', 'need', 'goal', 'behaviour',
                    'motivation', 'quote', 'insight'
                  )),
  content         text not null check (char_length(content) between 1 and 2000),
  origin          text not null default 'manual' check (origin in ('normalizer', 'ai', 'manual')),
  review_status   text not null default 'unreviewed' check (review_status in (
                    'unreviewed', 'accepted', 'rejected'
                  )),
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  search          tsvector generated always as (to_tsvector('english', content)) stored,
  unique (id, project_id),
  foreign key (session_id, project_id)
    references research_sessions(id, project_id) on delete set null (session_id),
  foreign key (participant_id, project_id)
    references participants(id, project_id) on delete set null (participant_id)
);

-- Evidence: which quotes support which item. An item may cite many quotes
-- (an insight across participants); a quote may support many items.

create table if not exists knowledge_item_evidence (
  item_id     uuid not null,
  quote_id    uuid not null,
  project_id  uuid not null,
  created_at  timestamptz not null default now(),
  primary key (item_id, quote_id),
  foreign key (item_id, project_id)
    references knowledge_items(id, project_id) on delete cascade,
  foreign key (quote_id, project_id)
    references source_quotes(id, project_id) on delete cascade
);

-- RLS ------------------------------------------------------------------------

alter table source_quotes enable row level security;
alter table knowledge_items enable row level security;
alter table knowledge_item_evidence enable row level security;

create policy "project_member_access" on source_quotes
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on knowledge_items
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on knowledge_item_evidence
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

create trigger knowledge_items_updated_at
  before update on knowledge_items
  for each row execute function update_updated_at_column();

-- Indexes --------------------------------------------------------------------
-- Every foreign key has an index whose leading columns match it (advisor 0001).

create index if not exists source_quotes_source_id_idx on source_quotes (source_id, project_id, start_offset);
create index if not exists source_quotes_session_id_idx on source_quotes (session_id, project_id);
create index if not exists source_quotes_participant_id_idx on source_quotes (participant_id, project_id);
create index if not exists source_quotes_project_id_idx on source_quotes (project_id);
create index if not exists source_quotes_created_by_idx on source_quotes (created_by);
create index if not exists knowledge_items_project_id_idx on knowledge_items (project_id, created_at desc);
create index if not exists knowledge_items_session_id_idx on knowledge_items (session_id, project_id);
create index if not exists knowledge_items_participant_id_idx on knowledge_items (participant_id, project_id);
create index if not exists knowledge_items_created_by_idx on knowledge_items (created_by);
create index if not exists knowledge_items_reviewed_by_idx on knowledge_items (reviewed_by);
create index if not exists knowledge_items_search_idx on knowledge_items using gin (search);
create index if not exists knowledge_item_evidence_item_id_idx on knowledge_item_evidence (item_id, project_id);
create index if not exists knowledge_item_evidence_quote_id_idx on knowledge_item_evidence (quote_id, project_id);
