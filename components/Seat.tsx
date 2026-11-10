"use client";
import type { Seat as SeatType } from "@/types";

type Props = { seat: SeatType; selected: boolean; lift: number; onSelect: (s: SeatType) => void };

export default function Seat({ seat, selected, lift, onSelect }: Props) {
  const kind = seat.bal ? "balcony" : seat.rec ? "recliner" : "standard";
  const look = selected
    ? "rounded-full border-[#e31b23] bg-[#e31b23] text-white ring-2 ring-[#e31b23]/20"
    : seat.taken
    ? "cursor-not-allowed rounded-full border-[#d7d9dd] bg-[#e3e5e8]"
    : seat.rec
    ? "rounded-[32%] border-[#9b6be8] bg-[#9b6be8]"
    : seat.bal
    ? "rounded-full border-[#d5ad63] bg-[#d5ad63] shadow-[inset_0_0_0_3px_white]"
    : "rounded-full border-[#b8bdc4] bg-white hover:border-[#555960]";

  return (
    <button
      disabled={seat.taken}
      aria-pressed={selected}
      aria-label={`Row ${seat.l} seat ${seat.n}, ${seat.taken ? "taken" : `${kind}, ${seat.price} DH`}`}
      onClick={() => onSelect(seat)}
      style={{ transform: `translateY(${lift.toFixed(1)}px)` }}
      className={`relative size-[var(--s)] shrink-0 border-[1.5px] p-0 text-[9px] font-bold after:absolute after:-inset-[2px] ${look}`}
    >
      {selected ? seat.n : null}
    </button>
  );
}
