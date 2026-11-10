import Link from "next/link";
import { notFound } from "next/navigation";
import { HALLS, getHall } from "@/lib/halls";
import { SHOWS, getShow } from "@/lib/shows";
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

  const next = HALLS[(HALLS.indexOf(hall) + 1) % HALLS.length];
  const seats = buildSeats(hall, show);

  return (
    <main className="mx-auto flex h-dvh max-w-[440px] flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <header className="flex items-end justify-between gap-2 px-5 pb-1 pt-[18px]">
        <div>
          <h1 className="font-display text-[46px] font-normal uppercase leading-none tracking-[-.5px]">Meridian</h1>
          <span className="mt-1.5 block text-[13px] text-mute">Fri 14 Nov · {hall.name}</span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Link href={`/${next.slug}/${show.id}`} aria-label="Switch hall"
            className="rounded-full border-[1.5px] border-ink px-3 py-1.5 text-xs font-extrabold tracking-[1px]">
            {hall.name} ⇄
          </Link>
          <FilmButton />
        </div>
      </header>

      <ShowTabs cinema={hall.slug} current={show.id} />

      <div className="mx-6 mt-[18px] text-center">
        <svg viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden className="h-[34px] w-full">
          <defs>
            <linearGradient id="screenGrad" x1="0" x2="1">
              <stop offset="0" stopColor="#E31B23" />
              <stop offset="1" stopColor="#C99A2E" />
            </linearGradient>
          </defs>
          <path d="M10 30 Q200 -8 390 30" fill="none" stroke="url(#screenGrad)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] tracking-[5px] text-mute">SCREEN</span>
      </div>

      <SeatPicker key={`${hall.slug}-${show.id}`} hall={hall} seats={seats} />
      <Legend />
      <p className="m-0 px-4 pb-1 text-center text-[11px] text-mute">Concept demo · hall sizes are placeholders</p>
    </main>
  );
}