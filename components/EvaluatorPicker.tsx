"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Evaluator } from "@/lib/types";

export default function EvaluatorPicker() {
  const router = useRouter();
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("evaluators")
        .select("id, name")
        .order("name", { ascending: true });
      if (!mounted) return;
      if (error) {
        setError("Algo deu errado. Tente recarregar a página.");
      } else {
        setEvaluators((data ?? []) as Evaluator[]);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    const ev = evaluators.find((x) => x.id === selectedId);
    if (ev) {
      localStorage.setItem("evaluator_id", ev.id);
      localStorage.setItem("evaluator_name", ev.name);
    }
    router.push("/avaliar");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <label className="block">
        <span className="block text-sm text-white/70 mb-2">Seu nome</span>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loading || !!error}
          className="w-full h-14 rounded-xl bg-seedz-navy-2 border-2 border-white/15 px-4 text-white text-base focus:border-seedz-green-bright focus:outline-none"
        >
          <option value="">
            {loading ? "Carregando..." : "— Selecione —"}
          </option>
          {evaluators.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="text-sm text-seedz-yellow">{error}</p>
      )}

      <button
        type="submit"
        disabled={!selectedId || submitting}
        className="w-full h-14 rounded-xl bg-seedz-green-bright text-seedz-navy font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
