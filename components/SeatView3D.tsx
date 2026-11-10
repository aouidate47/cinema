"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Hall, Seat } from "@/types";
import { drawScene, type Camera } from "@/lib/projection";
import { useLookAround } from "@/hooks/useLookAround";
import SeatSheet from "./SeatSheet";

type Extra = { zoom?: number; mark?: { seat: Seat; a: number; pulse: number } };
type Props = { hall: Hall; seats: Seat[]; seat: Seat; film: HTMLCanvasElement; onClose: () => void; onBook: () => void };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const FLIGHT_MS = 3800;
const SPLIT = 0.5; // first half: approach. second half: descend
const overlayBtn = "absolute rounded-full bg-[#F4EDE1] text-[#14142B]";

export default function SeatView3D({ hall, seats, seat, film, onClose, onBook }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<SVGGElement>(null);
  const seatsRef = useRef<SVGGElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLElement>(null);
  const distRef = useRef<HTMLElement>(null);
  const cam = useRef<Camera | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const skip = useRef(false);
  const [flying, setFlying] = useState(true);

  const { look, label, handlers, recenter } = useLookAround(!flying, () => drawRef.current());

  const paint = useCallback(
    (c: Camera, extra?: Extra) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !roomRef.current || !seatsRef.current) return;
      const out = drawScene(hall, seats, c, look.current, ctx, film, extra);
      roomRef.current.innerHTML = out.room;
      seatsRef.current.innerHTML = out.seats;
    },
    [hall, seats, film, look]
  );

  useEffect(() => {
    drawRef.current = () => { if (cam.current) paint(cam.current); };
  }, [paint]);

  // drone descent: wide and high, glide to hover behind the seat, then drop to eye level
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const zFar = hall.firstRow + (hall.rows.length - 1) * hall.rowPitch + 14;
    const eye: Camera = { x: seat.x, y: seat.y + hall.eye, z: seat.z };
    const start: Camera = { x: seat.x * 0.3, y: 10, z: zFar };
    const hover: Camera = { x: seat.x, y: seat.y + 4.2, z: seat.z + 3.6 };
    const dur = reduced ? 1 : FLIGHT_MS;
    const t0 = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const t = skip.current ? 1 : Math.min(1, (now - t0) / dur);
      let from = start, to = hover, u: number, z0 = 0.72, z1 = 0.95;
      if (t < SPLIT) u = easeOut(t / SPLIT);
      else { from = hover; to = eye; u = easeInOut((t - SPLIT) / (1 - SPLIT)); z0 = 0.95; z1 = 1; }
      const c: Camera = { x: lerp(from.x, to.x, u), y: lerp(from.y, to.y, u), z: lerp(from.z, to.z, u) };
      const a = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2; // beacon fades as you arrive

      paint(c, { zoom: lerp(z0, z1, u), mark: { seat, a, pulse: (Math.sin(now / 160) + 1) / 2 } });

      if (phaseRef.current) phaseRef.current.textContent = (t < SPLIT ? "Approaching seat " : "Descending to seat ") + seat.id;
      if (heightRef.current) heightRef.current.textContent = Math.max(0, c.y - seat.y).toFixed(1) + " m";
      if (distRef.current) distRef.current.textContent = Math.max(0, c.z).toFixed(1) + " m";

      if (t < 1) raf = requestAnimationFrame(step);
      else { cam.current = eye; setFlying(false); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hall, seat, paint]);

  const layer = "absolute inset-0 size-full";
  return (
    <div {...handlers} className="fixed inset-y-0 left-1/2 z-10 w-full max-w-[440px] -translate-x-1/2 animate-[fadein_.45s_ease-out] touch-none select-none overflow-hidden bg-[#120A0C]">
      <svg className={layer} viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g ref={roomRef} />
      </svg>
      <canvas ref={canvasRef} width={800} height={1040} className={`${layer} object-cover`} aria-hidden />
      <svg className={layer} viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g ref={seatsRef} />
      </svg>

      <button onClick={onClose} aria-label="Back"
        className={`${overlayBtn} left-3.5 top-[calc(12px+env(safe-area-inset-top))] size-10 text-xl`}>‹</button>
      {flying ? (
        <button onClick={() => { skip.current = true; }}
          className={`${overlayBtn} right-3.5 top-[calc(12px+env(safe-area-inset-top))] h-10 px-3.5 text-[13px] font-bold`}>
          Skip
        </button>
      ) : (
        <button onClick={() => recenter(matchMedia("(prefers-reduced-motion: reduce)").matches)}
          className={`${overlayBtn} right-3.5 top-[calc(12px+env(safe-area-inset-top))] h-10 px-3.5 text-[13px] font-bold`}>
          Recenter
        </button>
      )}
      <div className="absolute left-1/2 top-[calc(14px+env(safe-area-inset-top))] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F4EDE1] px-4 py-[9px] text-sm font-semibold text-[#14142B]">
        View from {seat.id}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[calc(62px+env(safe-area-inset-top))] text-center text-xs font-bold tracking-wide text-[#F4EDE1] opacity-85">
        {flying ? "" : label}
      </div>

      {/* camera readout during the descent */}
      <div aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-[calc(28px+env(safe-area-inset-bottom))] flex justify-center transition-opacity duration-500 ${flying ? "opacity-100" : "opacity-0"}`}>
        <div className="rounded-2xl bg-[#14142B]/85 px-5 py-3 text-[#F4EDE1] backdrop-blur">
          <div ref={phaseRef} className="text-[13px] font-semibold" />
          <div className="mt-2 flex gap-7">
            <div>
              <b ref={heightRef} className="block font-display text-2xl font-normal leading-none" />
              <span className="text-[11px] opacity-70">above the seat</span>
            </div>
            <div>
              <b ref={distRef} className="block font-display text-2xl font-normal leading-none" />
              <span className="text-[11px] opacity-70">from the screen</span>
            </div>
          </div>
        </div>
      </div>

      <SeatSheet seat={seat} hall={hall} visible={!flying} onChange={onClose} onBook={onBook} />
    </div>
  );
}