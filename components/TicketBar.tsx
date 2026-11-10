"use client";
import type { Seat } from "@/types";

export default function TicketBar({ seat, onView }: { seat: Seat | null; onView: () => void }) {
  return (
    <aside className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#111319] p-5 sm:p-6">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Your selection</p>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/35">Step 02</span>
        </div>
        <div className="mt-6">
          <p className="text-xs text-white/40">{seat ? "Selected seat" : "No seat selected yet"}</p>
          <h3 className="mt-1 text-[26px] font-semibold tracking-[-.045em] text-white">
            {seat ? `Row ${seat.l} · Seat ${seat.n}` : "Choose a seat"}
          </h3>
          <p className="mt-2 text-[12px] text-white/45">
            {seat ? (seat.bal ? "Balcony" : seat.rec ? "Recliner" : "Standard") + " · " + seat.price + " DH" : "Tap any available seat in the auditorium to see its details."}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-white/[0.08] pt-5">
        <div className="flex items-end justify-between">
          <span className="text-xs font-medium text-white/45">Ticket total</span>
          <strong className="font-display text-[32px] font-normal leading-none text-white">{seat ? `${seat.price}` : "—"}<span className="ml-1 text-sm font-sans font-medium text-white/45">DH</span></strong>
        </div>
        <button
          disabled={!seat}
          onClick={onView}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-[13px] font-bold transition-all ${seat ? "bg-brand text-white shadow-[0_8px_24px_rgba(227,27,35,.22)] hover:bg-[#f02b33] active:scale-[.98]" : "cursor-not-allowed bg-white/[0.07] text-white/25"}`}
        >
          Preview seat view
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/25">You can explore the view before confirming your seat.</p>
      </div>
    </aside>
  );
}
