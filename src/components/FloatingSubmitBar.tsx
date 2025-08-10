import React from 'react';

export default function FloatingSubmitBar({
  show,
  onPress,
}: { show: boolean; onPress: () => void }) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10
                 bg-white/90 dark:bg-slate-900/90 backdrop-blur
                 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]
                 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)]"
      role="region"
      aria-label="Submit plan"
    >
      <button
        type="button"
        onClick={onPress}
        className="w-full rounded-md bg-gradient-hero text-white
                   text-base font-semibold py-3 active:opacity-90"
      >
        Submit This Plan
      </button>
    </div>
  );
}
