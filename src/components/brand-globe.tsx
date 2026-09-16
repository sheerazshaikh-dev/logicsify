import { useEffect, useRef, useState } from "react";
import { World, type GlobeCard, type Position } from "@/components/ui/globe";

const globeConfig = {
  pointSize: 5,
  globeColor: "#000000",
  showAtmosphere: true,
  atmosphereColor: "#8BCF3C",
  atmosphereAltitude: 0.08,
  emissive: "#071107",
  emissiveIntensity: 0.08,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.72)",
  ambientLight: "#8BCF3C",
  directionalLeftLight: "#dff8c6",
  directionalTopLight: "#ffffff",
  pointLight: "#8BCF3C",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3.8,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

const colors = ["#04A6A1", "#8BCF3C"];
const arcValues = [
  [1, -19.885592, -43.951191, -22.9068, -43.1729, 0.1],
  [1, 28.6139, 77.209, 3.139, 101.6869, 0.2],
  [1, -19.885592, -43.951191, -1.303396, 36.852443, 0.5],
  [2, 1.3521, 103.8198, 35.6762, 139.6503, 0.2],
  [2, 51.5072, -0.1276, 3.139, 101.6869, 0.3],
  [2, -15.785493, -47.909029, 36.162809, -115.119411, 0.3],
  [3, -33.8688, 151.2093, 22.3193, 114.1694, 0.3],
  [3, 21.3099, -157.8581, 40.7128, -74.006, 0.3],
  [3, -6.2088, 106.8456, 51.5072, -0.1276, 0.3],
  [4, 11.986597, 8.571831, -15.595412, -56.05918, 0.5],
  [4, -34.6037, -58.3816, 22.3193, 114.1694, 0.7],
  [4, 51.5072, -0.1276, 48.8566, -2.3522, 0.1],
  [5, 14.5995, 120.9842, 51.5072, -0.1276, 0.3],
  [5, 1.3521, 103.8198, -33.8688, 151.2093, 0.2],
  [5, 34.0522, -118.2437, 48.8566, -2.3522, 0.2],
  [6, -15.432563, 28.315853, 1.094136, -63.34546, 0.7],
  [6, 37.5665, 126.978, 35.6762, 139.6503, 0.1],
  [6, 22.3193, 114.1694, 51.5072, -0.1276, 0.3],
  [7, -19.885592, -43.951191, -15.595412, -56.05918, 0.1],
  [7, 48.8566, -2.3522, 52.52, 13.405, 0.1],
  [7, 52.52, 13.405, 34.0522, -118.2437, 0.2],
  [8, -8.833221, 13.264837, -33.936138, 18.436529, 0.2],
  [8, 49.2827, -123.1207, 52.3676, 4.9041, 0.2],
  [8, 1.3521, 103.8198, 40.7128, -74.006, 0.5],
  [9, 51.5072, -0.1276, 34.0522, -118.2437, 0.2],
  [9, 22.3193, 114.1694, -22.9068, -43.1729, 0.7],
  [9, 1.3521, 103.8198, -34.6037, -58.3816, 0.5],
  [10, -22.9068, -43.1729, 28.6139, 77.209, 0.7],
  [10, 34.0522, -118.2437, 31.2304, 121.4737, 0.3],
  [10, -6.2088, 106.8456, 52.3676, 4.9041, 0.3],
  [11, 41.9028, 12.4964, 34.0522, -118.2437, 0.2],
  [11, -6.2088, 106.8456, 31.2304, 121.4737, 0.2],
  [11, 22.3193, 114.1694, 1.3521, 103.8198, 0.2],
  [12, 34.0522, -118.2437, 37.7749, -122.4194, 0.1],
  [12, 35.6762, 139.6503, 22.3193, 114.1694, 0.2],
  [12, 22.3193, 114.1694, 34.0522, -118.2437, 0.3],
  [13, 52.52, 13.405, 22.3193, 114.1694, 0.3],
  [13, 11.986597, 8.571831, 35.6762, 139.6503, 0.3],
  [13, -22.9068, -43.1729, -34.6037, -58.3816, 0.1],
  [14, -33.936138, 18.436529, 21.395643, 39.883798, 0.3],
] as const;

const sampleArcs: Position[] = arcValues.map(
  ([order, startLat, startLng, endLat, endLng, arcAlt], index) => ({
    order,
    startLat,
    startLng,
    endLat,
    endLng,
    arcAlt,
    color: colors[index % colors.length],
  }),
);

const floatingCards: GlobeCard[] = [
  {
    id: "review-london",
    kind: "review",
    lat: 51.5072,
    lng: -0.1276,
    altitude: 0.24,
    eyebrow: "Client Review",
    title: "Project feedback",
    detail: "Clear communication · Smooth handoff",
    image: "/logicsify-mark.webp",
    accent: "#8BCF3C",
  },
  {
    id: "agent-singapore",
    kind: "agent",
    lat: 1.3521,
    lng: 103.8198,
    altitude: 0.23,
    eyebrow: "AI Agent",
    title: "Online",
    detail: "Voice · Chat · Follow-up",
    accent: "#04A6A1",
  },
  {
    id: "metric-new-york",
    kind: "metric",
    lat: 40.7128,
    lng: -74.006,
    altitude: 0.24,
    eyebrow: "Live Metric",
    title: "24/7",
    detail: "AI availability",
    accent: "#8BCF3C",
  },
  {
    id: "location-karachi",
    kind: "location",
    lat: 24.8607,
    lng: 67.0011,
    altitude: 0.25,
    eyebrow: "Location",
    title: "Karachi",
    detail: "Pakistan · Serving globally",
    accent: "#04A6A1",
  },
  {
    id: "team-dubai",
    kind: "team",
    lat: 25.2048,
    lng: 55.2708,
    altitude: 0.25,
    eyebrow: "Team",
    title: "M. Sheeraz",
    detail: "Partner & Technology Lead",
    initials: "MS",
    accent: "#8BCF3C",
  },
];

export function BrandGlobe() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "320px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const renderGlobe = nearViewport && pageVisible;

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto flex h-[24rem] w-full max-w-[30rem] items-center justify-center overflow-visible sm:h-[30rem] sm:max-w-[36rem] md:h-[48rem] md:w-[175%] md:max-w-none lg:h-[58rem] lg:w-[235%] lg:-ml-[8%] xl:h-[62rem] xl:w-[250%] xl:-ml-[4%]"
    >
      <div
        className="absolute inset-0 z-10 md:-right-[16%] md:-bottom-[28%] md:left-auto md:top-auto md:h-[140%] md:w-[140%] lg:-right-[18%] lg:-bottom-[36%] lg:h-[148%] lg:w-[148%] xl:-right-[10%] xl:-bottom-[50%] xl:h-[154%] xl:w-[154%]"
        style={{ filter: "drop-shadow(0 0 34px rgba(139, 207, 60, 0.14))" }}
      >
        {renderGlobe ? <World data={sampleArcs} globeConfig={globeConfig} cards={floatingCards} /> : null}
      </div>
    </div>
  );
}
