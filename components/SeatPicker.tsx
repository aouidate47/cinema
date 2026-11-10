"use client";
import { useState } from "react";
import type { Hall, Seat } from "@/types";
import { useFilm } from "./FilmProvider";
import SeatMap from "./SeatMap";
import TicketBar from "./TicketBar";
import SeatView3D from "./SeatView3D";

type Props = { hall: Hall; seats: Seat[]; children?: React.ReactNode };

export default function SeatPicker({ hall, seats, children }: Props) {
  const { film, say } = useFilm();
  const [selected, setSelected] = useState<Seat | null>(null);
  const [viewing, setViewing] = useState(false);

  const book = () => {
    if (selected) say(`Booked, row ${selected.l} seat ${selected.n} (demo only, nothing is charged)`);
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-5">
      <section className="flex min-w-0 flex-col rounded-[22px] border border-white/[0.07] bg-black/15 px-2 pb-4 pt-3 sm:px-4 sm:pt-5">
        <div className="mx-auto mb-5 w-[78%] max-w-[520px] text-center">
          <div className="mb-1 text-[8px] font-bold uppercase tracking-[.3em] text-white/30">You are facing</div>
          <svg viewBox="0 0 500 44" preserveAspectRatio="none" aria-hidden className="h-8 w-full drop-shadow-[0_8px_18px_rgba(227,27,35,.18)] sm:h-10">
            <defs>
              <linearGradient id="screenGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#6e252b" />
                <stop offset=".5" stopColor="#f05a60" />
                <stop offset="1" stopColor="#6e252b" />
              </linearGradient>
            </defs>
            <path d="M8 37 Q250 -12 492 37" fill="none" stroke="url(#screenGrad)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-semibold uppercase tracking-[.25em] text-white/45">Cinema screen</span>
        </div>
        <SeatMap hall={hall} seats={seats} selectedId={selected?.id ?? null} onSelect={setSelected} />
        {children}
      </section>

      <TicketBar seat={selected} onView={() => setViewing(true)} />

      {viewing && selected && film && (
        <SeatView3D hall={hall} seats={seats} seat={selected} film={film} onClose={() => setViewing(false)} onBook={book} />
      )}
    </div>
  );
}
