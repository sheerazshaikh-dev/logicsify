import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LightCables from "@/components/light-cables";

export function HomeHeroLightCables() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setTarget(null);
      return;
    }

    let raf = 0;
    let attempts = 0;

    const findHero = () => {
      const hero = document.querySelector(
        '[data-cms-section-id="home-hero"] > section',
      ) as HTMLElement | null;

      if (hero) {
        hero.classList.add("isolate");
        const content = hero.querySelector(":scope > .container-page") as HTMLElement | null;
        if (content) {
          content.style.zIndex = "2";
        }
        const scrollHint = hero.querySelector(":scope > .absolute.bottom-6") as HTMLElement | null;
        if (scrollHint) {
          scrollHint.style.zIndex = "2";
        }
        setTarget(hero);
        return;
      }

      attempts += 1;
      if (attempts < 20) raf = requestAnimationFrame(findHero);
    };

    raf = requestAnimationFrame(findHero);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  if (!target) return null;

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <LightCables
        style={{ width: "100%", height: "100%", opacity: 0.78 }}
        background="#000000"
        baseColor="#000000"
        accentColor="#04A6A1"
        highlight="#8BCF3C"
        positionX={-11}
        positionY={-21}
        bundle={{
          bend: 0,
          count: 48,
          spread: 89,
          widthEnd: 300,
          thickness: 220,
          widthStart: 0,
        }}
        flow={{ flow: 300, pulses: 1 }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/35" />
    </div>,
    target,
  );
}
