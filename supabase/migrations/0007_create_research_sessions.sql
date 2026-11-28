-- Migration: 0007_create_research_sessions
-- Research input: participants, sessions and their raw sources.
-- Owned by modules/research. Nothing here is read by modules/ai directly.

-- Participants ---------------------------------------------------------------
-- A person who took part in research. Kept per project, pseudonymous by
-- default (label such as "P3"); attributes hold free-form profile facts
-- (role, segment, age band) that Personas group on.

create table if not exists participants (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  label         text not null check (char_length(label) between 1 and 100),
  attributes    jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, project_id),
  unique (project_id, label)
);

-- Research sessions ----------------------------------------------------------
-- One interview, survey batch, observation, usability test or document.

create table if not exists research_sessions (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 200),
  session_type    text not null check (session_type in (
                    'interview', 'survey', 'observation', 'usability_test', 'document', 'notes'
                  )),
  participant_id  uuid,
  conducted_at    date,
  status          text not null default 'draft' check (status in (
                    'draft', 'processing', 'ready', 'failed'
                  )),
  notes           text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, project_id),
  foreign key (participant_id, project_id)
    references participants(id, project_id) on delete set null (participant_id)
);

-- Research sources -----------------------------------------------------------
-- The raw material for a session: an uploaded file (in Storage) or pasted text.
-- content_text is the extracted plain text that source quotes point into via
-- character offsets, so it must not change once quotes exist (see trigger).

create table if not exists research_sources (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null,
  session_id          uuid not null,
  source_kind         text not null check (source_kind in ('file', 'paste')),
  storage_path        text,
  original_filename   text,
  mime_type           text,
  size_bytes          bigint check (size_bytes is null or size_bytes >= 0),
  content_text        text,
  content_sha256      text,
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
  foreign key (session_id, project_id)
    references research_sessions(id, project_id) on delete cascade,
  foreign key (project_id) references projects(id) on delete cascade,
  check (source_kind <> 'file' or storage_path is not null),
  check (source_kind <> 'paste' or content_text is not null)
);

-- RLS ------------------------------------------------------------------------

alter table participants enable row level security;
alter table research_sessions enable row level security;
alter table research_sources enable row level security;

create policy "project_member_access" on participants
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on research_sessions
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on research_sources
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

-- Triggers -------------------------------------------------------------------

create trigger participants_updated_at
  before update on participants
  for each row execute function update_updated_at_column();
create trigger research_sessions_updated_at
  before update on research_sessions
  for each row execute function update_updated_at_column();
create trigger research_sources_updated_at
  before update on research_sources
  for each row execute function update_updated_at_column();

-- Indexes --------------------------------------------------------------------
-- Every foreign key has an index whose leading columns match it (advisor 0001).

create index if not exists participants_project_id_idx on participants (project_id);
create index if not exists participants_created_by_idx on participants (created_by);
create index if not exists research_sessions_project_id_idx on research_sessions (project_id, created_at desc);
create index if not exists research_sessions_participant_id_idx on research_sessions (participant_id, project_id);
create index if not exists research_sessions_created_by_idx on research_sessions (created_by);
create index if not exists research_sources_session_id_idx on research_sources (session_id, project_id);
create index if not exists research_sources_project_id_idx on research_sources (project_id);
create index if not exists research_sources_created_by_idx on research_sources (created_by);

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
