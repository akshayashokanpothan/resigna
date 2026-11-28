-- Migration: 0007_create_studies_and_sources
-- Layer 1, Collect: studies, participants (with consent) and research sources.
-- Owned by modules/research.

-- Studies --------------------------------------------------------------------
-- A defined research activity within a project (Product Vision 7.3).

create table if not exists studies (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  title               text not null check (char_length(title) between 1 and 200),
  goal                text check (goal is null or char_length(goal) <= 2000),
  research_questions  text[] not null default '{}',
  methods             text[] not null default '{}' check (methods <@ array[
                        'interview', 'survey', 'usability_test', 'observation',
                        'diary', 'desk_research', 'other'
                      ]::text[]),
  status              text not null default 'planned' check (status in (
                        'planned', 'active', 'completed', 'archived'
                      )),
  starts_on           date,
  ends_on             date,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (id, project_id),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

-- Participants ---------------------------------------------------------------
-- A person in the project's research (7.5). Pseudonymous by default: label is
-- a code such as "P04"; attributes hold profile facts (role, segment, age band)
-- that Personas group on. Consent is tracked from the start (guardrail 8).

create table if not exists participants (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references projects(id) on delete cascade,
  label                 text not null check (char_length(label) between 1 and 100),
  attributes            jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  consent_status        text not null default 'pending' check (consent_status in (
                          'pending', 'granted', 'limited', 'withdrawn'
                        )),
  consent_recorded_at   timestamptz,
  consent_notes         text,
  created_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (id, project_id),
  unique (project_id, label),
  check (consent_status = 'pending' or consent_recorded_at is not null)
);

-- Which participants took part in which studies (participation history).
create table if not exists study_participants (
  study_id        uuid not null,
  participant_id  uuid not null,
  project_id      uuid not null,
  created_at      timestamptz not null default now(),
  primary key (study_id, participant_id),
  foreign key (study_id, project_id) references studies(id, project_id) on delete cascade,
  foreign key (participant_id, project_id) references participants(id, project_id) on delete cascade
);

-- Research sources -----------------------------------------------------------
-- An original input that findings trace back to (7.4): one interview
-- transcript, recording, document, survey export, set of notes and so on.
-- content_text is the extracted plain text that evidence points into by
-- character offset, so it can't change once evidence exists (see 0008).

create table if not exists research_sources (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  study_id            uuid not null,
  participant_id      uuid,
  title               text not null check (char_length(title) between 1 and 200),
  source_type         text not null check (source_type in (
                        'interview_transcript', 'recording', 'document', 'notes',
                        'survey_response', 'feedback', 'support_ticket',
                        'spreadsheet', 'observation', 'other'
                      )),
  conducted_at        date,
  input_method        text not null check (input_method in ('file', 'paste')),
  storage_path        text,
  original_filename   text,
  mime_type           text,
  size_bytes          bigint check (size_bytes is null or size_bytes >= 0),
  content_text        text,
  content_sha256      text,
  is_sensitive        boolean not null default false,
  normalizer          text,
  normalizer_version  text,
  status              text not null default 'pending' check (status in (
                        'pending', 'extracting', 'normalizing', 'ready', 'failed'
                      )),
  error_message       text,
  normalized_at       timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (id, project_id),
  foreign key (study_id, project_id) references studies(id, project_id) on delete cascade,
  foreign key (participant_id, project_id)
    references participants(id, project_id) on delete set null (participant_id),
  check (input_method <> 'file' or storage_path is not null),
  check (input_method <> 'paste' or content_text is not null)
);

-- RLS, triggers, indexes -----------------------------------------------------

select km_enable_project_rls(t) from unnest(array[
  'studies', 'participants', 'study_participants', 'research_sources'
]::regclass[]) t;

select km_add_updated_at_trigger(t) from unnest(array[
  'studies', 'participants', 'research_sources'
]::regclass[]) t;

create index if not exists studies_project_id_idx on studies (project_id, created_at desc);
create index if not exists research_sources_study_id_idx on research_sources (study_id, project_id, created_at desc);

select km_index_foreign_keys(t) from unnest(array[
  'studies', 'participants', 'study_participants', 'research_sources'
]::regclass[]) t;

-- Storage --------------------------------------------------------------------
-- Private bucket for uploaded research files. Object paths must start with the
-- project id: "<project_id>/<source_id>/<filename>".

insert into storage.buckets (id, name, public)
values ('research-sources', 'research-sources', false)
on conflict (id) do nothing;

create or replace function storage_path_project_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return split_part(object_name, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create policy "research_sources_member_access" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'research-sources'
    and public.is_project_member(public.storage_path_project_id(name))
  )
  with check (
    bucket_id = 'research-sources'
    and public.is_project_member(public.storage_path_project_id(name))
  );
