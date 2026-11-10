"use client";
import type { Hall, Seat } from "@/types";
import { useDraggableSheet } from "@/hooks/useDraggableSheet";

type Props = { seat: Seat; hall: Hall; visible: boolean; onChange: () => void; onBook: () => void };

function kicker(s: Seat) {
  const mid = s.r >= 3 && s.r <= 5 && Math.abs(s.x) < 1.6;
  return s.bal ? "Balcony view" : s.r <= 1 ? "Up close" : mid ? "Sweet spot" : s.r >= 6 ? "Full picture" : "Good view";
}

export default function SeatSheet({ seat, hall, visible, onChange, onBook }: Props) {
  const { ref, handlers } = useDraggableSheet(visible);
  const fov = Math.round((2 * Math.atan(hall.screenW / 2 / seat.z) * 180) / Math.PI);
  const ox = Math.abs(seat.x);
  const centred = ox < 0.15;
  const stat = "block font-display text-3xl font-normal leading-[normal]";

  return (
    <div
      ref={ref}
      data-sheet
      aria-hidden={!visible}
      {...handlers}
      style={visible ? undefined : { transform: "translateY(120%)" }}
      className="absolute inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom))] mx-auto max-w-[420px] touch-none rounded-[28px] bg-card px-5 pb-[18px] pt-5 text-ink transition-transform duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]"
    >
      <div data-grab className="-mt-3 flex h-7 cursor-grab items-center justify-center">
        <span className="h-[5px] w-[46px] rounded-sm bg-mute opacity-50" />
      </div>
      <div className="inline-block rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-paper">
        {kicker(seat)}
      </div>
      <h2 className="mb-0.5 mt-2.5 font-display text-4xl font-normal leading-[normal]">Row {seat.l}, seat {seat.n}</h2>
      <div className="text-sm text-mute">
        {seat.bal ? "Balcony" : seat.rec ? "Recliner" : "Standard"} · {seat.price} DH
      </div>

      <div className="my-4 grid grid-cols-3 border-y border-dashed border-line">
        <div className="py-3 pl-0"><b className={stat}>{seat.z.toFixed(1)} m</b><span className="text-xs text-mute">to screen</span></div>
        <div className="border-l border-line py-3 pl-3"><b className={stat}>{fov}°</b><span className="text-xs text-mute">field of view</span></div>
        <div className="border-l border-line py-3 pl-3">
          <b className={stat}>{centred ? "0 m" : `${ox.toFixed(1)} m`}</b>
          <span className="text-xs text-mute">{centred ? "centred" : `${seat.x < 0 ? "left" : "right"} of centre`}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button onClick={onChange} className="px-2 py-3 font-semibold text-mute underline">Change seat</button>
        <button onClick={onBook} className="flex-1 rounded-full bg-brand p-[17px] text-base font-bold text-white">
          Book seat, {seat.price} DH
        </button>
      </div>
    </div>
  );
}