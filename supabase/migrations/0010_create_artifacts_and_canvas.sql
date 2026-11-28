-- Migration: 0010_create_artifacts_and_canvas
-- Artifacts (personas, journey maps, reports...) that stay connected to the
-- research they came from (Product Vision 7.10), and the canvas layout for the
-- FigJam-style Knowledge Workspace with two-way FigJam/Figma sync (roadmap D12).

-- Artifacts ------------------------------------------------------------------
-- A stable handle; each generation or edit is an append-only version.

create table if not exists artifacts (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  study_id            uuid,
  artifact_type       text not null check (artifact_type in (
                        'persona', 'journey_map', 'report', 'summary', 'opportunity_map',
                        'affinity_map', 'presentation'
                      )),
  title               text not null check (char_length(title) between 1 and 200),
  status              text not null default 'draft' check (status in (
                        'draft', 'generating', 'in_review', 'published', 'failed', 'archived'
                      )),
  current_version_id  uuid,
  published_by        uuid references auth.users(id) on delete set null,
  published_at        timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (id, project_id),
  foreign key (study_id, project_id)
    references studies(id, project_id) on delete set null (study_id),
  -- AI never publishes on its own: publishing records a person and a time.
  check (status <> 'published' or published_at is not null)
);

create table if not exists artifact_versions (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null,
  artifact_id     uuid not null,
  version         integer not null check (version > 0),
  content         jsonb not null check (jsonb_typeof(content) = 'object'),
  content_schema  integer not null default 1,
  origin          text not null check (origin in ('human', 'ai', 'import')),
  ai_run_id       uuid,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (id, project_id),
  unique (id, artifact_id),
  unique (artifact_id, version),
  foreign key (artifact_id, project_id)
    references artifacts(id, project_id) on delete cascade
);

-- The current version must belong to this artifact.
alter table artifacts
  add constraint artifacts_current_version_fk
  foreign key (current_version_id, id) references artifact_versions(id, artifact_id)
  on delete set null (current_version_id);

-- Versions are append-only.
create or replace function prevent_artifact_version_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'artifact_versions are append-only; insert a new version instead'
    using errcode = 'check_violation';
end;
$$;

create trigger artifact_versions_append_only
  before update on artifact_versions
  for each row execute function prevent_artifact_version_update();

-- What each claim inside a version rests on. claim_path is a JSON Pointer into
-- artifact_versions.content (e.g. "/pain_points/2"). A row must cite something
-- when created; if the cited row is deleted later the reference becomes null
-- rather than rewriting history, and the UI flags the claim as unsupported.

create table if not exists artifact_citations (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null,
  version_id      uuid not null,
  claim_path      text not null check (claim_path = '' or claim_path like '/%'),
  insight_id      uuid,
  theme_id        uuid,
  observation_id  uuid,
  evidence_id     uuid,
  opportunity_id  uuid,
  created_at      timestamptz not null default now(),
  foreign key (version_id, project_id)
    references artifact_versions(id, project_id) on delete cascade,
  foreign key (insight_id, project_id)
    references insights(id, project_id) on delete set null (insight_id),
  foreign key (theme_id, project_id)
    references themes(id, project_id) on delete set null (theme_id),
  foreign key (observation_id, project_id)
    references observations(id, project_id) on delete set null (observation_id),
  foreign key (evidence_id, project_id)
    references evidence(id, project_id) on delete set null (evidence_id),
  foreign key (opportunity_id, project_id)
    references opportunities(id, project_id) on delete set null (opportunity_id)
);

create or replace function require_artifact_citation_target()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if num_nonnulls(new.insight_id, new.theme_id, new.observation_id, new.evidence_id, new.opportunity_id) = 0 then
    raise exception 'artifact_citations must cite an insight, theme, observation, evidence or opportunity'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger artifact_citations_require_target
  before insert on artifact_citations
  for each row execute function require_artifact_citation_target();

-- Canvas ---------------------------------------------------------------------
-- A canvas is a board of cards for a project or one study. It can be linked to
-- a FigJam or Figma file for two-way sync (D12).

create table if not exists canvases (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  study_id            uuid,
  name                text not null check (char_length(name) between 1 and 200),
  kind                text not null default 'workspace' check (kind in ('workspace', 'affinity_map')),
  external_tool       text check (external_tool is null or external_tool in ('figjam', 'figma')),
  external_file_key   text,
  last_synced_at      timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (id, project_id),
  foreign key (study_id, project_id)
    references studies(id, project_id) on delete set null (study_id),
  check ((external_tool is null) = (external_file_key is null))
);

-- One card on a canvas: where it sits and what it shows. Layout only; which
-- observations a theme groups lives in theme_observations, so moving a card
-- into a theme's frame is a theme_observations write plus a node move.
-- A card shows exactly one piece of knowledge, or is a free sticky note.
-- Deleting the knowledge removes its card. external_node_id and sync_version
-- let the FigJam/Figma plugin reconcile edits made on either side.

create table if not exists canvas_nodes (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null,
  canvas_id         uuid not null,
  node_type         text not null check (node_type in (
                      'evidence', 'observation', 'theme', 'insight', 'opportunity', 'note'
                    )),
  evidence_id       uuid,
  observation_id    uuid,
  theme_id          uuid,
  insight_id        uuid,
  opportunity_id    uuid,
  note_text         text check (note_text is null or char_length(note_text) <= 2000),
  x                 double precision not null default 0,
  y                 double precision not null default 0,
  width             double precision check (width is null or width > 0),
  height            double precision check (height is null or height > 0),
  z_index           integer not null default 0,
  color             text,
  external_node_id  text,
  sync_version      integer not null default 1 check (sync_version > 0),
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  foreign key (canvas_id, project_id) references canvases(id, project_id) on delete cascade,
  foreign key (evidence_id, project_id) references evidence(id, project_id) on delete cascade,
  foreign key (observation_id, project_id) references observations(id, project_id) on delete cascade,
  foreign key (theme_id, project_id) references themes(id, project_id) on delete cascade,
  foreign key (insight_id, project_id) references insights(id, project_id) on delete cascade,
  foreign key (opportunity_id, project_id) references opportunities(id, project_id) on delete cascade,
  unique (canvas_id, external_node_id),
  check (num_nonnulls(evidence_id, observation_id, theme_id, insight_id, opportunity_id)
         = case when node_type = 'note' then 0 else 1 end),
  check (node_type <> 'note' or note_text is not null),
  check (node_type <> 'evidence' or evidence_id is not null),
  check (node_type <> 'observation' or observation_id is not null),
  check (node_type <> 'theme' or theme_id is not null),
  check (node_type <> 'insight' or insight_id is not null),
  check (node_type <> 'opportunity' or opportunity_id is not null)
);

-- RLS, triggers, indexes -----------------------------------------------------

select km_enable_project_rls(t) from unnest(array[
  'artifacts', 'artifact_versions', 'artifact_citations', 'canvases', 'canvas_nodes'
]::regclass[]) t;

select km_add_updated_at_trigger(t) from unnest(array[
  'artifacts', 'canvases', 'canvas_nodes'
]::regclass[]) t;

create index if not exists artifacts_project_id_idx on artifacts (project_id, artifact_type, updated_at desc);
create index if not exists artifact_citations_version_claim_idx on artifact_citations (version_id, project_id, claim_path);

select km_index_foreign_keys(t) from unnest(array[
  'artifacts', 'artifact_versions', 'artifact_citations', 'canvases', 'canvas_nodes'
]::regclass[]) t;
