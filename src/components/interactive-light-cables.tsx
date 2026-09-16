import * as React from "react";
import { useEffect, useRef } from "react";

const MAX_CABLES = 32;
const GRAIN = 0.012;

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;
uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform vec3  uHigh;
uniform float uCount;
uniform float uBend;
uniform float uSpread;
uniform float uWStart;
uniform float uWEnd;
uniform float uAxis;
uniform float uDir;
uniform float uPosX;
uniform float uPosY;
uniform float uThick;
uniform float uFlow;
uniform float uPulses;
uniform float uGrab;
uniform float uGrain;

float sat(float x) { return clamp(x, 0.0, 1.0); }

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = h21(i), b = h21(i + vec2(1.0, 0.0));
  float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm3(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * vnoise(p);
    p = p * 2.07 + vec2(4.1, 2.3);
    a *= 0.5;
  }
  return s;
}

void main() {
  float ar = uRes.x / max(uRes.y, 1.0);
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(ar, 1.0);
  float t = uTime;
  vec2 pAdj = p - vec2(uPosX * ar, uPosY) * 0.5;

  vec3 col = uBg;
  vec2 sm = p - vec2(-0.05, -0.28);
  col += uBase * exp(-pow(length(sm * vec2(0.75, 1.9)) / 0.42, 1.7)) * 0.50
       * (0.6 + 0.6 * fbm3(p * 2.4 + vec2(t * 0.05, 0.0)));

  float extent = mix(ar, 1.0, uAxis);
  float along = mix(pAdj.x, pAdj.y, uAxis) * uDir;
  float across = mix(pAdj.y, pAdj.x, uAxis);
  float s01 = sat((along + extent * 0.5) / max(extent, 0.001));

  vec2 ptrRaw = (uMouse - 0.5) * vec2(ar, 1.0);
  float ptrAlong = mix(ptrRaw.x, ptrRaw.y, uAxis) * uDir;
  float ptrAcross = mix(ptrRaw.y, ptrRaw.x, uAxis);

  float kAlong = -0.18;
  float kAcross = 0.10;
  vec3 acc = vec3(0.0);
  float surge = 0.0;

  for (int i = 0; i < 32; i++) {
    if (float(i) >= uCount) break;
    float fi = float(i) / max(uCount - 1.0, 1.0);
    float o = fi - 0.5;
    float rnd = h21(vec2(fi * 7.31, 2.0));

    float kAlongi = kAlong + o * 0.10 + (rnd - 0.5) * 0.03;
    float bi = uBend * (0.88 + 0.24 * rnd);
    float spread = uSpread * mix(uWStart, uWEnd, s01) * (0.090 + 0.34 * sat((along - kAlong) * 0.85 + 0.25));
    float bendAlong = sqrt((along - kAlongi) * (along - kAlongi) + 0.0035);
    float yy = kAcross + o * spread - bi * bendAlong + 0.008 * sin(along * 3.0 + fi * 19.0);

    float gx = exp(-pow((along - ptrAlong) / max(uGrab * 0.30, 0.02), 2.0));
    yy = mix(yy, ptrAcross + o * spread * 0.55, gx * 0.60 * uHover);

    float dd = (across - yy) / (uThick * 0.0038);
    float core = 1.0 / (1.0 + dd * dd * 9.0);
    float sheath = 1.0 / (1.0 + dd * dd * 0.6);

    float ph = s01 * uPulses - t * uFlow * 0.55 - rnd * 0.22;
    float f = fract(ph);
    float pulse = exp(-pow((f - 0.55) / 0.15, 2.0));
    float w = (0.22 + 1.60 * pulse) * (0.55 + 0.45 * rnd);

    acc += (uHigh * core * 1.45 + uAccent * sheath * 0.20) * w;
    surge += core * gx;
  }

  float feed = smoothstep(0.0, 0.09, s01) * smoothstep(1.02, 0.30, s01);
  col += acc * feed * 0.20;
  col += uHigh * surge * 0.05 * uHover;
  col += (h21(gl_FragCoord.xy + fract(uTime) * 71.0) - 0.5) * uGrain;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

type Vec3 = [number, number, number];
type BundleGroup = {
  count?: number;
  bend?: number;
  spread?: number;
  thickness?: number;
  widthStart?: number;
  widthEnd?: number;
};
type FlowGroup = { flow?: number; pulses?: number };
type RenderValues = {
  bg: Vec3;
  base: Vec3;
  accent: Vec3;
  high: Vec3;
  speed: number;
  hover: number;
  count: number;
  bend: number;
  spread: number;
  thickness: number;
  wStart: number;
  wEnd: number;
  flow: number;
  pulses: number;
  grab: number;
  axis: number;
  dir: number;
  posX: number;
  posY: number;
};

export type InteractiveLightCablesProps = {
  style?: React.CSSProperties;
  background?: string;
  baseColor?: string;
  accentColor?: string;
  highlight?: string;
  speed?: number;
  hover?: number;
  grab?: number;
  direction?: "ltr" | "rtl" | "ttb" | "btt";
  positionX?: number;
  positionY?: number;
  bundle?: BundleGroup;
  flow?: FlowGroup;
};

function parseColor(input: string | undefined, fallback: Vec3): Vec3 {
  if (!input) return fallback;
  const str = String(input).trim();
  if (str.startsWith("#")) {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (![r, g, b].some(Number.isNaN)) return [r / 255, g / 255, b / 255];
    }
    return fallback;
  }
  const match = str.match(/[\d.]+/g);
  if (match && match.length >= 3) {
    return [
      Math.min(255, parseFloat(match[0])) / 255,
      Math.min(255, parseFloat(match[1])) / 255,
      Math.min(255, parseFloat(match[2])) / 255,
    ];
  }
  return fallback;
}

