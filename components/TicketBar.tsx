"use client";
import type { Seat } from "@/types";

export default function TicketBar({ seat, onView }: { seat: Seat | null; onView: () => void }) {
  return (
    <aside className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 lg:flex-col lg:items-stretch lg:justify-center lg:rounded-2xl lg:px-4 lg:py-5">
      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-[.12em] text-[#969aa1]">Selected seat</p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-[#24262a]">{seat ? `Row ${seat.l} · Seat ${seat.n}` : "None selected"}</p>
        <p className="mt-0.5 text-[10px] text-[#777b82]">{seat ? (seat.bal ? "Balcony" : seat.rec ? "Recliner" : "Standard") : "Choose an available seat"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-stretch">
        <p className="text-[13px] font-semibold text-[#24262a] lg:text-right">{seat ? `${seat.price} DH` : "—"}</p>
        <button
          disabled={!seat}
          onClick={onView}
          className={`rounded-lg px-4 py-2.5 text-[11px] font-semibold transition-colors ${seat ? "bg-[#24262a] text-white hover:bg-[#3a3c41]" : "cursor-not-allowed bg-[#ececeb] text-[#a5a8ad]"}`}
        >
          See seat view
        </button>
      </div>
    </aside>
  );
}
