import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const START_PROGRESS = 12;
const MAX_PENDING_PROGRESS = 88;

export function TopProgressBar() {
  const routerStatus = useRouterState({ select: (state) => state.status });
  const isNavigating = routerStatus === "pending";
  const [scrollProgress, setScrollProgress] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
  const [showRouteCompletion, setShowRouteCompletion] = useState(false);
  const wasNavigating = useRef(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    let progressTimer: number | undefined;
    let completionTimer: number | undefined;

    if (isNavigating) {
      wasNavigating.current = true;
      setShowRouteCompletion(false);
      setRouteProgress(START_PROGRESS);

      progressTimer = window.setInterval(() => {
        setRouteProgress((current) => {
          if (current >= MAX_PENDING_PROGRESS) return current;
          const remaining = MAX_PENDING_PROGRESS - current;
          return Math.min(MAX_PENDING_PROGRESS, current + Math.max(1, remaining * 0.12));
        });
      }, 140);
    } else if (wasNavigating.current) {
      wasNavigating.current = false;
      setRouteProgress(100);
      setShowRouteCompletion(true);

      completionTimer = window.setTimeout(() => {
        setShowRouteCompletion(false);
        setRouteProgress(0);
      }, 260);
    }

    return () => {
      if (progressTimer) window.clearInterval(progressTimer);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [isNavigating]);

  const displayingRouteProgress = isNavigating || showRouteCompletion;
  const progress = displayingRouteProgress ? routeProgress : scrollProgress;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-[5px] overflow-hidden"
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-[#8BCF3C] to-[#04A6A1] shadow-[0_0_12px_rgba(4,166,161,0.55)] will-change-transform"
          style={{
            transform: `scaleX(${progress / 100})`,
            transition: displayingRouteProgress
              ? "transform 180ms ease-out, opacity 180ms ease-out"
              : "transform 80ms linear",
            opacity: progress > 0 ? 1 : 0,
          }}
        />
      </div>

      {isNavigating ? (
        <div
          aria-live="polite"
          aria-label="Loading page"
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black/[0.04] backdrop-blur-[1px]"
        >
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/80 px-5 py-3 text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
            <span className="relative block h-5 w-5">
              <span className="absolute inset-0 rounded-full border-2 border-white/20" />
              <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#8BCF3C] border-r-[#04A6A1]" />
            </span>
            <span className="text-sm font-medium tracking-wide">Loading</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
