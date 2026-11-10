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
    <>
      <SeatMap hall={hall} seats={seats} selectedId={selected?.id ?? null} onSelect={setSelected} />
      <TicketBar seat={selected} onView={() => setViewing(true)} />
      {children && <div className="mt-5 px-1 pb-4">{children}</div>}
      {viewing && selected && film && (
        <SeatView3D hall={hall} seats={seats} seat={selected} film={film} onClose={() => setViewing(false)} onBook={book} />
      )}
    </>
  );
}