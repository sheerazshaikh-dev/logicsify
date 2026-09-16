import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useThree, type ThreeElement } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
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

export function Globe({ globeConfig, data }: { globeConfig: GlobeConfig; data: Position[] }) {
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
  }, [globeConfig.globeColor, globeConfig.emissive, globeConfig.emissiveIntensity, globeConfig.shininess, defaultProps.emissive, defaultProps.emissiveIntensity, defaultProps.globeColor, defaultProps.shininess]);

  useEffect(() => {
    if (!globeRef.current || !worldData) return;

    const arcs = data;
    const points = data.flatMap((arc) => [
      { size: defaultProps.pointSize, order: arc.order, color: arc.color, lat: arc.startLat, lng: arc.startLng },
      { size: defaultProps.pointSize, order: arc.order, color: arc.color, lat: arc.endLat, lng: arc.endLng },
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
      .arcStartLat((d) => (d as Position).startLat * 1)
      .arcStartLng((d) => (d as Position).startLng * 1)
      .arcEndLat((d) => (d as Position).endLat * 1)
      .arcEndLng((d) => (d as Position).endLng * 1)
      .arcColor((d) => (d as Position).color)
      .arcAltitude((d) => (d as Position).arcAlt * 1)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((d) => (d as Position).order * 1)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    globeRef.current
      .pointsData(uniquePoints)
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
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
        uniquePoints.filter((_d, i) => newNumbersOfRings.includes(i)),
      );
    }, 2000);

    return () => window.clearInterval(interval);
  }, [data, worldData, defaultProps.arcLength, defaultProps.arcTime, defaultProps.atmosphereAltitude, defaultProps.atmosphereColor, defaultProps.maxRings, defaultProps.pointSize, defaultProps.polygonColor, defaultProps.rings, defaultProps.showAtmosphere]);

  return <threeGlobe ref={globeRef} />;
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

export function World(props: { globeConfig: GlobeConfig; data: Position[] }) {
  const { globeConfig, data } = props;
  const scene = new Scene();
  scene.fog = new Fog(0xffffff, 400, 2000);
  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight color={globeConfig.directionalLeftLight} position={new Vector3(-400, 100, 400)} />
      <directionalLight color={globeConfig.directionalTopLight} position={new Vector3(-200, 500, 200)} />
      <pointLight color={globeConfig.pointLight} position={new Vector3(-200, 500, 200)} intensity={0.8} />
      <Globe globeConfig={globeConfig} data={data} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={1}
        autoRotate={true}
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
    ? (alpha: number) => `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    : () => "rgba(255,255,255,1)";
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}
