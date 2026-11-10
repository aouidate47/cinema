export default function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-4 bottom-[calc(24px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-[408px] rounded-[14px] bg-ink px-4 py-3.5 text-sm text-paper transition ${
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}