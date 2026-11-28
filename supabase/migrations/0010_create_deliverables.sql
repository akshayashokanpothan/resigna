-- Migration: 0010_create_deliverables
-- Generated outputs and their evidence links back into the Knowledge Model.
-- A deliverable is a stable handle; each generation or edit is an immutable
-- version. Every claim in a version can cite knowledge items and quotes.

create table if not exists deliverables (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  deliverable_type    text not null check (deliverable_type in (
                        'affinity_map', 'persona', 'journey_map', 'hmw'
                      )),
  title               text not null check (char_length(title) between 1 and 200),
  status              text not null default 'draft' check (status in (
                        'draft', 'generating', 'ready', 'failed', 'archived'
                      )),
  current_version_id  uuid,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (id, project_id)
);

create table if not exists deliverable_versions (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null,
  deliverable_id    uuid not null,
  version           integer not null check (version > 0),
  content           jsonb not null check (jsonb_typeof(content) = 'object'),
  content_schema    integer not null default 1,
  origin            text not null check (origin in ('ai', 'manual')),
  ai_run_id         uuid,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  unique (id, project_id),
  unique (id, deliverable_id),
  unique (deliverable_id, version),
  foreign key (deliverable_id, project_id)
    references deliverables(id, project_id) on delete cascade
);

-- The current version must belong to this deliverable.
alter table deliverables
  add constraint deliverables_current_version_fk
  foreign key (current_version_id, id) references deliverable_versions(id, deliverable_id)
  on delete set null (current_version_id);

-- Evidence for a claim inside a version. claim_path is a JSON Pointer into
-- deliverable_versions.content (e.g. "/pain_points/2"). Each row cites a
-- knowledge item, a quote, or both. If the cited item or quote is later
-- deleted the reference becomes null rather than rewriting history, so a row
-- with both null means "evidence removed" and the UI should flag that claim.

create table if not exists deliverable_evidence (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null,
  version_id  uuid not null,
  claim_path  text not null check (claim_path = '' or claim_path like '/%'),
  item_id     uuid,
  quote_id    uuid,
  created_at  timestamptz not null default now(),
  foreign key (version_id, project_id)
    references deliverable_versions(id, project_id) on delete cascade,
  foreign key (item_id, project_id)
    references knowledge_items(id, project_id) on delete set null (item_id),
  foreign key (quote_id, project_id)
    references source_quotes(id, project_id) on delete set null (quote_id)
);

create or replace function require_deliverable_evidence_target()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.item_id is null and new.quote_id is null then
    raise exception 'deliverable_evidence must cite a knowledge item or a source quote'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger deliverable_evidence_requires_target
  before insert on deliverable_evidence
  for each row execute function require_deliverable_evidence_target();

-- Versions are append-only.
create or replace function prevent_deliverable_version_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'deliverable_versions are append-only; insert a new version instead'
    using errcode = 'check_violation';
end;
$$;

create trigger deliverable_versions_append_only
  before update on deliverable_versions
  for each row execute function prevent_deliverable_version_update();

-- RLS ------------------------------------------------------------------------

alter table deliverables enable row level security;
alter table deliverable_versions enable row level security;
alter table deliverable_evidence enable row level security;

create policy "project_member_access" on deliverables
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on deliverable_versions
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on deliverable_evidence
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

create trigger deliverables_updated_at
  before update on deliverables
  for each row execute function update_updated_at_column();

-- Indexes --------------------------------------------------------------------
-- Every foreign key has an index whose leading columns match it (advisor 0001).

create index if not exists deliverables_project_id_idx on deliverables (project_id, deliverable_type, updated_at desc);
create index if not exists deliverables_current_version_id_idx on deliverables (current_version_id, id);
create index if not exists deliverables_created_by_idx on deliverables (created_by);
create index if not exists deliverable_versions_deliverable_id_idx on deliverable_versions (deliverable_id, project_id);
create index if not exists deliverable_versions_created_by_idx on deliverable_versions (created_by);
create index if not exists deliverable_evidence_version_id_idx on deliverable_evidence (version_id, project_id, claim_path);
create index if not exists deliverable_evidence_item_id_idx on deliverable_evidence (item_id, project_id);
create index if not exists deliverable_evidence_quote_id_idx on deliverable_evidence (quote_id, project_id);
