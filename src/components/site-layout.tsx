import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { useReveal } from "@/hooks/use-reveal";
import { PublicCmsDomRuntime } from "@/components/cms/cms-dom-runtime";

export function SiteLayout({ children }: { children: ReactNode }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <PublicCmsDomRuntime>
      <div ref={ref} className="min-h-dvh flex flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </PublicCmsDomRuntime>
  );
}
