"use client";

import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
};

export default function RankingTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-center text-white/60 py-12">
        Nenhuma avaliação ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm md:text-base">
        <thead>
          <tr className="text-white/60 text-xs uppercase tracking-wider">
            <th className="py-3 px-2 w-10">#</th>
            <th className="py-3 px-2">Candidato</th>
            <th className="py-3 px-2 hidden sm:table-cell">Grupo</th>
            <th className="py-3 px-2 text-right">Total</th>
            <th className="py-3 px-2 text-right hidden sm:table-cell">Média</th>
            <th className="py-3 px-2 text-right">Aval.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const top3 = i < 3;
            return (
              <tr
                key={r.candidate_id}
                className={
                  "border-t border-white/10 " +
                  (top3 ? "bg-seedz-navy-2/60" : "")
                }
              >
                <td
                  className={
                    "py-3 px-2 font-bold " +
                    (top3
                      ? "border-l-4 border-seedz-yellow text-seedz-yellow"
                      : "text-white/70")
                  }
                >
                  {i + 1}
                </td>
                <td className="py-3 px-2 font-medium">{r.candidate_name}</td>
                <td className="py-3 px-2 hidden sm:table-cell text-white/70">
                  {r.group_name}
                </td>
                <td className="py-3 px-2 text-right font-bold text-seedz-green-bright">
                  {r.total_score}
                </td>
                <td className="py-3 px-2 text-right hidden sm:table-cell text-white/80">
                  {r.avg_score}
                </td>
                <td className="py-3 px-2 text-right text-white/70">
                  {r.total_evaluations}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
