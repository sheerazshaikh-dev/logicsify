import { useEffect, useRef } from "react";

const BRAND_TEAL = "#04A6A1";
const BRAND_GREEN = "#8BCF3C";

type GeoPoint = { lat: number; lng: number };
type ProjectedPoint = GeoPoint & { x: number; y: number; z: number; visible: boolean };

const points: GeoPoint[] = [
  { lat: 24.9, lng: 67.1 },
  { lat: 25.2, lng: 55.3 },
  { lat: 51.5, lng: -0.1 },
  { lat: 40.7, lng: -74.0 },
  { lat: 37.8, lng: -122.4 },
  { lat: 1.3, lng: 103.8 },
  { lat: -33.9, lng: 151.2 },
  { lat: 35.7, lng: 139.7 },
  { lat: 52.5, lng: 13.4 },
  { lat: 48.9, lng: 2.3 },
  { lat: 19.1, lng: 72.9 },
  { lat: -23.6, lng: -46.6 },
  { lat: -1.3, lng: 36.8 },
  { lat: 43.7, lng: -79.4 },
  { lat: 31.2, lng: 121.5 },
];

const links: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 5],
  [1, 2],
  [1, 10],
  [2, 3],
  [2, 8],
  [3, 4],
  [4, 6],
  [5, 6],
  [5, 7],
  [7, 14],
  [8, 9],
  [9, 11],
  [10, 14],
  [11, 12],
  [12, 13],
  [13, 3],
];

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function BrandGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rotation = -0.3;
    let tilt = 0.08;
    let raf = 0;
    let isVisible = true;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (point: GeoPoint, radius: number, cx: number, cy: number): ProjectedPoint => {
      const lat = (point.lat * Math.PI) / 180;
      const lng = (point.lng * Math.PI) / 180 + rotation;
      const cosLat = Math.cos(lat);
      let x = cosLat * Math.sin(lng);
      let y = Math.sin(lat);
      let z = cosLat * Math.cos(lng);

      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const y2 = y * ct - z * st;
      const z2 = y * st + z * ct;
      y = y2;
      z = z2;

      return {
        ...point,
        x: cx + x * radius,
        y: cy - y * radius,
        z,
        visible: z > -0.06,
      };
    };

    const drawGrid = (radius: number, cx: number, cy: number) => {
      ctx.save();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = "rgba(255,255,255,0.10)";

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 4) {
          const p = project({ lat, lng }, radius, cx, cy);
          if (!p.visible) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      for (let lng = -150; lng <= 180; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -88; lat <= 88; lat += 3) {
          const p = project({ lat, lng }, radius, cx, cy);
          if (!p.visible) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const draw = (time: number) => {
      raf = 0;
      if (!isVisible) return;

      const dt = Math.min(40, time - lastTime);
      lastTime = time;
      if (!reduceMotion && !dragging) rotation += dt * 0.000075;

      ctx.clearRect(0, 0, width, height);
      const radius = Math.min(width, height) * 0.39;
      const cx = width * 0.5;
      const cy = height * 0.52;

      const halo = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.32);
      halo.addColorStop(0, "rgba(4,166,161,0.14)");
      halo.addColorStop(0.72, "rgba(139,207,60,0.07)");
      halo.addColorStop(1, "rgba(4,166,161,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.32, 0, Math.PI * 2);
      ctx.fill();

      const sphere = ctx.createRadialGradient(
        cx - radius * 0.42,
        cy - radius * 0.42,
        radius * 0.08,
        cx,
        cy,
        radius,
      );
      sphere.addColorStop(0, "rgba(17,33,34,0.98)");
      sphere.addColorStop(0.56, "rgba(6,17,18,0.98)");
      sphere.addColorStop(1, "rgba(0,5,6,1)");
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      drawGrid(radius, cx, cy);

      const projected = points.map((point) => project(point, radius, cx, cy));
      const pulse = (Math.sin(time * 0.0022) + 1) / 2;

      links.forEach(([a, b], index) => {
        const p1 = projected[a];
        const p2 = projected[b];
        if (!p1.visible || !p2.visible) return;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 - radius * (0.08 + (index % 4) * 0.018);
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, hexToRgba(BRAND_TEAL, 0.82));
        gradient.addColorStop(1, hexToRgba(BRAND_GREEN, 0.82));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
        ctx.stroke();

        const t = (time * 0.00016 + index * 0.137) % 1;
        const mt = 1 - t;
        const x = mt * mt * p1.x + 2 * mt * t * mx + t * t * p2.x;
        const y = mt * mt * p1.y + 2 * mt * t * my + t * t * p2.y;
        ctx.fillStyle = index % 2 ? BRAND_GREEN : BRAND_TEAL;
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      projected.forEach((p, index) => {
        if (!p.visible) return;
        const scale = 0.6 + Math.max(0, p.z) * 0.75;
        const color = index % 2 ? BRAND_GREEN : BRAND_TEAL;
        ctx.fillStyle = hexToRgba(color, 0.15);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 * scale + pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      const rim = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
      rim.addColorStop(0, hexToRgba(BRAND_TEAL, 0.16));
      rim.addColorStop(0.52, "rgba(255,255,255,0.16)");
      rim.addColorStop(1, hexToRgba(BRAND_GREEN, 0.32));
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      if (!reduceMotion || dragging) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!raf && isVisible) {
        lastTime = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
      start();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      rotation += dx * 0.006;
      tilt = Math.max(-0.65, Math.min(0.65, tilt + dy * 0.0035));
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
      start();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      start();
    });
    resizeObserver.observe(wrap);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "120px" },
    );
    visibilityObserver.observe(wrap);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    resize();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[620px] select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(4,166,161,0.12),transparent_62%)] blur-2xl" />
      <canvas
        ref={canvasRef}
        className="relative block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      />
    </div>
  );
}
