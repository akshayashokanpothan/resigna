-- Migration: 0009_create_tags_and_clusters
-- Organizing the Knowledge Model: tags (many per item) and clusters (the
-- groups an Affinity Map is drawn from).

-- Tags -----------------------------------------------------------------------

create table if not exists tags (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  category    text not null default 'theme' check (category in (
                'theme', 'sentiment', 'pain_point', 'need', 'behaviour', 'goal', 'custom'
              )),
  color       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, project_id)
);

create unique index if not exists tags_project_name_unique on tags (project_id, lower(name));

create table if not exists knowledge_item_tags (
  item_id     uuid not null,
  tag_id      uuid not null,
  project_id  uuid not null,
  origin      text not null default 'manual' check (origin in ('manual', 'ai')),
  confidence  numeric(4, 3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (item_id, tag_id),
  foreign key (item_id, project_id)
    references knowledge_items(id, project_id) on delete cascade,
  foreign key (tag_id, project_id)
    references tags(id, project_id) on delete cascade
);

-- Clusters -------------------------------------------------------------------
-- A named group of knowledge items. An item may sit in more than one cluster.

create table if not exists clusters (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  description  text,
  position     integer not null default 0,
  origin       text not null default 'manual' check (origin in ('manual', 'ai')),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (id, project_id)
);

create table if not exists cluster_items (
  cluster_id  uuid not null,
  item_id     uuid not null,
  project_id  uuid not null,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  primary key (cluster_id, item_id),
  foreign key (cluster_id, project_id)
    references clusters(id, project_id) on delete cascade,
  foreign key (item_id, project_id)
    references knowledge_items(id, project_id) on delete cascade
);

-- RLS ------------------------------------------------------------------------

alter table tags enable row level security;
alter table knowledge_item_tags enable row level security;
alter table clusters enable row level security;
alter table cluster_items enable row level security;

create policy "project_member_access" on tags
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on knowledge_item_tags
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on clusters
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy "project_member_access" on cluster_items
  for all to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

create trigger tags_updated_at
  before update on tags
  for each row execute function update_updated_at_column();
create trigger clusters_updated_at
  before update on clusters
  for each row execute function update_updated_at_column();

-- Indexes --------------------------------------------------------------------
-- Every foreign key has an index whose leading columns match it (advisor 0001).

create index if not exists tags_created_by_idx on tags (created_by);
create index if not exists knowledge_item_tags_item_id_idx on knowledge_item_tags (item_id, project_id);
create index if not exists knowledge_item_tags_tag_id_idx on knowledge_item_tags (tag_id, project_id);
create index if not exists knowledge_item_tags_created_by_idx on knowledge_item_tags (created_by);
create index if not exists clusters_project_id_idx on clusters (project_id, position);
create index if not exists clusters_created_by_idx on clusters (created_by);
create index if not exists cluster_items_cluster_id_idx on cluster_items (cluster_id, project_id);
create index if not exists cluster_items_item_id_idx on cluster_items (item_id, project_id);
