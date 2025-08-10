import React from 'react';

export default function FloatingSubmitBar({
  show,
  onSubmit,
  onRevealGate,
}: {
  show: boolean;
  onSubmit?: () => void;        // (unused now — we reveal gate instead)
  onRevealGate: () => void;
}) {
  if (!show) return null;
  return (
    <div
      className="
        fixed inset-x-0 bottom-0 z-40
        backdrop-blur-md
        bg-[hsl(var(--dark-navy))]/95
        border-t border-border
        px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]
        sm:hidden
      "
      role="region" aria-label="Submit plan"
    >
      <button
        type="button"
        onClick={() => {
          try { window.location.hash = '#submit-gate'; } catch {}
          window.dispatchEvent(new Event('reveal-submit-gate'));
          onRevealGate?.();
        }}
        className="w-full h-12 rounded-md bg-gradient-hero text-white font-semibold shadow-lg"
        aria-label="Submit This Plan"
      >
        Submit This Plan
      </button>
    </div>
  );
}
