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
    <main className="min-h-dvh px-4 pb-8 pt-[max(18px,env(safe-area-inset-top))] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <Link href="/" className="group flex items-center gap-3" aria-label="Meridian home">
            <span className="grid size-10 place-items-center rounded-[14px] bg-brand text-white shadow-[0_8px_24px_rgba(227,27,35,.28)]">
              <svg viewBox="0 0 24 24" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 7.5h16v12H4z" />
                <path d="m8 7.5 2-3h4l2 3M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
            </span>
            <span>
              <span className="block font-display text-[17px] tracking-[.04em]">MERIDIAN</span>
              <span className="block text-[9px] font-semibold tracking-[.24em] text-mute">CINEMA EXPERIENCE</span>
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <nav aria-label="Choose auditorium" className="flex items-center rounded-full border border-white/10 bg-white/[0.035] p-1">
              {HALLS.map((h) => {
                const on = h.slug === hall.slug;
                return (
                  <Link
                    key={h.slug}
                    href={`/${h.slug}/${show.id}`}
                    aria-current={on ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold transition-colors sm:px-4 ${on ? "bg-white text-[#111216] shadow-sm" : "text-white/55 hover:text-white"}`}
                  >
                    {h.name}
                  </Link>
                );
              })}
            </nav>
            <div className="rounded-full border border-white/10 bg-white/[0.035] p-1">
              <FilmButton />
            </div>
          </div>
        </header>

        <section className="grid gap-5 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:py-9">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#ff777d]">
              <span className="size-1.5 rounded-full bg-brand shadow-[0_0_12px_rgba(227,27,35,.8)]" />
              Now showing
            </div>
            <h1 className="max-w-[760px] font-display text-[clamp(2.35rem,6vw,4.6rem)] font-normal leading-[.98] tracking-[-.045em]">
              {MOVIE.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-white/55">
              <span>{MOVIE.genre}</span>
              <span className="size-1 rounded-full bg-white/25" />
              <span>{MOVIE.runtime}</span>
              <span className="size-1 rounded-full bg-white/25" />
              <span>{MOVIE.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 sm:self-end">
            <svg viewBox="0 0 24 24" className="size-4 text-white/55" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 10.5 12 4l9 6.5V20H3z" />
              <path d="M9 20v-6h6v6" />
            </svg>
            <span className="text-xs font-semibold text-white/75">{hall.name}</span>
            <span className="text-[10px] text-white/35">· Auditorium</span>
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Choose a session</p>
              <h2 className="mt-1 text-[17px] font-semibold tracking-tight">Showtimes</h2>
            </div>
            <span className="pb-0.5 text-[11px] text-white/35">Local time</span>
          </div>
          <ShowTabs cinema={hall.slug} current={show.id} left={left} />
        </section>

        <section className="seat-panel-glow overflow-hidden rounded-[28px] border border-white/[0.09] p-3 shadow-[0_28px_80px_rgba(0,0,0,.28)] sm:rounded-[32px] sm:p-6">
          <div className="mb-3 flex items-center justify-between px-1 sm:px-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/35">01 / Select your seats</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Choose your view</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white/45">Tap a seat to select</span>
          </div>
          <SeatPicker hall={hall} seats={seats}>
            <Legend hall={hall} />
          </SeatPicker>
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 px-2 pt-5 text-[10px] text-white/30 sm:flex-row">
          <span>MERIDIAN · A better view starts with your seat.</span>
          <span>Concept demo · Hall dimensions are illustrative</span>
        </footer>
      </div>
    </main>
  );
}
