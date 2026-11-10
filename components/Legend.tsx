import type { Hall } from "@/types";

const dot = "mr-2 inline-block size-2.5 shrink-0 border-[1.8px]";
const SLASH = "bg-[linear-gradient(45deg,transparent_38%,var(--mute)_38%_62%,transparent_62%),var(--taken)]";

export default function Legend({ hall }: { hall: Hall }) {
  const hasBal = hall.balFrom < hall.rows.length;
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-5 gap-y-2 px-5 py-2 text-xs text-mute">
      <span className="inline-flex items-center whitespace-nowrap"><i className={`${dot} rounded-full border-ink bg-card`} />Standard {hall.priceStd} DH</span>
      <span className="inline-flex items-center whitespace-nowrap"><i className={`${dot} rounded-[32%] border-plum bg-plum`} />Recliner {hall.priceRec} DH</span>
      {hasBal && (
        <span className="inline-flex items-center whitespace-nowrap"><i className={`${dot} rounded-full border-gold bg-gold shadow-[inset_0_0_0_3px_var(--card)]`} />Balcony {hall.priceBal} DH</span>
      )}
      <span className="inline-flex items-center whitespace-nowrap"><i className={`${dot} rounded-full border-taken ${SLASH}`} />Taken</span>
    </div>
  );
}