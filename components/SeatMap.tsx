"use client";
import { Fragment } from "react";
import type { Hall, Seat as SeatType } from "@/types";
import Seat from "./Seat";

type Props = { hall: Hall; seats: SeatType[]; selectedId: string | null; onSelect: (s: SeatType) => void };

export default function SeatMap({ hall, seats, selectedId, onSelect }: Props) {
  const byId = new Map(seats.map((s) => [s.id, s]));
  const maxSeats = Math.max(
    ...hall.rows.map((_, r) => (hall.rowLayouts?.[r] ?? hall.layout).reduce((a, b) => a + b, 0))
  );

  return (
    <div
      className="flex w-full flex-1 flex-col justify-center gap-2.5 overflow-x-auto px-1 py-3 sm:gap-3 sm:px-2"
      style={{ "--s": `min(27px, calc((min(100vw, 1100px) - 76px) / ${maxSeats}))` } as React.CSSProperties}
    >
      {hall.rows.map((l, r) => {
        let c = 0;
        let ix = 0;
        const rowLayout = hall.rowLayouts?.[r] ?? hall.layout;
        const total = rowLayout.reduce((a, b) => a + b, 0);
        return (
          <Fragment key={l}>
            {r === hall.balFrom && (
              <div className="my-1 text-center text-[9px] font-bold uppercase tracking-[.22em] text-gold/75">Balcony level</div>
            )}
            <div className="flex min-w-max items-center justify-center gap-2 sm:gap-3">
              <span aria-hidden className="w-4 text-center text-[10px] font-bold text-white/30">{l}</span>
              {rowLayout.map((n, block) => (
                <div key={block} className="flex gap-[3px] sm:gap-1">
                  {Array.from({ length: n }, () => {
                    c++;
                    const seat = byId.get(l + c)!;
                    const lift = Math.pow(ix - (total - 1) / 2, 2) * 0.18;
                    ix++;
                    return (
                      <Seat key={seat.id} seat={seat} lift={lift} selected={selectedId === seat.id} onSelect={onSelect} />
                    );
                  })}
                </div>
              ))}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
