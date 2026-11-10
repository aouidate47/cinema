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
    <div className="flex h-full min-h-0 flex-col gap-2.5 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-4">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-xl bg-[#f8f8f7] px-1.5 pb-2 pt-2 sm:px-3">
        <div className="mx-auto mb-1 w-[76%] max-w-[440px] shrink-0 text-center">
          <svg viewBox="0 0 500 32" preserveAspectRatio="none" aria-hidden className="h-5 w-full">
            <path d="M8 27 Q250 -10 492 27" fill="none" stroke="#b9bdc3" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-[8px] font-medium uppercase tracking-[.2em] text-[#9a9ea5]">Screen</span>
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
