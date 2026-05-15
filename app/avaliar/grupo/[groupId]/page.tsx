"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CandidateCard from "@/components/CandidateCard";
import type { Candidate } from "@/lib/types";

export default function GrupoPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId: groupIdStr } = use(params);
  const groupId = Number(groupIdStr);

  const router = useRouter();
  const [evaluatorId, setEvaluatorId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evaluatedSet, setEvaluatedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("evaluator_id");
    if (!id) {
      router.replace("/");
      return;
    }
    setEvaluatorId(id);
  }, [router]);

  useEffect(() => {
    if (!evaluatorId || !Number.isFinite(groupId)) return;
    let mounted = true;
    (async () => {
      const [g, c, e] = await Promise.all([
        supabase
          .from("groups")
          .select("name")
          .eq("id", groupId)
          .maybeSingle(),
        supabase
          .from("candidates")
          .select("id, name, group_id")
          .eq("group_id", groupId)
          .order("name"),
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
      setGroupName((g.data as { name: string } | null)?.name ?? "");
      setCandidates((c.data ?? []) as Candidate[]);
      setEvaluatedSet(
        new Set((e.data ?? []).map((r) => r.candidate_id as string))
      );
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [evaluatorId, groupId]);

  if (!evaluatorId) return null;

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-12">
      <Link
        href="/avaliar"
        className="inline-block text-sm text-white/70 hover:text-seedz-yellow mb-4"
      >
        ← Voltar aos grupos
      </Link>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-seedz-green font-semibold">
          {groupName || "Grupo"}
        </p>
        <h1 className="text-2xl font-bold">Candidatos</h1>
        {!loading && (
          <p className="text-sm text-white/60 mt-1">
            {
              candidates.filter((c) => evaluatedSet.has(c.id)).length
            }{" "}
            de {candidates.length} avaliados
          </p>
        )}
      </header>

      {error && <p className="text-seedz-yellow text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-white/60 text-sm">Carregando candidatos...</p>
      ) : candidates.length === 0 ? (
        <p className="text-white/60 text-sm">
          Nenhum candidato neste grupo.
        </p>
      ) : (
        <div className="space-y-2">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              id={c.id}
              name={c.name}
              evaluated={evaluatedSet.has(c.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
