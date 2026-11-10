"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Hall, Seat } from "@/types";
import { drawScene, type Camera } from "@/lib/projection";
import { useLookAround } from "@/hooks/useLookAround";
import SeatSheet from "./SeatSheet";

type Props = { hall: Hall; seats: Seat[]; seat: Seat; film: HTMLCanvasElement; onClose: () => void; onBook: () => void };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const overlayBtn = "absolute rounded-full bg-[#F4EDE1] text-[#14142B]";

export default function SeatView3D({ hall, seats, seat, film, onClose, onBook }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<SVGGElement>(null);
  const seatsRef = useRef<SVGGElement>(null);
  const cam = useRef<Camera | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const [flying, setFlying] = useState(true);

  const { look, label, handlers, recenter } = useLookAround(!flying, () => drawRef.current());

  const paint = useCallback(
    (c: Camera) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !roomRef.current || !seatsRef.current) return;
      const out = drawScene(hall, seats, c, look.current, ctx, film);
      roomRef.current.innerHTML = out.room;
      seatsRef.current.innerHTML = out.seats;
    },
    [hall, seats, film, look]
  );

  useEffect(() => {
    drawRef.current = () => { if (cam.current) paint(cam.current); };
  }, [paint]);

  // fly-in from above the hall down to the chosen seat
  useEffect(() => {
    const zFar = hall.firstRow + (hall.rows.length - 1) * hall.rowPitch + 12;
    const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 2200;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur), e = ease(t);
      paint({ x: lerp(0, seat.x, e), y: lerp(5.5, seat.y + hall.eye, e), z: lerp(zFar, seat.z, e) });
      if (t < 1) raf = requestAnimationFrame(step);
      else { cam.current = { x: seat.x, y: seat.y + hall.eye, z: seat.z }; setFlying(false); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hall, seat, paint]);

  const layer = "absolute inset-0 size-full";
  return (
    <div {...handlers} className="fixed inset-0 z-10 touch-none select-none overflow-hidden bg-[#120A0C]">
      <svg className={layer} viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g ref={roomRef} />
      </svg>
      <canvas ref={canvasRef} width={800} height={1040} className={`${layer} object-cover`} aria-hidden />
      <svg className={layer} viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g ref={seatsRef} />
      </svg>

      <button onClick={onClose} aria-label="Back"
        className={`${overlayBtn} left-3.5 top-[calc(12px+env(safe-area-inset-top))] size-10 text-xl`}>‹</button>
      <button onClick={() => recenter(matchMedia("(prefers-reduced-motion: reduce)").matches)}
        className={`${overlayBtn} right-3.5 top-[calc(12px+env(safe-area-inset-top))] h-10 px-3.5 text-xs font-extrabold uppercase tracking-wide`}>
        ⌖ Screen
      </button>
      <div className="absolute left-1/2 top-[calc(14px+env(safe-area-inset-top))] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F4EDE1] px-4 py-[9px] text-sm font-semibold text-[#14142B]">
        View from {seat.id}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[calc(62px+env(safe-area-inset-top))] text-center text-xs font-bold tracking-wide text-[#F4EDE1] opacity-85">
        {label}
      </div>

      <SeatSheet seat={seat} hall={hall} visible={!flying} onChange={onClose} onBook={onBook} />
    </div>
  );
}