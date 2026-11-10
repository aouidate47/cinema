"use client";
import { useCallback, useRef, useState } from "react";
import type { Hall, Seat } from "@/types";
import SeatSheet from "./SeatSheet";
import CinemaScene3D from "./CinemaScene3D";

type Props = { hall: Hall; seats: Seat[]; seat: Seat; film: HTMLCanvasElement; onClose: () => void; onBook: () => void };

const overlayBtn = "absolute rounded-full border border-white/10 bg-[#171317]/85 text-[#F4EDE1] shadow-lg backdrop-blur-xl";

export default function SeatView3D({ hall, seats, seat, film, onClose, onBook }: Props) {
  const [flying, setFlying] = useState(true);
  const [phase, setPhase] = useState("Entering auditorium");
  const skipRef = useRef(false);
  const lookRef = useRef(0);
  const arrived = useCallback(() => {
    setPhase("Your seat view");
    setFlying(false);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#09090d] text-[#F4EDE1]">
      <CinemaScene3D hall={hall} seats={seats} seat={seat} film={film}
        onArrive={arrived} skipRef={skipRef} lookRef={lookRef} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/50" />
      <button onClick={onClose} aria-label="Back"
        className={`${overlayBtn} left-4 top-[calc(14px+env(safe-area-inset-top))] grid size-11 place-items-center text-2xl`}>
        ‹
      </button>
      {flying ? (
        <button onClick={() => { skipRef.current = true; }}
          className={`${overlayBtn} right-4 top-[calc(14px+env(safe-area-inset-top))] h-11 px-5 text-sm font-semibold`}>
          Skip intro
        </button>
      ) : (
        <div className={`${overlayBtn} right-4 top-[calc(68px+env(safe-area-inset-top))] flex h-11 items-center gap-2 px-4 text-sm font-semibold`}>
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          Drag to look around
        </div>
      )}
      <div className="absolute left-1/2 top-[calc(16px+env(safe-area-inset-top))] -translate-x-1/2 rounded-full border border-white/10 bg-[#171317]/80 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-xl">
        <span className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />
        View from {seat.id}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(118px+env(safe-area-inset-bottom))] flex justify-center">
        <div className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-medium tracking-wide text-white/85 backdrop-blur-xl">
          {flying ? "PREVIEWING YOUR SEAT" : phase.toUpperCase()}
        </div>
      </div>
      <SeatSheet seat={seat} hall={hall} visible={!flying} onChange={onClose} onBook={onBook} />
    </div>
  );
}