import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TRAILS = 60;
const TRAIL_LENGTH = 30;
const THICKNESS = 2;
const COLOR = "rgba(139, 207, 60, 0.17)";
const DAMPENING = 0.1;
const TENSION = 0.95;
const FRICTION = 0.5;

class TrailNode {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

class TrailLine {
  spring: number;
  friction: number;
  nodes: TrailNode[] = [];

  constructor(
    private target: { x: number; y: number },
    spring: number,
  ) {
    this.spring = spring + 0.1 * Math.random() - 0.02;
    this.friction = FRICTION + 0.01 * Math.random() - 0.002;
    for (let i = 0; i < TRAIL_LENGTH; i += 1) {
      const node = new TrailNode();
      node.x = target.x;
      node.y = target.y;
      this.nodes.push(node);
    }
  }

  update() {
    let spring = this.spring;
    let node = this.nodes[0];
    node.vx += (this.target.x - node.x) * spring;
    node.vy += (this.target.y - node.y) * spring;

    for (let i = 0; i < this.nodes.length; i += 1) {
      node = this.nodes[i];
      if (i > 0) {
        const previous = this.nodes[i - 1];
        node.vx += (previous.x - node.x) * spring;
        node.vy += (previous.y - node.y) * spring;
        node.vx += previous.vx * DAMPENING;
        node.vy += previous.vy * DAMPENING;
      }
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= TENSION;
    }
  }

  draw(context: CanvasRenderingContext2D) {
    let x = this.nodes[0].x;
    let y = this.nodes[0].y;
    context.beginPath();
    context.moveTo(x, y);

    for (let i = 1; i < this.nodes.length - 2; i += 1) {
      const current = this.nodes[i];
      const next = this.nodes[i + 1];
      x = 0.5 * (current.x + next.x);
      y = 0.5 * (current.y + next.y);
      context.quadraticCurveTo(current.x, current.y, x, y);
    }

    const beforeLast = this.nodes[this.nodes.length - 2];
    const last = this.nodes[this.nodes.length - 1];
    context.quadraticCurveTo(beforeLast.x, beforeLast.y, last.x, last.y);
    context.stroke();
    context.closePath();
  }
}

function parseRgb(input: string) {
  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((value) => Number.parseFloat(value.trim()));
  return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts[3] ?? 1 };
}

function isDarkSurface(element: HTMLElement) {
  if (element.closest(".logicsify-admin")) return false;
  if (element.classList.contains("section-dark") || element.classList.contains("bg-ink") || element.classList.contains("bg-black")) {
    return true;
  }

  const style = window.getComputedStyle(element);
  const color = parseRgb(style.backgroundColor);
  if (!color || color.a < 0.15) return false;
  const luminance = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
  return luminance < 0.28;
}

function DarkSectionRibbon({ target }: { target: HTMLElement }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const insideRef = useRef(false);
  const linesRef = useRef<TrailLine[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const rect = target.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(target);

    let raf = 0;
    const render = () => {
      const rect = target.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      if (insideRef.current) {
        context.globalCompositeOperation = "lighter";
        context.strokeStyle = COLOR;
        context.lineWidth = THICKNESS;
        for (const line of linesRef.current) {
          line.update();
          line.draw(context);
        }
      }
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    const handlePointer = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      insideRef.current = inside;
      setVisible(inside);
      if (!inside) return;

      pointerRef.current.x = event.clientX - rect.left;
      pointerRef.current.y = event.clientY - rect.top;
      if (!linesRef.current.length) {
        linesRef.current = Array.from({ length: TRAILS }, (_, index) =>
          new TrailLine(pointerRef.current, 0.4 + (index / TRAILS) * 0.025),
        );
      }
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("blur", () => {
      insideRef.current = false;
      setVisible(false);
    });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", handlePointer);
      observer?.disconnect();
    };
  }, [target]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] block transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}

export function DarkSectionCursor() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      if (!element || element.closest(".logicsify-admin")) {
        setTarget(null);
        return;
      }

      let section = element.closest("section, footer, main") as HTMLElement | null;
      while (section && !isDarkSurface(section)) {
        section = section.parentElement?.closest("section, footer, main") as HTMLElement | null;
      }

      if (!section) {
        setTarget(null);
        return;
      }

      if (window.getComputedStyle(section).position === "static") {
        section.style.position = "relative";
      }
      section.style.isolation = "isolate";
      if (section.style.overflow === "") section.style.overflow = "hidden";
      setTarget(section);
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerleave", () => setTarget(null));
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  const portal = useMemo(() => {
    if (!target) return null;
    return createPortal(<DarkSectionRibbon target={target} />, target);
  }, [target]);

  return portal;
}
