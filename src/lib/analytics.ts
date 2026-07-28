declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "navigation_item_clicked"
  | "mega_menu_opened"
  | "technical_roadmap_cta_clicked"
  | "technical_roadmap_form_started"
  | "technical_roadmap_form_submitted"
  | "case_study_opened"
  | "case_study_filter_used"
  | "case_study_cta_clicked"
  | "automation_lab_view"
  | "automation_demo_selected"
  | "automation_demo_started"
  | "automation_demo_completed"
  | "automation_demo_reset"
  | "automation_demo_cta_clicked"
  | "automation_demo_lead_submitted"
  | "estimator_started"
  | "estimator_step_completed"
  | "estimator_completed"
  | "estimator_submitted"
  | "resource_opened"
  | "resource_downloaded"
  | "resource_form_submitted"
  | "insight_opened"
  | "insight_category_selected"
  | "insight_search_used"
  | "insight_share_clicked"
  | "insight_cta_clicked"
  | "comparison_opened"
  | "comparison_cta_clicked";

const forbiddenKeys = new Set([
  "name",
  "email",
  "phone",
  "document",
  "document_contents",
  "project_summary",
  "main_problem",
]);

export function trackEvent(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const safe = Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (forbiddenKeys.has(key.toLowerCase())) return false;
      return ["string", "number", "boolean"].includes(typeof value) || value == null;
    }),
  );
  const payload = { event, ...safe };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("logicsify:analytics", { detail: payload }));
}

export const trackAnalytics = trackEvent;

export function rememberRoadmapSource(source: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("logicsify:technical-roadmap-source", source.slice(0, 160));
}

export function getRoadmapSource() {
  if (typeof window === "undefined") return "direct";
  return window.sessionStorage.getItem("logicsify:technical-roadmap-source") || "direct";
}
