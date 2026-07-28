import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { rememberRoadmapSource, trackEvent } from "@/lib/analytics";

export function StickyMobileRoadmapCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(25,10,47,0.12)] backdrop-blur md:hidden">
      <Link
        to="/technical-roadmap"
        className="btn-primary flex w-full justify-center"
        onClick={() => { rememberRoadmapSource("sticky_mobile"); trackEvent("technical_roadmap_cta_clicked", { source: "sticky_mobile" }); }}
      >
        Get a Free Technical Roadmap <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
