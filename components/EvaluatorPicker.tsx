"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EvaluatorPicker() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = name.trim().replace(/\s+/g, " ");
    if (!normalized) return;
    setSubmitting(true);
    localStorage.setItem("evaluator_name", normalized);
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
