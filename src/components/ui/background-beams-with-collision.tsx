import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BeamConfig = {
  left: string;
  duration: number;
  delay: number;
  height: number;
  width?: number;
  opacity?: number;
};

type BeamStyle = CSSProperties & {
  "--beam-duration": string;
  "--beam-delay": string;
  "--beam-height": string;
  "--beam-width": string;
  "--beam-opacity": number;
};

type ParticleStyle = CSSProperties & {
  "--particle-x": string;
  "--particle-y": string;
  "--particle-delay": string;
};

const beams: BeamConfig[] = [
  { left: "3%", duration: 6.8, delay: -1.2, height: 58, opacity: 0.72 },
  { left: "9%", duration: 8.6, delay: -5.1, height: 34, opacity: 0.52 },
  { left: "15%", duration: 5.8, delay: -2.8, height: 86, width: 2, opacity: 0.78 },
  { left: "22%", duration: 9.4, delay: -7.3, height: 46, opacity: 0.58 },
  { left: "29%", duration: 7.4, delay: -4.2, height: 68, opacity: 0.7 },
  { left: "36%", duration: 10.6, delay: -8.4, height: 38, opacity: 0.5 },
  { left: "43%", duration: 6.2, delay: -3.5, height: 94, width: 2, opacity: 0.82 },
  { left: "50%", duration: 8.2, delay: -6.7, height: 52, opacity: 0.62 },
  { left: "57%", duration: 5.6, delay: -1.9, height: 72, opacity: 0.76 },
  { left: "64%", duration: 9.8, delay: -9.1, height: 42, opacity: 0.54 },
  { left: "71%", duration: 7.1, delay: -5.7, height: 88, width: 2, opacity: 0.8 },
  { left: "78%", duration: 10.9, delay: -2.3, height: 36, opacity: 0.5 },
  { left: "84%", duration: 6.5, delay: -4.8, height: 64, opacity: 0.72 },
  { left: "89%", duration: 8.9, delay: -7.8, height: 48, opacity: 0.6 },
  { left: "94%", duration: 5.9, delay: -3.2, height: 80, width: 2, opacity: 0.82 },
  { left: "98%", duration: 10.2, delay: -8.9, height: 40, opacity: 0.48 },
];

const particleVectors = [
  ["-34px", "-28px"],
  ["-22px", "-44px"],
  ["-8px", "-30px"],
  ["10px", "-48px"],
  ["25px", "-34px"],
  ["36px", "-18px"],
  ["-29px", "-12px"],
  ["28px", "-8px"],
];

export function BackgroundBeamsWithCollision({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="wl-beams-vignette absolute inset-0" />
      {beams.map((beam, index) => {
        const style: BeamStyle = {
          left: beam.left,
          "--beam-duration": `${beam.duration}s`,
          "--beam-delay": `${beam.delay}s`,
          "--beam-height": `${beam.height}px`,
          "--beam-width": `${beam.width ?? 1}px`,
          "--beam-opacity": beam.opacity ?? 0.65,
        };

        return (
          <div
            key={`${beam.left}-${index}`}
            className="wl-beam-column absolute inset-y-0 w-px"
            style={style}
          >
            <div className="wl-beam-mover absolute left-0 top-[-220px] h-full w-px">
              <span className="wl-collision-beam absolute left-0 top-0 block rounded-full" />
            </div>

            <span className="wl-collision-impact absolute bottom-0 left-1/2">
              <i className="wl-impact-glow absolute left-1/2 top-1/2 block" />
              {particleVectors.map(([x, y], particleIndex) => {
                const particleStyle: ParticleStyle = {
                  "--particle-x": x,
                  "--particle-y": y,
                  "--particle-delay": `${particleIndex * 0.012}s`,
                };
                return (
                  <i
                    key={particleIndex}
                    className="wl-impact-particle absolute left-1/2 top-1/2 block rounded-full"
                    style={particleStyle}
                  />
                );
              })}
            </span>
          </div>
        );
      })}
      <div className="wl-collision-floor absolute inset-x-0 bottom-0 h-px" />
    </div>
  );
}
