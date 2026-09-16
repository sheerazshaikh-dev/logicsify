import { BrandGlobe } from "@/components/brand-globe";

type InteractiveLogoParticlesProps = {
  imageSrc?: string;
  className?: string;
};

/**
 * Legacy compatibility wrapper.
 * The homepage previously rendered the Logicsify mark as thousands of animated
 * particles. It now renders the lighter interactive brand globe while keeping
 * the existing Hero import stable.
 */
export function InteractiveLogoParticles({ className = "" }: InteractiveLogoParticlesProps) {
  return (
    <div className={className}>
      <BrandGlobe />
    </div>
  );
}
