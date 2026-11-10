"use client";
import type { Seat as SeatType } from "@/types";

const SLASH = "bg-[linear-gradient(45deg,transparent_42%,var(--mute)_42%_58%,transparent_58%),var(--taken)]";

type Props = { seat: SeatType; selected: boolean; lift: number; onSelect: (s: SeatType) => void };

export default function Seat({ seat, selected, lift, onSelect }: Props) {
  const kind = seat.bal ? "balcony" : seat.rec ? "recliner" : "standard";
  const look = selected
    ? "rounded-full border-brand bg-brand text-[color:var(--on)] ring-4 ring-brand/25"
    : seat.taken
    ? `rounded-full border-taken ${SLASH}`
    : seat.rec
    ? "rounded-[32%] border-plum bg-plum"
    : seat.bal
    ? "rounded-full border-gold bg-gold shadow-[inset_0_0_0_3px_var(--card)]"
    : "rounded-full border-ink bg-card";

  return (
    <button
      disabled={seat.taken}
      aria-pressed={selected}
      aria-label={`Row ${seat.l} seat ${seat.n}, ${seat.taken ? "taken" : `${kind}, ${seat.price} DH`}`}
      onClick={() => onSelect(seat)}
      style={{ transform: `translateY(${lift.toFixed(1)}px)` }}
      className={`relative size-[var(--s)] border-[1.8px] p-0 text-[10px] font-bold after:absolute after:-inset-[2px] ${look}`}
    >
      {selected ? seat.n : null}
    </button>
  );
}