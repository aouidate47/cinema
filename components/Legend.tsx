const dot = "mr-[5px] inline-block size-2.5 align-[-1px] border-[1.8px]";
const SLASH = "bg-[linear-gradient(45deg,transparent_38%,var(--mute)_38%_62%,transparent_62%),var(--taken)]";

export default function Legend() {
  return (
    <div className="flex justify-center gap-2.5 py-1.5 text-xs text-mute">
      <span><i className={`${dot} rounded-full border-ink bg-card`} />Free</span>
      <span><i className={`${dot} rounded-full border-taken ${SLASH}`} />Taken</span>
      <span><i className={`${dot} rounded-[32%] border-plum bg-plum`} />Recliner</span>
      <span><i className={`${dot} rounded-full border-gold bg-gold shadow-[inset_0_0_0_3px_var(--card)]`} />Balcony</span>
      <span><i className={`${dot} rounded-full border-brand bg-brand`} />Yours</span>
    </div>
  );
}