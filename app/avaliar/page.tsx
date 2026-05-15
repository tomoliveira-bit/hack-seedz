"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Group } from "@/lib/types";

type GroupWithCounts = Group & {
  totalCandidates: number;
  evaluatedCandidates: number;
};

export default function EscolherGrupoPage() {
  const router = useRouter();
  const [evaluatorName, setEvaluatorName] = useState("");
  const [evaluatorId, setEvaluatorId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("evaluator_id");
    const n = localStorage.getItem("evaluator_name") ?? "";
    if (!id) {
      router.replace("/");
      return;
    }
    setEvaluatorId(id);
    setEvaluatorName(n);
  }, [router]);

  useEffect(() => {
    if (!evaluatorId) return;
    let mounted = true;
    (async () => {
      const [g, c, e] = await Promise.all([
        supabase.from("groups").select("id, name").order("id"),
        supabase.from("candidates").select("id, group_id"),
        supabase
          .from("evaluations")
          .select("candidate_id")
          .eq("evaluator_id", evaluatorId),
      ]);
      if (!mounted) return;
      if (g.error || c.error || e.error) {
        setError("Algo deu errado. Tente recarregar a página.");
        setLoading(false);
        return;
      }
      const evaluatedSet = new Set(
        (e.data ?? []).map((r) => r.candidate_id as string)
      );
      const candidatesByGroup = new Map<number, { id: string }[]>();
      for (const c0 of c.data ?? []) {
        const arr = candidatesByGroup.get(c0.group_id as number) ?? [];
        arr.push({ id: c0.id as string });
        candidatesByGroup.set(c0.group_id as number, arr);
      }
      const built: GroupWithCounts[] = (g.data ?? []).map((gr) => {
        const list = candidatesByGroup.get(gr.id as number) ?? [];
        const evaluated = list.filter((x) => evaluatedSet.has(x.id)).length;
        return {
          id: gr.id as number,
          name: gr.name as string,
          totalCandidates: list.length,
          evaluatedCandidates: evaluated,
        };
      });
      setGroups(built);
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
      <header className="flex items-center justify-between mb-8">
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

      <h2 className="text-2xl font-bold mb-2">Escolha o grupo</h2>
      <p className="text-white/60 text-sm mb-6">
        Selecione um grupo para ver os candidatos
      </p>

      {error && <p className="text-seedz-yellow text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-white/60 text-sm">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groups.map((g) => {
            const allDone =
              g.totalCandidates > 0 &&
              g.evaluatedCandidates === g.totalCandidates;
            return (
              <Link
                key={g.id}
                href={`/avaliar/grupo/${g.id}`}
                className="block rounded-xl bg-seedz-navy-2 border-2 border-white/10 hover:border-seedz-green p-5 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xl font-bold">{g.name}</span>
                  {allDone && (
                    <span className="shrink-0 text-xs font-bold uppercase tracking-wide bg-seedz-green-bright text-seedz-navy px-2.5 py-1 rounded-full">
                      ✓ Completo
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">
                    {g.totalCandidates} candidato
                    {g.totalCandidates === 1 ? "" : "s"}
                  </span>
                  <span className="text-sm font-semibold text-seedz-green">
                    {g.evaluatedCandidates}/{g.totalCandidates} avaliados
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
