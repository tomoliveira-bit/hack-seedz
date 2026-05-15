"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RankingTable from "@/components/RankingTable";
import type { RankingRow } from "@/lib/types";

export default function BancaPage() {
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | "all">("all");

  const fetchRanking = useCallback(async () => {
    const { data, error } = await supabase
      .from("ranking")
      .select("*")
      .order("total_score", { ascending: false });
    if (error) {
      setError("Algo deu errado. Tente recarregar a página.");
    } else {
      setRows((data ?? []) as RankingRow[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRanking();
    const channel = supabase
      .channel("banca-evaluations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evaluations" },
        () => {
          fetchRanking();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRanking]);

  const filtered =
    filter === "all" ? rows : rows.filter((r) => r.group_id === filter);

  return (
    <main className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-seedz-yellow font-semibold">
              Banca · Programa de Estágio Tech 2026
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">Ranking completo</h1>
          </div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-seedz-green-bright">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-seedz-green-bright opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-seedz-green-bright"></span>
            </span>
            Ao vivo
          </span>
        </div>
        <p className="text-sm text-white/60 mt-1">
          Atualizado em tempo real
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", 1, 2, 3, 4] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(g)}
            className={
              "px-4 h-10 rounded-full text-sm font-semibold border transition-colors " +
              (filter === g
                ? "bg-seedz-green-bright text-seedz-navy border-seedz-green-bright"
                : "bg-seedz-navy-2 text-white border-white/15 hover:border-seedz-green")
            }
          >
            {g === "all" ? "Todos os grupos" : `Grupo ${g}`}
          </button>
        ))}
      </div>

      {error && <p className="text-seedz-yellow text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-white/60 text-sm">Carregando ranking...</p>
      ) : (
        <RankingTable rows={filtered} />
      )}
    </main>
  );
}
