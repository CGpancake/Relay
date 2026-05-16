create table if not exists annotations (
  id uuid primary key,
  project_id text not null,
  shot_id text not null,
  version_id text not null,
  frame_number integer not null,
  user_id text not null,
  body jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists annotations_version_frame_idx
  on annotations (project_id, shot_id, version_id, frame_number);
