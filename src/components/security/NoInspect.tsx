import { useEffect } from "react";

/**
 * Lightweight client-side deterrents against casual inspection.
 * Note: This cannot truly prevent access to source or devtools.
 */
export default function NoInspect() {
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Block common DevTools shortcuts
      if (key === "f12") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if ((ctrlOrMeta && shift && ["i", "j", "c"].includes(key)) || (e.metaKey && e.altKey && key === "i")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // View source, print, save
      if (ctrlOrMeta && ["u", "p", "s"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  return null;
}
