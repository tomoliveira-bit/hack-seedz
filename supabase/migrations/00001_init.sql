-- Hackathon Seedz · Avaliação 2026
-- Migration 00001: schema inicial

-- =========================================
-- Tabelas
-- =========================================

create table if not exists groups (
  id integer primary key,
  name text not null
);

create table if not exists evaluators (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_id integer not null references groups(id)
);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluator_id uuid not null references evaluators(id),
  candidate_id uuid not null references candidates(id),
  habilidade_ia smallint not null check (habilidade_ia between 1 and 3),
  conhecimento_seedz smallint not null check (conhecimento_seedz between 1 and 3),
  curiosidade smallint not null check (curiosidade between 1 and 3),
  inovacao smallint not null check (inovacao between 1 and 3),
  raca smallint not null check (raca between 1 and 3),
  trabalho_equipe smallint not null check (trabalho_equipe between 1 and 3),
  updated_at timestamptz not null default now(),
  unique(evaluator_id, candidate_id)
);

-- =========================================
-- View do ranking
-- =========================================

create or replace view ranking as
select
  c.id as candidate_id,
  c.name as candidate_name,
  c.group_id,
  g.name as group_name,
  count(e.id) as total_evaluations,
  coalesce(sum(
    e.habilidade_ia + e.conhecimento_seedz + e.curiosidade +
    e.inovacao + e.raca + e.trabalho_equipe
  ), 0) as total_score,
  case when count(e.id) > 0 then
    round(
      sum(
        e.habilidade_ia + e.conhecimento_seedz + e.curiosidade +
        e.inovacao + e.raca + e.trabalho_equipe
      )::numeric / count(e.id), 2
    )
  else 0 end as avg_score
from candidates c
left join evaluations e on e.candidate_id = c.id
left join groups g on g.id = c.group_id
group by c.id, c.name, c.group_id, g.name;

-- =========================================
-- Row Level Security
-- App não tem autenticação — login é só selecionar o nome.
-- Policies abertas pra leitura/escrita anônima.
-- =========================================

alter table groups enable row level security;
alter table evaluators enable row level security;
alter table candidates enable row level security;
alter table evaluations enable row level security;

drop policy if exists "anon read groups" on groups;
drop policy if exists "anon read evaluators" on evaluators;
drop policy if exists "anon insert evaluators" on evaluators;
drop policy if exists "anon read candidates" on candidates;
drop policy if exists "anon read evaluations" on evaluations;
drop policy if exists "anon write evaluations" on evaluations;
drop policy if exists "anon update evaluations" on evaluations;

create policy "anon read groups" on groups for select using (true);
create policy "anon read evaluators" on evaluators for select using (true);
create policy "anon insert evaluators" on evaluators for insert with check (true);
create policy "anon read candidates" on candidates for select using (true);
create policy "anon read evaluations" on evaluations for select using (true);
create policy "anon write evaluations" on evaluations for insert with check (true);
create policy "anon update evaluations" on evaluations for update using (true) with check (true);

-- =========================================
-- Realtime
-- Habilita realtime na tabela evaluations
-- =========================================

alter publication supabase_realtime add table evaluations;
