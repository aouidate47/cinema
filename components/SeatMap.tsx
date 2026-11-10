"use client";
import { Fragment } from "react";
import type { Hall, Seat as SeatType } from "@/types";
import Seat from "./Seat";

type Props = { hall: Hall; seats: SeatType[]; selectedId: string | null; onSelect: (s: SeatType) => void };

export default function SeatMap({ hall, seats, selectedId, onSelect }: Props) {
  const byId = new Map(seats.map((s) => [s.id, s]));
  const maxSeats = Math.max(...hall.rows.map((_, r) => (hall.rowLayouts?.[r] ?? hall.layout).reduce((a, b) => a + b, 0)));

  return (
    <div
      className="flex min-h-0 w-full flex-1 flex-col justify-center gap-[clamp(3px,.7vh,7px)] overflow-hidden px-0.5 py-1"
      style={{ "--s": `min(23px, calc((100vw - 92px) / ${maxSeats}), calc((100dvh - 330px) / 17))` } as React.CSSProperties}
    >
      {hall.rows.map((l, r) => {
        let c = 0;
        let ix = 0;
        const rowLayout = hall.rowLayouts?.[r] ?? hall.layout;
        const total = rowLayout.reduce((a, b) => a + b, 0);
        return (
          <Fragment key={l}>
            {r === hall.balFrom && (
              <div className="my-0.5 text-center text-[8px] font-semibold uppercase tracking-[.18em] text-[#a47b3e]">Balcony</div>
            )}
            <div className="flex min-w-0 items-center justify-center gap-[clamp(3px,.7vw,9px)]">
              <span aria-hidden className="w-3 shrink-0 text-center text-[8px] font-semibold text-[#9a9ea5]">{l}</span>
              {rowLayout.map((n, block) => (
                <div key={block} className="flex gap-[2px]">
                  {Array.from({ length: n }, () => {
                    c++;
                    const seat = byId.get(l + c)!;
                    const lift = Math.pow(ix - (total - 1) / 2, 2) * 0.12;
                    ix++;
                    return <Seat key={seat.id} seat={seat} lift={lift} selected={selectedId === seat.id} onSelect={onSelect} />;
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
