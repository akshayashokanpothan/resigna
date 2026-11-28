-- Migration: 0009_create_synthesis_layers
-- Layers 3–5, Analyze → Understand → Act: themes, insights, opportunities and
-- decisions, plus the links that keep them traceable to evidence, and tags.
-- Each layer is its own table so the interface can always tell source data,
-- observations, AI suggestions, validated findings and decisions apart
-- (Product Vision guardrail 12).

-- Themes ---------------------------------------------------------------------
-- A recurring pattern across observations (7.8). Reviewable and editable.

create table if not exists themes (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  study_id            uuid,
  name                text not null check (char_length(name) between 1 and 200),
  description         text check (description is null or char_length(description) <= 2000),
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
  unique (id, project_id),
  foreign key (study_id, project_id)
    references studies(id, project_id) on delete set null (study_id),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

-- Which observations a theme groups. An observation can sit in several themes
-- (decided 28 Nov 2026). AI can suggest a grouping; a person accepts it.
create table if not exists theme_observations (
  theme_id            uuid not null,
  observation_id      uuid not null,
  project_id          uuid not null,
  position            integer not null default 0,
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
  primary key (theme_id, observation_id),
  foreign key (theme_id, project_id) references themes(id, project_id) on delete cascade,
  foreign key (observation_id, project_id) references observations(id, project_id) on delete cascade,
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

-- Insights -------------------------------------------------------------------
-- An interpreted finding (7.9). Empty study_id means a cross-study insight.
-- Starts as draft (people) or suggested (AI); accepting needs evidence (below).
-- Confidence is a level with a written basis, never a bare score (guardrail 7).

create table if not exists insights (
  id                            uuid primary key default gen_random_uuid(),
  project_id                    uuid not null references projects(id) on delete cascade,
  study_id                      uuid,
  statement                     text not null check (char_length(statement) between 1 and 1000),
  description                   text check (description is null or char_length(description) <= 5000),
  confidence                    text check (confidence is null or confidence in ('low', 'medium', 'high')),
  confidence_basis              text,
  evidence_unavailable_reason   text,
  origin                        text not null default 'human' check (origin in ('human', 'ai', 'import')),
  validation_status             text not null default 'draft' check (validation_status in (
                                  'draft', 'suggested', 'accepted', 'rejected'
                                )),
  ai_rationale                  text,
  ai_run_id                     uuid,
  ai_original                   jsonb,
  reviewed_by                   uuid references auth.users(id) on delete set null,
  reviewed_at                   timestamptz,
  created_by                    uuid references auth.users(id) on delete set null,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  search                        tsvector generated always as (
                                  to_tsvector('english', statement || ' ' || coalesce(description, ''))
                                ) stored,
  unique (id, project_id),
  foreign key (study_id, project_id)
    references studies(id, project_id) on delete set null (study_id),
  check (confidence is null or confidence_basis is not null),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

create table if not exists insight_themes (
  insight_id  uuid not null,
  theme_id    uuid not null,
  project_id  uuid not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (insight_id, theme_id),
  foreign key (insight_id, project_id) references insights(id, project_id) on delete cascade,
  foreign key (theme_id, project_id) references themes(id, project_id) on delete cascade
);

-- Opportunities --------------------------------------------------------------
-- Layer 5: design opportunities, how-might-we statements, recommendations,
-- hypotheses and prioritized problems.

create table if not exists opportunities (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  kind                text not null default 'opportunity' check (kind in (
                        'opportunity', 'how_might_we', 'recommendation', 'hypothesis', 'problem'
                      )),
  title               text not null check (char_length(title) between 1 and 500),
  description         text check (description is null or char_length(description) <= 5000),
  priority            text check (priority is null or priority in ('now', 'next', 'later')),
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
  unique (id, project_id),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

create table if not exists opportunity_insights (
  opportunity_id  uuid not null,
  insight_id      uuid not null,
  project_id      uuid not null,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  primary key (opportunity_id, insight_id),
  foreign key (opportunity_id, project_id) references opportunities(id, project_id) on delete cascade,
  foreign key (insight_id, project_id) references insights(id, project_id) on delete cascade
);

-- Decisions ------------------------------------------------------------------
-- A product or design decision and what it rests on. Made by people only, so
-- no AI review columns.

create table if not exists decisions (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 500),
  rationale       text,
  status          text not null default 'proposed' check (status in (
                    'proposed', 'accepted', 'rejected', 'superseded'
                  )),
  decided_by      uuid references auth.users(id) on delete set null,
  decided_at      timestamptz,
  superseded_by   uuid,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, project_id),
  foreign key (superseded_by, project_id)
    references decisions(id, project_id) on delete set null (superseded_by),
  check (status <> 'superseded' or superseded_by is not null),
  check (superseded_by is null or superseded_by <> id),
  check (status not in ('accepted', 'rejected') or decided_at is not null)
);

create table if not exists decision_insights (
  decision_id  uuid not null,
  insight_id   uuid not null,
  project_id   uuid not null,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  primary key (decision_id, insight_id),
  foreign key (decision_id, project_id) references decisions(id, project_id) on delete cascade,
  foreign key (insight_id, project_id) references insights(id, project_id) on delete cascade
);

create table if not exists decision_opportunities (
  decision_id     uuid not null,
  opportunity_id  uuid not null,
  project_id      uuid not null,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  primary key (decision_id, opportunity_id),
  foreign key (decision_id, project_id) references decisions(id, project_id) on delete cascade,
  foreign key (opportunity_id, project_id) references opportunities(id, project_id) on delete cascade
);

-- Evidence links -------------------------------------------------------------
-- Evidence → exactly one observation, theme, insight, opportunity or decision,
-- with a stance. Contradicting evidence is a row like any other, so it is
-- never hidden to make a neater story (guardrail 11). One table means "every
-- finding this quote touches" is a single query (section 8, both directions).

create table if not exists evidence_links (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  evidence_id         uuid not null,
  observation_id      uuid,
  theme_id            uuid,
  insight_id          uuid,
  opportunity_id      uuid,
  decision_id         uuid,
  stance              text not null default 'supports' check (stance in (
                        'supports', 'contradicts', 'context'
                      )),
  note                text,
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
  foreign key (evidence_id, project_id) references evidence(id, project_id) on delete cascade,
  foreign key (observation_id, project_id) references observations(id, project_id) on delete cascade,
  foreign key (theme_id, project_id) references themes(id, project_id) on delete cascade,
  foreign key (insight_id, project_id) references insights(id, project_id) on delete cascade,
  foreign key (opportunity_id, project_id) references opportunities(id, project_id) on delete cascade,
  foreign key (decision_id, project_id) references decisions(id, project_id) on delete cascade,
  unique nulls not distinct (evidence_id, observation_id, theme_id, insight_id, opportunity_id, decision_id),
  check (num_nonnulls(observation_id, theme_id, insight_id, opportunity_id, decision_id) = 1),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

-- An insight can only be accepted with evidence -------------------------------
-- At least one accepted supporting link, directly or through an accepted
-- observation in one of its themes, or a written reason why evidence is
-- unavailable (guardrail 4). Checked when the status becomes accepted.

create or replace function insight_has_supporting_evidence(p_insight_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.evidence_links l
    where l.insight_id = p_insight_id
      and l.stance = 'supports'
      and l.validation_status = 'accepted'
  ) or exists (
    select 1
    from public.insight_themes it
    join public.theme_observations tobs
      on tobs.theme_id = it.theme_id and tobs.validation_status = 'accepted'
    join public.evidence_links l
      on l.observation_id = tobs.observation_id
     and l.stance = 'supports'
     and l.validation_status = 'accepted'
    where it.insight_id = p_insight_id
  );
$$;

create or replace function require_insight_evidence()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.validation_status = 'accepted'
     and (tg_op = 'INSERT' or old.validation_status is distinct from 'accepted')
     and new.evidence_unavailable_reason is null
     and not public.insight_has_supporting_evidence(new.id) then
    raise exception 'an insight needs accepted supporting evidence (or a reason evidence is unavailable) before it can be accepted'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger insights_require_evidence
  before insert or update of validation_status on insights
  for each row execute function require_insight_evidence();

-- Tags -----------------------------------------------------------------------
-- Project tags, assignable to evidence, observations, themes or insights.

create table if not exists tags (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  category    text not null default 'custom' check (category in (
                'theme', 'pain_point', 'need', 'behaviour', 'emotion', 'persona_trait',
                'journey_stage', 'custom'
              )),
  color       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, project_id)
);

create unique index if not exists tags_project_name_unique on tags (project_id, lower(name));

create table if not exists tag_assignments (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  tag_id              uuid not null,
  evidence_id         uuid,
  observation_id      uuid,
  theme_id            uuid,
  insight_id          uuid,
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
  foreign key (tag_id, project_id) references tags(id, project_id) on delete cascade,
  foreign key (evidence_id, project_id) references evidence(id, project_id) on delete cascade,
  foreign key (observation_id, project_id) references observations(id, project_id) on delete cascade,
  foreign key (theme_id, project_id) references themes(id, project_id) on delete cascade,
  foreign key (insight_id, project_id) references insights(id, project_id) on delete cascade,
  unique nulls not distinct (tag_id, evidence_id, observation_id, theme_id, insight_id),
  check (num_nonnulls(evidence_id, observation_id, theme_id, insight_id) = 1),
  check (origin <> 'ai' or ai_rationale is not null),
  check (origin <> 'ai' or validation_status <> 'accepted' or reviewed_at is not null)
);

-- RLS, triggers, indexes -----------------------------------------------------

select km_enable_project_rls(t) from unnest(array[
  'themes', 'theme_observations', 'insights', 'insight_themes', 'opportunities',
  'opportunity_insights', 'decisions', 'decision_insights', 'decision_opportunities',
  'evidence_links', 'tags', 'tag_assignments'
]::regclass[]) t;

select km_add_updated_at_trigger(t) from unnest(array[
  'themes', 'insights', 'opportunities', 'decisions', 'evidence_links', 'tags'
]::regclass[]) t;

create index if not exists themes_project_id_idx on themes (project_id, created_at desc);
create index if not exists theme_observations_theme_position_idx on theme_observations (theme_id, project_id, position);
create index if not exists insights_project_id_idx on insights (project_id, created_at desc);
create index if not exists insights_search_idx on insights using gin (search);
create index if not exists opportunities_project_id_idx on opportunities (project_id, created_at desc);
create index if not exists decisions_project_id_idx on decisions (project_id, created_at desc);

select km_index_foreign_keys(t) from unnest(array[
  'themes', 'theme_observations', 'insights', 'insight_themes', 'opportunities',
  'opportunity_insights', 'decisions', 'decision_insights', 'decision_opportunities',
  'evidence_links', 'tags', 'tag_assignments'
]::regclass[]) t;
