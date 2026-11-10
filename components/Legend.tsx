import type { Hall } from "@/types";

const dot = "inline-block size-2 shrink-0 border";

export default function Legend({ hall }: { hall: Hall }) {
  const hasBal = hall.balFrom < hall.rows.length;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-black/[0.06] px-1 pt-2 text-[9px] text-[#777b82]">
      <span className="inline-flex items-center gap-1.5"><i className={`${dot} rounded-full border-[#b8bdc4] bg-white`} />Standard {hall.priceStd} DH</span>
      <span className="inline-flex items-center gap-1.5"><i className={`${dot} rounded-[30%] border-[#9b6be8] bg-[#9b6be8]`} />Recliner {hall.priceRec} DH</span>
      {hasBal && <span className="inline-flex items-center gap-1.5"><i className={`${dot} rounded-full border-[#d5ad63] bg-[#d5ad63]`} />Balcony {hall.priceBal} DH</span>}
      <span className="inline-flex items-center gap-1.5"><i className={`${dot} rounded-full border-[#858991] bg-[#858991]`} />Taken</span>
      <span className="inline-flex items-center gap-1.5"><i className={`${dot} rounded-full border-[#e31b23] bg-[#e31b23]`} />Selected</span>
    </div>
  );
}
