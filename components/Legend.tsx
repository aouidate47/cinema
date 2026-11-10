import type { Hall } from "@/types";

const dot = "mr-1.5 inline-block size-2.5 align-[-1px] border-[1.8px]";
const SLASH = "bg-[linear-gradient(45deg,transparent_38%,var(--mute)_38%_62%,transparent_62%),var(--taken)]";

export default function Legend({ hall }: { hall: Hall }) {
  const hasBal = hall.balFrom < hall.rows.length;
  return (
    <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 px-4 py-1.5 text-xs text-mute">
      <span><i className={`${dot} rounded-full border-ink bg-card`} />Standard {hall.priceStd} DH</span>
      <span><i className={`${dot} rounded-[32%] border-plum bg-plum`} />Recliner {hall.priceRec} DH</span>
      {hasBal && (
        <span><i className={`${dot} rounded-full border-gold bg-gold shadow-[inset_0_0_0_3px_var(--card)]`} />Balcony {hall.priceBal} DH</span>
      )}
      <span><i className={`${dot} rounded-full border-taken ${SLASH}`} />Taken</span>
    </div>
  );
}