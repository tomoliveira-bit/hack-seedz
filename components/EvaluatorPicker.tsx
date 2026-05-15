"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EvaluatorPicker() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = name.trim();
    if (!normalized) return;

    setSubmitting(true);
    setError(null);

    const { data: existing, error: findError } = await supabase
      .from("evaluators")
      .select("id, name")
      .ilike("name", normalized)
      .maybeSingle();

    if (findError) {
      setSubmitting(false);
      setError("Algo deu errado. Tente novamente.");
      return;
    }

    let evaluator = existing;

    if (!evaluator) {
      const { data: inserted, error: insertError } = await supabase
        .from("evaluators")
        .insert({ name: normalized })
        .select("id, name")
        .single();
      if (insertError || !inserted) {
        setSubmitting(false);
        setError("Não consegui salvar seu nome. Tente novamente.");
        return;
      }
      evaluator = inserted;
    }

    localStorage.setItem("evaluator_id", evaluator.id);
    localStorage.setItem("evaluator_name", evaluator.name);
    router.push("/avaliar");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <label className="block text-left">
        <span className="block text-sm text-white/70 mb-2">Seu nome</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          autoComplete="given-name"
          autoFocus
          maxLength={60}
          className="w-full h-14 rounded-xl bg-seedz-navy-2 border-2 border-white/15 px-4 text-white text-base focus:border-seedz-green-bright focus:outline-none placeholder:text-white/30"
        />
      </label>

      {error && <p className="text-sm text-seedz-yellow">{error}</p>}

      <button
        type="submit"
        disabled={!name.trim() || submitting}
        className="w-full h-14 rounded-xl bg-seedz-green-bright text-seedz-navy font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
