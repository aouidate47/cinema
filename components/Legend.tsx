import type { Hall } from "@/types";

const dot = "inline-block size-2.5 shrink-0 border-[1.8px]";

export default function Legend({ hall }: { hall: Hall }) {
  const hasBal = hall.balFrom < hall.rows.length;
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-white/[0.07] px-2 pt-4 text-[11px] font-medium text-white/55 sm:justify-start sm:gap-x-6">
      <span className="inline-flex items-center gap-2"><i className={`${dot} rounded-full border-white/75 bg-white/10`} />Standard <b className="font-semibold text-white/80">{hall.priceStd} DH</b></span>
      <span className="inline-flex items-center gap-2"><i className={`${dot} rounded-[32%] border-plum bg-plum`} />Recliner <b className="font-semibold text-white/80">{hall.priceRec} DH</b></span>
      {hasBal && <span className="inline-flex items-center gap-2"><i className={`${dot} rounded-full border-gold bg-gold shadow-[inset_0_0_0_3px_#15171d`} />Balcony <b className="font-semibold text-white/80">{hall.priceBal} DH</b></span>}
      <span className="inline-flex items-center gap-2"><i className={`${dot} rounded-full border-taken bg-[linear-gradient(45deg,transparent_38%,#8d929e_38%_62%,transparent_62%),var(--taken)]`} />Taken</span>
      <span className="inline-flex items-center gap-2"><i className={`${dot} rounded-full border-brand bg-brand shadow-[0_0_12px_rgba(227,27,35,.35)]`} />Selected</span>
    </div>
  );
}
