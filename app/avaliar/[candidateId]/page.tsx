"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ScoreButton from "@/components/ScoreButton";
import { CRITERIA, type CriterionKey, type Scores } from "@/lib/types";

const EMPTY_SCORES: Scores = {
  habilidade_ia: null,
  conhecimento_seedz: null,
  curiosidade: null,
  inovacao: null,
  raca: null,
  trabalho_equipe: null,
};

export default function AvaliarCandidatoPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = use(params);
  const router = useRouter();

  const [evaluatorId, setEvaluatorId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<CriterionKey>>(new Set());

  useEffect(() => {
    const id = localStorage.getItem("evaluator_id");
    if (!id) {
      router.replace("/");
      return;
    }
    setEvaluatorId(id);
  }, [router]);

  useEffect(() => {
    if (!evaluatorId || !candidateId) return;
    let mounted = true;
    (async () => {
      const [cand, exist] = await Promise.all([
        supabase
          .from("candidates")
          .select("name, group_id, groups(name)")
          .eq("id", candidateId)
          .maybeSingle(),
        supabase
          .from("evaluations")
          .select(
            "habilidade_ia, conhecimento_seedz, curiosidade, inovacao, raca, trabalho_equipe"
          )
          .eq("evaluator_id", evaluatorId)
          .eq("candidate_id", candidateId)
          .maybeSingle(),
      ]);
      if (!mounted) return;
      if (cand.error || exist.error) {
        setError("Algo deu errado. Tente recarregar a página.");
        setLoading(false);
        return;
      }
      if (cand.data) {
        const raw = cand.data as unknown as {
          name: string;
          groups: { name: string } | { name: string }[] | null;
        };
        setCandidateName(raw.name);
        const g = Array.isArray(raw.groups) ? raw.groups[0] : raw.groups;
        setGroupName(g?.name ?? "");
      }
      if (exist.data) {
        setScores({
          habilidade_ia: exist.data.habilidade_ia as 1 | 2 | 3,
          conhecimento_seedz: exist.data.conhecimento_seedz as 1 | 2 | 3,
          curiosidade: exist.data.curiosidade as 1 | 2 | 3,
          inovacao: exist.data.inovacao as 1 | 2 | 3,
          raca: exist.data.raca as 1 | 2 | 3,
          trabalho_equipe: exist.data.trabalho_equipe as 1 | 2 | 3,
        });
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [evaluatorId, candidateId]);

  const setScore = (key: CriterionKey, value: 1 | 2 | 3) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setMissing((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleSave = async () => {
    if (!evaluatorId) return;
    const missingKeys = CRITERIA.filter((c) => scores[c.key] === null).map(
      (c) => c.key
    );
    if (missingKeys.length > 0) {
      setMissing(new Set(missingKeys));
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      evaluator_id: evaluatorId,
      candidate_id: candidateId,
      habilidade_ia: scores.habilidade_ia,
      conhecimento_seedz: scores.conhecimento_seedz,
      curiosidade: scores.curiosidade,
      inovacao: scores.inovacao,
      raca: scores.raca,
      trabalho_equipe: scores.trabalho_equipe,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("evaluations")
      .upsert(payload, { onConflict: "evaluator_id,candidate_id" });
    if (error) {
      setSaving(false);
      setError("Não consegui salvar. Tente novamente.");
      return;
    }
    router.push("/avaliar");
  };

  if (!evaluatorId) return null;

  return (
    <main className="min-h-screen px-4 py-6 max-w-xl mx-auto pb-32">
      <Link
        href="/avaliar"
        className="inline-block text-sm text-white/70 hover:text-seedz-yellow mb-4"
      >
        ← Voltar
      </Link>

      {loading ? (
        <p className="text-white/60 text-sm">Carregando...</p>
      ) : (
        <>
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {candidateName}
            </h1>
            {groupName && (
              <p className="text-sm text-white/60 mt-1">{groupName}</p>
            )}
          </header>

          <div className="space-y-6">
            {CRITERIA.map((c) => {
              const isMissing = missing.has(c.key);
              return (
                <div
                  key={c.key}
                  className={
                    "rounded-xl p-4 border-2 transition-colors " +
                    (isMissing
                      ? "border-seedz-yellow bg-seedz-navy-2"
                      : "border-transparent")
                  }
                >
                  <h3 className="font-semibold text-base mb-1">{c.label}</h3>
                  <p className="text-xs text-white/50 mb-3">
                    1 = Abaixo · 2 = No esperado · 3 = Acima
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((v) => (
                      <ScoreButton
                        key={v}
                        value={v as 1 | 2 | 3}
                        selected={scores[c.key] === v}
                        onClick={() => setScore(c.key, v as 1 | 2 | 3)}
                      />
                    ))}
                  </div>
                  {isMissing && (
                    <p className="text-xs text-seedz-yellow mt-2">
                      Falta avaliar este critério.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <p className="text-seedz-yellow text-sm mt-4 text-center">
              {error}
            </p>
          )}
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-seedz-navy via-seedz-navy/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-xl mx-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full h-14 rounded-xl bg-seedz-green-bright text-seedz-navy font-bold text-lg disabled:opacity-40"
          >
            {saving ? "Salvando..." : "Salvar avaliação"}
          </button>
        </div>
      </div>
    </main>
  );
}
