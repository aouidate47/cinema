import Link from "next/link";
import { SHOWS } from "@/lib/shows";

type Props = { cinema: string; current: string; left?: Record<string, number> };

export default function ShowTabs({ cinema, current, left }: Props) {
  return (
    <nav className="flex gap-2 px-5 pt-3.5" aria-label="Showtimes">
      {SHOWS.map((s) => {
        const on = s.id === current;
        return (
          <Link
            key={s.id}
            href={`/${cinema}/${s.id}`}
            aria-current={on ? "page" : undefined}
            className={`flex-1 rounded-2xl border-[1.5px] px-3 py-2.5 ${on ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            <b className="block text-xl font-extrabold leading-tight">{s.time}</b>
            <small className={`text-[11px] ${on ? "opacity-70" : "text-mute"}`}>
              {s.format}{left ? `, ${left[s.id]} free` : ""}
            </small>
          </Link>
        );
      })}
    </nav>
  );
}