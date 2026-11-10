"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const HINT = "⇆ Drag to look around";

function dirLabel(look: number) {
  const d = (((look * 180) / Math.PI) % 360 + 360) % 360;
  return d < 45 || d >= 315 ? "Facing the screen" : d < 135 ? "Looking right" : d < 225 ? "Looking behind you" : "Looking left";
}

/** 360° look-around by dragging. `draw` repaints the scene; it is called at most once per frame while dragging. */
export function useLookAround(enabled: boolean, draw: () => void) {
  const look = useRef(0);
  const drag = useRef<{ x: number; l: number } | null>(null);
  const pending = useRef(0);
  const anim = useRef(0);
  const [label, setLabel] = useState(HINT);

  const stop = useCallback(() => {
    cancelAnimationFrame(pending.current);
    cancelAnimationFrame(anim.current);
    pending.current = 0;
    drag.current = null;
  }, []);
  useEffect(() => stop, [stop]); // unmounting cancels any running animation

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if ((e.target as HTMLElement).closest("button, [data-sheet]")) return;
    cancelAnimationFrame(anim.current);
    drag.current = { x: e.clientX, l: look.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !enabled) return;
    look.current = d.l - (e.clientX - d.x) * 0.006;
    setLabel(dirLabel(look.current));
    if (!pending.current)
      pending.current = requestAnimationFrame(() => { pending.current = 0; draw(); });
  };
  const end = () => { drag.current = null; };

  const recenter = (reduced: boolean) => {
    cancelAnimationFrame(anim.current);
    const l0 = look.current, t0 = performance.now();
    const tg = Math.round(l0 / (2 * Math.PI)) * 2 * Math.PI;
    const step = (n: number) => {
      const t = Math.min(1, (n - t0) / (reduced ? 1 : 450));
      look.current = l0 + (tg - l0) * (1 - Math.pow(1 - t, 3));
      draw();
      setLabel(dirLabel(look.current));
      if (t < 1) anim.current = requestAnimationFrame(step);
      else { look.current = 0; draw(); }
    };
    anim.current = requestAnimationFrame(step);
  };

  return {
    look, label, recenter,
    handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end },
  };
}