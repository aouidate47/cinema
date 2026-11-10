"use client";
import { useState } from "react";
import type { Hall, Seat } from "@/types";
import { useFilm } from "./FilmProvider";
import SeatMap from "./SeatMap";
import TicketBar from "./TicketBar";
import SeatView3D from "./SeatView3D";

export default function SeatPicker({ hall, seats }: { hall: Hall; seats: Seat[] }) {
  const { film, say } = useFilm();
  const [selected, setSelected] = useState<Seat | null>(null);
  const [viewing, setViewing] = useState(false);

  const book = () => {
    if (selected) say(`Booked ✓ Row ${selected.l} · Seat ${selected.n} (demo only, nothing is charged)`);
  };

  return (
    <>
      <SeatMap hall={hall} seats={seats} selectedId={selected?.id ?? null} onSelect={setSelected} />
      <TicketBar seat={selected} onView={() => setViewing(true)} />
      {viewing && selected && film && (
        <SeatView3D hall={hall} seats={seats} seat={selected} film={film} onClose={() => setViewing(false)} onBook={book} />
      )}
    </>
  );
}