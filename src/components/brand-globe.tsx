import { useEffect, useRef } from "react";

const BRAND_TEAL = "#04A6A1";
const BRAND_GREEN = "#8BCF3C";
const WORLD_DATA_URL = "https://assets.aceternity.com/globe.json";

type GeoPoint = { lat: number; lng: number };
type ProjectedPoint = GeoPoint & { x: number; y: number; z: number; visible: boolean };
type Arc = {
  start: GeoPoint;
  end: GeoPoint;
  altitude: number;
  color: string;
};
type Ring = { point: GeoPoint; startedAt: number; color: string };

type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};
type GeoFeature = { geometry?: GeoGeometry | null };
type GeoCollection = { features?: GeoFeature[] };

type Polygon = [number, number][];

const hubs: GeoPoint[] = [
  { lat: 24.86, lng: 67.01 }, // Karachi
  { lat: 25.2, lng: 55.27 }, // Dubai
  { lat: 51.5, lng: -0.12 }, // London
  { lat: 40.71, lng: -74.0 }, // New York
  { lat: 37.77, lng: -122.42 }, // San Francisco
  { lat: 1.35, lng: 103.82 }, // Singapore
  { lat: -33.87, lng: 151.21 }, // Sydney
  { lat: 35.68, lng: 139.69 }, // Tokyo
  { lat: 52.52, lng: 13.4 }, // Berlin
  { lat: 19.08, lng: 72.88 }, // Mumbai
  { lat: -23.55, lng: -46.63 }, // Sao Paulo
  { lat: -1.29, lng: 36.82 }, // Nairobi
];

const arcs: Arc[] = [
  { start: hubs[0], end: hubs[1], altitude: 0.18, color: BRAND_GREEN },
  { start: hubs[0], end: hubs[2], altitude: 0.28, color: BRAND_TEAL },
  { start: hubs[0], end: hubs[5], altitude: 0.22, color: BRAND_GREEN },
  { start: hubs[1], end: hubs[9], altitude: 0.2, color: BRAND_TEAL },
  { start: hubs[2], end: hubs[3], altitude: 0.28, color: BRAND_GREEN },
  { start: hubs[2], end: hubs[8], altitude: 0.15, color: BRAND_TEAL },
  { start: hubs[3], end: hubs[4], altitude: 0.2, color: BRAND_GREEN },
  { start: hubs[4], end: hubs[6], altitude: 0.34, color: BRAND_TEAL },
  { start: hubs[5], end: hubs[6], altitude: 0.25, color: BRAND_GREEN },
  { start: hubs[5], end: hubs[7], altitude: 0.18, color: BRAND_TEAL },
  { start: hubs[7], end: hubs[9], altitude: 0.2, color: BRAND_GREEN },
  { start: hubs[10], end: hubs[3], altitude: 0.28, color: BRAND_TEAL },
  { start: hubs[11], end: hubs[1], altitude: 0.18, color: BRAND_GREEN },
];

function rgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function normalizeLng(lng: number) {
  let value = lng;
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}

function extractPolygons(collection: GeoCollection): Polygon[] {
  const polygons: Polygon[] = [];
  for (const feature of collection.features || []) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === "Polygon") {
      const rings = geometry.coordinates as number[][][];
      if (Array.isArray(rings?.[0])) polygons.push(rings[0] as Polygon);
    } else if (geometry.type === "MultiPolygon") {
      const groups = geometry.coordinates as number[][][][];
      for (const group of groups || []) {
        if (Array.isArray(group?.[0])) polygons.push(group[0] as Polygon);
      }
    }
  }
  return polygons;
}

function polygonBounds(polygon: Polygon) {
  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;
  for (const [lng, lat] of polygon) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return { minLng, maxLng, minLat, maxLat };
}

function pointInPolygon(lng: number, lat: number, polygon: Polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-9) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function buildLandDots(collection: GeoCollection): GeoPoint[] {
  const polygons = extractPolygons(collection)
    .map((polygon) => ({ polygon, bounds: polygonBounds(polygon) }))
    .filter(({ bounds }) => bounds.maxLat >= -82 && bounds.minLat <= 82);

  const result: GeoPoint[] = [];
  const step = 3.25;
  for (let lat = -78; lat <= 82; lat += step) {
    // Slight longitudinal staggering creates a hex-like point field.
    const stagger = Math.round((lat + 90) / step) % 2 ? step * 0.5 : 0;
    for (let lng = -180 + stagger; lng <= 180; lng += step) {
      for (const { polygon, bounds } of polygons) {
        if (
          lng < bounds.minLng ||
          lng > bounds.maxLng ||
          lat < bounds.minLat ||
          lat > bounds.maxLat
        ) {
          continue;
        }
        if (pointInPolygon(lng, lat, polygon)) {
          result.push({ lat, lng: normalizeLng(lng) });
          break;
        }
      }
    }
  }
  return result;
}

