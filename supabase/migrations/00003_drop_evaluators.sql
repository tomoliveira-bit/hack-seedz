-- Remove dependência da tabela `evaluators`.
-- Avaliador é apenas o nome digitado no login (guardado em localStorage no client)
-- e gravado em cada evaluation.

drop view if exists ranking;

delete from evaluations;

alter table evaluations drop column if exists evaluator_id;

alter table evaluations add column if not exists evaluator_name text;
alter table evaluations alter column evaluator_name set not null;

alter table evaluations
  drop constraint if exists evaluations_evaluator_id_candidate_id_key;
alter table evaluations
  drop constraint if exists evaluations_evaluator_name_candidate_id_key;
alter table evaluations
  add constraint evaluations_evaluator_name_candidate_id_key
  unique (evaluator_name, candidate_id);

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
