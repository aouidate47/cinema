"use client";
import { createContext, useContext, useRef, useState } from "react";
import { createFilmCanvas, drawCover } from "@/lib/demoScreen";
import Toast from "./Toast";

type Ctx = { film: HTMLCanvasElement | null; say: (text: string) => void; pickImage: () => void };
const FilmCtx = createContext<Ctx | null>(null);

export function useFilm() {
  const c = useContext(FilmCtx);
  if (!c) throw new Error("useFilm must be used inside FilmProvider");
  return c;
}

export default function FilmProvider({ children }: { children: React.ReactNode }) {
  const [film] = useState<HTMLCanvasElement | null>(() =>
    typeof document === "undefined" ? null : createFilmCanvas()
  );
  const [toast, setToast] = useState({ text: "", show: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const say = (text: string) => {
    clearTimeout(timer.current);
    setToast({ text, show: true });
    timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !film) return;
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => { drawCover(film, im); URL.revokeObjectURL(url); say("Screen image changed"); };
    im.src = url;
  };

  return (
    <FilmCtx.Provider value={{ film, say, pickImage: () => fileRef.current?.click() }}>
      {children}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
      <Toast message={toast.text} show={toast.show} />
    </FilmCtx.Provider>
  );
}

export function FilmButton() {
  const { pickImage } = useFilm();
  return (
    <button
      onClick={pickImage}
      aria-label="Change screen image"
      title="Change screen image"
      className="grid size-9 place-items-center rounded-full border-[1.5px] border-line text-ink"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4 18 5-5 4 4 3-3 4 4" />
      </svg>
    </button>
  );
}