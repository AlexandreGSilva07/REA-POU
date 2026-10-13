-- Private orchestration schema; do not expose via browser Data API.
-- Review and apply only to the explicitly selected Supabase project.
create schema if not exists rea_control;
revoke all on schema rea_control from public;
revoke all on schema rea_control from anon, authenticated;

create table if not exists rea_control.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  repo_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists rea_control.specifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references rea_control.projects(id),
  spec_key text not null,
  revision integer not null check (revision >= 1),
  status text not null default 'draft' check (status in ('draft','approved','superseded')),
  document_path text not null,
  content_sha256 text,
  created_at timestamptz not null default now(),
  unique (project_id, spec_key, revision)
);

create table if not exists rea_control.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references rea_control.projects(id),
  specification_id uuid references rea_control.specifications(id),
  role text not null check (role in ('analyst','developer','reviewer')),
  status text not null default 'queued' check (status in ('queued','leased','in_review','blocked','accepted','failed')),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  attempt integer not null default 0 check (attempt >= 0),
  lease_owner text,
  lease_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rea_tasks_queue_idx on rea_control.tasks (status, role, created_at);

create table if not exists rea_control.agent_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references rea_control.tasks(id),
  agent_role text not null check (agent_role in ('analyst','developer','reviewer')),
  worker_id text not null,
  status text not null check (status in ('started','completed','failed','cancelled')),
  commit_sha text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  summary text
);

create table if not exists rea_control.validation_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references rea_control.tasks(id),
  build_commit_sha text,
  verdict text not null check (verdict in ('pass','fail','blocked','inconclusive')),
  expected text,
  observed text,
  evidence_ref text,
  created_at timestamptz not null default now()
);

revoke all on all tables in schema rea_control from anon, authenticated;
-- Orchestrator worker credentials and lease locking to be implemented before automatic task execution.
