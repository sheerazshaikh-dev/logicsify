import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { useReveal } from "@/hooks/use-reveal";
import { PublicCmsDomRuntime } from "@/components/cms/cms-dom-runtime";
import { StickyMobileRoadmapCta } from "@/components/sticky-mobile-roadmap-cta";
import { resolveContentFromPath } from "@/lib/content-routes";

const DYNAMIC_CMS_TYPES = new Set<string>([
  "case_study",
  "portfolio",
  "insight",
  "resource",
  "comparison",
]);

export function SiteLayout({ children }: { children: ReactNode }) {
  const ref = useReveal<HTMLDivElement>();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const resolvedContent = resolveContentFromPath(pathname);
  const useDynamicCms = Boolean(
    resolvedContent && DYNAMIC_CMS_TYPES.has(resolvedContent.type),
  );

  const layout = (
    <div ref={ref} className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main id="main" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <StickyMobileRoadmapCta />
    </div>
  );

  return useDynamicCms ? <PublicCmsDomRuntime>{layout}</PublicCmsDomRuntime> : layout;
}
