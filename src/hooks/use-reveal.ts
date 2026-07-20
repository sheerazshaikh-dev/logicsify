import { useEffect, useRef } from "react";

/**
 * Adds data-visible="true" on elements with [data-reveal] when in view.
 * Elements can add style={{ "--reveal-delay": "100ms" }} for stagger.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const editorMode = new URLSearchParams(window.location.search).get("cms_edit") === "1";
    if (editorMode || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.setAttribute("data-visible", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).setAttribute("data-visible", "true");
          } else if (e.boundingClientRect.top > 0) {
            // reverse when scrolling back up past it
            (e.target as HTMLElement).setAttribute("data-visible", "false");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}
