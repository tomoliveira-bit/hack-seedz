export type Evaluator = {
  id: string;
  name: string;
};

export type Group = {
  id: number;
  name: string;
};

export type Candidate = {
  id: string;
  name: string;
  group_id: number;
};

export const CRITERIA = [
  { key: "habilidade_ia", label: "Habilidade com IA" },
  { key: "conhecimento_seedz", label: "Conhecimento Seedz/agro" },
  { key: "curiosidade", label: "Curiosidade" },
  { key: "inovacao", label: "Inovação" },
  { key: "raca", label: "Raça" },
  { key: "trabalho_equipe", label: "Trabalho em equipe" },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export type Scores = Record<CriterionKey, 1 | 2 | 3 | null>;

export type Evaluation = {
  id: string;
  evaluator_id: string;
  candidate_id: string;
  habilidade_ia: number;
  conhecimento_seedz: number;
  curiosidade: number;
  inovacao: number;
  raca: number;
  trabalho_equipe: number;
  updated_at: string;
};

export type RankingRow = {
  candidate_id: string;
  candidate_name: string;
  group_id: number;
  group_name: string;
  total_evaluations: number;
  total_score: number;
  avg_score: number;
};
