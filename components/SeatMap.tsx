"use client";
import { Fragment } from "react";
import type { Hall, Seat as SeatType } from "@/types";
import Seat from "./Seat";

type Props = { hall: Hall; seats: SeatType[]; selectedId: string | null; onSelect: (s: SeatType) => void };

export default function SeatMap({ hall, seats, selectedId, onSelect }: Props) {
  const byId = new Map(seats.map((s) => [s.id, s]));
  const total = hall.layout.reduce((a, b) => a + b, 0);

  return (
    <div
      className="flex flex-1 flex-col justify-center gap-[7px] px-3"
      style={{ "--s": "min(20px, calc((100vw - 100px) / 14))" } as React.CSSProperties}
    >
      {hall.rows.map((l, r) => {
        let c = 0;
        let ix = 0;
        return (
          <Fragment key={l}>
            {r === hall.balFrom && (
              <div className="-my-0.5 text-center text-[10px] tracking-[4px] text-mute">BALCONY</div>
            )}
            <div className="flex items-center justify-center gap-3">
              <span aria-hidden className="w-3 text-[11px] font-semibold text-mute">{l}</span>
              {hall.layout.map((n, block) => (
                <div key={block} className="flex gap-[5px]">
                  {Array.from({ length: n }, () => {
                    c++;
                    const seat = byId.get(l + c)!;
                    const lift = Math.pow(ix - (total - 1) / 2, 2) * 0.28;
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