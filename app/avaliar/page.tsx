"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CandidateCard from "@/components/CandidateCard";
import type { Candidate, Group } from "@/lib/types";

export default function AvaliarPage() {
  const router = useRouter();
  const [evaluatorName, setEvaluatorName] = useState<string>("");
  const [evaluatorId, setEvaluatorId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evaluatedSet, setEvaluatedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("evaluator_id");
    const name = localStorage.getItem("evaluator_name") ?? "";
    if (!id) {
      router.replace("/");
      return;
    }
    setEvaluatorId(id);
    setEvaluatorName(name);
  }, [router]);

  useEffect(() => {
    if (!evaluatorId) return;
    let mounted = true;
    (async () => {
      const [g, c, e] = await Promise.all([
        supabase.from("groups").select("id, name").order("id"),
        supabase.from("candidates").select("id, name, group_id").order("name"),
        supabase
          .from("evaluations")
          .select("candidate_id")
          .eq("evaluator_id", evaluatorId),
      ]);
      if (!mounted) return;
      if (g.error || c.error || e.error) {
        setError("Algo deu errado. Tente recarregar a página.");
      } else {
        setGroups((g.data ?? []) as Group[]);
        setCandidates((c.data ?? []) as Candidate[]);
        setEvaluatedSet(
          new Set((e.data ?? []).map((r) => r.candidate_id as string))
        );
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [evaluatorId]);

  const handleLogout = () => {
    localStorage.removeItem("evaluator_id");
    localStorage.removeItem("evaluator_name");
    router.push("/");
  };

  if (!evaluatorId) return null;

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-12">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50">
            Hackathon Seedz
          </p>
          <h1 className="text-xl font-bold">Olá, {evaluatorName}</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-white/70 hover:text-seedz-yellow underline-offset-4 hover:underline"
        >
          Sair
        </button>
      </header>

      {error && (
        <p className="text-seedz-yellow text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-white/60 text-sm">Carregando candidatos...</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const list = candidates.filter((c) => c.group_id === group.id);
            if (list.length === 0) return null;
            return (
              <section key={group.id}>
                <h2 className="text-sm font-bold uppercase tracking-widest text-seedz-green mb-3">
                  {group.name}
                </h2>
                <div className="space-y-2">
                  {list.map((c) => (
                    <CandidateCard
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      evaluated={evaluatedSet.has(c.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
