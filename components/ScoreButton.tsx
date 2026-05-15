"use client";

type Props = {
  value: 1 | 2 | 3;
  selected: boolean;
  onClick: () => void;
};

export default function ScoreButton({ value, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 h-16 rounded-xl text-2xl font-bold transition-colors border-2 " +
        (selected
          ? "bg-seedz-green-bright text-seedz-navy border-seedz-green-bright"
          : "bg-seedz-navy-2 text-white border-white/15 hover:border-seedz-green")
      }
      aria-pressed={selected}
    >
      {value}
    </button>
  );
}
