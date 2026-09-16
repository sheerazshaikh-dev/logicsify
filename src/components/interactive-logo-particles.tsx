import { lazy, Suspense, useEffect, useState } from "react";

const LazyBrandGlobe = lazy(() =>
  import("@/components/brand-globe").then((module) => ({ default: module.BrandGlobe })),
);

type InteractiveLogoParticlesProps = {
  imageSrc?: string;
  className?: string;
};

function GlobePlaceholder() {
  return (
    <div
      className="relative mx-auto h-[24rem] w-full max-w-[30rem] sm:h-[30rem] sm:max-w-[36rem] md:h-[48rem] md:w-[175%] md:max-w-none lg:h-[58rem] lg:w-[235%] lg:-ml-[8%] xl:h-[62rem] xl:w-[250%] xl:-ml-[4%]"
      aria-hidden="true"
    />
  );
}

/**
 * Legacy compatibility wrapper.
 * Keep the exact globe UI, but load its Three.js bundle after the browser has
 * produced the first paint. This prevents the hero WebGL stack from blocking
 * FCP/LCP collection on slower mobile devices and synthetic performance runs.
 */
export function InteractiveLogoParticles({ className = "" }: InteractiveLogoParticlesProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <div className={className}>
      {ready ? (
        <Suspense fallback={<GlobePlaceholder />}>
          <LazyBrandGlobe />
        </Suspense>
      ) : (
        <GlobePlaceholder />
      )}
    </div>
  );
}
