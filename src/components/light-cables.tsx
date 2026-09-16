import * as React from "react";
import { useEffect, useRef } from "react";

const MAX_DPR = 2;
const MAX_CABLES = 48;
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
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + vec2(4.1, 2.3); a *= 0.5; }
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

    for (int i = 0; i < 48; i++) {
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

function parseColor(input: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!input) return fallback;
  const str = String(input).trim();
  if (str.charAt(0) === "#") {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return [r / 255, g / 255, b / 255];
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

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampN(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
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

type BundleGroup = {
  count?: number;
  bend?: number;
  spread?: number;
  thickness?: number;
  widthStart?: number;
  widthEnd?: number;
};

const BUNDLE_DEFAULTS: Required<BundleGroup> = {
  count: 34,
  bend: 46,
  spread: 100,
  thickness: 100,
  widthStart: 100,
  widthEnd: 100,
};

type FlowGroup = { flow?: number; pulses?: number };
const FLOW_DEFAULTS: Required<FlowGroup> = { flow: 100, pulses: 3 };

export type LightCablesProps = {
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
  width?: number;
  height?: number;
};

function LightCablesBase(props: LightCablesProps) {
  const {
    style,
    background = "#000000",
    baseColor = "#000000",
    accentColor = "#FF7500",
    highlight = "#FFD900",
    speed = 34,
    hover = 114,
    grab = 100,
    direction = "ttb",
    positionX = -13,
    positionY = -21,
    bundle,
    flow,
    width,
    height,
  } = props;

  const bundle_ = { ...BUNDLE_DEFAULTS, ...(bundle || {}) };
  const flow_ = { ...FLOW_DEFAULTS, ...(flow || {}) };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  sizeRef.current = { w: num(width, 0), h: num(height, 0) };

  const valuesRef = useRef<Record<string, number | string>>({});
  valuesRef.current = {
    bg: background,
    base: baseColor,
    accent: accentColor,
    high: highlight,
    speed: clampN(num(speed, 50), 0, 100) / 50,
    hover: clampN(num(hover, 100), 0, 200) / 100,
    count: Math.round(clampN(num(bundle_.count, 34), 4, MAX_CABLES)),
    bend: clampN(num(bundle_.bend, 46), 0, 150) / 100,
    spread: clampN(num(bundle_.spread, 100), 10, 300) / 100,
    thickness: clampN(num(bundle_.thickness, 100), 20, 400) / 100,
    wStart: clampN(num(bundle_.widthStart, 100), 0, 300) / 100,
    wEnd: clampN(num(bundle_.widthEnd, 100), 0, 300) / 100,
    flow: clampN(num(flow_.flow, 100), 0, 300) / 100,
    pulses: clampN(num(flow_.pulses, 3), 1, 12),
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
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!gl) {
      console.error("LightCables: WebGL unavailable");
      return;
    }

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("LightCables link:", gl.getProgramInfoLog(program));
      return;
    }
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

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const values = valuesRef.current;
      clock = (clock + dt * (values.speed as number)) % 3600;

      const pointer = pointerRef.current;
      const k = 1 - Math.exp(-6 * dt);
      pointer.on += (pointer.onTarget - pointer.on) * k;
      pointer.x += ((pointer.onTarget > 0 ? pointer.tx : 0.5) - pointer.x) * k;
      pointer.y += ((pointer.onTarget > 0 ? pointer.ty : 0.5) - pointer.y) * k;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const canvasWidth = sizeRef.current.w || canvas.clientWidth || 1200;
      const canvasHeight = sizeRef.current.h || canvas.clientHeight || 800;
      const bufferWidth = Math.max(1, Math.round(canvasWidth * dpr));
      const bufferHeight = Math.max(1, Math.round(canvasHeight * dpr));
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      gl.viewport(0, 0, bufferWidth, bufferHeight);

      gl.uniform2f(uniform("uRes"), bufferWidth, bufferHeight);
      gl.uniform1f(uniform("uTime"), clock);
      gl.uniform2f(uniform("uMouse"), pointer.x, 1 - pointer.y);
      gl.uniform1f(uniform("uHover"), Math.min(1, pointer.on) * (values.hover as number));

      const backgroundColor = parseColor(values.bg as string, [0.008, 0.024, 0.039]);
      const base = parseColor(values.base as string, [0.184, 0.659, 0.549]);
      const accent = parseColor(values.accent as string, [0.373, 0.784, 0.863]);
      const high = parseColor(values.high as string, [0.918, 0.984, 1.0]);
      gl.uniform3f(uniform("uBg"), backgroundColor[0], backgroundColor[1], backgroundColor[2]);
      gl.uniform3f(uniform("uBase"), base[0], base[1], base[2]);
      gl.uniform3f(uniform("uAccent"), accent[0], accent[1], accent[2]);
      gl.uniform3f(uniform("uHigh"), high[0], high[1], high[2]);
      gl.uniform1f(uniform("uCount"), values.count as number);
      gl.uniform1f(uniform("uBend"), values.bend as number);
      gl.uniform1f(uniform("uSpread"), values.spread as number);
      gl.uniform1f(uniform("uWStart"), values.wStart as number);
      gl.uniform1f(uniform("uWEnd"), values.wEnd as number);
      gl.uniform1f(uniform("uAxis"), values.axis as number);
      gl.uniform1f(uniform("uDir"), values.dir as number);
      gl.uniform1f(uniform("uPosX"), values.posX as number);
      gl.uniform1f(uniform("uPosY"), values.posY as number);
      gl.uniform1f(uniform("uThick"), values.thickness as number);
      gl.uniform1f(uniform("uFlow"), values.flow as number);
      gl.uniform1f(uniform("uPulses"), values.pulses as number);
      gl.uniform1f(uniform("uGrab"), values.grab as number);
      gl.uniform1f(uniform("uGrain"), GRAIN);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
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
        minWidth: 0,
        minHeight: 0,
        width: typeof width === "number" && width > 0 ? width : "100%",
        height: typeof height === "number" && height > 0 ? height : "100%",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

const PRESET: LightCablesProps = {
  background: "#000000",
  baseColor: "#000000",
  accentColor: "#04A6A1",
  highlight: "#8BCF3C",
  positionX: -11,
  bundle: {
    bend: 0,
    count: 48,
    spread: 89,
    widthEnd: 300,
    thickness: 220,
    widthStart: 0,
  },
  flow: {
    flow: 300,
    pulses: 1,
  },
};

export default function LightCables(props: LightCablesProps) {
  return <LightCablesBase {...PRESET} {...props} />;
}
