import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useThree, type ThreeElement } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Color, Fog, PerspectiveCamera, Scene, Vector3 } from "three";
import ThreeGlobe from "three-globe";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElement<typeof ThreeGlobe>;
  }
}

const WORLD_DATA_URL = "https://assets.aceternity.com/globe.json";
const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;
const CARD_DISTANCE_FACTOR = 180;

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeCardKind = "review" | "agent" | "metric" | "location" | "team";

export type GlobeCard = {
  id: string;
  kind: GlobeCardKind;
  lat: number;
  lng: number;
  altitude?: number;
  eyebrow: string;
  title: string;
  detail?: string;
  image?: string;
  accent?: string;
  initials?: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

type WorldData = {
  features: unknown[];
};

function latLngToPosition(lat: number, lng: number, altitude = 0.3): [number, number, number] {
  const radius = 100 * (1 + altitude);
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function cardShell(accent: string, width = 154) {
  return {
    width: `${width}px`,
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "14px",
    background: "linear-gradient(145deg, rgba(9,14,13,0.97), rgba(4,8,8,0.9))",
    boxShadow: `0 14px 40px rgba(0,0,0,0.42), 0 0 28px ${accent}20`,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    color: "#ffffff",
    padding: "10px 11px",
    fontFamily: "inherit",
  } as const;
}

function Eyebrow({ children, accent }: { children: string; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "rgba(255,255,255,0.6)",
        fontSize: 8,
        lineHeight: 1,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 10px ${accent}`,
        }}
      />
      {children}
    </div>
  );
}

function GlobeCardBillboard({ card }: { card: GlobeCard }) {
  const accent = card.accent || "#8BCF3C";
  const position = latLngToPosition(card.lat, card.lng, card.altitude ?? 0.3);

  return (
    <Html
      position={position}
      center
      distanceFactor={CARD_DISTANCE_FACTOR}
      occlude
      zIndexRange={[40, 2]}
      style={{ pointerEvents: "none" }}
    >
      <div
        style={{
          transform: "translateY(-18px)",
          transformOrigin: "center bottom",
          willChange: "transform, opacity",
        }}
      >
        {card.kind === "review" && (
          <div style={cardShell(accent, 166)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  flex: "0 0 auto",
                }}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: accent, fontSize: 10, fontWeight: 700 }}>L</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <Eyebrow accent={accent}>{card.eyebrow}</Eyebrow>
                <div style={{ marginTop: 4, color: accent, fontSize: 10, letterSpacing: "0.08em" }}>
                  ★★★★★
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 650, lineHeight: 1.3 }}>
              {card.title}
            </div>
            {card.detail && (
              <div style={{ marginTop: 3, color: "rgba(255,255,255,0.58)", fontSize: 8.5 }}>
                {card.detail}
              </div>
            )}
          </div>
        )}

        {card.kind === "agent" && (
          <div style={cardShell(accent, 150)}>
            <Eyebrow accent={accent}>{card.eyebrow}</Eyebrow>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{card.title}</div>
                {card.detail && (
                  <div style={{ marginTop: 3, color: "rgba(255,255,255,0.58)", fontSize: 8.5 }}>
                    {card.detail}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 2, alignItems: "center", height: 20 }}>
                {[7, 14, 10, 17, 8].map((height, index) => (
                  <span
                    key={index}
                    style={{
                      width: 2,
                      height,
                      borderRadius: 999,
                      background: index % 2 ? "#04A6A1" : "#8BCF3C",
                      opacity: 0.95,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {card.kind === "metric" && (
          <div style={cardShell(accent, 128)}>
            <Eyebrow accent={accent}>{card.eyebrow}</Eyebrow>
            <div style={{ marginTop: 7, fontSize: 20, fontWeight: 760, letterSpacing: "-0.04em" }}>
              {card.title}
            </div>
            {card.detail && (
              <div style={{ marginTop: 2, color: "rgba(255,255,255,0.58)", fontSize: 8.5 }}>
                {card.detail}
              </div>
            )}
          </div>
        )}

        {card.kind === "location" && (
          <div style={cardShell(accent, 148)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: `1px solid ${accent}66`,
                  background: `${accent}18`,
                  display: "grid",
                  placeItems: "center",
                  color: accent,
                  fontSize: 13,
                }}
              >
                ◉
              </div>
              <div>
                <Eyebrow accent={accent}>{card.eyebrow}</Eyebrow>
                <div style={{ marginTop: 5, fontSize: 11, fontWeight: 700 }}>{card.title}</div>
                {card.detail && (
                  <div style={{ marginTop: 2, color: "rgba(255,255,255,0.56)", fontSize: 8.5 }}>
                    {card.detail}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {card.kind === "team" && (
          <div style={cardShell(accent, 162)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: `linear-gradient(135deg, ${accent}, #04A6A1)`,
                  color: "#06110d",
                  fontSize: 9,
                  fontWeight: 800,
                  flex: "0 0 auto",
                }}
              >
                {card.initials || "LS"}
              </div>
              <div style={{ minWidth: 0 }}>
                <Eyebrow accent={accent}>{card.eyebrow}</Eyebrow>
                <div style={{ marginTop: 5, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {card.title}
                </div>
                {card.detail && (
                  <div
                    style={{
                      marginTop: 2,
                      color: "rgba(255,255,255,0.56)",
                      fontSize: 8.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.detail}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

export function Globe({
  globeConfig,
  data,
  cards = [],
}: {
  globeConfig: GlobeConfig;
  data: Position[];
  cards?: GlobeCard[];
}) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const [worldData, setWorldData] = useState<WorldData | null>(null);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  useEffect(() => {
    let active = true;
    fetch(WORLD_DATA_URL)
      .then((response) => response.json())
      .then((json: WorldData) => {
        if (active) setWorldData(json);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const globeMaterial = globeRef.current.globeMaterial() as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(globeConfig.globeColor || defaultProps.globeColor);
    globeMaterial.emissive = new Color(globeConfig.emissive || defaultProps.emissive);
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || defaultProps.emissiveIntensity;
    globeMaterial.shininess = globeConfig.shininess || defaultProps.shininess;
  }, [
    globeConfig.globeColor,
    globeConfig.emissive,
    globeConfig.emissiveIntensity,
    globeConfig.shininess,
    defaultProps.emissive,
    defaultProps.emissiveIntensity,
    defaultProps.globeColor,
    defaultProps.shininess,
  ]);

  useEffect(() => {
    if (!globeRef.current || !worldData) return;

    const points = data.flatMap((arc) => [
      {
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      },
      {
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      },
    ]);

    const seen = new Set<string>();
    const uniquePoints = points.filter((point) => {
      const key = `${point.lat}-${point.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    globeRef.current
      .hexPolygonsData(worldData.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor(() => defaultProps.polygonColor);

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => (d as Position).startLat)
      .arcStartLng((d) => (d as Position).startLng)
      .arcEndLat((d) => (d as Position).endLat)
      .arcEndLng((d) => (d as Position).endLng)
      .arcColor((d) => (d as Position).color)
      .arcAltitude((d) => (d as Position).arcAlt)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((d) => (d as Position).order)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    globeRef.current
      .pointsData(uniquePoints)
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(0.9);

    globeRef.current
      .ringsData([])
      .ringColor((d) => (t: number) =>
        hexToRgb((d as { color: string }).color)(Math.max(0, 0.95 - t * 0.9)),
      )
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings);

    const interval = window.setInterval(() => {
      if (!globeRef.current) return;
      const newNumbersOfRings = genRandomNumbers(
        0,
        data.length,
        Math.floor((data.length * 4) / 5),
      );
      globeRef.current.ringsData(
        uniquePoints.filter((_d, index) => newNumbersOfRings.includes(index)),
      );
    }, 2000);

    return () => window.clearInterval(interval);
  }, [
    data,
    worldData,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.atmosphereAltitude,
    defaultProps.atmosphereColor,
    defaultProps.maxRings,
    defaultProps.pointSize,
    defaultProps.polygonColor,
    defaultProps.rings,
    defaultProps.showAtmosphere,
  ]);

  return (
    <>
      <threeGlobe ref={globeRef} />
      {worldData && cards.map((card) => <GlobeCardBillboard key={card.id} card={card} />)}
    </>
  );
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();
  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, [gl, size]);
  return null;
}

export function World(props: { globeConfig: GlobeConfig; data: Position[]; cards?: GlobeCard[] }) {
  const { globeConfig, data, cards = [] } = props;
  const scene = new Scene();
  scene.fog = new Fog(0xffffff, 400, 2000);

  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe globeConfig={globeConfig} data={data} cards={cards} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 1}
        autoRotate={globeConfig.autoRotate ?? true}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const expanded = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expanded);
  return result
    ? (alpha: number) =>
        `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    : () => "rgba(255,255,255,1)";
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (!arr.includes(r)) arr.push(r);
  }
  return arr;
}
