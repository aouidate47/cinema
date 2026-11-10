"use client";
import type { Seat } from "@/types";

export default function TicketBar({ seat, onView }: { seat: Seat | null; onView: () => void }) {
  return (
    <div className="mx-3.5 mb-3.5 mt-2 flex items-stretch rounded-[22px] border border-line bg-card">
      <div className="flex-1 px-[18px] py-4" aria-live="polite">
        <small className="block text-[13px] text-mute">
          {seat ? `Row ${seat.l} · Seat ${seat.n}` : "Choose your seat"}
        </small>
        <strong className="font-display text-3xl font-normal">{seat ? `${seat.price} DH` : "—"}</strong>
      </div>
      <button
        disabled={!seat}
        onClick={onView}
        className={`rounded-r-[22px] border-l-2 border-dashed px-[22px] text-[15px] font-extrabold uppercase tracking-wide ${
          seat ? "border-transparent bg-brand text-white" : "border-line text-mute"
        }`}
      >
        View seat →
      </button>
    </div>
  );
}