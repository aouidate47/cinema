"use client";
import { useRef } from "react";

/** Bottom sheet: drag down to hide, drag up (or tap the handle) to show. */
export function useDraggableSheet(visible: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const collapsed = useRef(false);
  const drag = useRef<{ y: number; t: number; base: number; grab: boolean; cur?: number } | null>(null);

  const closedY = () => (ref.current?.offsetHeight ?? 0) - 104;
  const snap = (c: boolean) => {
    collapsed.current = c;
    if (ref.current) ref.current.style.transform = `translateY(${c ? closedY() : 0}px)`;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!visible || !el || (e.target as HTMLElement).closest("button")) return;
    drag.current = {
      y: e.clientY, t: performance.now(),
      base: collapsed.current ? closedY() : 0,
      grab: !!(e.target as HTMLElement).closest("[data-grab]"),
    };
    el.setPointerCapture(e.pointerId);
    el.style.transition = "none";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = ref.current;
    if (!d || !el) return;
    d.cur = Math.min(closedY(), Math.max(0, d.base + e.clientY - d.y));
    el.style.transform = `translateY(${d.cur}px)`;
  };
  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = ref.current;
    if (!d || !el) return;
    drag.current = null;
    el.style.transition = "";
    const dy = e.clientY - d.y;
    if (Math.abs(dy) < 6) snap(collapsed.current ? false : d.grab);
    else {
      const v = dy / Math.max(1, performance.now() - d.t);
      snap(v > 0.4 ? true : v < -0.4 ? false : (d.cur ?? d.base) > closedY() / 2);
    }
  };

  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } };
}