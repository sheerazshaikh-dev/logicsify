import { useEffect, useRef } from "react";

type InteractiveLogoParticlesProps = {
  imageSrc?: string;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  a: number;
};

type PointerState = {
  x: number;
  y: number;
  active: boolean;
  pressed: boolean;
  vx: number;
  vy: number;
  lastX: number;
  lastY: number;
  lastTime: number;
};

const ALPHA_THRESHOLD = 42;
const MAX_DPR = 2.5;
const MAX_PARTICLES = 24000;

/**
 * Renders the supplied transparent brand mark as tightly-packed particles.
 * At rest the particles overlap slightly, so the mark reads like the original
 * image. Pointer/touch proximity pushes nearby particles away; once the pointer
 * leaves, spring physics returns every particle to its exact source position.
 */
export function InteractiveLogoParticles({
  imageSrc = "/logicsify-particle-mark.png",
  className = "",
}: InteractiveLogoParticlesProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const pointer: PointerState = {
      x: -10000,
      y: -10000,
      active: false,
      pressed: false,
      vx: 0,
      vy: 0,
      lastX: -10000,
      lastY: -10000,
      lastTime: 0,
    };

    let particles: Particle[] = [];
    let particleRadius = 2.6;
    let width = 0;
    let height = 0;
    let visualWidth = 0;
    let visualHeight = 0;
    let interactionPadding = 0;
    let animationFrame = 0;
    let image: HTMLImageElement | null = null;
    let destroyed = false;
    let visible = true;
    let sleeping = false;
    let settledFrames = 0;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      pointer.active = false;
      pointer.pressed = false;
    };
    motionQuery.addEventListener?.("change", onMotionChange);

    const wake = () => {
      sleeping = false;
      settledFrames = 0;
    };

    const updatePointer = (event: PointerEvent) => {
      wake();
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Pointer coordinates are measured in the visible logo box, then shifted
      // into the larger off-edge simulation canvas. The extra canvas is purely
      // render space and never intercepts clicks in neighboring hero content.
      const nextX = event.clientX - rect.left + interactionPadding;
      const nextY = event.clientY - rect.top + interactionPadding;
      const now = performance.now();

      if (pointer.lastTime > 0) {
        const elapsed = Math.max(8, Math.min(40, now - pointer.lastTime));
        const velocityScale = 16.67 / elapsed;
        pointer.vx = (nextX - pointer.lastX) * velocityScale;
        pointer.vy = (nextY - pointer.lastY) * velocityScale;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }

      pointer.x = nextX;
      pointer.y = nextY;
      pointer.lastX = nextX;
      pointer.lastY = nextY;
      pointer.lastTime = now;
      pointer.active = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion) return;
      updatePointer(event);
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (reducedMotion) return;
      updatePointer(event);
    };

    const onPointerLeave = () => {
      wake();
      pointer.active = false;
      pointer.pressed = false;
      pointer.x = -10000;
      pointer.y = -10000;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.lastX = -10000;
      pointer.lastY = -10000;
      pointer.lastTime = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotion) return;
      updatePointer(event);
      pointer.pressed = true;
      wrapper.setPointerCapture?.(event.pointerId);
    };

    const onPointerUp = (event: PointerEvent) => {
      pointer.pressed = false;
      if (event.pointerType === "touch") {
        pointer.active = false;
        pointer.x = -10000;
        pointer.y = -10000;
        pointer.vx = 0;
        pointer.vy = 0;
        pointer.lastTime = 0;
      }
    };

    const buildParticles = () => {
      if (!image || !width || !height) return;

      const offscreen = document.createElement("canvas");
      offscreen.width = Math.max(1, Math.round(width));
      offscreen.height = Math.max(1, Math.round(height));
      const offscreenContext = offscreen.getContext("2d", {
        alpha: true,
        willReadFrequently: true,
      });
      if (!offscreenContext) return;

      offscreenContext.clearRect(0, 0, offscreen.width, offscreen.height);

      // The logo is sized only against the visible wrapper. The bitmap itself is
      // larger on every side so displaced particles have real drawing room and
      // never hit a hard canvas edge during hover distortion.
      const padding = Math.max(14, Math.min(visualWidth, visualHeight) * 0.055);
      const availableWidth = Math.max(1, visualWidth - padding * 2);
      const availableHeight = Math.max(1, visualHeight - padding * 2);
      const scale = Math.min(availableWidth / image.width, availableHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const drawX = interactionPadding + (visualWidth - drawWidth) / 2;
      const drawY = interactionPadding + (visualHeight - drawHeight) / 2;

      offscreenContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      const pixelData = offscreenContext.getImageData(0, 0, offscreen.width, offscreen.height).data;

      // Dense enough that adjacent circles overlap slightly. This is what makes
      // the idle state look like the original artwork instead of a dotted logo.
      let step = visualWidth >= 500 ? 2.25 : visualWidth >= 380 ? 2.15 : 2.05;
      const estimatedOpaqueArea = drawWidth * drawHeight * 0.39;
      const estimatedCount = estimatedOpaqueArea / (step * step);
      if (estimatedCount > MAX_PARTICLES) {
        step *= Math.sqrt(estimatedCount / MAX_PARTICLES);
      }
      // Smaller dots + much tighter sampling produce a crisp, high-resolution
      // silhouette while retaining a visible particle texture up close.
      particleRadius = Math.max(1.08, step * 0.57);

      const nextParticles: Particle[] = [];
      const startX = Math.max(0, Math.floor(drawX));
      const endX = Math.min(offscreen.width, Math.ceil(drawX + drawWidth));
      const startY = Math.max(0, Math.floor(drawY));
      const endY = Math.min(offscreen.height, Math.ceil(drawY + drawHeight));

      for (let y = startY; y < endY; y += step) {
        for (let x = startX; x < endX; x += step) {
          const sampleX = Math.min(offscreen.width - 1, Math.max(0, Math.round(x)));
          const sampleY = Math.min(offscreen.height - 1, Math.max(0, Math.round(y)));
          const pixelIndex = (sampleY * offscreen.width + sampleX) * 4;
          const alpha = pixelData[pixelIndex + 3];
          if (alpha < ALPHA_THRESHOLD) continue;

          nextParticles.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            r: pixelData[pixelIndex],
            g: pixelData[pixelIndex + 1],
            b: pixelData[pixelIndex + 2],
            a: alpha / 255,
          });
        }
      }

      particles = nextParticles;
      wake();
    };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      visualWidth = Math.max(280, rect.width);
      visualHeight = Math.max(280, rect.height);

      // Around 190–270 CSS pixels of invisible render buffer surrounds the
      // visible logo. This is intentionally larger than normal displacement so
      // even strong pointer sweeps remain inside the bitmap.
      interactionPadding = Math.min(270, Math.max(190, Math.min(visualWidth, visualHeight) * 0.42));
      width = visualWidth + interactionPadding * 2;
      height = visualHeight + interactionPadding * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = `${-interactionPadding}px`;
      canvas.style.top = `${-interactionPadding}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildParticles();
    };

    const render = () => {
      if (destroyed) return;
      animationFrame = window.requestAnimationFrame(render);
      if (!visible || !width || !height) return;
      if (sleeping && !pointer.active) return;

      context.clearRect(0, 0, width, height);

      // Mouse interaction is intentionally local: only particles under/near the
      // pointer scatter, while the rest of the mark stays recognizable.
      const reactionRadius = Math.min(170, Math.max(105, visualWidth * 0.245));
      const reactionRadiusSq = reactionRadius * reactionRadius;

      // Softer spring + higher damping = slower, more natural recovery.
      // While hovering, particles carry more inertia so the logo deforms
      // organically instead of snapping away and immediately rebuilding.
      const spring = pointer.active ? 0.018 : 0.042;
      const damping = pointer.active ? 0.925 : 0.875;
      const forceMultiplier = pointer.pressed ? 8.4 : 5.65;
      const maxDisplacement = Math.min(reactionRadius * 1.7, interactionPadding * 0.88);
      const pointerSpeed = Math.min(28, Math.hypot(pointer.vx, pointer.vy));
      const flowStrength = pointerSpeed > 0.2 ? Math.min(0.32, pointerSpeed * 0.012) : 0;
      let unsettled = false;

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        if (!reducedMotion && pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq > 0.0001 && distanceSq < reactionRadiusSq) {
            const distance = Math.sqrt(distanceSq);
            const proximity = 1 - distance / reactionRadius;
            const easedProximity = proximity * proximity * (3 - 2 * proximity);
            const force = easedProximity * forceMultiplier;

            // Radial repulsion opens a convincing cavity around the pointer.
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;

            // Add a restrained directional wake from pointer velocity. This
            // makes quick sweeps pull particles sideways instead of producing
            // a perfectly symmetrical, artificial-looking explosion.
            if (flowStrength > 0) {
              particle.vx += pointer.vx * flowStrength * easedProximity;
              particle.vy += pointer.vy * flowStrength * easedProximity;
            }
          }
        }

        particle.vx += (particle.originX - particle.x) * spring;
        particle.vy += (particle.originY - particle.y) * spring;
        particle.vx *= damping;
        particle.vy *= damping;
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Prevent a fast pointer swipe from throwing particles so far away that
        // the logo becomes unreadable for several seconds.
        const homeDx = particle.x - particle.originX;
        const homeDy = particle.y - particle.originY;
        const homeDistanceSq = homeDx * homeDx + homeDy * homeDy;
        if (homeDistanceSq > maxDisplacement * maxDisplacement) {
          const homeDistance = Math.sqrt(homeDistanceSq);
          particle.x = particle.originX + (homeDx / homeDistance) * maxDisplacement;
          particle.y = particle.originY + (homeDy / homeDistance) * maxDisplacement;
          particle.vx *= 0.55;
          particle.vy *= 0.55;
        }

        if (
          Math.abs(particle.vx) +
            Math.abs(particle.vy) +
            Math.abs(particle.x - particle.originX) +
            Math.abs(particle.y - particle.originY) >
          0.045
        ) {
          unsettled = true;
        }

        context.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.a})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
        context.fill();
      }

      if (!pointer.active && !unsettled) {
        settledFrames += 1;
        if (settledFrames >= 8) sleeping = true;
      } else {
        settledFrames = 0;
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    visibilityObserver.observe(wrapper);

    wrapper.addEventListener("pointermove", onPointerMove, { passive: true });
    wrapper.addEventListener("pointerenter", onPointerEnter, { passive: true });
    wrapper.addEventListener("pointerleave", onPointerLeave, { passive: true });
    wrapper.addEventListener("pointerdown", onPointerDown, { passive: true });
    wrapper.addEventListener("pointerup", onPointerUp, { passive: true });
    wrapper.addEventListener("pointercancel", onPointerLeave, { passive: true });

    image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!destroyed) resize();
    };
    image.src = imageSrc;

    render();

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener?.("change", onMotionChange);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerenter", onPointerEnter);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointerup", onPointerUp);
      wrapper.removeEventListener("pointercancel", onPointerLeave);
    };
  }, [imageSrc]);

  return (
    <div
      ref={wrapperRef}
      className={`relative mx-auto aspect-square w-full max-w-[620px] select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute touch-pan-y"
        aria-hidden="true"
      />
      <span className="sr-only">Interactive Logicsify brand mark</span>
    </div>
  );
}