function num(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampN(value: number, low: number, high: number) {
  return value < low ? low : value > high ? high : value;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("LightCables shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function InteractiveLightCables({
  style,
  background = "#000000",
  baseColor = "#000000",
  accentColor = "#04A6A1",
  highlight = "#8BCF3C",
  speed = 34,
  hover = 114,
  grab = 100,
  direction = "ltr",
  positionX = -11,
  positionY = -21,
  bundle = {},
  flow = {},
}: InteractiveLightCablesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef<RenderValues>({} as RenderValues);

  valuesRef.current = {
    bg: parseColor(background, [0, 0, 0]),
    base: parseColor(baseColor, [0, 0, 0]),
    accent: parseColor(accentColor, [0.016, 0.651, 0.631]),
    high: parseColor(highlight, [0.545, 0.812, 0.235]),
    speed: clampN(num(speed, 50), 0, 100) / 50,
    hover: clampN(num(hover, 100), 0, 200) / 100,
    count: Math.round(clampN(num(bundle.count, MAX_CABLES), 4, MAX_CABLES)),
    bend: clampN(num(bundle.bend, 0), 0, 150) / 100,
    spread: clampN(num(bundle.spread, 89), 10, 300) / 100,
    thickness: clampN(num(bundle.thickness, 220), 20, 400) / 100,
    wStart: clampN(num(bundle.widthStart, 0), 0, 300) / 100,
    wEnd: clampN(num(bundle.widthEnd, 300), 0, 300) / 100,
    flow: clampN(num(flow.flow, 300), 0, 300) / 100,
    pulses: clampN(num(flow.pulses, 1), 1, 12),
    grab: clampN(num(grab, 100), 10, 300) / 100,
    axis: direction === "ttb" || direction === "btt" ? 1 : 0,
    dir: direction === "rtl" || direction === "ttb" ? -1 : 1,
    posX: clampN(num(positionX, 0), -100, 100) / 100,
    posY: clampN(num(positionY, 0), -100, 100) / 100,
  };

  const pointerRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const locations: Record<string, WebGLUniformLocation | null> = {};
    const uniform = (name: string) => {
      if (!(name in locations)) locations[name] = gl.getUniformLocation(program, name);
      return locations[name];
    };

    const pointer = pointerRef.current;
    const isCompact = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxDpr = isCompact ? 1.1 : 1.35;
    const targetFps = reducedMotion ? 20 : isCompact ? 30 : 45;
    const frameInterval = 1000 / targetFps;

    let cssWidth = 1;
    let cssHeight = 1;
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    const resize = (width?: number, height?: number) => {
      cssWidth = Math.max(1, width ?? canvas.clientWidth || 1);
      cssHeight = Math.max(1, height ?? canvas.clientHeight || 1);
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const nextWidth = Math.max(1, Math.round(cssWidth * dpr));
      const nextHeight = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        gl.viewport(0, 0, nextWidth, nextHeight);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      resize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(canvas);

    const trackPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside || rect.width <= 0 || rect.height <= 0) {
        pointer.onTarget = 0;
        return;
      }
      pointer.tx = clampN((event.clientX - rect.left) / rect.width, 0, 1);
      pointer.ty = clampN((event.clientY - rect.top) / rect.height, 0, 1);
      pointer.onTarget = 1;
    };
    const clearPointer = () => {
      pointer.onTarget = 0;
    };

    window.addEventListener("pointermove", trackPointer, { passive: true });
    window.addEventListener("pointerleave", clearPointer);
    window.addEventListener("blur", clearPointer);

    let raf = 0;
    let lastFrame = performance.now();
    let clock = 0;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const elapsedMs = now - lastFrame;
      if (elapsedMs < frameInterval) return;

      const dt = Math.min(0.05, elapsedMs / 1000);
      lastFrame = now - (elapsedMs % frameInterval);
      const values = valuesRef.current;
      clock = (clock + dt * values.speed) % 3600;

      const k = 1 - Math.exp(-6 * dt);
      pointer.on += (pointer.onTarget - pointer.on) * k;
      pointer.x += ((pointer.onTarget > 0 ? pointer.tx : 0.5) - pointer.x) * k;
      pointer.y += ((pointer.onTarget > 0 ? pointer.ty : 0.5) - pointer.y) * k;

      const bufferWidth = canvas.width;
      const bufferHeight = canvas.height;
      if (bufferWidth <= 1 || bufferHeight <= 1 || cssWidth <= 1 || cssHeight <= 1) return;

      gl.uniform2f(uniform("uRes"), bufferWidth, bufferHeight);
      gl.uniform1f(uniform("uTime"), clock);
      gl.uniform2f(uniform("uMouse"), pointer.x, 1 - pointer.y);
      gl.uniform1f(uniform("uHover"), Math.min(1, pointer.on) * values.hover);
      gl.uniform3f(uniform("uBg"), values.bg[0], values.bg[1], values.bg[2]);
      gl.uniform3f(uniform("uBase"), values.base[0], values.base[1], values.base[2]);
      gl.uniform3f(uniform("uAccent"), values.accent[0], values.accent[1], values.accent[2]);
      gl.uniform3f(uniform("uHigh"), values.high[0], values.high[1], values.high[2]);
      gl.uniform1f(uniform("uCount"), values.count);
      gl.uniform1f(uniform("uBend"), values.bend);
      gl.uniform1f(uniform("uSpread"), values.spread);
      gl.uniform1f(uniform("uWStart"), values.wStart);
      gl.uniform1f(uniform("uWEnd"), values.wEnd);
      gl.uniform1f(uniform("uAxis"), values.axis);
      gl.uniform1f(uniform("uDir"), values.dir);
      gl.uniform1f(uniform("uPosX"), values.posX);
      gl.uniform1f(uniform("uPosY"), values.posY);
      gl.uniform1f(uniform("uThick"), values.thickness);
      gl.uniform1f(uniform("uFlow"), values.flow);
      gl.uniform1f(uniform("uPulses"), values.pulses);
      gl.uniform1f(uniform("uGrab"), values.grab);
      gl.uniform1f(uniform("uGrain"), GRAIN);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", trackPointer);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background,
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
