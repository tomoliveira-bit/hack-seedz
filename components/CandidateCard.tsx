"use client";

import Link from "next/link";

type Props = {
  id: string;
  name: string;
  evaluated: boolean;
};

export default function CandidateCard({ id, name, evaluated }: Props) {
  return (
    <Link
      href={`/avaliar/${id}`}
      className="block rounded-xl bg-seedz-navy-2 border border-white/10 hover:border-seedz-green px-4 py-4 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-base leading-tight">{name}</span>
        {evaluated ? (
          <span className="shrink-0 text-xs font-bold uppercase tracking-wide bg-seedz-green-bright text-seedz-navy px-2.5 py-1 rounded-full">
            Avaliado
          </span>
        ) : (
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-white/60 border border-white/20 px-2.5 py-1 rounded-full">
            Não avaliado
          </span>
        )}
      </div>
    </Link>
  );
}
