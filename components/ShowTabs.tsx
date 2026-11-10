import Link from "next/link";
import { SHOWS } from "@/lib/shows";

type Props = { cinema: string; current: string; left?: Record<string, number> };

export default function ShowTabs({ cinema, current, left }: Props) {
  return (
    <nav className="grid grid-cols-3 gap-2.5" aria-label="Showtimes">
      {SHOWS.map((s, index) => {
        const on = s.id === current;
        return (
          <Link
            key={s.id}
            href={`/${cinema}/${s.id}`}
            aria-current={on ? "page" : undefined}
            className={`group relative min-w-0 overflow-hidden rounded-2xl border px-3 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${on ? "border-brand/70 bg-brand text-white shadow-[0_10px_28px_rgba(227,27,35,.2)]" : "border-white/10 bg-white/[0.035] text-white hover:border-white/25 hover:bg-white/[0.07]"}`}
          >
            <span className={`mb-2 block text-[9px] font-bold uppercase tracking-[.16em] ${on ? "text-white/65" : "text-white/35"}`}>
              Session 0{index + 1}
            </span>
            <span className="block text-[clamp(1.2rem,3vw,1.65rem)] font-semibold leading-none tracking-[-.04em]">{s.time}</span>
            <span className={`mt-2 block truncate text-[10px] font-medium ${on ? "text-white/75" : "text-white/40"}`}>
              {s.format}{left ? ` · ${left[s.id]} seats left` : ""}
            </span>
            {on && <span className="absolute right-3 top-3 size-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />}
          </Link>
        );
      })}
    </nav>
  );
}
