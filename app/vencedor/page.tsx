"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RankingRow } from "@/lib/types";

export default function VencedorPage() {
  const [winner, setWinner] = useState<RankingRow | null>(null);
  const [hasAnyEvaluation, setHasAnyEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWinner = useCallback(async () => {
    const { data, error } = await supabase
      .from("ranking")
      .select("*")
      .order("total_score", { ascending: false })
      .limit(1);
    if (!error && data && data.length > 0) {
      const top = data[0] as RankingRow;
      setHasAnyEvaluation(top.total_evaluations > 0);
      setWinner(top.total_evaluations > 0 ? top : null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWinner();
    const channel = supabase
      .channel("vencedor-evaluations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evaluations" },
        () => {
          fetchWinner();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWinner]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-seedz-navy via-seedz-navy-2 to-seedz-green-dark px-6 py-12 text-center">
      <p className="text-sm md:text-base uppercase tracking-[0.4em] text-white/70 font-semibold mb-12">
        Programa de Estágio Tech 2026
      </p>

      {loading ? (
        <p className="text-white/60">Carregando...</p>
      ) : !winner || !hasAnyEvaluation ? (
        <div className="space-y-4">
          <p className="text-2xl md:text-4xl text-white/80 font-light">
            Aguardando avaliações…
          </p>
        </div>
      ) : (
        <div className="space-y-8 max-w-5xl">
          <p className="text-2xl md:text-4xl uppercase tracking-[0.5em] text-seedz-yellow font-bold">
            Vencedor
          </p>
          <h1
            className="font-black leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
          >
            {winner.candidate_name}
          </h1>
          <div className="pt-4 space-y-2">
            <p className="text-3xl md:text-5xl font-bold text-seedz-green-bright">
              {winner.total_score} pontos
            </p>
            <p className="text-base md:text-xl text-white/70">
              {winner.total_evaluations}{" "}
              {winner.total_evaluations === 1
                ? "avaliação recebida"
                : "avaliações recebidas"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
