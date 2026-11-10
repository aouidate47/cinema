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
    <main className="h-dvh overflow-hidden bg-[#f4f4f2] px-3 pb-3 pt-[max(10px,env(safe-area-inset-top))] text-[#202124] sm:px-6 sm:pb-5">
      <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-black/[0.08]">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Meridian home">
            <span className="grid size-8 place-items-center rounded-lg bg-[#202124] text-white">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 7.5h16v12H4z" /><path d="m8 7.5 2-3h4l2 3M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
            </span>
            <span className="font-display text-[15px] font-semibold tracking-[.07em]">MERIDIAN</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-[#777b82] sm:inline">Choose your seat</span>
            <FilmButton />
          </div>
        </header>

        <section className="flex shrink-0 items-center justify-between gap-3 py-3 sm:py-4">
          <div className="min-w-0">
            <h1 className="truncate text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-tight tracking-[-.04em]">{MOVIE.title}</h1>
            <p className="mt-1 text-[11px] text-[#777b82]">{MOVIE.genre} <span className="mx-1.5">·</span> {MOVIE.runtime}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[#555960] shadow-sm">Auditorium</span>
        </section>

        <section className="mb-3 shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Showtime</h2>
            <span className="text-[10px] text-[#858991]">Today</span>
          </div>
          <ShowTabs cinema={hall.slug} current={show.id} left={left} />
        </section>

        <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-2.5 shadow-[0_5px_24px_rgba(20,20,20,.045)] sm:rounded-[22px] sm:p-4">
          <div className="mb-1 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-semibold">Select seats</h2>
            <span className="text-[10px] text-[#858991]">Tap to select</span>
          </div>
          <SeatPicker hall={hall} seats={seats}>
            <Legend hall={hall} />
          </SeatPicker>
        </section>
      </div>
    </main>
  );
}
