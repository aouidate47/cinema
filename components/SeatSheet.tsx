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
  const stat = "block font-sans text-[28px] font-semibold tracking-[-0.045em] leading-tight";

  return (
    <div
      ref={ref}
      data-sheet
      aria-hidden={!visible}
      {...handlers}
      style={visible ? undefined : { transform: "translateY(120%)" }}
      className="absolute inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom))] mx-auto max-w-[420px] touch-none rounded-[30px] border border-white/60 bg-white/90 px-5 pb-[18px] pt-4 text-[#1d1d1f] shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition-transform duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)] dark:border-white/10 dark:bg-[#1c1c1e]/90 dark:text-white"
    >
      <div data-grab className="-mt-2 flex h-6 cursor-grab items-center justify-center">
        <span className="h-[5px] w-9 rounded-full bg-[#8e8e93]/55" />
      </div>

      <div className="inline-flex rounded-full bg-[#f2f2f7] px-3 py-1 text-[11px] font-semibold tracking-[0.01em] text-[#636366] dark:bg-white/10 dark:text-[#d1d1d6]">
        {kicker(seat)}
      </div>
      <h2 className="mb-0 mt-2.5 font-sans text-[27px] font-semibold tracking-[-0.045em] leading-tight">
        Row {seat.l}<span className="mx-1 text-[#8e8e93]">·</span>Seat {seat.n}
      </h2>
      <div className="mt-1 text-[13px] font-medium text-[#8e8e93]">
        {seat.bal ? "Balcony" : seat.rec ? "Recliner" : "Standard"} <span className="mx-1">·</span> {seat.price} DH
      </div>

      <div className="my-4 grid grid-cols-3 rounded-2xl bg-[#f2f2f7] px-1 py-3 dark:bg-white/[0.07]">
        <div className="px-2">
          <b className={stat}>{seat.z.toFixed(1)}<span className="ml-0.5 text-[15px] font-medium tracking-normal text-[#8e8e93]">m</span></b>
          <span className="mt-1 block text-[11px] font-medium text-[#8e8e93]">To screen</span>
        </div>
        <div className="border-l border-[#d1d1d6] px-3 dark:border-white/10">
          <b className={stat}>{fov}<span className="ml-0.5 text-[15px] font-medium tracking-normal text-[#8e8e93]">°</span></b>
          <span className="mt-1 block text-[11px] font-medium text-[#8e8e93]">Field of view</span>
        </div>
        <div className="border-l border-[#d1d1d6] px-3 dark:border-white/10">
          <b className={stat}>{centred ? "0" : ox.toFixed(1)}<span className="ml-0.5 text-[15px] font-medium tracking-normal text-[#8e8e93]">m</span></b>
          <span className="mt-1 block text-[11px] font-medium text-[#8e8e93]">{centred ? "Centered" : seat.x < 0 ? "Left of center" : "Right of center"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onChange} className="rounded-full px-3 py-3 text-[14px] font-semibold text-[#007aff] transition-colors hover:bg-[#007aff]/10">
          Change seat
        </button>
        <button onClick={onBook} className="flex-1 rounded-full bg-[#007aff] px-4 py-[15px] text-[15px] font-semibold tracking-[-0.01em] text-white shadow-sm transition-colors hover:bg-[#006be6] active:bg-[#005ac1]">
          Book · {seat.price} DH
        </button>
      </div>
    </div>
  );
}