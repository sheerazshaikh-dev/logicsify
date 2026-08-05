import { useEffect, useRef } from "react";

/**
 * Adds data-visible="true" on elements with [data-reveal] when in view.
 * Elements can add style={{ "--reveal-delay": "100ms" }} for stagger.
 *
 * CMS-backed sections can be inserted after the first render. A MutationObserver
 * registers those late elements so they do not remain permanently transparent.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const editorMode = new URLSearchParams(window.location.search).get("cms_edit") === "1";
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const revealImmediately =
      editorMode || reducedMotion || typeof IntersectionObserver === "undefined";
    const registered = new Set<HTMLElement>();

    const observer = revealImmediately
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const element = entry.target as HTMLElement;
              if (entry.isIntersecting) {
                element.setAttribute("data-visible", "true");
                observer?.unobserve(element);
                registered.delete(element);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        );

    const targetsWithin = (node: Node): HTMLElement[] => {
      if (!(node instanceof Element)) return [];

      const targets: HTMLElement[] = [];
      if (node.matches("[data-reveal]")) targets.push(node as HTMLElement);
      targets.push(...Array.from(node.querySelectorAll<HTMLElement>("[data-reveal]")));
      return targets;
    };

    const register = (node: Node) => {
      targetsWithin(node).forEach((element) => {
        if (registered.has(element)) return;
        registered.add(element);

        if (revealImmediately) {
          element.setAttribute("data-visible", "true");
        } else {
          observer?.observe(element);
        }
      });
    };

    const unregister = (node: Node) => {
      targetsWithin(node).forEach((element) => {
        observer?.unobserve(element);
        registered.delete(element);
      });
    };

    register(root);

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(register);
        record.removedNodes.forEach(unregister);
      });
    });

    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
      registered.clear();
    };
  }, []);

  return ref;
}
