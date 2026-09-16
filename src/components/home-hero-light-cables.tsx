import { lazy, Suspense, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { createPortal } from "react-dom";

const LazyInteractiveLightCables = lazy(() => import("@/components/interactive-light-cables"));

export function HomeHeroLightCables() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [rendererReady, setRendererReady] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setTarget(null);
      setIsVisible(false);
      setRendererReady(false);
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setRendererReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setTarget(null);
      setIsVisible(false);
      return;
    }

    let raf = 0;
    let attempts = 0;
    let observer: IntersectionObserver | null = null;

    const findHero = () => {
      const hero = document.querySelector(
        '[data-cms-section-id="home-hero"] > section',
      ) as HTMLElement | null;

      if (hero) {
        hero.classList.add("isolate");
        const content = hero.querySelector(":scope > .container-page") as HTMLElement | null;
        if (content) content.style.zIndex = "2";

        const scrollHint = hero.querySelector(":scope > .absolute.bottom-6") as HTMLElement | null;
        if (scrollHint) scrollHint.style.zIndex = "2";

        setTarget(hero);

        observer = new IntersectionObserver(
          ([entry]) => {
            setIsVisible(Boolean(entry?.isIntersecting));
          },
          {
            threshold: 0.01,
            rootMargin: "120px 0px",
          },
        );
        observer.observe(hero);
        return;
      }

      attempts += 1;
      if (attempts < 20) raf = requestAnimationFrame(findHero);
    };

    raf = requestAnimationFrame(findHero);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [pathname]);

  if (!target) return null;

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {isVisible && rendererReady ? (
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <LazyInteractiveLightCables
            style={{ width: "100%", height: "100%", opacity: 0.78 }}
            direction="ltr"
            background="#000000"
            baseColor="#000000"
            accentColor="#04A6A1"
            highlight="#8BCF3C"
            positionX={-11}
            positionY={-4}
            bundle={{
              bend: 0,
              count: 32,
              spread: 89,
              widthEnd: 300,
              thickness: 220,
              widthStart: 0,
            }}
            flow={{ flow: 300, pulses: 1 }}
          />
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/35" />
    </div>,
    target,
  );
}
