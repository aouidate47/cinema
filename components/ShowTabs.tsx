import Link from "next/link";
import { SHOWS } from "@/lib/shows";

type Props = { cinema: string; current: string; left?: Record<string, number> };

export default function ShowTabs({ cinema, current }: Props) {
  return (
    <nav className="grid grid-cols-3 gap-2" aria-label="Showtimes">
      {SHOWS.map((s) => {
        const on = s.id === current;
        return (
          <Link
            key={s.id}
            href={`/${cinema}/${s.id}`}
            aria-current={on ? "page" : undefined}
            className={`flex items-center justify-center rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors sm:py-3 ${on ? "border-[#24262a] bg-[#24262a] text-white" : "border-black/10 bg-white text-[#555960] hover:border-black/25"}`}
          >
            {s.time}
            <span className={`ml-2 text-[9px] font-medium ${on ? "text-white/65" : "text-[#969aa1]"}`}>{s.format}</span>
          </Link>
        );
      })}
    </nav>
  );
}
