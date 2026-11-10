import Link from "next/link";
import { notFound } from "next/navigation";
import { HALLS, getHall } from "@/lib/halls";
import { SHOWS, getShow } from "@/lib/shows";
import { MOVIE } from "@/lib/movie";
import { buildSeats } from "@/lib/buildSeats";
import ShowTabs from "@/components/ShowTabs";
import Legend from "@/components/Legend";
import SeatPicker from "@/components/SeatPicker";
import { FilmButton } from "@/components/FilmProvider";

export function generateStaticParams() {
  return HALLS.flatMap((h) => SHOWS.map((s) => ({ cinema: h.slug, show: s.id })));
}

export default async function Page({ params }: { params: Promise<{ cinema: string; show: string }> }) {
  const { cinema, show: showId } = await params;
  const hall = getHall(cinema);
  const show = getShow(showId);
  if (!hall || !show) notFound();

  const seats = buildSeats(hall, show);
  const left = Object.fromEntries(SHOWS.map((s) => [s.id, buildSeats(hall, s).filter((x) => !x.taken).length]));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between px-5 pt-4">
        <span className="font-display text-lg">Meridian</span>
        <div className="flex items-center gap-2">
          <nav aria-label="Hall" className="flex rounded-full border-[1.5px] border-line p-0.5">
            {HALLS.map((h) => {
              const on = h.slug === hall.slug;
              return (
                <Link
                  key={h.slug}
                  href={`/${h.slug}/${show.id}`}
                  aria-current={on ? "page" : undefined}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${on ? "bg-ink text-paper" : "text-mute"}`}
                >
                  {h.name}
                </Link>
              );
            })}
          </nav>
          <FilmButton />
        </div>
      </header>

      <section className="px-5 pb-1 pt-4">
        <h1 className="font-display text-[34px] font-normal leading-[1.05] tracking-[-.5px]">{MOVIE.title}</h1>
        <p className="mt-1.5 text-[13px] text-mute">
          {MOVIE.genre}, {MOVIE.runtime}
        </p>
        <p className="text-[13px] text-mute">
          {MOVIE.date} in {hall.name}
        </p>
      </section>

      <ShowTabs cinema={hall.slug} current={show.id} left={left} />

      <div className="stage flex min-h-0 flex-1 flex-col">
        <div className="mx-6 mt-[18px] text-center">
          <svg viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden
            className="h-[34px] w-full drop-shadow-[0_6px_14px_rgba(227,27,35,.35)]">
            <defs>
              <linearGradient id="screenGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#E31B23" />
                <stop offset="1" stopColor="#C99A2E" />
              </linearGradient>
            </defs>
            <path d="M10 30 Q200 -8 390 30" fill="none" stroke="url(#screenGrad)" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] text-mute">Screen</span>
        </div>

        <SeatPicker key={`${hall.slug}-${show.id}`} hall={hall} seats={seats}>
          <Legend hall={hall} />
        </SeatPicker>
      </div>
      <p className="m-0 px-4 pb-1 text-center text-[11px] text-mute">Concept demo, hall sizes are placeholders</p>
    </main>
  );
}