function fallbackLandDots(): GeoPoint[] {
  // Used only if the Aceternity world data cannot be loaded.
  const seeds = [
    { lat: 47, lng: -101 }, { lat: 39, lng: -96 }, { lat: 31, lng: -99 },
    { lat: -9, lng: -60 }, { lat: -22, lng: -48 }, { lat: -35, lng: -66 },
    { lat: 52, lng: 10 }, { lat: 45, lng: 25 }, { lat: 31, lng: 35 },
    { lat: 24, lng: 67 }, { lat: 22, lng: 79 }, { lat: 35, lng: 103 },
    { lat: 36, lng: 138 }, { lat: 7, lng: 107 }, { lat: -4, lng: 121 },
    { lat: 14, lng: 20 }, { lat: 0, lng: 24 }, { lat: -15, lng: 28 },
    { lat: -28, lng: 24 }, { lat: -25, lng: 134 }, { lat: -34, lng: 147 },
  ];
  const dots: GeoPoint[] = [];
  for (const seed of seeds) {
    for (let y = -10; y <= 10; y += 3.4) {
      for (let x = -15; x <= 15; x += 3.4) {
        const distance = Math.hypot(x / 1.4, y);
        if (distance < 10 + ((seed.lng + x + y) % 4)) {
          dots.push({ lat: seed.lat + y, lng: normalizeLng(seed.lng + x) });
        }
      }
    }
  }
  return dots;
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
    let rotation = -1.05;
    let tilt = -0.08;
    let raf = 0;
    let visible = true;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastFrame = 0;
    let landDots = fallbackLandDots();
    let rings: Ring[] = [];
    let nextRingAt = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const abortController = new AbortController();

    fetch(WORLD_DATA_URL, { signal: abortController.signal, cache: "force-cache" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: GeoCollection) => {
        const dots = buildLandDots(data);
        if (dots.length > 250) landDots = dots;
      })
      .catch(() => undefined);

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

      return { ...point, x: cx + x * radius, y: cy - y * radius, z, visible: z > 0.01 };
    };

    const bezierPoint = (
      p0: ProjectedPoint,
      p1: ProjectedPoint,
      cx: number,
      cy: number,
      radius: number,
      altitude: number,
      t: number,
    ) => {
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      const fromCenterX = mx - cx;
      const fromCenterY = my - cy;
      const length = Math.max(1, Math.hypot(fromCenterX, fromCenterY));
      const controlX = mx + (fromCenterX / length) * radius * altitude;
      const controlY = my + (fromCenterY / length) * radius * altitude;
      const mt = 1 - t;
      return {
        x: mt * mt * p0.x + 2 * mt * t * controlX + t * t * p1.x,
        y: mt * mt * p0.y + 2 * mt * t * controlY + t * t * p1.y,
        controlX,
        controlY,
      };
    };

    const draw = (time: number) => {
      raf = 0;
      if (!visible || !width || !height) return;

      // 30fps is visually smooth for this ambient hero element and keeps CPU/GPU use low.
      if (lastFrame && time - lastFrame < 32 && !dragging) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const dt = lastFrame ? Math.min(50, time - lastFrame) : 16;
      lastFrame = time;
      if (!reduceMotion && !dragging) rotation += dt * 0.000055;

      ctx.clearRect(0, 0, width, height);
      const radius = Math.min(width, height) * 0.415;
      const cx = width * 0.5;
      const cy = height * 0.53;

      // Aceternity-style atmosphere.
      const atmosphere = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius * 1.23);
      atmosphere.addColorStop(0, "rgba(4,166,161,0)");
      atmosphere.addColorStop(0.78, "rgba(4,166,161,0.025)");
      atmosphere.addColorStop(0.92, "rgba(4,166,161,0.12)");
      atmosphere.addColorStop(1, "rgba(139,207,60,0)");
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.23, 0, Math.PI * 2);
      ctx.fill();

      // Dark, slightly emissive globe surface.
      const sphere = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.42,
        radius * 0.08,
        cx,
        cy,
        radius,
      );
      sphere.addColorStop(0, "#092426");
      sphere.addColorStop(0.46, "#041719");
      sphere.addColorStop(0.78, "#020c0d");
      sphere.addColorStop(1, "#000506");
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Country texture: small hex-like points built from the same world dataset
      // linked by the Aceternity component documentation.
      for (let i = 0; i < landDots.length; i += 1) {
        const p = project(landDots[i], radius, cx, cy);
        if (!p.visible) continue;
        const front = Math.max(0, p.z);
        const alpha = 0.22 + front * 0.48;
        const color = i % 5 === 0 ? BRAND_GREEN : BRAND_TEAL;
        ctx.fillStyle = rgba(color, alpha);
        const dotRadius = 0.75 + front * 0.62;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Animated arcs with dashed heads/tails rather than static full lines.
      arcs.forEach((arc, index) => {
        const start = project(arc.start, radius, cx, cy);
        const end = project(arc.end, radius, cx, cy);
        if (!start.visible || !end.visible) return;

        const mid = bezierPoint(start, end, cx, cy, radius, arc.altitude, 0.5);
        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, rgba(arc.color, 0.15));
        gradient.addColorStop(0.5, rgba(arc.color, 0.95));
        gradient.addColorStop(1, rgba(arc.color === BRAND_TEAL ? BRAND_GREEN : BRAND_TEAL, 0.45));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.15;
        ctx.setLineDash([radius * 0.17, radius * 0.075]);
        ctx.lineDashOffset = -(time * 0.018 + index * 34);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(mid.controlX, mid.controlY, end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const travel = (time * 0.00012 + index * 0.11) % 1;
        const moving = bezierPoint(start, end, cx, cy, radius, arc.altitude, travel);
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 9;
        ctx.fillStyle = arc.color;
        ctx.beginPath();
        ctx.arc(moving.x, moving.y, 1.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Endpoint dots.
      hubs.forEach((point, index) => {
        const p = project(point, radius, cx, cy);
        if (!p.visible) return;
        const color = index % 2 ? BRAND_GREEN : BRAND_TEAL;
        const front = Math.max(0.35, p.z);
        ctx.fillStyle = rgba(color, 0.16);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.5 * front, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8 + front * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Propagating rings similar to the Aceternity globe's ring layer.
      if (!reduceMotion && time >= nextRingAt) {
        const index = Math.floor((time / 1300) % hubs.length);
        rings.push({
          point: hubs[index],
          startedAt: time,
          color: index % 2 ? BRAND_GREEN : BRAND_TEAL,
        });
        rings = rings.slice(-4);
        nextRingAt = time + 950;
      }
      rings = rings.filter((ring) => time - ring.startedAt < 1800);
      for (const ring of rings) {
        const p = project(ring.point, radius, cx, cy);
        if (!p.visible) continue;
        const age = Math.min(1, (time - ring.startedAt) / 1800);
        ctx.strokeStyle = rgba(ring.color, (1 - age) * 0.52);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + age * 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Thin illuminated rim.
      const rim = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
      rim.addColorStop(0, rgba(BRAND_TEAL, 0.08));
      rim.addColorStop(0.45, "rgba(255,255,255,0.10)");
      rim.addColorStop(1, rgba(BRAND_GREEN, 0.26));
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      if (!reduceMotion || dragging) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!raf && visible) {
        lastFrame = 0;
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
      rotation += dx * 0.0052;
      tilt = Math.max(-0.58, Math.min(0.45, tilt + dy * 0.003));
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
        visible = entry.isIntersecting;
        if (visible) start();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "80px" },
    );
    visibilityObserver.observe(wrap);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    resize();
    start();

    return () => {
      abortController.abort();
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
      className="relative mx-auto aspect-square w-full max-w-[650px] select-none"
      aria-label="Interactive Logicsify global network"
      role="img"
    >
      <div className="pointer-events-none absolute inset-[5%] rounded-full bg-[radial-gradient(circle,rgba(4,166,161,0.10),transparent_68%)] blur-2xl" />
      <canvas
        ref={canvasRef}
        className="relative block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      />
    </div>
  );
}
